"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { cn, formatCurrency } from "@/lib/utils";
import type { Position } from "@/types/account";
import { getSectorById } from "@/mock/sectors";
import { Package } from "lucide-react";

const GRID_COLS =
  "minmax(140px, 1.3fr) minmax(90px, 0.8fr) minmax(90px, 0.8fr) minmax(90px, 0.8fr) minmax(90px, 0.8fr) minmax(110px, 1fr) minmax(110px, 1fr) minmax(100px, 0.9fr)";

interface PositionTableProps {
  positions: Position[];
  delay?: number;
}

export default function PositionTable({
  positions,
  delay = 0,
}: PositionTableProps) {
  const router = useRouter();

  if (positions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: delay * 0.08 }}
        className="glass p-8 flex flex-col items-center justify-center gap-3"
      >
        <Package size={40} className="text-[var(--text-muted)] opacity-50" />
        <span className="text-sm text-[var(--text-muted)]">暂无持仓</span>
        <span className="text-xs text-[var(--text-muted)] opacity-60">
          下单交易后将在此显示持仓信息
        </span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: delay * 0.08,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      data-demo-highlight="portfolio-table"
      className="glass overflow-hidden rounded-xl"
    >
      {/* Component Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <Package size={16} className="text-[var(--accent)]" />
          <span className="text-sm font-semibold text-[var(--text-primary)]">
            持仓明细
          </span>
          <span className="text-xs text-[var(--text-muted)]">
            共 {positions.length} 只
          </span>
        </div>
      </div>

      {/* Table Header Row */}
      <div
        className="grid px-5 py-2.5 text-[10px] font-medium text-[var(--text-muted)] border-b border-[var(--border-subtle)]"
        style={{ gridTemplateColumns: GRID_COLS }}
      >
        <span>股票</span>
        <span>板块</span>
        <span className="text-right">持仓/可用</span>
        <span className="text-right">成本价</span>
        <span className="text-right">现价</span>
        <span className="text-right">市值</span>
        <span className="text-right">浮动盈亏</span>
        <span className="text-right">今日盈亏</span>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-[var(--border-subtle)]">
        {positions.map((pos, i) => {
          const sector = getSectorById(pos.sectorId);
          const pnlColor =
            pos.unrealizedPnL > 0
              ? "text-up"
              : pos.unrealizedPnL < 0
              ? "text-down"
              : "text-[var(--text-secondary)]";
          const todayColor =
            pos.todayPnL > 0
              ? "text-up"
              : pos.todayPnL < 0
              ? "text-down"
              : "text-[var(--text-secondary)]";

          return (
            <motion.div
              key={pos.stockCode}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, delay: i * 0.03 }}
              onClick={() => router.push(`/stocks/${pos.stockCode}`)}
              className="grid px-5 text-sm items-center hover:bg-[var(--surface-2)] transition-colors duration-150 cursor-pointer row-interactive"
              style={{
                gridTemplateColumns: GRID_COLS,
                minHeight: "68px",
              }}
            >
              {/* Stock Name + Code */}
              <div className="flex flex-col justify-center">
                <span className="text-[var(--text-primary)] font-medium">
                  {pos.stockName}
                </span>
                <span className="text-[10px] text-[var(--text-muted)] font-mono-nums">
                  {pos.stockCode}
                </span>
              </div>

              {/* Sector */}
              <span className="text-[10px] text-[var(--text-muted)] truncate">
                {sector?.name || pos.sectorId}
              </span>

              {/* Quantity / Available */}
              <div className="flex flex-col items-end">
                <span className="text-xs text-[var(--text-primary)] font-mono-nums">
                  {pos.quantity.toLocaleString()}
                </span>
                <span className="text-[10px] text-[var(--text-muted)] font-mono-nums">
                  /{pos.availableQuantity.toLocaleString()}
                </span>
              </div>

              {/* Avg Cost */}
              <span className="text-right text-xs text-[var(--text-secondary)] font-mono-nums">
                ¥{pos.avgCost.toFixed(2)}
              </span>

              {/* Current Price */}
              <span className="text-right text-xs font-semibold text-[var(--text-primary)] font-mono-nums">
                ¥{pos.currentPrice.toFixed(2)}
              </span>

              {/* Market Value */}
              <span className="text-right text-xs text-[var(--text-primary)] font-mono-nums">
                ¥{formatCurrency(pos.marketValue)}
              </span>

              {/* Unrealized P&L */}
              <span
                className={cn(
                  "text-right text-xs font-semibold font-mono-nums",
                  pnlColor
                )}
              >
                {pos.unrealizedPnL >= 0 ? "+" : ""}
                {formatCurrency(pos.unrealizedPnL)}
              </span>

              {/* Today P&L */}
              <span
                className={cn(
                  "text-right text-xs font-mono-nums",
                  todayColor
                )}
              >
                {pos.todayPnL >= 0 ? "+" : ""}
                {formatCurrency(pos.todayPnL)}
              </span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
