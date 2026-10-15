import { NextRequest, NextResponse } from "next/server";
import { getMarketStockDetail, normalizeCode } from "@/lib/market-provider";
import { complianceEngine } from "@/lib/sentinel-core";
import { clientIp, createRateLimiter } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const MAX_QUESTION_LENGTH = 2000;
const OPENAI_TIMEOUT_MS = 30_000;
const DEFAULT_MODEL = "gpt-5.5";
// 每个 IP 每分钟 10 次；模型调用要花钱，不能无限打
const limiter = createRateLimiter({ limit: 10, windowMs: 60_000 });

function badRequest(error: string) {
  return NextResponse.json({ error }, { status: 400 });
}

interface ChatRequestBody {
  question?: string;
  stockCode?: string;
}

function fallbackAnswer(question: string, stockName: string, summary: string, bullets: string[]): string {
  return [
    `我先按当前行情和技术指标给你一个研究视角：${stockName} 现在的状态是「${summary}」。`,
    ...bullets.map((item) => `- ${item}`),
    question.includes("能买吗") || question.includes("推荐")
      ? "我的建议是把它放进观察清单，用趋势强度、量能和回撤一起看，不要只按单日涨跌做决定。"
      : "如果你想继续深入，可以问我：趋势有没有变强、风险在哪、和同板块谁更值得观察。",
    "提示：这里是研究辅助，不构成投资建议。",
  ].join("\n");
}

function extractOutputText(payload: unknown): string | null {
  const data = payload as { output_text?: string; output?: Array<{ content?: Array<{ text?: string }> }> };
  if (typeof data.output_text === "string") return data.output_text;
  const text = data.output
    ?.flatMap((item) => item.content ?? [])
    .map((item) => item.text)
    .filter(Boolean)
    .join("\n");
  return text || null;
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
  if (!normalizeCode(stockCode)) return badRequest("invalid_stock_code");
  const detail = await getMarketStockDetail(stockCode);

  if (!detail) {
    return NextResponse.json({ answer: "没有找到这只股票的数据。", provider: "fallback" });
  }

  const context = {
    quote: detail.quote,
    analysis: detail.analysis,
    candlesTail: detail.candles.slice(-20),
    fallbackUsed: detail.fallbackUsed,
  };

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      answer: fallbackAnswer(question, detail.quote.name, detail.analysis.summary, detail.analysis.bullets),
      provider: "local-research-engine",
      context,
    });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OPENAI_TIMEOUT_MS);
  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || DEFAULT_MODEL,
        instructions:
          "你是 A-Share Sentinel X 的 AI 研究助手。只基于传入行情、技术指标和持仓上下文回答。不要承诺收益，不要给出绝对买卖指令。用中文，短句，结论先行，必须说明数据时间和风险。",
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: `用户问题：${question}\n\n行情上下文：${JSON.stringify(context)}`,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) throw new Error(`OpenAI API failed: ${response.status}`);
    const json = await response.json();
    const answer = extractOutputText(json);
    return NextResponse.json({
      // 模型输出同样过一遍合规过滤，和本地生成的文字一个标准
      answer: answer
        ? complianceEngine(answer)
        : fallbackAnswer(question, detail.quote.name, detail.analysis.summary, detail.analysis.bullets),
      provider: "openai",
      context,
    });
  } catch {
    return NextResponse.json({
      answer: fallbackAnswer(question, detail.quote.name, detail.analysis.summary, detail.analysis.bullets),
      provider: "local-research-engine",
      context,
    });
  } finally {
    clearTimeout(timeout);
  }
}
