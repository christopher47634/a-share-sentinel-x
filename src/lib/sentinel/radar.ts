// 市场雷达：市场温度、状态、风格、热门板块与风险暗流。

import type { MarketRegime, MarketStyle, SentinelStock, SentinelSector, SentinelAccount, MarketSnapshotInput, MarketRadarResult } from "./types";
import { clamp, safeNumber, pct } from "./utils";
import { MARKET, POSITION } from "../thresholds";

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

  const hotSectors = rankSectorsByHeat(sectors).slice(0, 10);

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

/** 雷达和信号引擎共用的板块排名：按 heatScore 从高到低 */
export function rankSectorsByHeat(sectors: SentinelSector[]): SentinelSector[] {
  return sectors
    .map((sector) => ({ ...sector, heatScore: calculateSectorHeatScore(sector) }))
    .sort((a, b) => safeNumber(b.heatScore) - safeNumber(a.heatScore));
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
  const strongStocks = args.stocks.filter((stock) => stock.changePct >= MARKET.STRONG_STOCK_PCT);
  const weakStocks = args.stocks.filter((stock) => stock.changePct <= MARKET.WEAK_STOCK_PCT);
  const highVolumeStocks = args.stocks.filter((stock) => safeNumber(stock.volumeRatio) >= MARKET.HIGH_VOLUME_RATIO);

  if (args.marketTemperature < 35) {
    signals.push("市场温度偏低，整体风险偏好不足");
  }

  if (args.downCount > args.upCount * 1.5) {
    signals.push("下跌家数明显多于上涨家数，市场宽度偏弱");
  }

  // 样本很小时「大跌 1 只、大涨 0 只」也会触发，所以要求大跌个股多于大涨个股且占到一定比例
  const weakShareFloor = Math.max(2, Math.ceil(args.stocks.length * MARKET.WEAK_STOCK_SHARE));
  if (weakStocks.length > strongStocks.length && weakStocks.length >= weakShareFloor) {
    signals.push("大跌个股数量偏多，需关注亏钱效应扩散");
  }

  if (highVolumeStocks.length > 0 && strongStocks.length > 0) {
    signals.push("高量比强势股增多，短线波动可能放大");
  }

  if (args.account) {
    const concentrated = args.account.positions.filter((position) => position.positionRatio >= POSITION.SINGLE_HIGH);
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
