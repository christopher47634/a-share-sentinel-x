import { NextResponse } from "next/server";
import { clientIp, createRateLimiter } from "@/lib/rate-limit";
import { runKlineSignalBacktest, type HistoricalBar } from "@/lib/sentinel/backtest";

const checkLimit = createRateLimiter({ limit: 30, windowMs: 60_000 });

export async function POST(request: Request) {
  const ip = clientIp(request.headers);
  const rate = checkLimit(ip);
  if (!rate.ok) {
    return NextResponse.json(
      { error: "请求过于频繁，请稍后再试" },
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } },
    );
  }

  const raw: unknown = await request.json().catch(() => null);
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return NextResponse.json({ error: "请求体必须是 JSON 对象" }, { status: 400 });
  }

  const body = raw as {
    code?: unknown;
    name?: unknown;
    sector?: unknown;
    bars?: unknown;
    missedDropPct?: unknown;
  };

  if (typeof body.code !== "string" || !body.code.trim() || typeof body.name !== "string" || !body.name.trim()) {
    return NextResponse.json({ error: "缺少有效的 code 或 name" }, { status: 400 });
  }
  if (!Array.isArray(body.bars) || body.bars.length < 2 || body.bars.length > 1000) {
    return NextResponse.json({ error: "bars 长度必须在 2 至 1000 之间" }, { status: 400 });
  }

  const bars: HistoricalBar[] = [];
  for (const item of body.bars) {
    if (!item || typeof item !== "object") {
      return NextResponse.json({ error: "bars 包含非法条目" }, { status: 400 });
    }
    const b = item as Record<string, unknown>;
    if (
      typeof b.date !== "string" ||
      typeof b.open !== "number" ||
      typeof b.high !== "number" ||
      typeof b.low !== "number" ||
      typeof b.close !== "number" ||
      typeof b.volume !== "number"
    ) {
      return NextResponse.json({ error: "K 线条目缺少数值字段" }, { status: 400 });
    }
    bars.push({
      date: b.date,
      open: b.open,
      high: b.high,
      low: b.low,
      close: b.close,
      volume: b.volume,
    });
  }

  const summary = runKlineSignalBacktest({
    code: body.code.trim(),
    name: body.name.trim(),
    sector: typeof body.sector === "string" ? body.sector : undefined,
    bars,
    missedDropPct: typeof body.missedDropPct === "number" ? body.missedDropPct : undefined,
  });

  return NextResponse.json({ ok: true, summary });
}
