import type { MarketCandle, MarketIndicatorSnapshot } from "@/types/market";

function round(value: number, digits = 2): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function movingAverage(candles: MarketCandle[], period: number): number | null {
  if (candles.length < period) return null;
  const slice = candles.slice(-period).map((item) => item.close);
  const result = average(slice);
  return result === null ? null : round(result);
}

function ema(values: number[], period: number): number[] {
  if (values.length === 0) return [];
  const k = 2 / (period + 1);
  const result: number[] = [values[0]];
  for (let i = 1; i < values.length; i += 1) {
    result.push(values[i] * k + result[i - 1] * (1 - k));
  }
  return result;
}

function rsi(values: number[], period = 14): number | null {
  if (values.length <= period) return null;
  let gains = 0;
  let losses = 0;
  for (let i = values.length - period; i < values.length; i += 1) {
    const diff = values[i] - values[i - 1];
    if (diff >= 0) gains += diff;
    else losses += Math.abs(diff);
  }
  if (losses === 0) return 100;
  const rs = gains / losses;
  return round(100 - 100 / (1 + rs));
}

function macd(values: number[]): { macd: number | null; signal: number | null; histogram: number | null } {
  if (values.length < 35) return { macd: null, signal: null, histogram: null };
  const ema12 = ema(values, 12);
  const ema26 = ema(values, 26);
  const dif = values.map((_, i) => ema12[i] - ema26[i]);
  const dea = ema(dif, 9);
  const latestMacd = dif[dif.length - 1];
  const latestSignal = dea[dea.length - 1];
  return {
    macd: round(latestMacd, 3),
    signal: round(latestSignal, 3),
    histogram: round((latestMacd - latestSignal) * 2, 3),
  };
}

function atr(candles: MarketCandle[], period = 14): number | null {
  if (candles.length <= period) return null;
  const recent = candles.slice(-(period + 1));
  const trs: number[] = [];
  for (let i = 1; i < recent.length; i += 1) {
    const current = recent[i];
    const prev = recent[i - 1];
    trs.push(
      Math.max(
        current.high - current.low,
        Math.abs(current.high - prev.close),
        Math.abs(current.low - prev.close)
      )
    );
  }
  const result = average(trs);
  return result === null ? null : round(result);
}

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

export function buildMarketAnalysis(candles: MarketCandle[]): MarketIndicatorSnapshot {
  const closes = candles.map((item) => item.close);
  const latest = closes[closes.length - 1] ?? 0;
  const ma5 = movingAverage(candles, 5);
  const ma10 = movingAverage(candles, 10);
  const ma20 = movingAverage(candles, 20);
  const ma60 = movingAverage(candles, 60);
  const rsi14 = rsi(closes);
  const macdSnapshot = macd(closes);
  const atr14 = atr(candles);
  const recentHigh = Math.max(...candles.slice(-60).map((item) => item.high), latest);
  const drawdownPercent = recentHigh > 0 ? round(((latest - recentHigh) / recentHigh) * 100) : 0;
  const recentVolume = candles.slice(-5).map((item) => item.volume);
  const baseVolume = candles.slice(-25, -5).map((item) => item.volume);
  const recentVolumeAvg = average(recentVolume);
  const baseVolumeAvg = average(baseVolume);
  const volumeRatio =
    recentVolumeAvg !== null && baseVolumeAvg && baseVolumeAvg > 0
      ? round(recentVolumeAvg / baseVolumeAvg, 2)
      : null;

  const maStack =
    ma5 !== null && ma10 !== null && ma20 !== null
      ? (ma5 > ma10 ? 1 : -1) + (ma10 > ma20 ? 1 : -1) + (latest > ma20 ? 1 : -1)
      : 0;
  const momentum = rsi14 === null ? 0 : rsi14 > 65 ? 1 : rsi14 < 35 ? -1 : 0;
  const macdSignal = macdSnapshot.histogram === null ? 0 : macdSnapshot.histogram > 0 ? 1 : -1;
  const trendScore = clamp(50 + maStack * 10 + momentum * 8 + macdSignal * 7 + Math.max(drawdownPercent, -30) * 0.6);
  const riskScore = clamp(
    30 + Math.abs(drawdownPercent) * 1.4 + (atr14 && latest ? (atr14 / latest) * 900 : 0) + (rsi14 && rsi14 > 72 ? 12 : 0)
  );

  const trendLabel =
    trendScore >= 72 ? "趋势增强" : trendScore >= 55 ? "温和偏强" : trendScore >= 42 ? "震荡观察" : "趋势偏弱";
  const riskLabel = riskScore >= 70 ? "高波动" : riskScore >= 48 ? "中等风险" : "风险可控";

  const bullets = [
    ma5 && ma20
      ? `MA5 ${ma5 > ma20 ? "位于" : "低于"} MA20，短线结构${ma5 > ma20 ? "偏强" : "承压"}`
      : "均线样本不足，等待更多 K 线确认",
    rsi14 !== null
      ? `RSI14 为 ${rsi14}，${rsi14 > 70 ? "短线偏热" : rsi14 < 35 ? "情绪偏冷" : "处于中性区间"}`
      : "RSI 暂不可用",
    volumeRatio !== null
      ? `近 5 日量能约为前 20 日的 ${volumeRatio} 倍`
      : "量能基准不足",
  ];

  return {
    ma5,
    ma10,
    ma20,
    ma60,
    rsi14,
    macd: macdSnapshot.macd,
    signal: macdSnapshot.signal,
    histogram: macdSnapshot.histogram,
    atr14,
    drawdownPercent,
    volumeRatio,
    trendScore: Math.round(trendScore),
    riskScore: Math.round(riskScore),
    trendLabel,
    riskLabel,
    summary: `${trendLabel} · ${riskLabel}。系统基于真实/兜底行情计算，不构成投资建议。`,
    bullets,
  };
}
