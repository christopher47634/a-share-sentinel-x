import { NextRequest, NextResponse } from "next/server";
import { getMarketStockDetail, normalizeCode } from "@/lib/market-provider";
import { fetchStockAnnouncements } from "@/lib/news-provider";
import {
  buildLocalResearchAnswer,
  callUpstreamLlm,
  resolveAiProvider,
  sanitizeHistory,
  sanitizePortfolioContext,
  streamUpstreamCompatLlm,
  type ResearchPromptPayload,
} from "@/lib/ai-provider";
import { clientIp, createRateLimiter } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const MAX_QUESTION_LENGTH = 2000;
// 每个 IP 每分钟 10 次；模型调用要花钱，不能无限打
const limiter = createRateLimiter({ limit: 10, windowMs: 60_000 });

function badRequest(error: string) {
  return NextResponse.json({ error }, { status: 400 });
}

interface ChatRequestBody {
  question?: string;
  stockCode?: string;
  history?: unknown;
  portfolioContext?: unknown;
  stream?: boolean;
}

function sseEncode(event: Record<string, unknown>): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(event)}\n\n`);
}

export async function POST(request: NextRequest) {
  const rate = limiter(clientIp(request.headers));
  if (!rate.ok) {
    return NextResponse.json(
      { error: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } }
    );
  }

  let body: ChatRequestBody;
  try {
    body = (await request.json()) as ChatRequestBody;
  } catch {
    return badRequest("invalid_json");
  }
  if (!body || typeof body !== "object") return badRequest("invalid_body");
  if (body.question !== undefined && typeof body.question !== "string") return badRequest("question_must_be_string");
  if (body.stockCode !== undefined && typeof body.stockCode !== "string") return badRequest("stock_code_must_be_string");
  if ((body.question?.length ?? 0) > MAX_QUESTION_LENGTH) return badRequest("question_too_long");

  const question = body.question?.trim() || "请解释当前走势";
  const stockCode = body.stockCode || "600519";
  const normalized = normalizeCode(stockCode);
  if (!normalized) return badRequest("invalid_stock_code");

  const history = sanitizeHistory(body.history);
  const portfolioContext = sanitizePortfolioContext(body.portfolioContext);
  const wantStream = body.stream === true;

  const [detail, announcements] = await Promise.all([
    getMarketStockDetail(normalized.code),
    fetchStockAnnouncements([normalized.code], { pageSize: 5, maxAgeDays: 30 }),
  ]);

  if (!detail) {
    return NextResponse.json({ answer: "没有找到这只股票的数据。", provider: "fallback" });
  }

  const context: ResearchPromptPayload["context"] = {
    quote: detail.quote,
    analysis: detail.analysis,
    candlesTail: detail.candles.slice(-20),
    fallbackUsed: detail.fallbackUsed,
    portfolio: portfolioContext,
    announcements,
  };
  const payload: ResearchPromptPayload = { question, history, context };
  const provider = resolveAiProvider();
  const fallback = () =>
    buildLocalResearchAnswer({ question, detail, portfolioContext, announcements });

  if (wantStream) {
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          let finalAnswer: string | null = null;
          let usedProvider = provider.label;
          let usedModel = provider.model;

          if (provider.kind === "openai-compatible") {
            let emitted = false;
            finalAnswer = await streamUpstreamCompatLlm(provider, payload, (chunk) => {
              emitted = true;
              controller.enqueue(sseEncode({ type: "delta", text: chunk }));
            });
            if (!finalAnswer) {
              usedProvider = "local-research-engine";
              usedModel = "local-research-engine";
              finalAnswer = fallback();
              if (!emitted) {
                controller.enqueue(sseEncode({ type: "delta", text: finalAnswer }));
              }
            }
          } else if (provider.kind === "openai-responses") {
            finalAnswer = await callUpstreamLlm(provider, payload);
            if (!finalAnswer) {
              usedProvider = "local-research-engine";
              usedModel = "local-research-engine";
              finalAnswer = fallback();
            }
            controller.enqueue(sseEncode({ type: "delta", text: finalAnswer }));
          } else {
            finalAnswer = fallback();
            // 按行平滑推送，兼顾首字速度与阅读节奏
            for (const line of finalAnswer.split("\n")) {
              controller.enqueue(sseEncode({ type: "delta", text: `${line}\n` }));
            }
          }

          controller.enqueue(
            sseEncode({
              type: "done",
              answer: finalAnswer,
              provider: usedProvider,
              model: usedModel,
              announcementsCount: announcements.length,
              hasPortfolioContext: Boolean(portfolioContext?.position),
            })
          );
        } catch {
          const safe = fallback();
          controller.enqueue(
            sseEncode({
              type: "done",
              answer: safe,
              provider: "local-research-engine",
              model: "local-research-engine",
              announcementsCount: announcements.length,
              hasPortfolioContext: Boolean(portfolioContext?.position),
            })
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  }

  const upstream = await callUpstreamLlm(provider, payload);
  if (upstream) {
    return NextResponse.json({
      answer: upstream,
      provider: provider.label,
      model: provider.model,
      announcementsCount: announcements.length,
      hasPortfolioContext: Boolean(portfolioContext?.position),
      context,
    });
  }

  return NextResponse.json({
    answer: fallback(),
    provider: "local-research-engine",
    model: "local-research-engine",
    announcementsCount: announcements.length,
    hasPortfolioContext: Boolean(portfolioContext?.position),
    context,
  });
}
