"use client";

import { useEffect, useState } from "react";
import { marketIndices } from "@/mock/market";
import type { MarketIndexSnapshot, MarketQuote } from "@/types/market";

const MOCK_UPDATED_AT = "2026-06-18T07:00:00.000Z";

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

  useEffect(() => {
    let cancelled = false;
    fetch("/api/market/indices", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("index_fetch_failed"))))
      .then((nextSnapshot: MarketIndexSnapshot) => {
        if (!cancelled && nextSnapshot.indices?.length) setSnapshot(nextSnapshot);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  return snapshot;
}
