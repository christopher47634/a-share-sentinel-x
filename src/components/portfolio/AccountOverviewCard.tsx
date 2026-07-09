"use client";

import { motion } from "framer-motion";
import { cn, formatCurrency } from "@/lib/utils";
import type { AccountSummary } from "@/types/account";
import {
  Wallet,
  PiggyBank,
  TrendingUp,
  TrendingDown,
  Shield,
  Clock,
} from "lucide-react";
import { FlowHoverSurface } from "@/components/common/FlowHoverSurface";
import { MagneticSurface } from "@/components/interaction/MagneticSurface";

const RISK_CONFIG: Record<
  AccountSummary["riskLevel"],
  { label: string; color: string; bg: string }
> = {
  low: { label: "低风险", color: "#34D399", bg: "rgba(52,211,153,0.12)" },
  medium: {
    label: "中风险",
    color: "#FBBF24",
    bg: "rgba(251,191,36,0.12)",
  },
  high: { label: "高风险", color: "#EF4444", bg: "rgba(239,68,68,0.12)" },
};

interface AccountOverviewCardProps {
  account: AccountSummary;
  delay?: number;
}

export default function AccountOverviewCard({
  account,
  delay = 0,
}: AccountOverviewCardProps) {
  const risk = RISK_CONFIG[account.riskLevel];
  const pnlColor =
    account.totalPnL > 0
      ? "text-up"
      : account.totalPnL < 0
      ? "text-down"
      : "text-[var(--text-secondary)]";
  const todayPnlColor =
    account.todayPnL > 0
      ? "text-up"
      : account.todayPnL < 0
      ? "text-down"
      : "text-[var(--text-secondary)]";

  return (
    <MagneticSurface>
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: delay * 0.08,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className="glass p-5 relative overflow-hidden card-interactive"
    >
    <FlowHoverSurface variant="card">
      {/* Subtle ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 30% 20%, rgba(212,165,116,0.05), transparent 60%)",
        }}
      />
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Wallet size={16} className="text-[var(--accent)]" />
            <span className="text-sm font-semibold text-[var(--text-primary)]">
              账户概览
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1"
              style={{ color: risk.color, backgroundColor: risk.bg }}
            >
              <Shield size={10} />
              {risk.label}
            </span>
          </div>
        </div>

        {/* Total Assets - Hero */}
        <div className="mb-4">
          <span className="text-xs text-[var(--text-muted)] block mb-1">
            总资产
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm text-[var(--text-secondary)]">¥</span>
            <span className="text-2xl font-bold text-[var(--text-primary)] font-mono-nums tracking-tight">
              {formatCurrency(account.totalAssets)}
            </span>
          </div>
        </div>

        {/* Grid stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Available Cash */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
              <PiggyBank size={10} />
              可用资金
            </span>
            <span className="text-sm font-semibold text-[var(--text-primary)] font-mono-nums">
              ¥{formatCurrency(account.availableCash)}
            </span>
          </div>

          {/* Market Value */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
              <TrendingUp size={10} />
              持仓市值
            </span>
            <span className="text-sm font-semibold text-[var(--text-primary)] font-mono-nums">
              ¥{formatCurrency(account.marketValue)}
            </span>
          </div>

          {/* Total P&L */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
              {account.totalPnL >= 0 ? (
                <TrendingUp size={10} />
              ) : (
                <TrendingDown size={10} />
              )}
              总盈亏
            </span>
            <span
              className={cn(
                "text-sm font-semibold font-mono-nums",
                pnlColor
              )}
            >
              {account.totalPnL >= 0 ? "+" : ""}
              {formatCurrency(account.totalPnL)}
            </span>
          </div>

          {/* Today P&L */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
              {account.todayPnL >= 0 ? (
                <TrendingUp size={10} />
              ) : (
                <TrendingDown size={10} />
              )}
              今日盈亏
            </span>
            <span
              className={cn(
                "text-sm font-semibold font-mono-nums",
                todayPnlColor
              )}
            >
              {account.todayPnL >= 0 ? "+" : ""}
              {formatCurrency(account.todayPnL)}
            </span>
          </div>
        </div>

        {/* Position Ratio Bar */}
        <div className="mt-4 pt-3 border-t border-[var(--border-subtle)]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-[var(--text-muted)]">
              仓位比例
            </span>
            <span className="text-[10px] font-mono-nums text-[var(--text-secondary)]">
              {(account.positionRatio * 100).toFixed(1)}%
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-[var(--surface-2)] overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${account.positionRatio * 100}%` }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
              className="h-full rounded-full"
              style={{
                background:
                  "linear-gradient(90deg, var(--accent), #A78BFA)",
              }}
            />
          </div>
        </div>

        {/* Updated time */}
        <div className="mt-2 flex items-center justify-end gap-1">
          <Clock size={10} className="text-[var(--text-muted)]" />
          <span className="text-[10px] text-[var(--text-muted)]">
            {new Date(account.updatedAt).toLocaleString("zh-CN", {
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>
    </FlowHoverSurface>
    </motion.div>
    </MagneticSurface>
  );
}
