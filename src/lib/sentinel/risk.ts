// 风险护盾：集中度、高风险持仓、行业暴露、弱市高仓位与计划偏离。

import type { RiskLevel, SentinelPosition, SentinelAccount, MarketRadarResult, Alert, RiskItem, RiskShieldResult } from "./types";
import { clamp, pct } from "./utils";
import { POSITION, RISK_LEVEL_CUTOFF, RISK_WEIGHT } from "../thresholds";

/**
 * 4. 风险护盾
 */
export function riskEngine(args: {
  account: SentinelAccount;
  marketRadar?: MarketRadarResult;
  alerts?: Alert[];
}): RiskShieldResult {
  const riskItems: RiskItem[] = [];
  const positions = args.account.positions;

  for (const position of positions) {
    if (position.positionRatio >= POSITION.SINGLE_HIGH) {
      riskItems.push({
        id: `risk-concentration-${position.code}`,
        level: "High",
        title: "单股集中度风险",
        reason: `${position.name} 仓位达到 ${pct(position.positionRatio * 100)}，单股集中度偏高。`,
        affectedPositions: [position.name],
        evidence: [`仓位 ${pct(position.positionRatio * 100)}`],
        observationPoints: ["观察该持仓是否出现放量下跌", "观察该持仓所属板块是否走弱"],
      });
    } else if (position.positionRatio >= POSITION.SINGLE_WATCH) {
      riskItems.push({
        id: `risk-concentration-medium-${position.code}`,
        level: "Medium",
        title: "单股仓位偏高",
        reason: `${position.name} 仓位达到 ${pct(position.positionRatio * 100)}，需要纳入重点观察。`,
        affectedPositions: [position.name],
        evidence: [`仓位 ${pct(position.positionRatio * 100)}`],
        observationPoints: ["观察仓位较高标的是否弱于板块"],
      });
    }

    if (position.riskLevel === "High" && position.positionRatio >= POSITION.HIGH_RISK_STOCK) {
      riskItems.push({
        id: `risk-high-vol-${position.code}`,
        level: "High",
        title: "高风险持仓占比偏高",
        reason: `${position.name} 标记为高风险，且仓位达到 ${pct(position.positionRatio * 100)}。`,
        affectedPositions: [position.name],
        evidence: [`风险等级 High`, `仓位 ${pct(position.positionRatio * 100)}`],
        observationPoints: ["关注该标的波动是否扩散到账户净值", "关注是否偏离原交易计划"],
      });
    }
  }

  const sectorExposure = calculateSectorExposure(positions);
  for (const [sector, exposure] of sectorExposure.entries()) {
    if (exposure >= POSITION.SECTOR_HIGH) {
      riskItems.push({
        id: `risk-sector-${sector}`,
        level: "High",
        title: "行业集中度风险",
        reason: `${sector} 暴露达到 ${pct(exposure * 100)}，组合行业集中度偏高。`,
        affectedPositions: positions.filter((position) => position.sector === sector).map((position) => position.name),
        evidence: [`${sector} 暴露 ${pct(exposure * 100)}`],
        observationPoints: [`观察 ${sector} 是否继续维持强势`, "关注该行业走弱时对账户净值的影响"],
      });
    }
  }

  if (args.marketRadar && ["弱势调整", "恐慌下跌"].includes(args.marketRadar.marketRegime)) {
    const positionRatio = args.account.marketValue / Math.max(args.account.totalAssets, 1);
    if (positionRatio >= POSITION.WEAK_MARKET_TOTAL) {
      riskItems.push({
        id: "risk-market-high-position",
        level: "Critical",
        title: "弱势市场下高仓位风险",
        reason: `市场处于 ${args.marketRadar.marketRegime}，当前仓位 ${pct(positionRatio * 100)}。`,
        affectedPositions: positions.map((position) => position.name),
        evidence: [`市场状态 ${args.marketRadar.marketRegime}`, `仓位 ${pct(positionRatio * 100)}`],
        observationPoints: ["观察市场温度是否继续下降", "观察持仓是否普遍弱于板块"],
      });
    }
  }

  const planDeviationAlerts = (args.alerts ?? []).filter((alert) => alert.relatedToPlan);
  if (planDeviationAlerts.length > 0) {
    riskItems.push({
      id: "risk-plan-deviation",
      level: "High",
      title: "交易计划偏离风险",
      reason: `当前有 ${planDeviationAlerts.length} 条提醒涉及交易计划偏离。`,
      affectedPositions: planDeviationAlerts.map((alert) => alert.name),
      evidence: planDeviationAlerts.map((alert) => alert.title),
      observationPoints: ["记录偏离原因", "盘后复盘是否存在情绪化操作"],
    });
  }

  const riskScore = clamp(scoreRiskItems(riskItems));
  const overallRiskLevel: RiskLevel =
    riskScore >= RISK_LEVEL_CUTOFF.Critical
      ? "Critical"
      : riskScore >= RISK_LEVEL_CUTOFF.High
        ? "High"
        : riskScore >= RISK_LEVEL_CUTOFF.Medium
          ? "Medium"
          : "Low";

  const explanation =
    riskItems.length === 0
      ? "当前模拟账户未识别到明显集中度或计划偏离风险，风险等级暂为 Low。"
      : `当前风险等级为 ${overallRiskLevel}。主要风险来自：${riskItems
          .slice(0, 3)
          .map((item) => item.title)
          .join("、")}。系统建议将这些项目纳入后续观察，但不构成任何交易建议。`;

  return {
    overallRiskLevel,
    riskScore,
    riskItems,
    explanation,
    observationPoints: [
      "观察高仓位持仓是否弱于所属板块",
      "观察高波动持仓是否出现放量下跌",
      "观察市场温度是否继续下降",
      "盘后复盘交易计划是否被执行",
    ],
  };
}

/**
 * 同一只重仓股以前会同时计入「单股集中度」「高风险持仓」「行业集中度」三项，分数很快饱和到 100。
 * 现在：只涉及单只持仓的风险项按持仓去重、只取最高一项；
 * 行业项只在它覆盖的持仓还没被单股项计过分时才计分；账户级风险项照常累加。
 */
export function scoreRiskItems(riskItems: RiskItem[]): number {
  const perPosition = new Map<string, number>();
  let total = 0;

  for (const item of riskItems) {
    if (item.id.startsWith("risk-concentration") || item.id.startsWith("risk-high-vol")) {
      const key = item.affectedPositions[0] ?? item.id;
      perPosition.set(key, Math.max(perPosition.get(key) ?? 0, RISK_WEIGHT[item.level]));
    }
  }
  for (const weight of perPosition.values()) total += weight;

  for (const item of riskItems) {
    if (item.id.startsWith("risk-concentration") || item.id.startsWith("risk-high-vol")) continue;
    if (item.id.startsWith("risk-sector-") && item.affectedPositions.every((name) => perPosition.has(name))) continue;
    total += RISK_WEIGHT[item.level];
  }
  return total;
}

function calculateSectorExposure(positions: SentinelPosition[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const position of positions) {
    const sector = position.sector ?? "未分类";
    map.set(sector, (map.get(sector) ?? 0) + position.positionRatio);
  }
  return map;
}
