"use client";

import { motion } from "framer-motion";
import type { AccountSummary, Position } from "@/types/account";
import { PieChart, AlertTriangle } from "lucide-react";
import { FlowHoverSurface } from "@/components/common/FlowHoverSurface";

interface AssetAllocationProps {
  account: AccountSummary;
  positions: Position[];
  delay?: number;
}

export default function AssetAllocation({
  account,
  positions,
  delay = 0,
}: AssetAllocationProps) {
  const cashPercent = account.totalAssets > 0
    ? (account.availableCash / account.totalAssets) * 100
    : 100;
  const positionPercent = account.totalAssets > 0
    ? (account.marketValue / account.totalAssets) * 100
    : 0;

  const highRiskPositions = positions.filter((p) => p.riskLevel === "high");
  const highRiskValue = highRiskPositions.reduce(
    (sum, p) => sum + p.marketValue,
    0
  );
  const highRiskPercent =
    account.marketValue > 0
      ? (highRiskValue / account.marketValue) * 100
      : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: delay * 0.08,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className="glass p-4 relative overflow-hidden"
    >
    <FlowHoverSurface variant="card">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 70% 80%, rgba(167,139,250,0.04), transparent 60%)",
        }}
      />
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <PieChart size={14} className="text-[var(--accent)]" />
          <span className="text-xs font-semibold text-[var(--text-primary)]">
            资产配置
          </span>
        </div>

        {/* Cash vs Position */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[var(--text-muted)]">
                现金
              </span>
              <span className="text-[10px] font-mono-nums text-[var(--text-secondary)]">
                {cashPercent.toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[var(--text-muted)]">
                持仓
              </span>
              <span className="text-[10px] font-mono-nums text-[var(--text-secondary)]">
                {positionPercent.toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="w-full h-2 rounded-full bg-[var(--surface-2)] overflow-hidden flex">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${cashPercent}%` }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
              className="h-full rounded-l-full"
              style={{ background: "var(--accent)" }}
            />
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${positionPercent}%` }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
              className="h-full rounded-r-full"
              style={{ background: "#A78BFA" }}
            />
          </div>
        </div>

        {/* Per-stock allocation */}
        {positions.length > 0 && (
          <div className="space-y-1.5 mb-3">
            {positions.map((pos) => (
              <div
                key={pos.stockCode}
                className="flex items-center justify-between"
              >
                <span className="text-[10px] text-[var(--text-secondary)] truncate flex-1 min-w-0">
                  {pos.stockName}
                </span>
                <div className="flex items-center gap-2 ml-2">
                  <div className="w-12 h-1 rounded-full bg-[var(--surface-2)] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[var(--accent)]"
                      style={{ width: `${pos.positionRatio * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono-nums text-[var(--text-muted)] w-8 text-right">
                    {(pos.positionRatio * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* High risk summary */}
        {highRiskPositions.length > 0 && (
          <div
            className="flex items-center justify-between p-2 rounded-lg mt-2"
            style={{
              background: "rgba(239,68,68,0.06)",
              border: "1px solid rgba(239,68,68,0.1)",
            }}
          >
            <div className="flex items-center gap-1.5">
              <AlertTriangle size={12} className="text-red-400" />
              <span className="text-[10px] text-red-400">高风险仓位</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono-nums text-red-400">
                {highRiskPositions.length}只
              </span>
              <span className="text-[10px] font-mono-nums text-red-300">
                {highRiskPercent.toFixed(1)}%
              </span>
            </div>
          </div>
        )}
      </div>
    </FlowHoverSurface>
    </motion.div>
  );
}
