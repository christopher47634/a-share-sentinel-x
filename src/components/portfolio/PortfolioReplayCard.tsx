"use client";

import { motion } from "framer-motion";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  ShieldAlert,
} from "lucide-react";
import type {
  AccountSummary,
  AccountTransaction,
  PortfolioHistory,
} from "@/types/account";
import { cn, formatCurrency } from "@/lib/utils";

interface PortfolioReplayCardProps {
  account: AccountSummary;
  history: PortfolioHistory[];
  transactions: AccountTransaction[];
  compact?: boolean;
  delay?: number;
}

function calcMaxDrawdown(values: number[]) {
  let peak = values[0] ?? 0;
  let maxDrawdown = 0;

  for (const value of values) {
    if (value > peak) peak = value;
    if (peak > 0) {
      maxDrawdown = Math.min(maxDrawdown, (value - peak) / peak);
    }
  }

  return maxDrawdown * 100;
}

export default function PortfolioReplayCard({
  account,
  history,
  transactions,
  compact = false,
  delay = 0,
}: PortfolioReplayCardProps) {
  const sortedHistory = [...history].sort((a, b) => a.date.localeCompare(b.date));
  const chartHistory =
    sortedHistory.length > 0
      ? sortedHistory
      : [
          {
            date: new Date().toISOString().slice(0, 10),
            totalAssets: account.totalAssets,
            marketValue: account.marketValue,
            cash: account.availableCash,
            pnl: account.totalPnL,
          },
        ];

  const values = chartHistory.map((item) => item.totalAssets);
  const firstValue = values[0] ?? account.totalAssets;
  const lastValue = values[values.length - 1] ?? account.totalAssets;
  const totalChange = lastValue - firstValue;
  const totalChangePercent = firstValue > 0 ? (totalChange / firstValue) * 100 : 0;
  const isUp = totalChange >= 0;

  const dayChanges = chartHistory.slice(1).map((item, index) => ({
    date: item.date,
    change: item.totalAssets - chartHistory[index].totalAssets,
  }));
  const bestDay = dayChanges.reduce(
    (best, item) => (item.change > best.change ? item : best),
    { date: "—", change: 0 }
  );
  const worstDay = dayChanges.reduce(
    (worst, item) => (item.change < worst.change ? item : worst),
    { date: "—", change: 0 }
  );
  const winDays = dayChanges.filter((item) => item.change > 0).length;
  const winRate = dayChanges.length > 0 ? (winDays / dayChanges.length) * 100 : 0;
  const maxDrawdown = calcMaxDrawdown(values);
  const realizedPnL = transactions.reduce(
    (sum, item) => sum + (item.realizedPnL ?? 0),
    0
  );

  const width = 680;
  const height = compact ? 120 : 160;
  const padding = 10;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = chartHistory.map((item, index) => {
    const x =
      padding +
      (index / Math.max(chartHistory.length - 1, 1)) * (width - padding * 2);
    const y =
      height -
      padding -
      ((item.totalAssets - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  });

  const latestTransactions = [...transactions]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, compact ? 2 : 3);

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, delay: delay * 0.08 }}
      className="glass relative overflow-hidden rounded-2xl p-4 md:p-5"
      style={{
        background:
          "radial-gradient(circle at 12% 0%, rgba(52,211,153,0.08), transparent 34%), linear-gradient(145deg, rgba(255,255,255,0.055), rgba(255,255,255,0.018))",
        border: "1px solid rgba(255,255,255,0.09)",
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent,rgba(255,255,255,0.035),transparent)]" />

      <div className="relative z-10">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="mb-1.5 flex items-center gap-2">
              <Activity size={15} className="text-[var(--accent)]" />
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                收益复盘
              </h2>
            </div>
            <p className="text-xs leading-5 text-[var(--text-muted)]">
              记录每次模拟成交后的资产快照，用来复看曲线、回撤和交易节奏。
            </p>
          </div>
          <div className="text-left sm:text-right">
            <div className="text-[10px] text-[var(--text-muted)]">
              当前总资产
            </div>
            <div className="text-xl font-bold text-[var(--text-primary)] font-mono-nums">
              ¥{formatCurrency(account.totalAssets)}
            </div>
            <div
              className={cn(
                "text-xs font-semibold font-mono-nums",
                isUp ? "text-up" : "text-down"
              )}
            >
              {isUp ? "+" : ""}
              {totalChangePercent.toFixed(2)}%
            </div>
          </div>
        </div>

        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          className="mb-4 w-full rounded-xl border border-white/5 bg-black/10"
          style={{ height }}
        >
          <defs>
            <linearGradient id="replay-line-fill" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor={isUp ? "var(--up)" : "var(--down)"}
                stopOpacity="0.2"
              />
              <stop
                offset="100%"
                stopColor={isUp ? "var(--up)" : "var(--down)"}
                stopOpacity="0"
              />
            </linearGradient>
          </defs>
          <polygon
            points={`${padding},${height} ${points.join(" ")} ${
              width - padding
            },${height}`}
            fill="url(#replay-line-fill)"
          />
          <polyline
            points={points.join(" ")}
            fill="none"
            stroke={isUp ? "var(--up)" : "var(--down)"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <ReplayMetric
            icon={BarChart3}
            label="交易日胜率"
            value={`${winRate.toFixed(0)}%`}
          />
          <ReplayMetric
            icon={ShieldAlert}
            label="最大回撤"
            value={`${maxDrawdown.toFixed(2)}%`}
            danger={maxDrawdown < -3}
          />
          <ReplayMetric
            icon={ArrowUpRight}
            label="最好单日"
            value={`${bestDay.change >= 0 ? "+" : ""}${formatCurrency(bestDay.change)}`}
          />
          <ReplayMetric
            icon={ArrowDownRight}
            label="已实现盈亏"
            value={`${realizedPnL >= 0 ? "+" : ""}${formatCurrency(realizedPnL)}`}
            danger={realizedPnL < 0}
          />
        </div>

        {!compact && latestTransactions.length > 0 && (
          <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.025] p-3">
            <div className="mb-2 text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
              最近成交
            </div>
            <div className="space-y-2">
              {latestTransactions.map((item) => {
                const positive = item.amount > 0;
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 text-xs"
                  >
                    <span className="min-w-0 truncate text-[var(--text-secondary)]">
                      {item.type === "buy" ? "买入" : item.type === "sell" ? "卖出" : "调整"}{" "}
                      {item.stockCode}
                    </span>
                    <span
                      className={cn(
                        "shrink-0 font-mono-nums font-semibold",
                        positive ? "text-up" : "text-down"
                      )}
                    >
                      {positive ? "+" : ""}
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-3 flex items-center justify-between text-[10px] text-[var(--text-muted)]">
          <span>{chartHistory[0]?.date ?? "—"}</span>
          <span>最差单日 {worstDay.change >= 0 ? "+" : ""}{formatCurrency(worstDay.change)}</span>
          <span>{chartHistory[chartHistory.length - 1]?.date ?? "—"}</span>
        </div>
      </div>
    </motion.section>
  );
}

function ReplayMetric({
  icon: Icon,
  label,
  value,
  danger = false,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.025] p-3">
      <div className="mb-1 flex items-center gap-1.5 text-[10px] text-[var(--text-muted)]">
        <Icon size={12} />
        {label}
      </div>
      <div
        className={cn(
          "truncate text-sm font-semibold font-mono-nums",
          danger ? "text-down" : "text-[var(--text-primary)]"
        )}
      >
        {value}
      </div>
    </div>
  );
}
