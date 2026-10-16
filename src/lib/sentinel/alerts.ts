// 提醒引擎：把同一标的的信号合成一条提醒，并在窗口内去重。

import type { AlertLevel, Signal, Alert } from "./types";
import { clamp, nowIso } from "./utils";
import { ALERT } from "../thresholds";

/**
 * 3. 提醒引擎
 */
export function alertEngine(args: {
  signals: Signal[];
  previousAlerts?: Alert[];
  dedupeWindowMinutes?: number;
}): Alert[] {
  const dedupeWindowMs = (args.dedupeWindowMinutes ?? ALERT.DEDUPE_WINDOW_MINUTES) * 60 * 1000;
  const previous = args.previousAlerts ?? [];
  const grouped = new Map<string, Signal[]>();

  for (const signal of args.signals) {
    const key = `${signal.code}`;
    const group = grouped.get(key) ?? [];
    group.push(signal);
    grouped.set(key, group);
  }

  const alerts: Alert[] = [];

  for (const [code, signals] of grouped.entries()) {
    const first = signals[0];
    if (!first) continue;

    const score = clamp(signals.reduce((sum, signal) => sum + signal.score, 0), 0, 100);
    const hasRisk = signals.some((signal) => signal.signalType === "RISK");
    const relatedToPosition = signals.some((signal) => signal.relatedToPosition);
    const relatedToPlan = signals.some((signal) => signal.relatedToPlan);

    const level: AlertLevel = hasRisk ? "Risk" : score >= 80 ? "High" : score >= 60 ? "Medium" : "Low";

    // 窗口内同一代码已经提醒过的信号名；只有当前信号全部提醒过才算重复。
    // 以前是「任一信号名相同就整条丢弃」，新出现的风险信号会被旧的放量信号吞掉。
    const recentlyAlerted = new Set(
      previous
        .filter((alert) => alert.code === code && Date.now() - new Date(alert.createdAt).getTime() <= dedupeWindowMs)
        .flatMap((alert) => alert.signals.map((existing) => existing.signalName)),
    );
    const duplicate = signals.every((signal) => recentlyAlerted.has(signal.signalName));

    if (duplicate) continue;

    const evidence = signals.flatMap((signal) => signal.evidence);
    const signalNames = signals.map((signal) => signal.signalName);

    alerts.push({
      id: `alert-${code}-${Date.now()}-${alerts.length}`,
      code,
      name: first.name,
      level,
      score,
      title: `${level}｜${relatedToPosition ? "持仓相关" : "市场异动"}｜${signalNames.slice(0, 3).join(" + ")}`,
      signals,
      evidence,
      relatedToPosition,
      relatedToPlan,
      aiExplanation: generateAlertExplanation(first.name, signals, level),
      riskNote: generateAlertRiskNote(signals),
      observationPoints: generateAlertObservationPoints(signals),
      createdAt: nowIso(),
    });
  }

  return alerts.sort((a, b) => b.score - a.score);
}

function generateAlertExplanation(stockName: string, signals: Signal[], level: AlertLevel): string {
  const names = signals.map((signal) => signal.signalName);
  const relatedToPosition = signals.some((signal) => signal.relatedToPosition);
  const relatedToPlan = signals.some((signal) => signal.relatedToPlan);

  return [
    `${stockName} 当前触发 ${names.length} 个信号：${names.join("、")}。`,
    relatedToPosition ? "该标的与用户模拟持仓直接相关，因此提醒优先级上调。" : "该标的当前属于市场异动观察对象。",
    relatedToPlan ? "系统检测到该事件可能与用户原交易计划存在偏离，需要重点记录。" : "",
    `综合判断：该提醒等级为 ${level}，更适合进入观察清单，而不是直接形成交易指令。`,
  ]
    .filter(Boolean)
    .join("");
}

function generateAlertRiskNote(signals: Signal[]): string {
  if (signals.some((signal) => signal.signalType === "RISK")) {
    return "该提醒包含风险信号，需要关注后续是否出现放量下跌、冲高回落或弱于板块。";
  }

  if (signals.some((signal) => signal.signalType === "PLAN")) {
    return "该提醒涉及交易计划偏离，需要避免临盘情绪化操作。";
  }

  return "该提醒仅表示市场异动，不代表确定性机会，也不构成投资建议。";
}

function generateAlertObservationPoints(signals: Signal[]): string[] {
  const points = new Set<string>();

  if (signals.some((signal) => signal.signalName.includes("板块"))) {
    points.add("所属板块能否维持热度排名");
  }

  if (signals.some((signal) => signal.signalName.includes("放量") || signal.signalName.includes("量比"))) {
    points.add("量比和成交额能否继续维持");
  }

  if (signals.some((signal) => signal.signalName.includes("拉升") || signal.signalName.includes("涨速"))) {
    points.add("涨速是否转负，是否出现冲高回落");
  }

  if (signals.some((signal) => signal.signalType === "PLAN")) {
    points.add("当前走势是否偏离原交易计划");
  }

  if (signals.some((signal) => signal.relatedToPosition)) {
    points.add("该异动对模拟账户今日盈亏的影响");
  }

  points.add("后续 15-30 分钟价格和成交量是否延续");

  return Array.from(points);
}
