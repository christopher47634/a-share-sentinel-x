/**
 * Sentinel 引擎的阈值集中在这里。以前同一概念在不同函数里写成 0.25 / 0.3 / 0.35，
 * 现在单股集中度只有两档：WATCH（纳入观察）和 HIGH（高风险）。
 */
export const POSITION = {
  /** 单股仓位纳入观察 */
  SINGLE_WATCH: 0.25,
  /** 单股仓位过高：信号、市场风险提示、风险护盾 High 共用这一条线 */
  SINGLE_HIGH: 0.3,
  /** 标记为高风险的持仓，仓位超过这条线就提示 */
  HIGH_RISK_STOCK: 0.2,
  /** 单一行业暴露过高 */
  SECTOR_HIGH: 0.5,
  /** 弱势市场下总仓位过高 */
  WEAK_MARKET_TOTAL: 0.7,
} as const;

export const SIGNAL = {
  UP_PCT: 5,
  DOWN_PCT: -3,
  VOLUME_RATIO: 2.5,
  TURNOVER_RATE: 8,
  /** 板块热度排名前 N 才算「热门板块」 */
  HOT_SECTOR_RANK: 10,
  /** 个股比所属板块弱这么多个百分点才算「弱于板块」 */
  WEAKER_THAN_SECTOR_PCT: 1,
} as const;

export const MARKET = {
  STRONG_STOCK_PCT: 7,
  WEAK_STOCK_PCT: -5,
  HIGH_VOLUME_RATIO: 3,
  /** 大跌个股至少占样本的这个比例，才提示亏钱效应 */
  WEAK_STOCK_SHARE: 0.1,
} as const;

/** 风险项计分：同一持仓的多条风险只计最高一条 */
export const RISK_WEIGHT = {
  Critical: 35,
  High: 25,
  Medium: 15,
  Low: 8,
} as const;

export const RISK_LEVEL_CUTOFF = {
  Critical: 80,
  High: 55,
  Medium: 30,
} as const;

export const ALERT = {
  DEDUPE_WINDOW_MINUTES: 10,
} as const;
