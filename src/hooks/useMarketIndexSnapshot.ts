"use client";

import { useState } from "react";
import { useVisiblePolling } from "./useVisiblePolling";
import { marketIndices } from "@/mock/market";
import type { MarketIndexSnapshot, MarketQuote } from "@/types/market";

const MOCK_UPDATED_AT = "2026-06-18T07:00:00.000Z";
/** 页面可见时的刷新间隔 */
const REFRESH_MS = 30_000;

function fallbackQuote(index: (typeof marketIndices)[number]): MarketQuote {
  const prevClose = index.price - index.changeAmount;
  return {
    code: index.code,
    name: index.name,
    price: index.price,
    changePercent: index.changePercent,
    changeAmount: index.changeAmount,
    volume: index.volume,
    turnover: index.turnover,
    turnoverRate: 0,
    marketCap: "N/A",
    pe: 0,
    high: index.high,
    low: index.low,
    open: prevClose,
    prevClose,
    source: "mock",
    sourceLabel: "Mock fallback",
    updatedAt: index.lastUpdated,
    tradeStatus: "unknown",
  };
}

function buildFallbackSnapshot(): MarketIndexSnapshot {
  const indices = marketIndices.map(fallbackQuote);
  const upCount = indices.filter((item) => item.changePercent > 0).length;
  const downCount = indices.filter((item) => item.changePercent < 0).length;
  return {
    indices,
    breadth: {
      upCount,
      downCount,
      flatCount: indices.length - upCount - downCount,
      sampleSize: indices.length,
      totalTurnover: "N/A",
    },
    source: "mock",
    sourceLabel: "Mock fallback",
    updatedAt: MOCK_UPDATED_AT,
    fallbackUsed: true,
  };
}

export function useMarketIndexSnapshot() {
  const [snapshot, setSnapshot] = useState<MarketIndexSnapshot>(() => buildFallbackSnapshot());

  // 页面可见时每 30 秒刷新一次；切到后台暂停，回到前台立刻补一次
  useVisiblePolling(async (isCancelled) => {
    const response = await fetch("/api/market/indices", { cache: "no-store" });
    if (!response.ok) throw new Error("index_fetch_failed");
    const nextSnapshot = (await response.json()) as MarketIndexSnapshot;
    if (!isCancelled() && nextSnapshot.indices?.length) setSnapshot(nextSnapshot);
  }, REFRESH_MS);

  return snapshot;
}
