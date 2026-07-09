"use client";

import { motion } from "framer-motion";
import { useMarketIndexSnapshot } from "@/hooks/useMarketIndexSnapshot";
import DataSourceBadge from "@/components/market/DataSourceBadge";
import { cn, formatPercent } from "@/lib/utils";

export default function IndexTicker() {
  const snapshot = useMarketIndexSnapshot();

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex items-center gap-6 px-6 py-2.5 border-b border-[var(--border-subtle)] overflow-x-auto no-scrollbar"
      style={{ background: "var(--surface-1)" }}
    >
      {snapshot.indices.map((idx, i) => (
        <motion.div
          key={idx.code}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.05 }}
          className="flex items-center gap-3 whitespace-nowrap"
        >
          <span className="text-xs text-[var(--text-muted)] font-medium">{idx.name}</span>
          <span className={cn("text-sm font-semibold font-mono-nums", idx.changePercent >= 0 ? "text-up" : "text-down")}>
            {idx.price.toFixed(2)}
          </span>
          <span className={cn("text-xs font-mono-nums px-1.5 py-0.5 rounded", idx.changePercent >= 0 ? "text-up bg-up" : "text-down bg-down")}>
            {formatPercent(idx.changePercent)}
          </span>
          {i < snapshot.indices.length - 1 && <div className="w-px h-4 bg-[var(--border-subtle)] ml-6" />}
        </motion.div>
      ))}
      <div className="flex-1" />
      <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
        <DataSourceBadge source={snapshot.source} label={snapshot.sourceLabel} updatedAt={snapshot.updatedAt} fallbackUsed={snapshot.fallbackUsed} />
        <span>
          Sample turnover <span className="text-[var(--accent)] font-medium font-mono-nums">{snapshot.breadth.totalTurnover}</span>
        </span>
        <span>
          Up <span className="text-up font-mono-nums">{snapshot.breadth.upCount}</span> / Down <span className="text-down font-mono-nums">{snapshot.breadth.downCount}</span>
        </span>
      </div>
    </motion.div>
  );
}
