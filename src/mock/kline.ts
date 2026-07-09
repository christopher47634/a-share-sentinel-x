// ─── K-line Mock Data ─────────────────────────────────────────────
// Enhanced with configurable trend bias so kline data is consistent
// with each stock's sector performance and current changePercent.
//   trend="up":      bias = -0.42  (avg daily drift ≈ +0.08×vol)
//   trend="down":    bias = -0.58  (avg daily drift ≈ -0.08×vol)
//   trend="sideways": bias = -0.50 (avg daily drift ≈ 0)

export interface KlineBar {
  time: number; // unix timestamp in seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/**
 * Generate synthetic kline data with configurable trend bias.
 * @param basePrice  Starting price (roughly 120 days ago)
 * @param days       Number of bars to generate
 * @param volatility Daily volatility factor (default 0.02 = 2%)
 * @param trend      "up" | "down" | "sideways" (default "up")
 */
function generateKlineData(
  basePrice: number,
  days: number,
  volatility: number = 0.02,
  trend: "up" | "down" | "sideways" = "up"
): KlineBar[] {
  // Bias lookup: Math.random() returns [0,1), so subtracting these
  // gives the desired directional drift.
  const biasMap = { up: 0.42, down: 0.58, sideways: 0.50 };
  const bias = biasMap[trend];

  const data: KlineBar[] = [];
  let price = basePrice;
  const now = Math.floor(Date.now() / 1000);
  const daySeconds = 86400;

  for (let i = days; i >= 0; i--) {
    const time = now - i * daySeconds;
    const change = (Math.random() - bias) * volatility * price;
    const open = price;
    const close = price + change;
    const high = Math.max(open, close) + Math.random() * volatility * price * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * price * 0.5;
    const volume = Math.floor(Math.random() * 5000000 + 1000000);

    data.push({
      time,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume,
    });

    price = close;
  }

  return data;
}

// ─── Pre-generated kline data for all sector stocks ──────────────
// Trend per stock matches its individual changePercent direction.
// Sector-level trend aligns with the sector's changePercent.
//
// Sector trend map:
//   光通信 (up)      算力 (up)       半导体 (up)
//   矿山 (down)      新能源 (up)     机器人 (up)
//   低空经济 (up)    军工 (down)     医药 (down)
//   白酒 (sideways)

export const klineData: Record<string, KlineBar[]> = {
  // 光通信 — sector up; 亨通光电 slightly negative → down
  "300308": generateKlineData(110, 120, 0.025, "up"),
  "300502": generateKlineData(75, 120, 0.028, "up"),
  "300394": generateKlineData(140, 120, 0.022, "up"),
  "600487": generateKlineData(17, 120, 0.02, "down"),   // -0.28%
  "300548": generateKlineData(38, 120, 0.035, "up"),

  // 算力 — sector up; 海康威视 negative → down
  "000977": generateKlineData(30, 120, 0.03, "up"),
  "603019": generateKlineData(48, 120, 0.025, "up"),
  "000938": generateKlineData(23, 120, 0.02, "up"),
  "002415": generateKlineData(33, 120, 0.015, "down"),  // -0.73%
  "688256": generateKlineData(230, 120, 0.035, "up"),

  // 半导体 — sector up; 韦尔股份 negative → down
  "688981": generateKlineData(72, 120, 0.022, "up"),
  "002371": generateKlineData(320, 120, 0.025, "up"),
  "603501": generateKlineData(105, 120, 0.028, "down"), // -0.45%
  "688012": generateKlineData(140, 120, 0.03, "up"),
  "688396": generateKlineData(45, 120, 0.02, "up"),

  // 矿山 — sector down; 紫金矿业 positive → up
  "002466": generateKlineData(45, 120, 0.03, "down"),
  "601899": generateKlineData(16, 120, 0.018, "up"),    // +0.48%
  "601088": generateKlineData(39, 120, 0.012, "down"),
  "603993": generateKlineData(8.5, 120, 0.025, "down"),
  "002460": generateKlineData(40, 120, 0.028, "down"),

  // 新能源 — sector up; 中环股份 negative → down
  "601012": generateKlineData(21, 120, 0.022, "up"),
  "300750": generateKlineData(180, 120, 0.025, "up"),
  "300274": generateKlineData(72, 120, 0.025, "up"),
  "002129": generateKlineData(16, 120, 0.02, "down"),   // -0.82%
  "688599": generateKlineData(27, 120, 0.022, "up"),

  // 机器人 — sector up; 步科股份 slightly negative → down
  "300124": generateKlineData(55, 120, 0.025, "up"),
  "688017": generateKlineData(80, 120, 0.032, "up"),
  "300607": generateKlineData(25, 120, 0.03, "up"),
  "688160": generateKlineData(50, 120, 0.028, "down"),  // -0.42%
  "002747": generateKlineData(17, 120, 0.025, "up"),

  // 低空经济 — sector up; 新余国科 slightly negative → down
  "688566": generateKlineData(140, 120, 0.04, "up"),
  "000099": generateKlineData(20, 120, 0.028, "up"),
  "002085": generateKlineData(14, 120, 0.025, "up"),
  "688609": generateKlineData(40, 120, 0.035, "up"),
  "300722": generateKlineData(30, 120, 0.028, "down"),  // -0.35%

  // 军工 — sector down; all negative
  "600893": generateKlineData(44, 120, 0.02, "down"),
  "600760": generateKlineData(53, 120, 0.018, "down"),
  "600118": generateKlineData(30, 120, 0.022, "down"),
  "002049": generateKlineData(113, 120, 0.02, "down"),
  "000768": generateKlineData(36, 120, 0.018, "down"),

  // 医药 — sector down; 恒瑞医药 positive → up
  "603259": generateKlineData(54, 120, 0.02, "down"),
  "600276": generateKlineData(47, 120, 0.015, "up"),    // +0.67%
  "300760": generateKlineData(270, 120, 0.018, "down"),
  "300015": generateKlineData(12.5, 120, 0.02, "down"),
  "000538": generateKlineData(57, 120, 0.012, "down"),

  // 白酒 — sector sideways; 洋河股份 negative → down
  "600519": generateKlineData(1650, 120, 0.015, "up"),
  "000858": generateKlineData(148, 120, 0.018, "up"),
  "000568": generateKlineData(165, 120, 0.018, "up"),
  "002304": generateKlineData(93, 120, 0.015, "down"),  // -0.34%
  "600809": generateKlineData(210, 120, 0.02, "up"),
};

// Generate kline for a stock code (fallback to slight upward if not pre-generated)
export function getKlineData(code: string, days: number = 120): KlineBar[] {
  if (klineData[code]) return klineData[code];
  return generateKlineData(100, days, 0.025, "up");
}

// ─── Sector trend data (area chart) ──────────────────────────────
// Trend direction matches each sector's changePercent sign.

export interface TrendPoint {
  time: number;
  value: number;
}

const sectorTrendCache: Record<string, TrendPoint[]> = {};

/** Sector-level trend direction lookup */
const sectorTrendBias: Record<string, "up" | "down" | "sideways"> = {
  "optical-communication": "up",
  "computing-power": "up",
  semiconductor: "up",
  mining: "down",
  "new-energy": "up",
  robotics: "up",
  "low-altitude": "up",
  military: "down",
  pharma: "down",
  baijiu: "sideways",
};

export function getSectorTrend(sectorId: string, days: number = 60): TrendPoint[] {
  if (sectorTrendCache[sectorId]) return sectorTrendCache[sectorId];

  const trend = sectorTrendBias[sectorId] ?? "up";
  const biasMap = { up: 0.47, down: 0.53, sideways: 0.50 };
  const bias = biasMap[trend];

  const data: TrendPoint[] = [];
  let value = 1000;
  const now = Math.floor(Date.now() / 1000);
  const daySeconds = 86400;

  for (let i = days; i >= 0; i--) {
    const time = now - i * daySeconds;
    value += (Math.random() - bias) * 20;
    value = Math.max(800, Math.min(1200, value));
    data.push({ time, value: parseFloat(value.toFixed(2)) });
  }

  sectorTrendCache[sectorId] = data;
  return data;
}
