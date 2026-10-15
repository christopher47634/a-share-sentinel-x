import { NextRequest, NextResponse } from "next/server";
import { getMarketSnapshot, MAX_SNAPSHOT_CODES, normalizeCode } from "@/lib/market-provider";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const codesParam = request.nextUrl.searchParams.get("codes");
  const codes = codesParam
    ? codesParam
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : undefined;
  // 代码会被拼进上游 URL，先严格校验：6 位数字、可带 sh/sz/bj 前缀，数量有上限
  if (codes && (codes.length > MAX_SNAPSHOT_CODES || codes.some((code) => !normalizeCode(code)))) {
    return NextResponse.json(
      { error: "invalid_codes", message: `codes 只接受 6 位代码（可带 sh/sz/bj 前缀），最多 ${MAX_SNAPSHOT_CODES} 个` },
      { status: 400 }
    );
  }
  const snapshot = await getMarketSnapshot(codes);
  return NextResponse.json(snapshot, {
    headers: {
      "Cache-Control": "s-maxage=30, stale-while-revalidate=120",
    },
  });
}
