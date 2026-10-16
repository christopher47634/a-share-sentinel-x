import { NextRequest, NextResponse } from "next/server";
import { getMarketIndexSnapshot, getMarketSnapshot, MAX_SNAPSHOT_CODES, normalizeCode } from "@/lib/market-provider";
import { buildLiveSentinelInput } from "@/lib/sentinel/live-input";
import { stocks as universe } from "@/mock/stocks";
import { getSectorById } from "@/mock/sectors";

export const dynamic = "force-dynamic";

/** 持仓代码最多带几只；其余名额给观察样本 */
const MAX_HELD = 8;

const sectorByCode = new Map(universe.map((s) => [s.code, getSectorById(s.sectorId)?.name]));

/** 观察样本：每个板块取前几只，保证 10 个板块都有成分股参与汇总（直接截前 40 只会漏掉后面的板块） */
function sampleUniverse(perSector: number): string[] {
  const taken = new Map<string, number>();
  const picked: string[] = [];
  for (const stock of universe) {
    const n = taken.get(stock.sectorId) ?? 0;
    if (n >= perSector) continue;
    taken.set(stock.sectorId, n + 1);
    picked.push(stock.code);
  }
  return picked;
}
const SAMPLE = sampleUniverse(3);

/**
 * Sentinel 页面的实时输入：观察样本（内置股票池）+ 调用方的持仓代码（?held=600519,300750）的实时报价，
 * 板块由样本成分股汇总，再加主要指数。只有真正来自上游的报价会进入结果，mock 补位一律剔除。
 */
export async function GET(request: NextRequest) {
  const heldParam = request.nextUrl.searchParams.get("held");
  const held = heldParam ? heldParam.split(",").map((c) => c.trim()).filter(Boolean) : [];
  if (held.length > MAX_HELD || held.some((c) => !normalizeCode(c))) {
    return NextResponse.json({ error: "invalid_held", message: `held 最多 ${MAX_HELD} 个 6 位代码` }, { status: 400 });
  }

  const heldCodes = held.map((c) => normalizeCode(c)!.code);
  const codes = [...new Set([...heldCodes, ...SAMPLE])].slice(0, MAX_SNAPSHOT_CODES);
  const [snapshot, indexSnapshot] = await Promise.all([getMarketSnapshot(codes), getMarketIndexSnapshot()]);
  const input = buildLiveSentinelInput({
    quotes: snapshot.quotes,
    indices: indexSnapshot.indices,
    sectorOf: (code) => sectorByCode.get(code) ?? undefined,
  });

  return NextResponse.json(
    {
      input,
      sampleSize: codes.length,
      liveCount: input.stocks.length,
      source: snapshot.source,
      sourceLabel: snapshot.sourceLabel,
      updatedAt: snapshot.updatedAt,
    },
    { headers: { "Cache-Control": "s-maxage=30, stale-while-revalidate=60" } }
  );
}
