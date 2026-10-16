// 盯盘信号：按价格、量能、涨速、板块、持仓和交易计划逐只生成信号。

import type { SignalType, SentinelStock, SentinelSector, SentinelAccount, MarketRadarResult, Signal } from "./types";
import { safeNumber, pct, nowIso, findPosition, getSectorForStock } from "./utils";
import { rankSectorsByHeat } from "./radar";
import { POSITION, SIGNAL } from "../thresholds";

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
  const sectorByName = new Map(args.sectors.map((sector) => [sector.name, sector]));
  // 与市场雷达同一口径：按 heatScore 排「热度第 N」，而不是按原始涨跌幅
  rankSectorsByHeat(args.sectors).forEach((sector, index) => {
    sectorRankMap.set(sector.name, index + 1);
  });

  const thresholds = {
    upPct: args.userThresholds?.upPct ?? SIGNAL.UP_PCT,
    downPct: args.userThresholds?.downPct ?? SIGNAL.DOWN_PCT,
    volumeRatio: args.userThresholds?.volumeRatio ?? SIGNAL.VOLUME_RATIO,
    turnoverRate: args.userThresholds?.turnoverRate ?? SIGNAL.TURNOVER_RATE,
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

    const sectorData = sector ? sectorByName.get(sector) : undefined;

    if (sectorRank && sectorRank <= SIGNAL.HOT_SECTOR_RANK && stock.changePct > 0) {
      pushSignal("板块共振", "SECTOR", 20, [`所属行业 ${sector} 位列热度第 ${sectorRank}，个股同步上涨 ${pct(stock.changePct)}`]);
    }

    // 只在板块本身上涨、个股明显落后于板块时触发；以前所有 ≤0 的股票都会命中
    if (
      sectorRank &&
      sectorRank <= SIGNAL.HOT_SECTOR_RANK &&
      sectorData &&
      sectorData.changePct > 0 &&
      stock.changePct < sectorData.changePct - SIGNAL.WEAKER_THAN_SECTOR_PCT
    ) {
      pushSignal("弱于板块", "SECTOR", 20, [
        `所属行业 ${sector} 位列热度第 ${sectorRank}（板块 ${pct(sectorData.changePct)}），个股仅 ${pct(stock.changePct)}`,
      ]);
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

    if (position && position.positionRatio >= POSITION.SINGLE_HIGH) {
      pushSignal(`单股仓位超过${Math.round(POSITION.SINGLE_HIGH * 100)}%`, "POSITION", 15, [
        `${position.name} 仓位 ${pct(position.positionRatio * 100)}`,
      ]);
    }

    if (position?.riskLevel === "High" && position.positionRatio >= POSITION.HIGH_RISK_STOCK) {
      pushSignal(`高风险股票仓位超过${Math.round(POSITION.HIGH_RISK_STOCK * 100)}%`, "RISK", 25, [
        `${position.name} 风险等级 High，仓位 ${pct(position.positionRatio * 100)}`,
      ]);
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
