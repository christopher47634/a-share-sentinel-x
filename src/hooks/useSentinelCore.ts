"use client";

import { startTransition, useCallback, useEffect, useMemo, useState } from "react";
import { useVisiblePolling } from "./useVisiblePolling";
import { getAccount, getPositions } from "@/lib/account-storage";
import { getSectorById } from "@/mock/sectors";
import type { Position } from "@/types/account";
import {
  generateSentinelDemoData,
  runSentinelCore,
  toSentinelAccount,
  type LiveSentinelInput,
} from "@/lib/sentinel-core";

/** 实时报价少于这个数就不切换：样本太小，市场温度、板块排名都没有意义 */
const MIN_LIVE_STOCKS = 8;
/** 页面可见时的刷新间隔 */
const REFRESH_MS = 60_000;
/** 随请求带上的持仓代码上限（与 /api/sentinel/input 的 MAX_HELD 一致） */
const MAX_HELD = 8;

export type SentinelDataMode = "demo" | "live";

export interface SentinelDataSource {
  mode: SentinelDataMode;
  /** 实时模式：实际拿到实时报价的股票数 / 请求的样本数 */
  liveCount: number;
  sampleSize: number;
  sourceLabel: string;
  updatedAt: string | null;
  /** 账户来自本地模拟账本，还是演示账户 */
  account: "local" | "demo";
}

interface LiveResponse {
  input: LiveSentinelInput;
  sampleSize: number;
  liveCount: number;
  sourceLabel: string;
  updatedAt: string;
}

interface Ledger {
  cash: number;
  positions: Position[];
}

/** 读本地模拟账本；从没交易过的空账户返回 null（没有可分析的持仓，继续用演示账户展示功能） */
function readLedger(): Ledger | null {
  try {
    const positions = getPositions();
    const account = getAccount();
    const untouched = positions.length === 0 && account.availableCash === 1_000_000;
    return untouched ? null : { cash: account.availableCash, positions };
  } catch {
    return null;
  }
}

/**
 * Sentinel 六个 AI 页面的数据入口。
 * - 首屏（含服务端渲染）用内置演示数据，保证水合一致；
 * - 挂载后请求 /api/sentinel/input，实时报价足够时切换到「实时行情 + 本地模拟账户」，页面可见时每分钟刷新；
 * - 拿不到实时数据（接口失败、休市无报价）就一直停在演示数据，source.mode 告诉页面该怎么标注。
 */
export function useSentinelCore() {
  const demo = useMemo(() => generateSentinelDemoData(), []);
  const [live, setLive] = useState<LiveResponse | null>(null);
  const [ledger, setLedger] = useState<Ledger | null>(null);
  const refreshLedger = useCallback(() => setLedger(readLedger()), []);

  useVisiblePolling(async (isCancelled) => {
    const held = (readLedger()?.positions ?? []).map((p) => p.stockCode).slice(0, MAX_HELD);
    const query = held.length ? `?held=${encodeURIComponent(held.join(","))}` : "";
    const response = await fetch(`/api/sentinel/input${query}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`sentinel_input_${response.status}`);
    const data = (await response.json()) as LiveResponse;
    // 作为 transition 提交：实时数据可能在页面某些区块还没水合完时就到了，
    // 普通更新会让 React 拿新数据去对服务端 HTML，出现 hydration 文本不一致
    if (!isCancelled() && data.input?.stocks?.length >= MIN_LIVE_STOCKS) startTransition(() => setLive(data));
  }, REFRESH_MS);

  // 下单（本页或另一个标签页）后按新账本重算
  useEffect(() => {
    refreshLedger();
    window.addEventListener("sentinel:account-updated", refreshLedger);
    window.addEventListener("storage", refreshLedger);
    return () => {
      window.removeEventListener("sentinel:account-updated", refreshLedger);
      window.removeEventListener("storage", refreshLedger);
    };
  }, [refreshLedger]);

  return useMemo(() => {
    if (!live) {
      const source: SentinelDataSource = {
        mode: "demo",
        liveCount: 0,
        sampleSize: 0,
        sourceLabel: "内置演示样本",
        updatedAt: null,
        account: "demo",
      };
      return { sentinel: runSentinelCore(), data: demo, source };
    }

    const quotes = new Map(live.input.stocks.map((s) => [s.code, s]));
    const localAccount = ledger
      ? toSentinelAccount({
          cash: ledger.cash,
          positions: ledger.positions,
          sectorNameOf: (id) => getSectorById(id)?.name,
          priceOf: (code) => quotes.get(code)?.price,
          prevCloseOf: (code) => quotes.get(code)?.prevClose,
        })
      : null;
    const data = {
      ...demo,
      indices: live.input.indices.length ? live.input.indices : demo.indices,
      stocks: live.input.stocks,
      sectors: live.input.sectors,
      account: localAccount ?? demo.account,
      // 实时模式下没有可验证的新闻源，不再拿演示事件做归因
      newsEvents: [],
    };
    const source: SentinelDataSource = {
      mode: "live",
      liveCount: live.liveCount,
      sampleSize: live.sampleSize,
      sourceLabel: live.sourceLabel,
      updatedAt: live.updatedAt,
      account: localAccount ? "local" : "demo",
    };
    return { sentinel: runSentinelCore(data), data, source };
  }, [live, demo, ledger]);
}
