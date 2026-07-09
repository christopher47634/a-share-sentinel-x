import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number, decimals: number = 2): string {
  return num.toFixed(decimals);
}

export function formatPercent(num: number): string {
  const prefix = num > 0 ? "+" : "";
  return `${prefix}${num.toFixed(2)}%`;
}

export function formatAmount(num: number): string {
  const prefix = num > 0 ? "+" : "";
  return `${prefix}${num.toFixed(2)}`;
}

export function formatCurrency(num: number): string {
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function getChangeColor(change: number): string {
  if (change > 0) return "var(--up)";
  if (change < 0) return "var(--down)";
  return "var(--neutral)";
}

export function getChangeClass(change: number): string {
  if (change > 0) return "text-up";
  if (change < 0) return "text-down";
  return "text-[var(--text-secondary)]";
}
