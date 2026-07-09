import { NextRequest, NextResponse } from "next/server";
import { getMarketStockDetail } from "@/lib/market-provider";
import type { MarketTimeframe } from "@/types/market";

export const dynamic = "force-dynamic";
const VALID_TIMEFRAMES: MarketTimeframe[] = ["minute", "day", "week", "month"];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
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
