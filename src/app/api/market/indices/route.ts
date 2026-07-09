import { NextResponse } from "next/server";
import { getMarketIndexSnapshot } from "@/lib/market-provider";

export const dynamic = "force-dynamic";

export async function GET() {
  const snapshot = await getMarketIndexSnapshot();
  return NextResponse.json(snapshot, {
    headers: {
      "Cache-Control": "s-maxage=30, stale-while-revalidate=120",
    },
  });
}
