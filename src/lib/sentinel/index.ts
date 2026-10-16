// src/lib/sentinel/index.ts

/**
 * A-Share Sentinel X Core Engine
 *
 * This file contains the core product intelligence for:
 * - AI automatic market watching
 * - AI automatic stock monitoring
 * - signal detection
 * - alert generation
 * - risk shield
 * - causality explanation
 * - trading journal
 * - compliance filtering
 *
 * It is intentionally framework-agnostic.
 * Pages and components should call these engines instead of duplicating logic.
 */

// 各引擎拆在同目录的模块里；这里统一导出，并提供一键运行的 runSentinelCore。
export * from "./types";
export * from "./radar";
export * from "./signals";
export * from "./alerts";
export * from "./risk";
export * from "./causality";
export * from "./journal";
export * from "./compliance";
export * from "./demo";
export * from "./live-input";

import type { MarketRadarResult, Signal, Alert, RiskShieldResult, CausalityReport, JournalResult } from "./types";
import { marketRadarEngine } from "./radar";
import { signalEngine } from "./signals";
import { alertEngine } from "./alerts";
import { riskEngine } from "./risk";
import { causalityEngine } from "./causality";
import { journalEngine } from "./journal";
import { generateSentinelDemoData } from "./demo";

/**
 * 9. 一键生成完整 Sentinel 结果
 */
export function runSentinelCore(input?: Partial<ReturnType<typeof generateSentinelDemoData>>): {
  marketRadar: MarketRadarResult;
  signals: Signal[];
  alerts: Alert[];
  risk: RiskShieldResult;
  causalityReports: CausalityReport[];
  journal: JournalResult;
} {
  const demo = generateSentinelDemoData();
  // input 里值为 undefined 的键不能覆盖 demo，否则下游拿到 undefined 直接崩
  const defined = Object.fromEntries(
    Object.entries(input ?? {}).filter(([, value]) => value !== undefined),
  ) as Partial<typeof demo>;
  const data = { ...demo, ...defined };
  const marketRadar = marketRadarEngine({ indices: data.indices, stocks: data.stocks, sectors: data.sectors, account: data.account });
  const signals = signalEngine({ stocks: data.stocks, sectors: data.sectors, account: data.account, marketRadar });
  const alerts = alertEngine({ signals });
  const risk = riskEngine({ account: data.account, marketRadar, alerts });
  // 归因报告取提醒分最高的三只，而不是输入顺序的前三只
  const alertScore = new Map<string, number>();
  for (const alert of alerts) alertScore.set(alert.code, Math.max(alertScore.get(alert.code) ?? 0, alert.score));
  const topStocks = data.stocks
    .map((stock, index) => ({ stock, index, score: alertScore.get(stock.code) ?? -1 }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, 3)
    .map((entry) => entry.stock);
  const causalityReports = topStocks.map((stock) => causalityEngine({ stock, account: data.account, marketRadar, sectors: data.sectors, signals, newsEvents: data.newsEvents }));
  const journal = journalEngine({ account: data.account, marketRadar, alerts, risk });
  return { marketRadar, signals, alerts, risk, causalityReports, journal };
}
