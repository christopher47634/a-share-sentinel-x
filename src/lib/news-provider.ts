// 公开个股公告源：东方财富沪深公告列表接口（免费公开，无需鉴权）。
// 纯 TypeScript，不依赖 React；用于为 Causality Lab 与 AI 研究助手提供可验证的公司事件依据。

import { normalizeCode } from "./market-provider";

const ANNOUNCEMENT_REFERER = "https://quote.eastmoney.com/";
const ANNOUNCEMENT_TIMEOUT_MS = 2500;
const CACHE_TTL_MS = 15 * 60 * 1000;
const CACHE_MAX_ENTRIES = 120;

export interface VerifiedNewsEvent {
  title: string;
  relatedCodes: string[];
  relatedSectors?: string[];
  sentiment: "positive" | "negative" | "neutral";
  source: string;
  time: string;
  category?: string;
  artCode?: string;
}

interface EastmoneyAnnouncementItem {
  art_code?: string;
  title?: string;
  title_ch?: string;
  notice_date?: string;
  display_time?: string;
  codes?: Array<{ stock_code?: string; short_name?: string }>;
  columns?: Array<{ column_name?: string }>;
}

interface EastmoneyAnnouncementResponse {
  data?: {
    list?: EastmoneyAnnouncementItem[];
  };
}

const POSITIVE_RE = /回购|增持|预增|扭亏|中标|签约|分红|派息|业绩快报.*增|战略合作|获批/;
const NEGATIVE_RE = /减持|预亏|首亏|警示|立案|诉讼|仲裁|退市|问询函|监管函|处罚|冻结|违约|风险提示/;

export function classifyAnnouncementSentiment(title: string): "positive" | "negative" | "neutral" {
  if (NEGATIVE_RE.test(title)) return "negative";
  if (POSITIVE_RE.test(title)) return "positive";
  return "neutral";
}

function normalizeNoticeTime(raw?: string): string {
  if (!raw) return "";
  // "2026-11-17 00:00:00" 或 "2026-11-02 16:59:12:242" -> "2026-11-17" 或 "2026-11-02 16:59"
  const trimmed = raw.trim();
  if (/^\d{4}-\d{2}-\d{2}\s+00:00:00/.test(trimmed)) return trimmed.slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}/.test(trimmed)) return trimmed.slice(0, 16);
  return trimmed.slice(0, 10);
}

/**
 * 把东财公告接口返回的原始列表整理为可验证事件（纯函数，方便单测）。
 * - 按 art_code/标题去重；
 * - 过滤超出回看天数的旧公告，避免把半年前的公告当成今日异动归因；
 * - 仅做保守关键词情绪标注，不臆测未披露影响。
 */
export function parseAnnouncementItems(
  items: EastmoneyAnnouncementItem[],
  options: {
    sectorOf?: (code: string) => string | undefined;
    maxAgeDays?: number;
    nowMs?: number;
    limit?: number;
  } = {}
): VerifiedNewsEvent[] {
  const maxAgeDays = options.maxAgeDays ?? 30;
  const nowMs = options.nowMs ?? Date.now();
  const cutoffMs = nowMs - maxAgeDays * 86_400_000;
  const limit = options.limit ?? 12;

  const seen = new Set<string>();
  const events: VerifiedNewsEvent[] = [];

  for (const item of items) {
    const title = (item.title_ch || item.title || "").trim();
    if (!title) continue;
    const dedupeKey = item.art_code || title;
    if (seen.has(dedupeKey)) continue;

    const rawTime = item.display_time || item.notice_date || "";
    const datePart = rawTime.slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
      const ts = new Date(`${datePart}T00:00:00+08:00`).getTime();
      if (Number.isFinite(ts) && ts < cutoffMs) continue;
    }

    const relatedCodes = Array.from(
      new Set(
        (item.codes ?? [])
          .map((c) => c.stock_code?.trim())
          .filter((c): c is string => Boolean(c && /^\d{6}$/.test(c)))
      )
    );
    if (relatedCodes.length === 0) continue;

    const relatedSectors = options.sectorOf
      ? Array.from(new Set(relatedCodes.map((c) => options.sectorOf?.(c)).filter((s): s is string => Boolean(s))))
      : undefined;

    const category = item.columns?.map((c) => c.column_name).filter(Boolean).join("/") || undefined;
    const time = normalizeNoticeTime(rawTime);

    seen.add(dedupeKey);
    events.push({
      title,
      relatedCodes,
      relatedSectors: relatedSectors?.length ? relatedSectors : undefined,
      sentiment: classifyAnnouncementSentiment(title),
      source: category ? `交易所公告·${category}` : "交易所公告",
      time,
      category,
      artCode: item.art_code,
    });

    if (events.length >= limit) break;
  }

  return events;
}

const announcementCache = new Map<string, { events: VerifiedNewsEvent[]; expiresAt: number }>();

/**
 * 单次 HTTP 批量拉取多只 A 股近期公开公告（严格校验 6 位代码防注入，带 15 分钟内存缓存与超时熔断）。
 */
export async function fetchStockAnnouncements(
  codes: string[],
  options: {
    pageSize?: number;
    maxAgeDays?: number;
    sectorOf?: (code: string) => string | undefined;
    timeoutMs?: number;
  } = {}
): Promise<VerifiedNewsEvent[]> {
  const cleanCodes = Array.from(
    new Set(codes.map((c) => normalizeCode(c)?.code).filter((c): c is string => Boolean(c)))
  ).slice(0, 15);
  if (cleanCodes.length === 0) return [];

  const pageSize = Math.min(Math.max(options.pageSize ?? 12, 1), 25);
  const cacheKey = `${cleanCodes.slice().sort().join(",")}:${pageSize}:${options.maxAgeDays ?? 30}`;
  const now = Date.now();
  const cached = announcementCache.get(cacheKey);
  if (cached && cached.expiresAt > now) return cached.events;

  const url = `https://np-anotice-stock.eastmoney.com/api/security/ann?sr=-1&page_size=${pageSize}&page_index=1&ann_type=A&stock_list=${cleanCodes.join(",")}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? ANNOUNCEMENT_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Referer: ANNOUNCEMENT_REFERER,
        "User-Agent": "Mozilla/5.0 A-Share-Sentinel-X/1.0",
      },
      next: { revalidate: 300 },
    });
    if (!response.ok) return [];
    const json = (await response.json()) as EastmoneyAnnouncementResponse;
    const events = parseAnnouncementItems(json.data?.list ?? [], {
      sectorOf: options.sectorOf,
      maxAgeDays: options.maxAgeDays,
      limit: pageSize,
    });
    if (announcementCache.size >= CACHE_MAX_ENTRIES) {
      const oldest = announcementCache.keys().next().value;
      if (oldest) announcementCache.delete(oldest);
    }
    announcementCache.set(cacheKey, { events, expiresAt: now + CACHE_TTL_MS });
    return events;
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}
