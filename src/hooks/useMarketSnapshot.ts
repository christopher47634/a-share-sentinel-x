"use client";

import { useMemo, useState } from "react";
import { useVisiblePolling } from "./useVisiblePolling";
import { stocks } from "@/mock/stocks";
import type { MarketQuote, MarketSnapshot } from "@/types/market";

export const DEFAULT_LIVE_STOCK_CODES = stocks.slice(0, 32).map((item) => item.code);
const MOCK_UPDATED_AT = "2026-06-18T07:00:00.000Z";
/** 页面可见时的刷新间隔；与 /api/market/snapshot 的 s-maxage=30 对齐 */
const REFRESH_MS = 30_000;

function fallbackQuote(stock: (typeof stocks)[number]): MarketQuote {
  return {
    ...stock,
    source: "mock",
    sourceLabel: "Mock fallback",
    updatedAt: MOCK_UPDATED_AT,
    tradeStatus: "unknown",
  };
}

export { parseAmountYi } from "@/lib/market-format";

export function useMarketSnapshot(codes: string[] = DEFAULT_LIVE_STOCK_CODES) {
  const fallbackQuotes = useMemo(() => {
    const codeSet = new Set(codes);
    return stocks.filter((item) => codeSet.has(item.code)).map(fallbackQuote);
  }, [codes]);

  const [quotes, setQuotes] = useState<MarketQuote[]>(fallbackQuotes);
  const [sourceLabel, setSourceLabel] = useState("Mock fallback");
  const [fallbackUsed, setFallbackUsed] = useState(true);

  // 用代码串做依赖：调用方每次渲染传新数组也不会重复请求
  const codesKey = codes.join(",");

  // 页面可见时每 30 秒刷新一次；切到后台暂停，回到前台立刻补一次
  useVisiblePolling(
    async (isCancelled) => {
      const response = await fetch(`/api/market/snapshot?codes=${encodeURIComponent(codesKey)}`, { cache: "no-store" });
      if (!response.ok) throw new Error("snapshot_fetch_failed");
      const snapshot = (await response.json()) as MarketSnapshot;
      if (isCancelled() || !snapshot.quotes?.length) return;
      setQuotes(snapshot.quotes);
      setSourceLabel(snapshot.sourceLabel);
      setFallbackUsed(snapshot.fallbackUsed);
    },
    REFRESH_MS,
    codesKey
  );

  return { quotes, sourceLabel, fallbackUsed };
}
