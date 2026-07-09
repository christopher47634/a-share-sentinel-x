// ─── Stock Mock Data ──────────────────────────────────────────────
// Stock performance correlates with sector strength.
// Strong sectors: 4-5 positive, 1 slightly negative (realistic intraday noise).
// Weak sectors:  4-5 negative, 1 slightly positive.
// PE ratios reflect real A-share valuations (negative for unprofitable co's).

export interface Stock {
  code: string;
  name: string;
  sectorId: string;
  price: number;
  changePercent: number;
  changeAmount: number;
  volume: string;
  turnover: string;
  turnoverRate: number;
  marketCap: string;
  pe: number;
  high: number;
  low: number;
  open: number;
  prevClose: number;
  /** Optional risk warning for high-volatility or overvalued stocks */
  riskWarning?: string;
}

export const stocks: Stock[] = [
  // ─── 光通信 (sector change +3.85%, hotRank 2, trend up) ─────────
  // 4 positive + 1 slightly negative (亨通光电 profit-taking)
  { code: "300308", name: "中际旭创", sectorId: "optical-communication", price: 128.56, changePercent: 5.23, changeAmount: 6.38, volume: "3.2亿", turnover: "41.2亿", turnoverRate: 4.8, marketCap: "1028亿", pe: 28.5, high: 131.2, low: 121.3, open: 122.1, prevClose: 122.18 },
  { code: "300502", name: "新易盛", sectorId: "optical-communication", price: 86.42, changePercent: 3.67, changeAmount: 3.06, volume: "2.1亿", turnover: "18.1亿", turnoverRate: 3.2, marketCap: "518亿", pe: 32.1, high: 88.9, low: 82.5, open: 83.0, prevClose: 83.36 },
  { code: "300394", name: "天孚通信", sectorId: "optical-communication", price: 156.78, changePercent: 2.45, changeAmount: 3.76, volume: "1.5亿", turnover: "23.5亿", turnoverRate: 2.9, marketCap: "627亿", pe: 35.2, high: 158.3, low: 151.2, open: 152.5, prevClose: 153.02 },
  { code: "600487", name: "亨通光电", sectorId: "optical-communication", price: 18.53, changePercent: -0.28, changeAmount: -0.05, volume: "4.8亿", turnover: "9.1亿", turnoverRate: 2.1, marketCap: "373亿", pe: 18.6, high: 19.2, low: 18.4, open: 18.5, prevClose: 18.58 },
  { code: "300548", name: "博创科技", sectorId: "optical-communication", price: 42.15, changePercent: 6.12, changeAmount: 2.43, volume: "1.8亿", turnover: "7.6亿", turnoverRate: 5.6, marketCap: "85亿", pe: 42.3, high: 43.8, low: 39.2, open: 39.8, prevClose: 39.72, riskWarning: "换手率偏高：短线资金活跃，注意追高风险" },

  // ─── 算力 (sector change +2.73%, hotRank 1, trend up) ──────────
  // 4 positive + 1 negative (海康威视 — large-cap laggard)
  { code: "000977", name: "浪潮信息", sectorId: "computing-power", price: 35.67, changePercent: 3.45, changeAmount: 1.19, volume: "8.6亿", turnover: "30.7亿", turnoverRate: 5.8, marketCap: "523亿", pe: 22.4, high: 36.8, low: 34.1, open: 34.5, prevClose: 34.48 },
  { code: "603019", name: "中科曙光", sectorId: "computing-power", price: 52.34, changePercent: 2.89, changeAmount: 1.47, volume: "5.2亿", turnover: "27.2亿", turnoverRate: 3.6, marketCap: "768亿", pe: 35.8, high: 53.6, low: 50.2, open: 50.8, prevClose: 50.87 },
  { code: "000938", name: "紫光股份", sectorId: "computing-power", price: 24.89, changePercent: 1.56, changeAmount: 0.38, volume: "6.3亿", turnover: "15.7亿", turnoverRate: 2.2, marketCap: "712亿", pe: 28.9, high: 25.4, low: 24.2, open: 24.5, prevClose: 24.51 },
  { code: "002415", name: "海康威视", sectorId: "computing-power", price: 32.45, changePercent: -0.73, changeAmount: -0.24, volume: "7.8亿", turnover: "25.3亿", turnoverRate: 0.8, marketCap: "3031亿", pe: 20.1, high: 33.1, low: 31.8, open: 32.7, prevClose: 32.69 },
  { code: "688256", name: "寒武纪", sectorId: "computing-power", price: 268.90, changePercent: 4.56, changeAmount: 11.70, volume: "2.1亿", turnover: "56.5亿", turnoverRate: 4.2, marketCap: "1124亿", pe: -156.2, high: 275.3, low: 255.8, open: 257.0, prevClose: 257.20, riskWarning: "高估值风险：公司持续亏损，市盈率为负；股价波动剧烈" },

  // ─── 半导体 (sector change +1.92%, hotRank 4, trend up) ────────
  // 4 positive + 1 slightly negative (韦尔股份 — 游资分歧)
  { code: "688981", name: "中芯国际", sectorId: "semiconductor", price: 78.45, changePercent: 2.34, changeAmount: 1.79, volume: "4.5亿", turnover: "35.3亿", turnoverRate: 2.3, marketCap: "6200亿", pe: 45.6, high: 79.8, low: 76.2, open: 76.5, prevClose: 76.66 },
  { code: "002371", name: "北方华创", sectorId: "semiconductor", price: 342.56, changePercent: 1.78, changeAmount: 5.99, volume: "1.2亿", turnover: "41.1亿", turnoverRate: 1.8, marketCap: "1812亿", pe: 52.3, high: 348.0, low: 335.2, open: 336.5, prevClose: 336.57 },
  { code: "603501", name: "韦尔股份", sectorId: "semiconductor", price: 112.34, changePercent: -0.45, changeAmount: -0.51, volume: "3.2亿", turnover: "35.9亿", turnoverRate: 2.6, marketCap: "1356亿", pe: 38.9, high: 114.5, low: 110.8, open: 113.0, prevClose: 112.85 },
  { code: "688012", name: "中微公司", sectorId: "semiconductor", price: 156.78, changePercent: 3.12, changeAmount: 4.74, volume: "1.8亿", turnover: "28.2亿", turnoverRate: 2.9, marketCap: "942亿", pe: 65.2, high: 159.3, low: 150.5, open: 151.8, prevClose: 152.04, riskWarning: "估值偏高：半导体设备估值溢价，PE高于行业均值" },
  { code: "688396", name: "华润微", sectorId: "semiconductor", price: 48.92, changePercent: 1.23, changeAmount: 0.59, volume: "2.5亿", turnover: "12.2亿", turnoverRate: 1.9, marketCap: "587亿", pe: 32.1, high: 49.8, low: 47.6, open: 48.0, prevClose: 48.33 },

  // ─── 矿山 (sector change -0.86%, hotRank 9, trend down) ───────
  // 4 negative + 1 positive (紫金矿业 — 黄金避险)
  { code: "002466", name: "天齐锂业", sectorId: "mining", price: 42.56, changePercent: -2.34, changeAmount: -1.02, volume: "5.6亿", turnover: "23.8亿", turnoverRate: 3.4, marketCap: "694亿", pe: 15.8, high: 44.2, low: 41.8, open: 43.8, prevClose: 43.58 },
  { code: "601899", name: "紫金矿业", sectorId: "mining", price: 16.78, changePercent: 0.48, changeAmount: 0.08, volume: "12.3亿", turnover: "20.6亿", turnoverRate: 1.6, marketCap: "4412亿", pe: 12.3, high: 17.1, low: 16.5, open: 16.7, prevClose: 16.70 },
  { code: "601088", name: "中国神华", sectorId: "mining", price: 38.92, changePercent: -0.26, changeAmount: -0.10, volume: "6.8亿", turnover: "26.5亿", turnoverRate: 0.3, marketCap: "7734亿", pe: 10.2, high: 39.5, low: 38.5, open: 39.0, prevClose: 39.02 },
  { code: "603993", name: "洛阳钼业", sectorId: "mining", price: 8.45, changePercent: -1.17, changeAmount: -0.10, volume: "8.9亿", turnover: "7.5亿", turnoverRate: 2.1, marketCap: "1823亿", pe: 8.9, high: 8.7, low: 8.3, open: 8.6, prevClose: 8.55 },
  { code: "002460", name: "赣锋锂业", sectorId: "mining", price: 38.12, changePercent: -1.85, changeAmount: -0.72, volume: "4.2亿", turnover: "16.0亿", turnoverRate: 2.8, marketCap: "769亿", pe: 22.4, high: 39.5, low: 37.6, open: 39.0, prevClose: 38.84 },

  // ─── 新能源 (sector change +1.45%, hotRank 6, trend up) ───────
  // 4 positive + 1 negative (中环股份 — 产业链价格承压)
  { code: "601012", name: "隆基绿能", sectorId: "new-energy", price: 22.34, changePercent: 1.68, changeAmount: 0.37, volume: "9.2亿", turnover: "20.6亿", turnoverRate: 1.2, marketCap: "1693亿", pe: 18.5, high: 22.8, low: 21.8, open: 21.9, prevClose: 21.97 },
  { code: "300750", name: "宁德时代", sectorId: "new-energy", price: 198.56, changePercent: 2.12, changeAmount: 4.12, volume: "3.8亿", turnover: "75.5亿", turnoverRate: 0.9, marketCap: "8720亿", pe: 22.8, high: 201.3, low: 193.5, open: 194.2, prevClose: 194.44 },
  { code: "300274", name: "阳光电源", sectorId: "new-energy", price: 78.90, changePercent: 1.45, changeAmount: 1.13, volume: "4.5亿", turnover: "35.5亿", turnoverRate: 2.2, marketCap: "1182亿", pe: 15.6, high: 80.2, low: 77.1, open: 77.5, prevClose: 77.77 },
  { code: "002129", name: "中环股份", sectorId: "new-energy", price: 15.67, changePercent: -0.82, changeAmount: -0.13, volume: "6.1亿", turnover: "9.6亿", turnoverRate: 1.8, marketCap: "510亿", pe: 25.3, high: 16.0, low: 15.4, open: 15.8, prevClose: 15.80 },
  { code: "688599", name: "天合光能", sectorId: "new-energy", price: 28.45, changePercent: 0.53, changeAmount: 0.15, volume: "3.5亿", turnover: "10.0亿", turnoverRate: 1.6, marketCap: "618亿", pe: 20.1, high: 28.9, low: 28.0, open: 28.2, prevClose: 28.30 },

  // ─── 机器人 (sector change +2.31%, hotRank 5, trend up) ───────
  // 4 positive + 1 slightly negative (步科股份 — 小盘股获利回吐)
  { code: "300124", name: "汇川技术", sectorId: "robotics", price: 62.34, changePercent: 3.56, changeAmount: 2.14, volume: "5.8亿", turnover: "36.2亿", turnoverRate: 2.2, marketCap: "1656亿", pe: 35.8, high: 63.8, low: 59.5, open: 60.0, prevClose: 60.20 },
  { code: "688017", name: "绿的谐波", sectorId: "robotics", price: 89.56, changePercent: 4.23, changeAmount: 3.64, volume: "2.3亿", turnover: "20.6亿", turnoverRate: 3.8, marketCap: "150亿", pe: 85.2, high: 92.3, low: 85.2, open: 86.0, prevClose: 85.92, riskWarning: "估值偏高：市盈率显著高于行业平均，机器人概念溢价" },
  { code: "300607", name: "拓斯达", sectorId: "robotics", price: 28.78, changePercent: 2.89, changeAmount: 0.81, volume: "3.2亿", turnover: "9.2亿", turnoverRate: 4.5, marketCap: "68亿", pe: 45.6, high: 29.5, low: 27.6, open: 27.8, prevClose: 27.97 },
  { code: "688160", name: "步科股份", sectorId: "robotics", price: 55.02, changePercent: -0.42, changeAmount: -0.23, volume: "1.2亿", turnover: "6.7亿", turnoverRate: 2.9, marketCap: "45亿", pe: 52.3, high: 57.5, low: 54.8, open: 55.5, prevClose: 55.25 },
  { code: "002747", name: "埃斯顿", sectorId: "robotics", price: 18.45, changePercent: 2.12, changeAmount: 0.38, volume: "4.5亿", turnover: "8.3亿", turnoverRate: 3.1, marketCap: "160亿", pe: 68.9, high: 18.9, low: 17.8, open: 18.0, prevClose: 18.07, riskWarning: "估值偏高：机器人概念溢价明显，PE接近70倍" },

  // ─── 低空经济 (sector change +4.12%, hotRank 3, trend up) ─────
  // 4 positive + 1 slightly negative (新余国科 — 小盘换手分歧)
  { code: "688566", name: "亿航智能", sectorId: "low-altitude", price: 168.90, changePercent: 6.78, changeAmount: 10.70, volume: "0.8亿", turnover: "13.5亿", turnoverRate: 5.2, marketCap: "96亿", pe: -32.5, high: 172.5, low: 156.3, open: 158.0, prevClose: 158.20, riskWarning: "高波动风险：公司尚未盈利，eVTOL商业化不确定性高" },
  { code: "000099", name: "中信海直", sectorId: "low-altitude", price: 22.34, changePercent: 3.45, changeAmount: 0.74, volume: "3.5亿", turnover: "7.8亿", turnoverRate: 4.1, marketCap: "134亿", pe: 42.3, high: 23.1, low: 21.2, open: 21.5, prevClose: 21.60 },
  { code: "002085", name: "万丰奥威", sectorId: "low-altitude", price: 15.67, changePercent: 2.89, changeAmount: 0.44, volume: "5.2亿", turnover: "8.1亿", turnoverRate: 3.6, marketCap: "236亿", pe: 28.9, high: 16.2, low: 15.0, open: 15.2, prevClose: 15.23 },
  { code: "688609", name: "纵横股份", sectorId: "low-altitude", price: 45.23, changePercent: 5.12, changeAmount: 2.21, volume: "1.5亿", turnover: "6.8亿", turnoverRate: 6.2, marketCap: "36亿", pe: -18.5, high: 46.8, low: 42.5, open: 43.0, prevClose: 43.02, riskWarning: "高波动风险：公司持续亏损，换手率超6%，短线博弈激烈" },
  { code: "300722", name: "新余国科", sectorId: "low-altitude", price: 31.84, changePercent: -0.35, changeAmount: -0.11, volume: "2.1亿", turnover: "6.8亿", turnoverRate: 3.8, marketCap: "51亿", pe: 55.6, high: 33.2, low: 31.5, open: 32.0, prevClose: 31.95 },

  // ─── 军工 (sector change -1.23%, hotRank 10, trend down) ──────
  // All negative — sector-wide weakness
  { code: "600893", name: "航发动力", sectorId: "military", price: 42.56, changePercent: -1.56, changeAmount: -0.68, volume: "5.2亿", turnover: "22.1亿", turnoverRate: 1.9, marketCap: "1134亿", pe: 68.9, high: 43.8, low: 42.0, open: 43.5, prevClose: 43.24, riskWarning: "估值偏高：军工板块估值较高，关注订单落地节奏" },
  { code: "600760", name: "中航沈飞", sectorId: "military", price: 52.34, changePercent: -0.89, changeAmount: -0.47, volume: "3.8亿", turnover: "19.9亿", turnoverRate: 1.4, marketCap: "1432亿", pe: 52.3, high: 53.5, low: 51.8, open: 53.0, prevClose: 52.81 },
  { code: "600118", name: "中国卫星", sectorId: "military", price: 28.90, changePercent: -2.12, changeAmount: -0.62, volume: "4.5亿", turnover: "13.0亿", turnoverRate: 2.1, marketCap: "342亿", pe: 85.6, high: 29.8, low: 28.5, open: 29.5, prevClose: 29.52, riskWarning: "估值偏高：卫星应用商业化进展不及预期" },
  { code: "002049", name: "紫光国微", sectorId: "military", price: 112.34, changePercent: -0.45, changeAmount: -0.51, volume: "2.8亿", turnover: "31.5亿", turnoverRate: 1.8, marketCap: "675亿", pe: 42.3, high: 114.5, low: 110.8, open: 113.0, prevClose: 112.85 },
  { code: "000768", name: "中航西飞", sectorId: "military", price: 35.67, changePercent: -1.34, changeAmount: -0.48, volume: "4.2亿", turnover: "15.0亿", turnoverRate: 1.5, marketCap: "984亿", pe: 58.9, high: 36.5, low: 35.2, open: 36.2, prevClose: 36.15 },

  // ─── 医药 (sector change -0.54%, hotRank 8, trend down) ───────
  // 4 negative + 1 positive (恒瑞医药 — 创新药龙头逆势走强)
  { code: "603259", name: "药明康德", sectorId: "pharma", price: 52.34, changePercent: -1.23, changeAmount: -0.65, volume: "6.8亿", turnover: "35.6亿", turnoverRate: 2.3, marketCap: "1553亿", pe: 18.5, high: 53.8, low: 51.5, open: 53.0, prevClose: 52.99 },
  { code: "600276", name: "恒瑞医药", sectorId: "pharma", price: 48.56, changePercent: 0.67, changeAmount: 0.32, volume: "5.2亿", turnover: "25.3亿", turnoverRate: 0.8, marketCap: "3098亿", pe: 52.3, high: 49.2, low: 47.8, open: 48.2, prevClose: 48.24 },
  { code: "300760", name: "迈瑞医疗", sectorId: "pharma", price: 268.90, changePercent: -0.45, changeAmount: -1.22, volume: "1.8亿", turnover: "48.4亿", turnoverRate: 1.5, marketCap: "3262亿", pe: 28.9, high: 272.5, low: 265.3, open: 270.0, prevClose: 270.12 },
  { code: "300015", name: "爱尔眼科", sectorId: "pharma", price: 12.34, changePercent: -0.56, changeAmount: -0.07, volume: "8.5亿", turnover: "10.5亿", turnoverRate: 0.9, marketCap: "1158亿", pe: 42.3, high: 12.6, low: 12.1, open: 12.4, prevClose: 12.41 },
  { code: "000538", name: "云南白药", sectorId: "pharma", price: 56.78, changePercent: -0.23, changeAmount: -0.13, volume: "2.5亿", turnover: "14.2亿", turnoverRate: 1.4, marketCap: "720亿", pe: 22.1, high: 57.5, low: 56.2, open: 57.0, prevClose: 56.91 },

  // ─── 白酒 (sector change +0.78%, hotRank 7, trend sideways) ───
  // 4 positive + 1 negative (洋河股份 — 次高端承压)
  { code: "600519", name: "贵州茅台", sectorId: "baijiu", price: 1688.00, changePercent: 0.98, changeAmount: 16.40, volume: "0.6亿", turnover: "101.3亿", turnoverRate: 0.5, marketCap: "21210亿", pe: 25.6, high: 1695.0, low: 1668.0, open: 1670.0, prevClose: 1671.60 },
  { code: "000858", name: "五粮液", sectorId: "baijiu", price: 152.34, changePercent: 0.78, changeAmount: 1.18, volume: "3.2亿", turnover: "48.7亿", turnoverRate: 0.8, marketCap: "5904亿", pe: 20.3, high: 153.8, low: 150.5, open: 151.0, prevClose: 151.16 },
  { code: "000568", name: "泸州老窖", sectorId: "baijiu", price: 168.56, changePercent: 0.56, changeAmount: 0.94, volume: "2.1亿", turnover: "35.4亿", turnoverRate: 1.4, marketCap: "2480亿", pe: 18.9, high: 170.2, low: 166.8, open: 167.5, prevClose: 167.62 },
  { code: "002304", name: "洋河股份", sectorId: "baijiu", price: 92.34, changePercent: -0.34, changeAmount: -0.32, volume: "1.8亿", turnover: "16.6亿", turnoverRate: 1.2, marketCap: "1391亿", pe: 15.6, high: 93.5, low: 91.2, open: 92.8, prevClose: 92.66 },
  { code: "600809", name: "山西汾酒", sectorId: "baijiu", price: 218.56, changePercent: 1.23, changeAmount: 2.66, volume: "1.5亿", turnover: "32.8亿", turnoverRate: 1.2, marketCap: "2666亿", pe: 22.4, high: 220.8, low: 215.2, open: 216.0, prevClose: 215.90 },
];

export function getStockByCode(code: string): Stock | undefined {
  return stocks.find((s) => s.code === code);
}

export function getStocksBySector(sectorId: string): Stock[] {
  return stocks.filter((s) => s.sectorId === sectorId);
}

export function getTopGainers(n: number = 10): Stock[] {
  return [...stocks].sort((a, b) => b.changePercent - a.changePercent).slice(0, n);
}

export function getTopLosers(n: number = 10): Stock[] {
  return [...stocks].sort((a, b) => a.changePercent - b.changePercent).slice(0, n);
}

export function getTopByTurnover(n: number = 10): Stock[] {
  return [...stocks].sort((a, b) => {
    const aVal = parseFloat(a.turnover.replace("亿", ""));
    const bVal = parseFloat(b.turnover.replace("亿", ""));
    return bVal - aVal;
  }).slice(0, n);
}
