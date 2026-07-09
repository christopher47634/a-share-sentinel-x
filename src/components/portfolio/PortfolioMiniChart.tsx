"use client";

import { motion } from "framer-motion";
import { cn, formatCurrency } from "@/lib/utils";
import type { PortfolioHistory } from "@/types/account";
import { Activity } from "lucide-react";
import { FlowHoverSurface } from "@/components/common/FlowHoverSurface";

interface PortfolioMiniChartProps {
  history: PortfolioHistory[];
  delay?: number;
}

export default function PortfolioMiniChart({
  history,
  delay = 0,
}: PortfolioMiniChartProps) {
  if (history.length < 2) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: delay * 0.08 }}
        className="glass p-4 flex items-center justify-center"
      >
        <span className="text-xs text-[var(--text-muted)]">暂无历史数据</span>
      </motion.div>
    );
  }

  const values = history.map((h) => h.totalAssets);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const width = 280;
  const height = 80;
  const padding = 4;

  const points = history.map((h, i) => {
    const x = padding + (i / (history.length - 1)) * (width - padding * 2);
    const y = height - padding - ((h.totalAssets - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  });

  const firstValue = values[0];
  const lastValue = values[values.length - 1];
  const totalChange = lastValue - firstValue;
  const totalChangePercent = firstValue > 0 ? (totalChange / firstValue) * 100 : 0;
  const isUp = totalChange >= 0;

  const strokeColor = isUp ? "var(--up)" : "var(--down)";

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
          background: isUp
            ? "radial-gradient(ellipse at 50% 80%, rgba(52,211,153,0.04), transparent 60%)"
            : "radial-gradient(ellipse at 50% 80%, rgba(239,68,68,0.04), transparent 60%)",
        }}
      />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Activity size={12} className="text-[var(--accent)]" />
            <span className="text-xs font-semibold text-[var(--text-primary)]">
              资产走势
            </span>
          </div>
          <span className="text-[10px] text-[var(--text-muted)]">近30天</span>
        </div>

        {/* Summary */}
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-lg font-bold text-[var(--text-primary)] font-mono-nums">
            ¥{formatCurrency(lastValue)}
          </span>
          <span
            className={cn(
              "text-xs font-semibold font-mono-nums",
              isUp ? "text-up" : "text-down"
            )}
          >
            {isUp ? "+" : ""}
            {totalChangePercent.toFixed(2)}%
          </span>
        </div>

        {/* SVG Chart */}
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full"
          style={{ height: "80px" }}
          preserveAspectRatio="none"
        >
          {/* Gradient fill */}
          <defs>
            <linearGradient
              id={`portfolio-gradient-${isUp ? "up" : "down"}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.15" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Fill area */}
          <polygon
            points={`${padding},${height} ${points.join(" ")} ${width - padding},${height}`}
            fill={`url(#portfolio-gradient-${isUp ? "up" : "down"})`}
          />

          {/* Line */}
          <polyline
            points={points.join(" ")}
            fill="none"
            stroke={strokeColor}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* Date range */}
        <div className="flex items-center justify-between mt-1">
          <span className="text-[10px] text-[var(--text-muted)] font-mono-nums">
            {history[0].date.slice(5)}
          </span>
          <span className="text-[10px] text-[var(--text-muted)] font-mono-nums">
            {history[history.length - 1].date.slice(5)}
          </span>
        </div>
      </div>
    </FlowHoverSurface>
    </motion.div>
  );
}
