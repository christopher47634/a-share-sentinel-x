// 归因解盘：行情事实 → 浅层 / 结构 / 风格 / 事件归因 → 持仓影响与观察点。

import type { SentinelStock, SentinelSector, SentinelAccount, MarketRadarResult, Signal, CausalityReport } from "./types";
import { safeNumber, pct, money, findPosition, getSectorForStock } from "./utils";
import { complianceEngine } from "./compliance";

/**
 * 5. 归因解盘
 */
export function causalityEngine(args: {
  stock: SentinelStock;
  account?: SentinelAccount;
  marketRadar?: MarketRadarResult;
  sectors?: SentinelSector[];
  signals?: Signal[];
  newsEvents?: Array<{
    title: string;
    relatedCodes?: string[];
    relatedSectors?: string[];
    sentiment?: "positive" | "negative" | "neutral";
    source?: string;
    time?: string;
  }>;
}): CausalityReport {
  const stock = args.stock;
  const position = findPosition(args.account, stock.code);
  const sector = getSectorForStock(stock, args.account);
  const sectorData = args.sectors?.find((item) => item.name === sector);
  const relatedSignals = (args.signals ?? []).filter((signal) => signal.code === stock.code);
  const relatedEvents =
    args.newsEvents?.filter(
      (event) =>
        event.relatedCodes?.includes(stock.code) ||
        (sector ? event.relatedSectors?.includes(sector) : false),
    ) ?? [];

  const marketFacts = [
    `当前价格 ${stock.price}`,
    `今日涨跌幅 ${pct(stock.changePct)}`,
    `量比 ${safeNumber(stock.volumeRatio).toFixed(2)}`,
    `换手率 ${pct(safeNumber(stock.turnoverRate))}`,
    typeof stock.fiveMinChangePct === "number" ? `5分钟涨跌幅 ${pct(stock.fiveMinChangePct)}` : "",
    typeof stock.speed === "number" ? `涨速 ${stock.speed.toFixed(2)}` : "",
  ].filter(Boolean);

  const shallowAttribution = [
    stock.changePct > 0
      ? "价格端出现上涨，说明该标的短线关注度有所提升。"
      : stock.changePct < 0
        ? "价格端出现下跌，说明该标的短线承压。"
        : "价格端变化有限，当前主要观察成交和板块结构。",
    safeNumber(stock.volumeRatio) >= 2.5
      ? "成交端出现放量，说明该波动不是单纯价格噪音。"
      : "成交端暂未出现显著放量，行情持续性需要继续验证。",
    relatedSignals.length > 0
      ? `系统识别到 ${relatedSignals.length} 个相关信号：${relatedSignals.map((signal) => signal.signalName).join("、")}。`
      : "当前未识别到高优先级异动信号。",
  ];

  const structuralAttribution = [
    sector ? `该标的所属行业为 ${sector}。` : "当前未识别到明确所属行业。",
    sectorData
      ? `所属行业今日涨跌幅 ${pct(sectorData.changePct)}，上涨家数 ${sectorData.upCount}，下跌家数 ${sectorData.downCount}。`
      : "当前缺少所属行业的结构数据。",
    sectorData && stock.changePct > sectorData.changePct
      ? "该标的当前强于所属板块，具备相对强势特征。"
      : sectorData && stock.changePct < sectorData.changePct
        ? "该标的当前弱于所属板块，需要观察是否存在个股层面压力。"
        : "该标的与板块相对强弱暂不明确。",
  ];

  const marketStyleAttribution = [
    args.marketRadar ? `当前市场风格为 ${args.marketRadar.marketStyle}。` : "当前未接入市场风格判断。",
    args.marketRadar
      ? `市场状态为 ${args.marketRadar.marketRegime}，市场温度 ${args.marketRadar.marketTemperature}/100。`
      : "",
    args.marketRadar && sector && args.marketRadar.hotSectors.some((item) => item.name === sector)
      ? `该标的所属行业处于市场热度前列，存在板块共振。`
      : "该标的所属行业暂未处于最强主线前列，需观察后续是否扩散。",
  ].filter(Boolean);

  const eventAttribution =
    relatedEvents.length > 0
      ? relatedEvents.map((event) => `检测到事件：${event.title}。来源：${event.source ?? "mock/source"}。情绪：${event.sentiment ?? "neutral"}。`)
      : ["当前系统未接入可验证实时公告、新闻或政策数据，因此不对政策或公司事件做确定性归因。"];

  const portfolioImpact = position
    ? [
        `该标的属于用户模拟持仓，仓位 ${pct(position.positionRatio * 100)}。`,
        `当前浮动盈亏 ${money(position.unrealizedPnl)}，浮动盈亏率 ${pct(position.unrealizedPnlPct)}。`,
        Math.abs(position.positionRatio) >= 0.25
          ? "该标的对模拟账户净值影响较高。"
          : "该标的对模拟账户净值影响中等或较低。",
      ]
    : ["该标的当前不是用户模拟持仓，主要作为自选或市场观察对象。"];

  const planCheck = position?.plan
    ? [
        `用户原交易计划：${position.plan}`,
        /不追高|回调|等待/.test(position.plan) && stock.changePct >= 5
          ? "当前价格上涨较快，可能偏离「不追高 / 等待回调」的原始计划。"
          : "当前暂未识别到明显交易计划偏离。",
      ]
    : ["当前未记录该标的的交易计划。"];

  const riskNotes = [
    safeNumber(stock.volumeRatio) >= 3 ? "量比偏高，短线波动可能放大。" : "",
    stock.changePct >= 7 && safeNumber(stock.speed) < 0 ? "涨幅较高且涨速转负，需要观察冲高回落风险。" : "",
    position && position.riskLevel === "High" ? "该标的被标记为高风险持仓，需纳入重点观察。" : "",
    "本内容仅用于模拟实盘、市场观察和学习演示，不构成投资建议。",
  ].filter(Boolean);

  const observationPoints = [
    "所属板块能否维持强势",
    "量比和成交额是否继续放大",
    "涨速是否转负",
    "是否继续强于或弱于所属板块",
    "是否偏离用户原交易计划",
  ];

  const oneLineSummary = `${stock.name} 当前属于"${relatedSignals
    .slice(0, 2)
    .map((signal) => signal.signalName)
    .join(" + ") || "常规观察"}"事件，需结合板块结构和模拟持仓影响继续观察。`;

  // 用户自己写的交易计划是原话引用，不做合规改写
  const finalText = complianceEngine(
    [
      `【一句话总结】${oneLineSummary}`,
      `【行情事实】${marketFacts.join("；")}`,
      `【浅层归因】${shallowAttribution.join("")}`,
      `【结构归因】${structuralAttribution.join("")}`,
      `【市场风格归因】${marketStyleAttribution.join("")}`,
      `【事件 / 政策 / 公司归因】${eventAttribution.join("")}`,
      `【用户持仓影响】${portfolioImpact.join("")}`,
      `【交易计划检查】${planCheck.join("")}`,
      `【风险提示】${riskNotes.join("")}`,
      `【后续观察指标】${observationPoints.join("；")}`,
    ].join("\n\n"),
    { preserve: position?.plan ? [position.plan] : [] },
  );

  return {
    code: stock.code,
    name: stock.name,
    oneLineSummary,
    marketFacts,
    shallowAttribution,
    structuralAttribution,
    marketStyleAttribution,
    eventAttribution,
    portfolioImpact,
    planCheck,
    riskNotes,
    observationPoints,
    finalText,
  };
}
