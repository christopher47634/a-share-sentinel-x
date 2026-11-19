import { NextRequest, NextResponse } from "next/server";
import { getMarketIndexSnapshot } from "@/lib/market-provider";
import { clientIp, createRateLimiter } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
const limiter = createRateLimiter({ limit: 60, windowMs: 60_000 });

export async function GET(request: NextRequest) {
  const rate = limiter(clientIp(request.headers));
  if (!rate.ok) {
    return NextResponse.json(
      { error: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } }
    );
  }
  const snapshot = await getMarketIndexSnapshot();
  return NextResponse.json(snapshot, {
    headers: {
      "Cache-Control": "s-maxage=30, stale-while-revalidate=120",
    },
  });
}
