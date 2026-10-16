import {
  alertEngine,
  signalEngine,
  type AlertLevel,
  type SentinelAccount,
  type SentinelPosition,
  type SentinelSector,
  type SentinelStock,
} from "./sentinel-core";

/**
 * 「信号 → 提醒 → 结果」评测。
 *
 * 每个用例给一只股票的盘中快照、可选的持仓，以及事后结果（下一交易日涨跌幅）。
 * 评测先跑 signalEngine + alertEngine，核对触发的信号和提醒等级是否和用例记录一致（回归），
 * 再用事后结果给风险提醒打分：风险提醒之后下跌算命中，上涨算误报，没有风险提醒却大跌算漏报。
 */
export interface AlertEvalCase {
  id: string;
  title: string;
  stock: SentinelStock;
  sectors?: SentinelSector[];
  position?: Partial<SentinelPosition>;
  expect: {
    signals: string[];
    level: AlertLevel | null;
  };
  outcome: {
    nextDayChangePct: number;
  };
}

export interface AlertEvalResult {
  id: string;
  signals: string[];
  level: AlertLevel | null;
  mismatches: string[];
  verdict: "hit" | "false-alarm" | "missed" | "quiet" | "non-risk";
}

export interface AlertEvalMetrics {
  cases: number;
  regressionPass: number;
  riskAlerts: number;
  hits: number;
  falseAlarms: number;
  missed: number;
  riskPrecision: number | null;
  riskRecall: number | null;
}

/** 下一交易日跌到这个幅度以下，没有风险提醒就算漏报 */
export const MISSED_DROP_PCT = -3;

function accountFor(c: AlertEvalCase): SentinelAccount | undefined {
  if (!c.position) return undefined;
  const p = c.position;
  const quantity = p.quantity ?? 1000;
  const costPrice = p.costPrice ?? c.stock.price;
  const marketValue = quantity * c.stock.price;
  const position: SentinelPosition = {
    code: c.stock.code,
    name: c.stock.name,
    quantity,
    costPrice,
    currentPrice: c.stock.price,
    marketValue,
    positionRatio: p.positionRatio ?? 0.1,
    unrealizedPnl: (c.stock.price - costPrice) * quantity,
    unrealizedPnlPct: costPrice > 0 ? ((c.stock.price - costPrice) / costPrice) * 100 : 0,
    ...p,
  };
  const totalAsset = marketValue / position.positionRatio;
  return {
    totalAsset,
    cash: totalAsset - marketValue,
    marketValue,
    todayPnl: 0,
    totalPnl: 0,
    totalReturnPct: 0,
    positions: [position],
  };
}

export function runAlertEvalCase(c: AlertEvalCase): AlertEvalResult {
  const signals = signalEngine({ stocks: [c.stock], sectors: c.sectors ?? [], account: accountFor(c) });
  const [alert] = alertEngine({ signals });
  const names = signals.map((s) => s.signalName).sort();
  const level = alert?.level ?? null;

  const mismatches: string[] = [];
  const expected = [...c.expect.signals].sort();
  if (JSON.stringify(names) !== JSON.stringify(expected)) {
    mismatches.push(`信号 期望 [${expected.join("、")}] 实际 [${names.join("、")}]`);
  }
  if (level !== c.expect.level) mismatches.push(`等级 期望 ${c.expect.level} 实际 ${level}`);

  const dropped = c.outcome.nextDayChangePct < 0;
  let verdict: AlertEvalResult["verdict"];
  if (level === "Risk") verdict = dropped ? "hit" : "false-alarm";
  else if (c.outcome.nextDayChangePct <= MISSED_DROP_PCT) verdict = "missed";
  else verdict = level ? "non-risk" : "quiet";

  return { id: c.id, signals: names, level, mismatches, verdict };
}

export function scoreAlertEval(results: AlertEvalResult[]): AlertEvalMetrics {
  const count = (v: AlertEvalResult["verdict"]) => results.filter((r) => r.verdict === v).length;
  const hits = count("hit");
  const falseAlarms = count("false-alarm");
  const missed = count("missed");
  const round = (x: number) => Math.round(x * 1000) / 1000;
  return {
    cases: results.length,
    regressionPass: results.filter((r) => r.mismatches.length === 0).length,
    riskAlerts: hits + falseAlarms,
    hits,
    falseAlarms,
    missed,
    riskPrecision: hits + falseAlarms ? round(hits / (hits + falseAlarms)) : null,
    riskRecall: hits + missed ? round(hits / (hits + missed)) : null,
  };
}
