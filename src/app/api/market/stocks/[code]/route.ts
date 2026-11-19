import { NextRequest, NextResponse } from "next/server";
import { getMarketStockDetail, normalizeCode } from "@/lib/market-provider";
import { clientIp, createRateLimiter } from "@/lib/rate-limit";
import type { MarketTimeframe } from "@/types/market";

export const dynamic = "force-dynamic";
const VALID_TIMEFRAMES: MarketTimeframe[] = ["minute", "day", "week", "month"];
const limiter = createRateLimiter({ limit: 60, windowMs: 60_000 });

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const rate = limiter(clientIp(request.headers));
  if (!rate.ok) {
    return NextResponse.json(
      { error: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } }
    );
  }
  const { code } = await params;
  if (!normalizeCode(code)) {
    return NextResponse.json({ error: "invalid_code" }, { status: 400 });
  }
  const timeframeParam = request.nextUrl.searchParams.get("timeframe") as MarketTimeframe | null;
  const timeframe =
    timeframeParam && VALID_TIMEFRAMES.includes(timeframeParam) ? timeframeParam : "day";
  const detail = await getMarketStockDetail(code, timeframe);
  if (!detail) {
    return NextResponse.json({ error: "stock_not_found" }, { status: 404 });
  }
  return NextResponse.json(detail, {
    headers: {
      "Cache-Control": timeframe === "minute" ? "s-maxage=15, stale-while-revalidate=60" : "s-maxage=60, stale-while-revalidate=300",
    },
  });
}
