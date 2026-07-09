"use client";

import GlassCard from "@/components/common/GlassCard";
import { motion } from "framer-motion";
import { cn, formatPercent } from "@/lib/utils";
import { Activity, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useMarketIndexSnapshot } from "@/hooks/useMarketIndexSnapshot";

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

export default function MarketOverview() {
  const snapshot = useMarketIndexSnapshot();
  const avgChange = snapshot.indices.length
    ? snapshot.indices.reduce((sum, item) => sum + item.changePercent, 0) / snapshot.indices.length
    : 0;
  const breadthTilt = snapshot.breadth.sampleSize
    ? (snapshot.breadth.upCount - snapshot.breadth.downCount) / snapshot.breadth.sampleSize
    : 0;
  const fearGreedIndex = Math.round(clamp(50 + avgChange * 12 + breadthTilt * 16));
  const label = fearGreedIndex >= 70 ? "Hot" : fearGreedIndex >= 55 ? "Strong" : fearGreedIndex >= 45 ? "Mixed" : "Weak";
  const shortTrend = avgChange > 0.15 ? "Bullish" : avgChange < -0.15 ? "Bearish" : "Range";

  const signals = [
    {
      name: "Index avg",
      value: formatPercent(Number(avgChange.toFixed(2))),
      signal: avgChange > 0.15 ? "buy" : avgChange < -0.15 ? "sell" : "neutral",
    },
    {
      name: "Index breadth",
      value: `${snapshot.breadth.upCount} up/${snapshot.breadth.downCount} down`,
      signal: breadthTilt > 0.2 ? "buy" : breadthTilt < -0.2 ? "sell" : "neutral",
    },
    {
      name: "Turnover sample",
      value: snapshot.breadth.totalTurnover,
      signal: "neutral",
    },
    {
      name: "Data source",
      value: snapshot.fallbackUsed ? "Mixed fallback" : "Live",
      signal: snapshot.fallbackUsed ? "neutral" : "buy",
    },
  ];

  const getSentimentColor = (idx: number) => {
    if (idx >= 75) return "text-[var(--down)]";
    if (idx >= 50) return "text-[var(--accent)]";
    if (idx >= 25) return "text-[var(--text-secondary)]";
    return "text-[var(--up)]";
  };

  const getSignalIcon = (signal: string) => {
    switch (signal) {
      case "buy":
        return <TrendingUp size={12} className="text-up" />;
      case "sell":
        return <TrendingDown size={12} className="text-down" />;
      default:
        return <Minus size={12} className="text-[var(--text-muted)]" />;
    }
  };

  return (
    <GlassCard delay={3} className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <Activity size={16} className="text-[var(--accent)]" />
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Market pulse</h3>
      </div>

      <div className="flex items-center justify-center mb-4">
        <div className="relative w-20 h-20">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r="40" fill="none" stroke="var(--surface-3)" strokeWidth="8" />
            <motion.circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${fearGreedIndex * 2.51} 251`}
              initial={{ strokeDasharray: "0 251" }}
              animate={{ strokeDasharray: `${fearGreedIndex * 2.51} 251` }}
              transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn("text-lg font-bold font-mono-nums", getSentimentColor(fearGreedIndex))}>{fearGreedIndex}</span>
            <span className="text-[9px] text-[var(--text-muted)]">{label}</span>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-1.5 mb-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] pulse-dot" />
          <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider font-medium">Live index signals</span>
        </div>
        <div className="rounded-lg overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.04)", background: "rgba(2,6,18,0.3)" }}>
          <div className="grid grid-cols-[1fr_70px_40px] gap-2 px-3 py-1.5 text-[9px] text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-subtle)]">
            <span>Metric</span>
            <span className="text-right">Value</span>
            <span className="text-center">Signal</span>
          </div>
          {signals.map((sig, i) => (
            <div key={sig.name} className="grid grid-cols-[1fr_70px_40px] gap-2 px-3 py-1.5 text-xs items-center" style={{ borderBottom: i < signals.length - 1 ? "1px solid rgba(255,255,255,0.03)" : "none" }}>
              <span className="text-[var(--text-muted)] text-[11px]">{sig.name}</span>
              <span className="text-right text-[var(--text-secondary)] font-mono-nums text-[11px]">{sig.value}</span>
              <span className="flex items-center justify-center">{getSignalIcon(sig.signal)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1 p-2.5 rounded-lg bg-[var(--surface-1)]">
          <span className="text-[10px] text-[var(--text-muted)]">Sample up</span>
          <span className="text-sm font-semibold text-up font-mono-nums">{snapshot.breadth.upCount}</span>
        </div>
        <div className="flex flex-col gap-1 p-2.5 rounded-lg bg-[var(--surface-1)]">
          <span className="text-[10px] text-[var(--text-muted)]">Sample down</span>
          <span className="text-sm font-semibold text-down font-mono-nums">{snapshot.breadth.downCount}</span>
        </div>
        <div className="flex flex-col gap-1 p-2.5 rounded-lg bg-[var(--surface-1)]">
          <span className="text-[10px] text-[var(--text-muted)]">Index avg</span>
          <span className={cn("text-sm font-semibold font-mono-nums", avgChange >= 0 ? "text-up" : "text-down")}>
            {formatPercent(Number(avgChange.toFixed(2)))}
          </span>
        </div>
        <div className="flex flex-col gap-1 p-2.5 rounded-lg bg-[var(--surface-1)]">
          <span className="text-[10px] text-[var(--text-muted)]">Trend</span>
          <span className="text-sm font-semibold text-[var(--accent)] font-mono-nums">{shortTrend}</span>
        </div>
      </div>
    </GlassCard>
  );
}
