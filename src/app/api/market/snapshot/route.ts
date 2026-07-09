import { NextRequest, NextResponse } from "next/server";
import { getMarketSnapshot } from "@/lib/market-provider";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const codesParam = request.nextUrl.searchParams.get("codes");
  const codes = codesParam
    ? codesParam
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : undefined;
  const snapshot = await getMarketSnapshot(codes);
  return NextResponse.json(snapshot, {
    headers: {
      "Cache-Control": "s-maxage=30, stale-while-revalidate=120",
    },
  });
}
