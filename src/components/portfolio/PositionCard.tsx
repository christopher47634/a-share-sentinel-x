"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { cn, formatCurrency, formatPercent } from "@/lib/utils";
import type { Position } from "@/types/account";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { FlowHoverSurface } from "@/components/common/FlowHoverSurface";

interface PositionCardProps {
  position: Position;
  index: number;
}

export default function PositionCard({ position, index }: PositionCardProps) {
  const router = useRouter();
  const isUp = position.unrealizedPnLPercent >= 0;
  const pnlColor =
    position.unrealizedPnL > 0
      ? "text-up"
      : position.unrealizedPnL < 0
      ? "text-down"
      : "text-[var(--text-secondary)]";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      onClick={() => router.push(`/mobile/trade/${position.stockCode}`)}
      className="p-4 rounded-xl cursor-pointer hover:brightness-110 transition-all card-interactive mobile-press"
      style={{
        background:
          "linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02)), rgba(15,22,36,0.6)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
    <FlowHoverSurface variant="card">
      <div className="flex items-center justify-between mb-2">
        <div>
          <span className="text-sm font-medium text-[var(--text-primary)]">
            {position.stockName}
          </span>
          <span className="text-[10px] text-[var(--text-muted)] font-mono-nums ml-1.5">
            {position.stockCode}
          </span>
        </div>
        <div
          className={cn(
            "flex items-center gap-0.5",
            isUp ? "text-up" : "text-down"
          )}
        >
          {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          <span className="text-xs font-semibold font-mono-nums">
            {formatPercent(position.unrealizedPnLPercent)}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between mb-1.5">
        <span className="text-lg font-bold text-[var(--text-primary)] font-mono-nums">
          ¥{position.currentPrice.toFixed(2)}
        </span>
        <span className={cn("text-sm font-semibold font-mono-nums", pnlColor)}>
          {position.unrealizedPnL >= 0 ? "+" : ""}
          {formatCurrency(position.unrealizedPnL)}
        </span>
      </div>

      <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)]">
        <span>
          持仓{" "}
          <span className="font-mono-nums text-[var(--text-secondary)]">
            {position.quantity.toLocaleString()}
          </span>{" "}
          股
        </span>
        <span>
          市值{" "}
          <span className="font-mono-nums text-[var(--text-secondary)]">
            ¥{formatCurrency(position.marketValue)}
          </span>
        </span>
      </div>
    </FlowHoverSurface>
    </motion.div>
  );
}
