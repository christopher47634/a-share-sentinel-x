// 引擎共用的小工具：数值保护、格式化、持仓查找。

import type { SentinelStock, SentinelPosition, SentinelAccount } from "./types";

export function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

export function safeNumber(value: unknown, fallback = 0): number {
  if (typeof value !== "number" || Number.isNaN(value) || !Number.isFinite(value)) {
    return fallback;
  }
  return value;
}

export function pct(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function money(value: number): string {
  return `¥${Math.round(value).toLocaleString("zh-CN")}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function findPosition(account: SentinelAccount | undefined, code: string): SentinelPosition | undefined {
  return account?.positions.find((position) => position.code === code);
}

export function getSectorForStock(stock: SentinelStock, account?: SentinelAccount): string | undefined {
  const position = findPosition(account, stock.code);
  return stock.sector ?? position?.sector;
}
