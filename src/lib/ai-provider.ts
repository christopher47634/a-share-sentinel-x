// 多模型 AI 研究副驾适配层：
// - 支持 OpenAI-Compatible Chat Completions（DeepSeek / 通义千问 / 兼容网关，默认 AI_API_KEY）
// - 兼容原有 OpenAI Responses API（OPENAI_API_KEY）
// - 未配置密钥或上游超时时，自动回退到融合「实时行情 + 持仓成本/计划 + 公开公告」的本地研究引擎
// 所有输出统一经过 complianceEngine 合规过滤。

import type { MarketStockDetail } from "@/types/market";
import type { VerifiedNewsEvent } from "./news-provider";
import { complianceEngine } from "./sentinel-core";

export interface ChatHistoryMessage {
  role: "user" | "assistant";
  content: string;
}

export interface PositionChatContext {
  stockCode: string;
  stockName?: string;
  quantity: number;
  availableQuantity?: number;
  avgCost: number;
  positionRatio?: number;
  unrealizedPnlPct?: number;
  plan?: string;
  stopLossPrice?: number;
  targetPrice?: number;
}

export interface PortfolioChatContext {
  position?: PositionChatContext;
  portfolioSummary?: {
    totalAssets?: number;
    positionRatio?: number;
    riskLevel?: string;
    riskScore?: number;
  };
  activeAlerts?: Array<{
    level: string;
    title: string;
    score?: number;
  }>;
}

export interface ResolvedAiProvider {
  kind: "openai-compatible" | "openai-responses" | "local";
  apiKey?: string;
  baseUrl?: string;
  model: string;
  label: string;
}

const DEFAULT_OPENAI_MODEL = "gpt-5.5";
const DEFAULT_COMPAT_BASE_URL = "https://api.deepseek.com/v1";
const DEFAULT_COMPAT_MODEL = "deepseek-chat";
const DEFAULT_TIMEOUT_MS = 30_000;
const MAX_HISTORY_TURNS = 6;
const MAX_HISTORY_CHARS = 1000;

export function resolveAiProvider(env: Record<string, string | undefined> = process.env): ResolvedAiProvider {
  const compatKey = env.AI_API_KEY?.trim();
  if (compatKey) {
    const baseUrl = (env.AI_BASE_URL?.trim() || DEFAULT_COMPAT_BASE_URL).replace(/\/+$/, "");
    const model = env.AI_MODEL?.trim() || DEFAULT_COMPAT_MODEL;
    return {
      kind: "openai-compatible",
      apiKey: compatKey,
      baseUrl,
      model,
      label: model,
    };
  }

  const openaiKey = env.OPENAI_API_KEY?.trim();
  if (openaiKey) {
    const model = env.OPENAI_MODEL?.trim() || DEFAULT_OPENAI_MODEL;
    return {
      kind: "openai-responses",
      apiKey: openaiKey,
      baseUrl: "https://api.openai.com/v1",
      model,
      label: "openai",
    };
  }

  return {
    kind: "local",
    model: "local-research-engine",
    label: "local-research-engine",
  };
}

export function sanitizeHistory(raw: unknown): ChatHistoryMessage[] {
  if (!Array.isArray(raw)) return [];
  const cleaned: ChatHistoryMessage[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const role = (item as { role?: unknown }).role;
    const content = (item as { content?: unknown }).content;
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") continue;
    const trimmed = content.trim();
    if (!trimmed) continue;
    cleaned.push({ role, content: trimmed.slice(0, MAX_HISTORY_CHARS) });
  }
  return cleaned.slice(-MAX_HISTORY_TURNS);
}

function finiteNum(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

export function sanitizePortfolioContext(raw: unknown): PortfolioChatContext | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const obj = raw as Record<string, unknown>;
  const out: PortfolioChatContext = {};

  if (obj.position && typeof obj.position === "object") {
    const p = obj.position as Record<string, unknown>;
    const quantity = finiteNum(p.quantity);
    const avgCost = finiteNum(p.avgCost);
    const stockCode = typeof p.stockCode === "string" ? p.stockCode.trim().slice(0, 12) : "";
    if (stockCode && quantity !== undefined && quantity > 0 && avgCost !== undefined && avgCost > 0) {
      out.position = {
        stockCode,
        stockName: typeof p.stockName === "string" ? p.stockName.trim().slice(0, 32) : undefined,
        quantity,
        availableQuantity: finiteNum(p.availableQuantity),
        avgCost,
        positionRatio: finiteNum(p.positionRatio),
        unrealizedPnlPct: finiteNum(p.unrealizedPnlPct),
        plan: typeof p.plan === "string" && p.plan.trim() ? p.plan.trim().slice(0, 200) : undefined,
        stopLossPrice: finiteNum(p.stopLossPrice),
        targetPrice: finiteNum(p.targetPrice),
      };
    }
  }

  if (obj.portfolioSummary && typeof obj.portfolioSummary === "object") {
    const s = obj.portfolioSummary as Record<string, unknown>;
    out.portfolioSummary = {
      totalAssets: finiteNum(s.totalAssets),
      positionRatio: finiteNum(s.positionRatio),
      riskLevel: typeof s.riskLevel === "string" ? s.riskLevel.slice(0, 16) : undefined,
      riskScore: finiteNum(s.riskScore),
    };
  }

  if (Array.isArray(obj.activeAlerts)) {
    const alerts = obj.activeAlerts
      .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
      .slice(0, 5)
      .map((item) => ({
        level: typeof item.level === "string" ? item.level.slice(0, 16) : "Info",
        title: typeof item.title === "string" ? item.title.slice(0, 120) : "",
        score: finiteNum(item.score),
      }))
      .filter((item) => item.title.length > 0);
    if (alerts.length > 0) out.activeAlerts = alerts;
  }

  return out.position || out.portfolioSummary || out.activeAlerts ? out : undefined;
}

export function buildSystemInstructions(): string {
  return [
    "你是 A-Share Sentinel X 的 AI 研究副驾，面向工作日无法持续盯盘的 A 股投资者。",
    "硬性规则：",
    "1. 只基于传入的实时/历史行情、技术指标、近期公开公告、用户模拟持仓与交易计划上下文作答，绝不编造未提供的数据或公告。",
    "2. 如果用户持有该标的，必须结合其成本价、仓位占比、T+1 可卖股数、止损/目标观察线和原交易计划给出针对性观察框架。",
    "3. 引用公告时必须带日期和来源；如果公告列表为空，明确说明近期未检索到公开公告。",
    "4. 严禁承诺收益或给出确定性买卖指令，用中文短句、结论先行，并标明数据来源时间与关键观察条件。",
  ].join("\n");
}

/**
 * 升级后的本地研究引擎（无 API Key 或上游异常时使用）：
 * 融合行情指标、用户模拟持仓与交易计划、实时告警和近期公开公告，保证开箱即用且不胡说。
 */
export function buildLocalResearchAnswer(args: {
  question: string;
  detail: MarketStockDetail;
  portfolioContext?: PortfolioChatContext;
  announcements?: VerifiedNewsEvent[];
}): string {
  const { question, detail, portfolioContext, announcements = [] } = args;
  const { quote, analysis } = detail;
  const lines: string[] = [];

  lines.push(
    `【研究结论】${quote.name}（${quote.code}）当前价 ¥${quote.price.toFixed(2)}（${quote.changePercent >= 0 ? "+" : ""}${quote.changePercent.toFixed(2)}%），状态为「${analysis.summary}」（数据源：${quote.sourceLabel}）。`
  );

  lines.push("【行情与技术面】");
  for (const bullet of analysis.bullets) {
    lines.push(`- ${bullet}`);
  }
  if (typeof quote.volumeRatio === "number") {
    lines.push(`- 实时量比 ${quote.volumeRatio.toFixed(2)}，换手率 ${quote.turnoverRate.toFixed(2)}%${typeof quote.speed === "number" ? `，涨速 ${quote.speed.toFixed(2)}` : ""}。`);
  }

  const pos = portfolioContext?.position;
  if (pos && pos.stockCode === quote.code) {
    const pnlPct = pos.avgCost > 0 ? ((quote.price - pos.avgCost) / pos.avgCost) * 100 : 0;
    const ratioText = typeof pos.positionRatio === "number" ? `，占组合 ${(pos.positionRatio * 100).toFixed(1)}%` : "";
    const t1Locked = typeof pos.availableQuantity === "number" ? Math.max(0, pos.quantity - pos.availableQuantity) : 0;
    lines.push("【你的模拟持仓与计划】");
    lines.push(
      `- 当前持有 ${pos.quantity.toLocaleString("zh-CN")} 股（成本 ¥${pos.avgCost.toFixed(2)}，浮盈 ${pnlPct >= 0 ? "+" : ""}${pnlPct.toFixed(2)}%${ratioText}）${t1Locked > 0 ? `，其中 ${t1Locked} 股受 T+1 锁定` : ""}。`
    );
    if (pos.stopLossPrice !== undefined) {
      const gap = ((quote.price - pos.stopLossPrice) / pos.stopLossPrice) * 100;
      lines.push(
        gap <= 0
          ? `- 现价已触及或低于你设定的止损观察线 ¥${pos.stopLossPrice.toFixed(2)}，需重点核查是否触发风控纪律。`
          : `- 距离止损观察线 ¥${pos.stopLossPrice.toFixed(2)} 还有 +${gap.toFixed(2)}% 缓冲空间。`
      );
    }
    if (pos.targetPrice !== undefined) {
      const gap = ((pos.targetPrice - quote.price) / Math.max(quote.price, 0.01)) * 100;
      lines.push(
        gap <= 0
          ? `- 现价已达到或超过目标观察价 ¥${pos.targetPrice.toFixed(2)}，可对照原计划评估分批观察节奏。`
          : `- 距离目标观察价 ¥${pos.targetPrice.toFixed(2)} 尚有 ${gap.toFixed(2)}% 空间。`
      );
    }
    if (pos.plan) {
      lines.push(`- 你的原交易计划：${pos.plan}`);
    }
  }

  if (portfolioContext?.activeAlerts?.length) {
    lines.push("【相关活跃提醒】");
    for (const alert of portfolioContext.activeAlerts.slice(0, 3)) {
      lines.push(`- [${alert.level}] ${alert.title}`);
    }
  }

  lines.push("【近期公开公告】");
  if (announcements.length > 0) {
    for (const ann of announcements.slice(0, 3)) {
      lines.push(`- [${ann.time || "近期"}] ${ann.title}（${ann.source}）`);
    }
  } else {
    lines.push("- 近 30 日未检索到该标的新的公开公告，短线波动需优先从板块与量价结构观察。");
  }

  if (/能买吗|买不买|推荐|抄底|清仓|满仓/.test(question)) {
    lines.push("【观察框架】请结合趋势分、量比持续性、所属板块强弱以及你自己的止损/仓位纪律做独立判断，避免凭单日涨跌做情绪化决策。");
  } else {
    lines.push("【继续追问】你可以进一步问我：若跌破 20 日低点该如何记录风控、与同板块强弱对比，或对我的持仓计划做压力测试。");
  }

  return complianceEngine(lines.join("\n"), {
    preserve: pos?.plan ? [pos.plan] : [],
  });
}

function extractResponsesOutputText(payload: unknown): string | null {
  const data = payload as { output_text?: string; output?: Array<{ content?: Array<{ text?: string }> }> };
  if (typeof data.output_text === "string") return data.output_text;
  const text = data.output
    ?.flatMap((item) => item.content ?? [])
    .map((item) => item.text)
    .filter(Boolean)
    .join("\n");
  return text || null;
}

function extractChatCompletionsText(payload: unknown): string | null {
  const data = payload as { choices?: Array<{ message?: { content?: string } }> };
  const text = data.choices?.[0]?.message?.content;
  return typeof text === "string" && text.trim() ? text : null;
}

export interface ResearchPromptPayload {
  question: string;
  history: ChatHistoryMessage[];
  context: {
    quote: MarketStockDetail["quote"];
    analysis: MarketStockDetail["analysis"];
    candlesTail: MarketStockDetail["candles"];
    fallbackUsed: boolean;
    portfolio?: PortfolioChatContext;
    announcements: VerifiedNewsEvent[];
  };
}

function buildContextPrompt(payload: ResearchPromptPayload): string {
  return `用户当前问题：${payload.question}\n\n结构化上下文（行情、技术指标、用户模拟持仓与近期公开公告）：\n${JSON.stringify(payload.context)}`;
}

/**
 * 调用上游大模型（支持 OpenAI-Compatible Chat Completions 与 OpenAI Responses API），
 * 失败时返回 null 由调用方无损降级到本地研究引擎。
 */
export async function callUpstreamLlm(
  provider: ResolvedAiProvider,
  payload: ResearchPromptPayload,
  timeoutMs = DEFAULT_TIMEOUT_MS
): Promise<string | null> {
  if (provider.kind === "local" || !provider.apiKey || !provider.baseUrl) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const preserve = payload.context.portfolio?.position?.plan ? [payload.context.portfolio.position.plan] : [];

  try {
    if (provider.kind === "openai-compatible") {
      const messages = [
        { role: "system", content: buildSystemInstructions() },
        ...payload.history,
        { role: "user", content: buildContextPrompt(payload) },
      ];
      const response = await fetch(`${provider.baseUrl}/chat/completions`, {
        method: "POST",
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${provider.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: provider.model,
          messages,
          temperature: 0.3,
        }),
      });
      if (!response.ok) return null;
      const json = await response.json();
      const raw = extractChatCompletionsText(json);
      return raw ? complianceEngine(raw, { preserve }) : null;
    }

    const inputItems = [
      ...payload.history.map((m) => ({
        role: m.role,
        content: [{ type: m.role === "user" ? "input_text" : "output_text", text: m.content }],
      })),
      {
        role: "user",
        content: [{ type: "input_text", text: buildContextPrompt(payload) }],
      },
    ];
    const response = await fetch(`${provider.baseUrl}/responses`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${provider.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: provider.model,
        instructions: buildSystemInstructions(),
        input: inputItems,
      }),
    });
    if (!response.ok) return null;
    const json = await response.json();
    const raw = extractResponsesOutputText(json);
    return raw ? complianceEngine(raw, { preserve }) : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * OpenAI-Compatible 上游流式输出：逐 delta 回调 onDelta，并在流结束后返回经合规过滤的完整文本。
 */
export async function streamUpstreamCompatLlm(
  provider: ResolvedAiProvider,
  payload: ResearchPromptPayload,
  onDelta: (chunk: string) => void,
  timeoutMs = DEFAULT_TIMEOUT_MS
): Promise<string | null> {
  if (provider.kind !== "openai-compatible" || !provider.apiKey || !provider.baseUrl) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const preserve = payload.context.portfolio?.position?.plan ? [payload.context.portfolio.position.plan] : [];

  try {
    const messages = [
      { role: "system", content: buildSystemInstructions() },
      ...payload.history,
      { role: "user", content: buildContextPrompt(payload) },
    ];
    const response = await fetch(`${provider.baseUrl}/chat/completions`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${provider.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: provider.model,
        messages,
        temperature: 0.3,
        stream: true,
      }),
    });
    if (!response.ok || !response.body) return null;

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let fullText = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line.startsWith("data:")) continue;
        const data = line.slice(5).trim();
        if (!data || data === "[DONE]") continue;
        try {
          const parsed = JSON.parse(data) as { choices?: Array<{ delta?: { content?: string } }> };
          const delta = parsed.choices?.[0]?.delta?.content;
          if (typeof delta === "string" && delta.length > 0) {
            fullText += delta;
            onDelta(delta);
          }
        } catch {
          // 忽略残缺 SSE 帧
        }
      }
    }

    return fullText.trim() ? complianceEngine(fullText, { preserve }) : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
