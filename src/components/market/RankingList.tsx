"use client";

import { motion } from "framer-motion";
import { cn, formatPercent } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface RankingStock {
  code: string;
  name: string;
  price: number;
  changePercent: number;
  turnover: string;
}

interface RankingListProps {
  title: string;
  stocks: RankingStock[];
  valueKey: "changePercent" | "turnover";
  delay?: number;
}

export default function RankingList({
  title,
  stocks,
  valueKey,
  delay = 0,
}: RankingListProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: delay * 0.08,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className="glass p-4"
    >
      <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
        {title}
      </h3>

      <div className="space-y-0.5">
        {stocks.slice(0, 8).map((stock, i) => {
          const value = stock[valueKey];
          const isPercent = valueKey === "changePercent";
          const numValue =
            typeof value === "number"
              ? value
              : parseFloat(String(value).replace("亿", ""));


          return (
            <motion.div
              key={stock.code}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: delay * 0.08 + i * 0.04 }}
              className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-[var(--glass-bg)] transition-colors cursor-pointer group"
            >
              {/* Rank */}
              <span
                className={cn(
                  "w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold",
                  i < 3
                    ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                    : "text-[var(--text-muted)]"
                )}
              >
                {i + 1}
              </span>

              {/* Stock info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[var(--text-primary)] font-medium truncate">
                    {stock.name}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] font-mono-nums">
                    {stock.code}
                  </span>
                </div>
              </div>

              {/* Price */}
              <span className="text-sm font-semibold text-[var(--text-primary)] font-mono-nums tabular-nums">
                {typeof stock.price === "number"
                  ? stock.price.toFixed(2)
                  : stock.price}
              </span>

              {/* Change / Turnover */}
              <div
                className={cn(
                  "flex items-center gap-0.5 min-w-[72px] justify-end",
                  isPercent
                    ? numValue >= 0
                      ? "text-up"
                      : "text-down"
                    : "text-[var(--text-secondary)]"
                )}
              >
                {isPercent && (
                  <>
                    {numValue >= 0 ? (
                      <ArrowUpRight size={12} />
                    ) : (
                      <ArrowDownRight size={12} />
                    )}
                  </>
                )}
                <span className="text-xs font-semibold font-mono-nums">
                  {isPercent
                    ? formatPercent(numValue)
                    : String(value)}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
