// src/lib/sentinel-core.ts

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

export type MarketRegime =
  | "全面强势"
  | "结构性强势"
  | "震荡偏强"
  | "震荡分化"
  | "弱势调整"
  | "恐慌下跌";

export type MarketStyle =
  | "科技成长"
  | "低估值防御"
  | "权重拉升"
  | "题材活跃"
  | "消费修复"
  | "金融护盘"
  | "小盘活跃"
  | "大盘分化"
  | "风险偏好上升"
  | "风险偏好下降"
  | "暂无明确风格";

export type AlertLevel = "High" | "Medium" | "Low" | "Risk";

export type RiskLevel = "Low" | "Medium" | "High" | "Critical";

export type SignalType =
  | "PRICE"
  | "VOLUME"
  | "SPEED"
  | "SECTOR"
  | "POSITION"
  | "PLAN"
  | "RISK";

export interface SentinelStock {
  code: string;
  name: string;
  price: number;
  prevClose?: number;
  changePct: number;
  fiveMinChangePct?: number;
  tenMinChangePct?: number;
  speed?: number;
  volumeRatio?: number;
  turnoverRate?: number;
  amount?: number;
  volume?: number;
  avg20Volume?: number;
  high20?: number;
  low20?: number;
  sector?: string;
  concepts?: string[];
  isWatchlist?: boolean;
}

export interface SentinelSector {
  name: string;
  changePct: number;
  upCount: number;
  downCount: number;
  turnoverRate?: number;
  leadingStock?: string;
  leadingStockChangePct?: number;
  heatScore?: number;
}

export interface SentinelIndex {
  code: string;
  name: string;
  price: number;
  changePct: number;
  amount?: number;
}

export interface SentinelPosition {
  code: string;
  name: string;
  quantity: number;
  costPrice: number;
  currentPrice: number;
  marketValue: number;
  positionRatio: number;
  unrealizedPnl: number;
  unrealizedPnlPct: number;
  sector?: string;
  concepts?: string[];
  plan?: string;
  riskLevel?: RiskLevel;
  watchReason?: string;
  stopLossPrice?: number;
  targetPrice?: number;
}

export interface SentinelOrder {
  id: string;
  code: string;
  name: string;
  side: "BUY" | "SELL";
  quantity: number;
  price: number;
  amount: number;
  status: "submitted" | "matching" | "filled" | "rejected" | "cancelled";
  createdAt: string;
}

export interface SentinelTrade {
  id: string;
  orderId?: string;
  code: string;
  name: string;
  side: "BUY" | "SELL";
  quantity: number;
  price: number;
  amount: number;
  fee?: number;
  createdAt: string;
}

export interface SentinelAccount {
  totalAsset: number;
  cash: number;
  marketValue: number;
  todayPnl: number;
  totalPnl: number;
  totalReturnPct: number;
  maxDrawdownPct?: number;
  positions: SentinelPosition[];
  orders?: SentinelOrder[];
  trades?: SentinelTrade[];
}

export interface MarketSnapshotInput {
  indices: SentinelIndex[];
  stocks: SentinelStock[];
  sectors: SentinelSector[];
  account?: SentinelAccount;
}

export interface MarketRadarResult {
  marketTemperature: number;
  marketRegime: MarketRegime;
  marketStyle: MarketStyle;
  upCount: number;
  downCount: number;
  flatCount: number;
  hotSectors: SentinelSector[];
  weakSectors: SentinelSector[];
  hotStocks: SentinelStock[];
  weakStocks: SentinelStock[];
  highVolumeStocks: SentinelStock[];
  riskSignals: string[];
  oneLineSummary: string;
  brief: string;
  observationPoints: string[];
}

export interface Signal {
  id: string;
  code: string;
  name: string;
  signalName: string;
  signalType: SignalType;
  score: number;
  evidence: string[];
  relatedToPosition: boolean;
  relatedToPlan: boolean;
  triggeredAt: string;
}

export interface Alert {
  id: string;
  code: string;
  name: string;
  level: AlertLevel;
  score: number;
  title: string;
  signals: Signal[];
  evidence: string[];
  aiExplanation: string;
  riskNote: string;
  observationPoints: string[];
  relatedToPosition: boolean;
  relatedToPlan: boolean;
  createdAt: string;
}

export interface RiskItem {
  id: string;
  level: RiskLevel;
  title: string;
  reason: string;
  affectedPositions: string[];
  evidence: string[];
  observationPoints: string[];
}

export interface RiskShieldResult {
  overallRiskLevel: RiskLevel;
  riskScore: number;
  riskItems: RiskItem[];
  explanation: string;
  observationPoints: string[];
}

export interface CausalityReport {
  code: string;
  name: string;
  oneLineSummary: string;
  marketFacts: string[];
  shallowAttribution: string[];
  structuralAttribution: string[];
  marketStyleAttribution: string[];
  eventAttribution: string[];
  portfolioImpact: string[];
  planCheck: string[];
  riskNotes: string[];
  observationPoints: string[];
  finalText: string;
}

export interface JournalResult {
  date: string;
  accountSummary: string[];
  marketSummary: string[];
  alertSummary: string[];
  tradeSummary: string[];
  riskSummary: string[];
  effectiveAlerts: Alert[];
  highPriorityAlerts: Alert[];
  nextDayWatchlist: string[];
  reviewText: string;
}

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

function safeNumber(value: unknown, fallback = 0): number {
  if (typeof value !== "number" || Number.isNaN(value) || !Number.isFinite(value)) {
    return fallback;
  }
  return value;
}

function pct(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

function money(value: number): string {
  return `¥${Math.round(value).toLocaleString("zh-CN")}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

function findPosition(account: SentinelAccount | undefined, code: string): SentinelPosition | undefined {
  return account?.positions.find((position) => position.code === code);
}

function getSectorForStock(stock: SentinelStock, account?: SentinelAccount): string | undefined {
  const position = findPosition(account, stock.code);
  return stock.sector ?? position?.sector;
}

/**
 * 1. AI 自动看盘：市场雷达引擎
 */
export function marketRadarEngine(input: MarketSnapshotInput): MarketRadarResult {
  const stocks = input.stocks ?? [];
  const sectors = input.sectors ?? [];

  const upCount = stocks.filter((stock) => stock.changePct > 0).length;
  const downCount = stocks.filter((stock) => stock.changePct < 0).length;
  const flatCount = stocks.length - upCount - downCount;

  const upRatio = stocks.length > 0 ? upCount / stocks.length : 0;
  const strongSectorCount = sectors.filter((sector) => sector.changePct >= 1.5).length;
  const hotSectorAvgChange =
    sectors.length > 0
      ? sectors
          .slice()
          .sort((a, b) => b.changePct - a.changePct)
          .slice(0, 5)
          .reduce((sum, sector) => sum + sector.changePct, 0) / Math.min(5, sectors.length)
      : 0;

  const highVolumeRatio =
    stocks.length > 0 ? stocks.filter((stock) => safeNumber(stock.volumeRatio) >= 2.5).length / stocks.length : 0;

  const strongStockRatio =
    stocks.length > 0 ? stocks.filter((stock) => stock.changePct >= 5).length / stocks.length : 0;

  const weakStockRatio =
    stocks.length > 0 ? stocks.filter((stock) => stock.changePct <= -5).length / stocks.length : 0;

  const marketTemperature = clamp(
    upRatio * 25 +
      Math.min(strongSectorCount, 10) * 1.5 +
      Math.max(hotSectorAvgChange, 0) * 4 +
      highVolumeRatio * 15 +
      strongStockRatio * 15 -
      weakStockRatio * 10,
  );

  const marketRegime = detectMarketRegime(marketTemperature);
  const marketStyle = detectMarketStyle(input);

  const hotSectors = sectors
    .map((sector) => ({
      ...sector,
      heatScore: calculateSectorHeatScore(sector),
    }))
    .sort((a, b) => safeNumber(b.heatScore) - safeNumber(a.heatScore))
    .slice(0, 10);

  const weakSectors = sectors.slice().sort((a, b) => a.changePct - b.changePct).slice(0, 10);

  const hotStocks = stocks.slice().sort((a, b) => b.changePct - a.changePct).slice(0, 10);
  const weakStocks = stocks.slice().sort((a, b) => a.changePct - b.changePct).slice(0, 10);
  const highVolumeStocks = stocks
    .slice()
    .sort((a, b) => safeNumber(b.volumeRatio) - safeNumber(a.volumeRatio))
    .slice(0, 10);

  const riskSignals = generateMarketRiskSignals({
    marketTemperature,
    marketRegime,
    upCount,
    downCount,
    stocks,
    sectors,
    account: input.account,
  });

  const mainLine = hotSectors.slice(0, 3).map((sector) => sector.name).join("、") || "暂无明确主线";

  const oneLineSummary = `当前市场处于【${marketRegime}】状态，市场温度 ${Math.round(
    marketTemperature,
  )}/100，主线集中在 ${mainLine}，风格偏向【${marketStyle}】。`;

  const brief = [
    `【一句话判断】${oneLineSummary}`,
    `【市场状态】上涨 ${upCount} 家，下跌 ${downCount} 家，市场宽度${upCount >= downCount ? "偏积极" : "偏谨慎"}。`,
    `【主线板块】当前热度较高的方向为：${mainLine}。`,
    `【资金偏好】从高量比和强势个股分布看，短线资金偏向${marketStyle}。`,
    `【风险暗流】${riskSignals.length > 0 ? riskSignals.join("；") : "当前未识别到极端系统性风险信号。"}。`,
    `【对模拟账户影响】${
      input.account
        ? generatePortfolioImpactLine(input.account, hotSectors)
        : "当前未接入模拟账户，无法计算持仓影响。"
    }`,
    "【后续观察】关注主线板块持续性、成交量能否放大、强势股是否出现冲高回落。",
  ].join("\n");

  return {
    marketTemperature: Math.round(marketTemperature),
    marketRegime,
    marketStyle,
    upCount,
    downCount,
    flatCount,
    hotSectors,
    weakSectors,
    hotStocks,
    weakStocks,
    highVolumeStocks,
    riskSignals,
    oneLineSummary,
    brief,
    observationPoints: [
      "强势板块能否维持热度前三",
      "上涨家数是否继续大于下跌家数",
      "高量比个股是否继续扩散",
      "用户持仓是否跟随所属板块表现",
      "强势股是否出现涨速转负或冲高回落",
    ],
  };
}

function detectMarketRegime(score: number): MarketRegime {
  if (score >= 80) return "全面强势";
  if (score >= 65) return "结构性强势";
  if (score >= 50) return "震荡偏强";
  if (score >= 35) return "震荡分化";
  if (score >= 20) return "弱势调整";
  return "恐慌下跌";
}

function calculateSectorHeatScore(sector: SentinelSector): number {
  const total = Math.max(sector.upCount + sector.downCount, 1);
  const upRatio = sector.upCount / total;
  return clamp(
    Math.max(sector.changePct, 0) * 30 +
      upRatio * 25 +
      safeNumber(sector.turnoverRate) * 3 +
      Math.max(safeNumber(sector.leadingStockChangePct), 0) * 2,
  );
}

function detectMarketStyle(input: MarketSnapshotInput): MarketStyle {
  const sectorNames = input.sectors
    .slice()
    .sort((a, b) => b.changePct - a.changePct)
    .slice(0, 5)
    .map((sector) => sector.name)
    .join(" ");

  const upCount = input.stocks.filter((stock) => stock.changePct > 0).length;
  const downCount = input.stocks.filter((stock) => stock.changePct < 0).length;
  const strongSmallThemeCount = input.stocks.filter(
    (stock) => stock.changePct >= 5 && safeNumber(stock.amount) < 5_000_000_000,
  ).length;

  if (/半导体|芯片|软件|通信|人工智能|AI|算力|电子|计算机/.test(sectorNames)) return "科技成长";
  if (/银行|保险|煤炭|电力|公用事业|高速/.test(sectorNames)) return "低估值防御";
  if (/证券|银行|保险/.test(sectorNames) && upCount < downCount) return "权重拉升";
  if (/食品|白酒|消费|旅游|家电/.test(sectorNames)) return "消费修复";
  if (/金融|证券|银行|保险/.test(sectorNames)) return "金融护盘";
  if (strongSmallThemeCount >= 10) return "题材活跃";
  if (upCount > downCount * 1.5) return "风险偏好上升";
  if (downCount > upCount * 1.5) return "风险偏好下降";

  return "暂无明确风格";
}

function generateMarketRiskSignals(args: {
  marketTemperature: number;
  marketRegime: MarketRegime;
  upCount: number;
  downCount: number;
  stocks: SentinelStock[];
  sectors: SentinelSector[];
  account?: SentinelAccount;
}): string[] {
  const signals: string[] = [];
  const strongStocks = args.stocks.filter((stock) => stock.changePct >= 7);
  const weakStocks = args.stocks.filter((stock) => stock.changePct <= -5);
  const highVolumeStocks = args.stocks.filter((stock) => safeNumber(stock.volumeRatio) >= 3);

  if (args.marketTemperature < 35) {
    signals.push("市场温度偏低，整体风险偏好不足");
  }

  if (args.downCount > args.upCount * 1.5) {
    signals.push("下跌家数明显多于上涨家数，市场宽度偏弱");
  }

  if (weakStocks.length >= strongStocks.length && weakStocks.length > 0) {
    signals.push("大跌个股数量偏多，需关注亏钱效应扩散");
  }

  if (highVolumeStocks.length > 0 && strongStocks.length > 0) {
    signals.push("高量比强势股增多，短线波动可能放大");
  }

  if (args.account) {
    const concentrated = args.account.positions.filter((position) => position.positionRatio >= 0.3);
    if (concentrated.length > 0) {
      signals.push(`组合存在单股集中度风险：${concentrated.map((item) => item.name).join("、")}`);
    }
  }

  return signals;
}

function generatePortfolioImpactLine(account: SentinelAccount, hotSectors: SentinelSector[]): string {
  const hotSectorSet = new Set(hotSectors.slice(0, 5).map((sector) => sector.name));
  const exposed = account.positions.filter((position) => position.sector && hotSectorSet.has(position.sector));

  if (exposed.length === 0) {
    return "当前热门板块与模拟持仓直接重合度不高，账户更多受整体市场情绪影响。";
  }

  const totalExposure = exposed.reduce((sum, position) => sum + position.positionRatio, 0);
  return `你的模拟账户有 ${exposed.length} 个持仓暴露在当前热门方向，合计仓位约 ${pct(
    totalExposure * 100,
  )}，相关标的包括：${exposed.map((position) => position.name).join("、")}。`;
}

/**
 * 2. AI 自动盯盘：信号引擎
 */
export function signalEngine(args: {
  stocks: SentinelStock[];
  sectors: SentinelSector[];
  account?: SentinelAccount;
  userThresholds?: {
    upPct?: number;
    downPct?: number;
    volumeRatio?: number;
    turnoverRate?: number;
  };
  marketRadar?: MarketRadarResult;
}): Signal[] {
  const signals: Signal[] = [];
  const sectorRankMap = new Map<string, number>();
  const hotSectors = args.sectors.slice().sort((a, b) => b.changePct - a.changePct);

  hotSectors.forEach((sector, index) => {
    sectorRankMap.set(sector.name, index + 1);
  });

  const thresholds = {
    upPct: args.userThresholds?.upPct ?? 5,
    downPct: args.userThresholds?.downPct ?? -3,
    volumeRatio: args.userThresholds?.volumeRatio ?? 2.5,
    turnoverRate: args.userThresholds?.turnoverRate ?? 8,
  };

  for (const stock of args.stocks) {
    const position = findPosition(args.account, stock.code);
    const relatedToPosition = Boolean(position);
    const relatedToPlan = Boolean(position?.plan);
    const sector = getSectorForStock(stock, args.account);
    const sectorRank = sector ? sectorRankMap.get(sector) : undefined;

    const pushSignal = (
      signalName: string,
      signalType: SignalType,
      score: number,
      evidence: string[],
      forceRelatedToPlan = false,
    ) => {
      signals.push({
        id: `${stock.code}-${signalName}-${Date.now()}-${signals.length}`,
        code: stock.code,
        name: stock.name,
        signalName,
        signalType,
        score,
        evidence,
        relatedToPosition,
        relatedToPlan: relatedToPlan || forceRelatedToPlan,
        triggeredAt: nowIso(),
      });
    };

    if (stock.changePct >= thresholds.upPct) {
      pushSignal("涨幅超过用户阈值", "PRICE", 20, [`今日涨幅 ${pct(stock.changePct)}，超过阈值 ${pct(thresholds.upPct)}`]);
    }

    if (stock.changePct <= thresholds.downPct) {
      pushSignal("跌幅超过用户阈值", "PRICE", 20, [`今日跌幅 ${pct(stock.changePct)}，低于阈值 ${pct(thresholds.downPct)}`]);
    }

    if (typeof stock.high20 === "number" && stock.price >= stock.high20) {
      pushSignal("突破近20日高点", "PRICE", 20, [`当前价 ${stock.price}，近20日高点 ${stock.high20}`]);
    }

    if (typeof stock.low20 === "number" && stock.price <= stock.low20) {
      pushSignal("跌破近20日低点", "PRICE", 20, [`当前价 ${stock.price}，近20日低点 ${stock.low20}`]);
    }

    if (position && Math.abs(stock.price - position.costPrice) / Math.max(position.costPrice, 1) <= 0.01) {
      pushSignal("接近用户成本价", "POSITION", 15, [`当前价 ${stock.price} 接近成本价 ${position.costPrice}`]);
    }

    if (position?.stopLossPrice && stock.price <= position.stopLossPrice) {
      pushSignal("接近或跌破止损观察线", "RISK", 25, [`当前价 ${stock.price}，止损观察线 ${position.stopLossPrice}`]);
    }

    if (position?.targetPrice && stock.price >= position.targetPrice) {
      pushSignal("接近目标观察价", "PRICE", 15, [`当前价 ${stock.price}，目标观察价 ${position.targetPrice}`]);
    }

    if (safeNumber(stock.volumeRatio) >= thresholds.volumeRatio) {
      pushSignal("放量异动", "VOLUME", 20, [`量比 ${safeNumber(stock.volumeRatio).toFixed(2)}，超过阈值 ${thresholds.volumeRatio}`]);
    }

    if (safeNumber(stock.avg20Volume) > 0 && safeNumber(stock.volume) >= safeNumber(stock.avg20Volume) * 2) {
      pushSignal("成交量高于20日均量2倍", "VOLUME", 20, [
        `当前成交量 ${safeNumber(stock.volume).toLocaleString("zh-CN")}，20日均量 ${safeNumber(stock.avg20Volume).toLocaleString("zh-CN")}`,
      ]);
    }

    if (safeNumber(stock.turnoverRate) >= thresholds.turnoverRate) {
      pushSignal("高换手", "VOLUME", 15, [`换手率 ${pct(safeNumber(stock.turnoverRate))}`]);
    }

    if (safeNumber(stock.fiveMinChangePct) >= 2) {
      pushSignal("快速拉升", "SPEED", 20, [`5分钟涨幅 ${pct(safeNumber(stock.fiveMinChangePct))}`]);
    }

    if (safeNumber(stock.tenMinChangePct) >= 3) {
      pushSignal("10分钟急速拉升", "SPEED", 20, [`10分钟涨幅 ${pct(safeNumber(stock.tenMinChangePct))}`]);
    }

    if (stock.changePct >= 5 && safeNumber(stock.speed) < 0) {
      pushSignal("涨速转负", "SPEED", 20, [`今日涨幅 ${pct(stock.changePct)}，但涨速转负 ${safeNumber(stock.speed).toFixed(2)}`]);
    }

    if (stock.changePct >= 7 && safeNumber(stock.speed) < 0) {
      pushSignal("冲高回落风险", "RISK", 25, [`涨幅 ${pct(stock.changePct)} 后涨速转负，存在冲高回落风险`]);
    }

    if (sectorRank && sectorRank <= 10 && stock.changePct > 0) {
      pushSignal("板块共振", "SECTOR", 20, [`所属行业 ${sector} 位列热度第 ${sectorRank}，个股同步上涨 ${pct(stock.changePct)}`]);
    }

    if (sectorRank && sectorRank <= 10 && stock.changePct <= 0) {
      pushSignal("弱于板块", "SECTOR", 20, [`所属行业 ${sector} 位列热度第 ${sectorRank}，但个股未跟随上涨`]);
    }

    if (args.marketRadar?.marketRegime === "弱势调整" && stock.changePct > 3) {
      pushSignal("逆势走强", "SECTOR", 15, [`市场处于弱势调整，但个股上涨 ${pct(stock.changePct)}`]);
    }

    if (
      args.marketRadar &&
      ["全面强势", "结构性强势", "震荡偏强"].includes(args.marketRadar.marketRegime) &&
      stock.changePct < -2
    ) {
      pushSignal("逆势走弱", "RISK", 25, [`市场状态为 ${args.marketRadar.marketRegime}，但个股下跌 ${pct(stock.changePct)}`]);
    }

    if (position && stock.changePct <= -3 && safeNumber(stock.volumeRatio) >= 2) {
      pushSignal("持仓股放量下跌", "RISK", 25, [`持仓股下跌 ${pct(stock.changePct)}，量比 ${safeNumber(stock.volumeRatio).toFixed(2)}`]);
    }

    if (position && position.positionRatio >= 0.3) {
      pushSignal("单股仓位超过30%", "POSITION", 15, [`${position.name} 仓位 ${pct(position.positionRatio * 100)}`]);
    }

    if (position?.riskLevel === "High" && position.positionRatio >= 0.2) {
      pushSignal("高风险股票仓位超过20%", "RISK", 25, [`${position.name} 风险等级 High，仓位 ${pct(position.positionRatio * 100)}`]);
    }

    if (position?.plan && /不追高|等待回调|回调/.test(position.plan) && stock.changePct >= 5) {
      pushSignal(
        "交易计划偏离：原计划不追高但股价大幅拉升",
        "PLAN",
        15,
        [`原计划：${position.plan}`, `当前涨幅：${pct(stock.changePct)}`],
        true,
      );
    }

    if (position?.plan && /中线|长期|持有/.test(position.plan) && stock.changePct <= -4) {
      pushSignal(
        "交易计划检查：中线持有遇到明显回撤",
        "PLAN",
        15,
        [`原计划：${position.plan}`, `当前跌幅：${pct(stock.changePct)}`],
        true,
      );
    }
  }

  return signals;
}

/**
 * 3. 提醒引擎
 */
export function alertEngine(args: {
  signals: Signal[];
  previousAlerts?: Alert[];
  dedupeWindowMinutes?: number;
}): Alert[] {
  const dedupeWindowMs = (args.dedupeWindowMinutes ?? 10) * 60 * 1000;
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

    const duplicate = previous.some((alert) => {
      const created = new Date(alert.createdAt).getTime();
      const closeInTime = Date.now() - created <= dedupeWindowMs;
      const sameCode = alert.code === code;
      const sameSignal = alert.signals.some((existing) =>
        signals.some((current) => current.signalName === existing.signalName),
      );
      return sameCode && sameSignal && closeInTime;
    });

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
    if (position.positionRatio >= 0.35) {
      riskItems.push({
        id: `risk-concentration-${position.code}`,
        level: "High",
        title: "单股集中度风险",
        reason: `${position.name} 仓位达到 ${pct(position.positionRatio * 100)}，单股集中度偏高。`,
        affectedPositions: [position.name],
        evidence: [`仓位 ${pct(position.positionRatio * 100)}`],
        observationPoints: ["观察该持仓是否出现放量下跌", "观察该持仓所属板块是否走弱"],
      });
    } else if (position.positionRatio >= 0.25) {
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

    if (position.riskLevel === "High" && position.positionRatio >= 0.2) {
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
    if (exposure >= 0.5) {
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
    const positionRatio = args.account.marketValue / Math.max(args.account.totalAsset, 1);
    if (positionRatio >= 0.7) {
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

  const rawRiskScore = riskItems.reduce((sum, item) => {
    if (item.level === "Critical") return sum + 35;
    if (item.level === "High") return sum + 25;
    if (item.level === "Medium") return sum + 15;
    return sum + 8;
  }, 0);

  const riskScore = clamp(rawRiskScore);
  const overallRiskLevel: RiskLevel =
    riskScore >= 80 ? "Critical" : riskScore >= 55 ? "High" : riskScore >= 30 ? "Medium" : "Low";

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

function calculateSectorExposure(positions: SentinelPosition[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const position of positions) {
    const sector = position.sector ?? "未分类";
    map.set(sector, (map.get(sector) ?? 0) + position.positionRatio);
  }
  return map;
}

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
    `总资产 ${money(args.account.totalAsset)}`,
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
    date: args.date ?? new Date().toISOString().slice(0, 10),
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

/**
 * 7. 合规过滤
 */
export function complianceEngine(text: string): string {
  const replacements: Array<[RegExp, string]> = [
    [/建议买入/g, "可以纳入观察"],
    [/建议卖出/g, "需要关注风险变化"],
    [/满仓/g, "高仓位"],
    [/清仓/g, "降低风险暴露"],
    [/必涨/g, "存在上涨可能但需验证"],
    [/必跌/g, "存在下行风险但需验证"],
    [/稳赚/g, "收益不确定"],
    [/保证收益/g, "不保证收益"],
    [/内幕消息/g, "未经验证信息"],
    [/确定上涨/g, "可能走强但需验证"],
    [/确定下跌/g, "可能走弱但需验证"],
    [/目标价承诺/g, "观察价位"],
  ];

  let output = text;

  for (const [pattern, replacement] of replacements) {
    output = output.replace(pattern, replacement);
  }

  const riskDisclaimer = "本内容仅用于模拟实盘、市场观察和学习演示，不构成投资建议。";

  if (!output.includes(riskDisclaimer)) {
    output += `\n\n${riskDisclaimer}`;
  }

  return output;
}

/**
 * 8. Demo 数据生成器
 */
export function generateSentinelDemoData(): {
  indices: SentinelIndex[];
  stocks: SentinelStock[];
  sectors: SentinelSector[];
  account: SentinelAccount;
  newsEvents: Array<{
    title: string;
    relatedCodes?: string[];
    relatedSectors?: string[];
    sentiment?: "positive" | "negative" | "neutral";
    source?: string;
    time?: string;
  }>;
} {
  const sectors: SentinelSector[] = [
    { name: "半导体", changePct: 3.2, upCount: 48, downCount: 9, turnoverRate: 4.8, leadingStock: "寒武纪", leadingStockChangePct: 7.6 },
    { name: "人工智能", changePct: 2.7, upCount: 55, downCount: 16, turnoverRate: 5.1, leadingStock: "科大讯飞", leadingStockChangePct: 5.8 },
    { name: "新能源", changePct: 1.1, upCount: 38, downCount: 24, turnoverRate: 2.9, leadingStock: "宁德时代", leadingStockChangePct: 1.9 },
    { name: "白酒", changePct: -0.8, upCount: 9, downCount: 23, turnoverRate: 1.2, leadingStock: "贵州茅台", leadingStockChangePct: -1.1 },
    { name: "银行", changePct: -0.4, upCount: 12, downCount: 28, turnoverRate: 0.8, leadingStock: "平安银行", leadingStockChangePct: -0.7 },
    { name: "通信设备", changePct: 2.2, upCount: 36, downCount: 11, turnoverRate: 3.9, leadingStock: "中际旭创", leadingStockChangePct: 6.2 },
  ];

  const stocks: SentinelStock[] = [
    {
      code: "688256", name: "寒武纪", price: 668, prevClose: 621, changePct: 7.6,
      fiveMinChangePct: 2.6, tenMinChangePct: 3.7, speed: -0.2, volumeRatio: 3.4,
      turnoverRate: 9.8, amount: 8_200_000_000, volume: 820_000, avg20Volume: 350_000,
      high20: 660, low20: 540, sector: "半导体", concepts: ["人工智能", "算力", "芯片"], isWatchlist: true,
    },
    {
      code: "002230", name: "科大讯飞", price: 51.2, prevClose: 48.4, changePct: 5.8,
      fiveMinChangePct: 1.9, tenMinChangePct: 3.1, speed: 0.4, volumeRatio: 2.8,
      turnoverRate: 7.2, amount: 4_900_000_000, volume: 1_200_000, avg20Volume: 590_000,
      high20: 52, low20: 43, sector: "人工智能", concepts: ["AI 应用", "教育信息化"], isWatchlist: true,
    },
    {
      code: "300750", name: "宁德时代", price: 193.6, prevClose: 190, changePct: 1.9,
      fiveMinChangePct: 0.4, tenMinChangePct: 0.7, speed: 0.1, volumeRatio: 1.6,
      turnoverRate: 2.4, amount: 7_100_000_000, volume: 900_000, avg20Volume: 760_000,
      high20: 205, low20: 176, sector: "新能源", concepts: ["锂电池", "储能"], isWatchlist: true,
    },
    {
      code: "600519", name: "贵州茅台", price: 1432, prevClose: 1448, changePct: -1.1,
      fiveMinChangePct: -0.2, tenMinChangePct: -0.4, speed: -0.1, volumeRatio: 1.1,
      turnoverRate: 0.6, amount: 3_800_000_000, volume: 180_000, avg20Volume: 170_000,
      high20: 1510, low20: 1410, sector: "白酒", concepts: ["消费", "白酒"], isWatchlist: true,
    },
    {
      code: "000001", name: "平安银行", price: 11.1, prevClose: 11.18, changePct: -0.7,
      fiveMinChangePct: -0.1, tenMinChangePct: -0.2, speed: 0, volumeRatio: 0.9,
      turnoverRate: 0.8, amount: 1_200_000_000, volume: 780_000, avg20Volume: 820_000,
      high20: 11.9, low20: 10.8, sector: "银行", concepts: ["金融", "低估值"], isWatchlist: false,
    },
  ];

  const positions: SentinelPosition[] = [
    { code: "688256", name: "寒武纪", quantity: 200, costPrice: 620, currentPrice: 668, marketValue: 133_600, unrealizedPnl: 9_600, unrealizedPnlPct: 7.74, positionRatio: 0.133, sector: "半导体", concepts: ["人工智能", "算力", "芯片"], plan: "高波动观察，不追高，只观察回调后的持续性", riskLevel: "High", watchReason: "AI 算力方向核心观察标的", stopLossPrice: 585, targetPrice: 680 },
    { code: "300750", name: "宁德时代", quantity: 900, costPrice: 190, currentPrice: 193.6, marketValue: 174_240, unrealizedPnl: 3_240, unrealizedPnlPct: 1.89, positionRatio: 0.174, sector: "新能源", concepts: ["锂电池", "储能"], plan: "中线持有，观察新能源板块修复", riskLevel: "Medium", watchReason: "新能源龙头", stopLossPrice: 178, targetPrice: 210 },
    { code: "600519", name: "贵州茅台", quantity: 100, costPrice: 1450, currentPrice: 1432, marketValue: 143_200, unrealizedPnl: -1_800, unrealizedPnlPct: -1.24, positionRatio: 0.143, sector: "白酒", concepts: ["消费", "白酒"], plan: "稳定配置，观察消费防御属性", riskLevel: "Low", watchReason: "消费龙头", stopLossPrice: 1380, targetPrice: 1520 },
    { code: "002230", name: "科大讯飞", quantity: 2500, costPrice: 48, currentPrice: 51.2, marketValue: 128_000, unrealizedPnl: 8_000, unrealizedPnlPct: 6.67, positionRatio: 0.128, sector: "人工智能", concepts: ["AI 应用", "教育信息化"], plan: "关注 AI 应用板块共振，不追高", riskLevel: "High", watchReason: "AI 应用方向", stopLossPrice: 45, targetPrice: 55 },
  ];

  const marketValue = positions.reduce((sum, p) => sum + p.marketValue, 0);
  const cash = 420_000;
  const totalAsset = cash + marketValue;

  const account: SentinelAccount = {
    totalAsset, cash, marketValue, todayPnl: 3_800, totalPnl: 8_800, totalReturnPct: 0.88,
    maxDrawdownPct: -3.2, positions,
    trades: [{ id: "trade-1", code: "688256", name: "寒武纪", side: "BUY", quantity: 50, price: 620, amount: 31_000, fee: 7.75, createdAt: new Date().toISOString() }],
  };

  return {
    indices: [
      { code: "000001", name: "上证指数", price: 3188.2, changePct: 0.42, amount: 390_000_000_000 },
      { code: "399001", name: "深证成指", price: 10242.8, changePct: 0.83, amount: 510_000_000_000 },
      { code: "399006", name: "创业板指", price: 2044.6, changePct: 1.12, amount: 250_000_000_000 },
    ],
    stocks, sectors, account,
    newsEvents: [
      { title: "模拟事件：AI 算力方向盘中热度提升，半导体与人工智能板块同步走强", relatedCodes: ["688256", "002230"], relatedSectors: ["半导体", "人工智能"], sentiment: "positive", source: "mock", time: new Date().toISOString() },
    ],
  };
}

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
  const data = { ...demo, ...input };
  const marketRadar = marketRadarEngine({ indices: data.indices, stocks: data.stocks, sectors: data.sectors, account: data.account });
  const signals = signalEngine({ stocks: data.stocks, sectors: data.sectors, account: data.account, marketRadar });
  const alerts = alertEngine({ signals });
  const risk = riskEngine({ account: data.account, marketRadar, alerts });
  const causalityReports = data.stocks.slice(0, 3).map((stock) => causalityEngine({ stock, account: data.account, marketRadar, sectors: data.sectors, signals, newsEvents: data.newsEvents }));
  const journal = journalEngine({ account: data.account, marketRadar, alerts, risk });
  return { marketRadar, signals, alerts, risk, causalityReports, journal };
}
