// 盘后复盘：账户、市场、提醒、成交、风险汇总成复盘日志。

import type { SentinelTrade, SentinelAccount, MarketRadarResult, Alert, RiskShieldResult, JournalResult } from "./types";
import { pct, money } from "./utils";
import { complianceEngine } from "./compliance";
import { shanghaiDate } from "../time";

/**
 * 6. 盘后复盘
 */
export function journalEngine(args: {
  date?: string;
  account: SentinelAccount;
  marketRadar?: MarketRadarResult;
  alerts?: Alert[];
  trades?: SentinelTrade[];
  risk?: RiskShieldResult;
}): JournalResult {
  const alerts = args.alerts ?? [];
  const trades = args.trades ?? args.account.trades ?? [];
  const highPriorityAlerts = alerts.filter((alert) => alert.level === "High" || alert.level === "Risk");
  const effectiveAlerts = alerts.filter((alert) => alert.relatedToPosition || alert.score >= 80);

  const accountSummary = [
    `总资产 ${money(args.account.totalAssets)}`,
    `今日盈亏 ${money(args.account.todayPnl)}`,
    `累计收益率 ${pct(args.account.totalReturnPct)}`,
    `当前现金 ${money(args.account.cash)}`,
    `持仓市值 ${money(args.account.marketValue)}`,
  ];

  const marketSummary = args.marketRadar
    ? [
        `市场状态 ${args.marketRadar.marketRegime}`,
        `市场温度 ${args.marketRadar.marketTemperature}/100`,
        `市场风格 ${args.marketRadar.marketStyle}`,
        `主线板块 ${args.marketRadar.hotSectors.slice(0, 3).map((sector) => sector.name).join("、")}`,
      ]
    : ["当前未接入市场雷达结果。"];

  const alertSummary = [
    `今日共触发 ${alerts.length} 条提醒`,
    `高优先级 / 风险提醒 ${highPriorityAlerts.length} 条`,
    `与持仓相关提醒 ${alerts.filter((alert) => alert.relatedToPosition).length} 条`,
    `涉及交易计划偏离提醒 ${alerts.filter((alert) => alert.relatedToPlan).length} 条`,
  ];

  const tradeSummary = [
    `今日模拟成交 ${trades.length} 笔`,
    `买入 ${trades.filter((trade) => trade.side === "BUY").length} 笔`,
    `卖出 ${trades.filter((trade) => trade.side === "SELL").length} 笔`,
  ];

  const riskSummary = args.risk
    ? [
        `当前风险等级 ${args.risk.overallRiskLevel}`,
        `风险分数 ${args.risk.riskScore}/100`,
        `识别风险项 ${args.risk.riskItems.length} 个`,
      ]
    : ["当前未接入风险护盾结果。"];

  const nextDayWatchlist = Array.from(
    new Set([
      ...highPriorityAlerts.map((alert) => `${alert.code} ${alert.name}`),
      ...args.account.positions
        .filter((position) => position.positionRatio >= 0.25 || position.riskLevel === "High")
        .map((position) => `${position.code} ${position.name}`),
    ]),
  ).slice(0, 8);

  const reviewText = complianceEngine(
    [
      `【今日账户表现】${accountSummary.join("；")}`,
      `【今日市场环境】${marketSummary.join("；")}`,
      `【今日有效提醒】系统识别到 ${effectiveAlerts.length} 条高价值提醒，主要集中在 ${effectiveAlerts
        .slice(0, 3)
        .map((alert) => alert.name)
        .join("、") || "暂无"}。`,
      `【今日误报提醒】当前 MVP 暂未接入提醒后续走势验证，误报需要在后续版本通过回放和收盘价对比评估。`,
      `【模拟交易回顾】${tradeSummary.join("；")}`,
      `【持仓风险变化】${riskSummary.join("；")}`,
      `【交易计划执行情况】今日有 ${alerts.filter((alert) => alert.relatedToPlan).length} 条提醒涉及计划偏离，需要盘后重点复盘。`,
      `【明日观察清单】${nextDayWatchlist.join("、") || "暂无重点观察标的"}。`,
      "【规则优化建议】后续应记录提醒触发后 5 分钟、30 分钟、收盘后的价格表现，用于评估信号有效性。",
    ].join("\n\n"),
  );

  return {
    date: args.date ?? shanghaiDate(),
    accountSummary,
    marketSummary,
    alertSummary,
    tradeSummary,
    riskSummary,
    effectiveAlerts,
    highPriorityAlerts,
    nextDayWatchlist,
    reviewText,
  };
}
