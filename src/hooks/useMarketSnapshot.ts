"use client";

import { useEffect, useMemo, useState } from "react";
import { stocks } from "@/mock/stocks";
import type { MarketQuote, MarketSnapshot } from "@/types/market";

export const DEFAULT_LIVE_STOCK_CODES = stocks.slice(0, 32).map((item) => item.code);
const MOCK_UPDATED_AT = "2026-06-18T07:00:00.000Z";

function fallbackQuote(stock: (typeof stocks)[number]): MarketQuote {
  return {
    ...stock,
    source: "mock",
    sourceLabel: "Mock fallback",
    updatedAt: MOCK_UPDATED_AT,
    tradeStatus: "unknown",
  };
}

export function parseAmountYi(value: string): number {
  const num = Number.parseFloat(String(value).replace(/,/g, ""));
  if (!Number.isFinite(num)) return 0;
  if (/\u4e07/.test(value)) return num / 10_000;
  return num;
}

export function useMarketSnapshot(codes: string[] = DEFAULT_LIVE_STOCK_CODES) {
  const fallbackQuotes = useMemo(() => {
    const codeSet = new Set(codes);
    return stocks.filter((item) => codeSet.has(item.code)).map(fallbackQuote);
  }, [codes]);

  const [quotes, setQuotes] = useState<MarketQuote[]>(fallbackQuotes);
  const [sourceLabel, setSourceLabel] = useState("Mock fallback");
  const [fallbackUsed, setFallbackUsed] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const query = encodeURIComponent(codes.join(","));
    fetch(`/api/market/snapshot?codes=${query}`, { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("snapshot_fetch_failed"))))
      .then((snapshot: MarketSnapshot) => {
        if (cancelled || !snapshot.quotes?.length) return;
        setQuotes(snapshot.quotes);
        setSourceLabel(snapshot.sourceLabel);
        setFallbackUsed(snapshot.fallbackUsed);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [codes]);

  return { quotes, sourceLabel, fallbackUsed };
}
