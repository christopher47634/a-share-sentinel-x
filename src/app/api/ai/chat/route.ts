import { NextRequest, NextResponse } from "next/server";
import { getMarketStockDetail } from "@/lib/market-provider";

export const dynamic = "force-dynamic";

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
  const body = (await request.json()) as ChatRequestBody;
  const question = body.question?.trim() || "请解释当前走势";
  const stockCode = body.stockCode || "600519";
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

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-5.5",
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
      answer: answer || fallbackAnswer(question, detail.quote.name, detail.analysis.summary, detail.analysis.bullets),
      provider: "openai",
      context,
    });
  } catch {
    return NextResponse.json({
      answer: fallbackAnswer(question, detail.quote.name, detail.analysis.summary, detail.analysis.bullets),
      provider: "local-research-engine",
      context,
    });
  }
}
