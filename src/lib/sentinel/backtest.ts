// 历史日 K 线信号回放与风险提醒事后评测引擎（Phase 2）

import { alertEngine } from "./alerts";
import { signalEngine } from "./signals";
import type { AlertLevel, SentinelPosition, SentinelStock } from "./types";

export interface HistoricalBar {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface BacktestInput {
  code: string;
  name: string;
  sector?: string;
  bars: HistoricalBar[];
  position?: Partial<SentinelPosition>;
  /** 事后跌幅 <= 此阈值且未触发 Risk 提醒时记为漏报，默认 -3% */
  missedDropPct?: number;
}

export interface BacktestEvent {
  date: string;
  close: number;
  changePct: number;
  volumeRatio: number;
  signals: string[];
  level: AlertLevel | null;
  forward1dPct: number | null;
  forward3dPct: number | null;
  forward5dPct: number | null;
  maxAdverse5dPct: number | null;
  verdict: "hit" | "false-alarm" | "missed" | "non-risk" | "quiet" | "pending";
}

export interface BacktestSummary {
  code: string;
  name: string;
  barsEvaluated: number;
  totalAlerts: number;
  byLevel: Record<AlertLevel, number>;
  riskAlerts: number;
  hits: number;
  falseAlarms: number;
  missed: number;
  riskPrecision: number | null;
  riskRecall: number | null;
  riskF1: number | null;
  avgRiskForward1dPct: number | null;
  avgRiskForward5dPct: number | null;
  avgHighForward5dPct: number | null;
  events: BacktestEvent[];
}

const round3 = (n: number) => Math.round(n * 1000) / 1000;
const round2 = (n: number) => Math.round(n * 100) / 100;

function mean(values: number[]): number | null {
  if (values.length === 0) return null;
  return round2(values.reduce((sum, v) => sum + v, 0) / values.length);
}

function buildAccount(stock: SentinelStock, partial?: Partial<SentinelPosition>) {
  if (!partial) return undefined;
  const quantity = partial.quantity ?? 1000;
  const costPrice = partial.costPrice ?? stock.price;
  const marketValue = quantity * stock.price;
  const positionRatio = partial.positionRatio ?? 0.15;
  const position: SentinelPosition = {
    code: stock.code,
    name: stock.name,
    quantity,
    costPrice,
    currentPrice: stock.price,
    marketValue,
    positionRatio,
    unrealizedPnl: (stock.price - costPrice) * quantity,
    unrealizedPnlPct: costPrice > 0 ? ((stock.price - costPrice) / costPrice) * 100 : 0,
    ...partial,
  };
  const totalAssets = positionRatio > 0 ? marketValue / positionRatio : marketValue;
  return {
    totalAssets,
    cash: Math.max(0, totalAssets - marketValue),
    marketValue,
    todayPnl: 0,
    totalPnl: position.unrealizedPnl,
    totalReturnPct: position.unrealizedPnlPct,
    positions: [position],
  };
}

/**
 * 在有序历史日 K 线上逐日回放 signalEngine + alertEngine，并用 T+1/T+3/T+5 真实收益评估提醒质量。
 * 至少需要 2 根 K 线；若不足 20 根则使用已有历史窗口计算 rolling high/low/avgVolume。
 */
export function runKlineSignalBacktest(input: BacktestInput): BacktestSummary {
  const missedDropPct = input.missedDropPct ?? -3;
  const validBars = input.bars.filter(
    (b) => Number.isFinite(b.close) && b.close > 0 && Number.isFinite(b.volume) && b.volume >= 0,
  );

  const byLevel: Record<AlertLevel, number> = { Risk: 0, High: 0, Medium: 0, Low: 0 };
  const events: BacktestEvent[] = [];

  for (let i = 1; i < validBars.length; i++) {
    const cur = validBars[i];
    const prev = validBars[i - 1];
    const windowStart = Math.max(0, i - 20);
    const historyWindow = validBars.slice(windowStart, i);

    const high20 = Math.max(...historyWindow.map((b) => b.high));
    const low20 = Math.min(...historyWindow.map((b) => b.low));
    const avg20Volume =
      historyWindow.reduce((sum, b) => sum + b.volume, 0) / Math.max(1, historyWindow.length);
    const volumeRatio = avg20Volume > 0 ? round2(cur.volume / avg20Volume) : 1;
    const changePct = round2(((cur.close - prev.close) / prev.close) * 100);

    const stock: SentinelStock = {
      code: input.code,
      name: input.name,
      sector: input.sector,
      price: cur.close,
      prevClose: prev.close,
      changePct,
      volume: cur.volume,
      avg20Volume: Math.round(avg20Volume),
      volumeRatio,
      high20,
      low20,
      isWatchlist: true,
    };

    const signals = signalEngine({
      stocks: [stock],
      sectors: [],
      account: buildAccount(stock, input.position),
    });
    const [alert] = alertEngine({ signals });
    const level: AlertLevel | null = alert?.level ?? null;
    if (level) byLevel[level] += 1;

    const fwd = (offset: number): number | null => {
      const target = validBars[i + offset];
      if (!target) return null;
      return round2(((target.close - cur.close) / cur.close) * 100);
    };

    const forward1dPct = fwd(1);
    const forward3dPct = fwd(3);
    const forward5dPct = fwd(5);

    const futureSlice = validBars.slice(i + 1, i + 6);
    const maxAdverse5dPct =
      futureSlice.length > 0
        ? round2(((Math.min(...futureSlice.map((b) => b.low)) - cur.close) / cur.close) * 100)
        : null;

    let verdict: BacktestEvent["verdict"];
    if (forward1dPct === null) {
      verdict = "pending";
    } else if (level === "Risk") {
      verdict = forward1dPct < 0 ? "hit" : "false-alarm";
    } else if (forward1dPct <= missedDropPct) {
      verdict = "missed";
    } else {
      verdict = level ? "non-risk" : "quiet";
    }

    events.push({
      date: cur.date,
      close: cur.close,
      changePct,
      volumeRatio,
      signals: signals.map((s) => s.signalName).sort(),
      level,
      forward1dPct,
      forward3dPct,
      forward5dPct,
      maxAdverse5dPct,
      verdict,
    });
  }

  const hits = events.filter((e) => e.verdict === "hit").length;
  const falseAlarms = events.filter((e) => e.verdict === "false-alarm").length;
  const missed = events.filter((e) => e.verdict === "missed").length;
  const riskAlerts = hits + falseAlarms;

  const riskPrecision = riskAlerts > 0 ? round3(hits / riskAlerts) : null;
  const riskRecall = hits + missed > 0 ? round3(hits / (hits + missed)) : null;
  const riskF1 =
    riskPrecision !== null && riskRecall !== null && riskPrecision + riskRecall > 0
      ? round3((2 * riskPrecision * riskRecall) / (riskPrecision + riskRecall))
      : null;

  const riskEvents = events.filter((e) => e.level === "Risk");
  const highEvents = events.filter((e) => e.level === "High");

  return {
    code: input.code,
    name: input.name,
    barsEvaluated: events.length,
    totalAlerts: byLevel.Risk + byLevel.High + byLevel.Medium + byLevel.Low,
    byLevel,
    riskAlerts,
    hits,
    falseAlarms,
    missed,
    riskPrecision,
    riskRecall,
    riskF1,
    avgRiskForward1dPct: mean(
      riskEvents.map((e) => e.forward1dPct).filter((v): v is number => v !== null),
    ),
    avgRiskForward5dPct: mean(
      riskEvents.map((e) => e.forward5dPct).filter((v): v is number => v !== null),
    ),
    avgHighForward5dPct: mean(
      highEvents.map((e) => e.forward5dPct).filter((v): v is number => v !== null),
    ),
    events,
  };
}
