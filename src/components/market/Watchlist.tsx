"use client";

import { motion } from "framer-motion";
import { cn, formatPercent } from "@/lib/utils";
import { Star, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useMarketSnapshot } from "@/hooks/useMarketSnapshot";

const WATCH_CODES = ["600519", "300750", "688256", "000977", "300124"];

function sparklineFromQuote(prevClose: number, currentPrice: number) {
  const points = 16;
  const result: number[] = [];
  for (let i = 0; i < points; i += 1) {
    const t = i / (points - 1);
    const wave = Math.sin(t * Math.PI * 2) * prevClose * 0.002;
    result.push(Number((prevClose + (currentPrice - prevClose) * t + wave).toFixed(2)));
  }
  return result;
}

function SparklineSVG({ data, color }: { data: number[]; color: string }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 64;
  const h = 24;

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <motion.polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.2, delay: 0.3 }}
      />
    </svg>
  );
}

export default function Watchlist({ delay = 0 }: { delay?: number }) {
  const { quotes } = useMarketSnapshot(WATCH_CODES);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="glass p-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <Star size={14} className="text-[var(--accent)]" />
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">自选股</h3>
      </div>

      <div className="space-y-0.5">
        {quotes.map((stock, i) => {
          const isUp = stock.changePercent >= 0;
          return (
            <motion.div
              key={stock.code}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: delay * 0.08 + i * 0.05 }}
              className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-[var(--glass-bg)] transition-colors cursor-pointer"
            >
              <div className="flex-1 min-w-0">
                <span className="text-sm text-[var(--text-primary)] font-medium">{stock.name}</span>
                <span className="text-[10px] text-[var(--text-muted)] font-mono-nums ml-2">{stock.code}</span>
              </div>

              <SparklineSVG data={sparklineFromQuote(stock.prevClose, stock.price)} color={isUp ? "var(--up)" : "var(--down)"} />

              <div className="text-right min-w-[70px]">
                <div className="text-sm font-semibold text-[var(--text-primary)] font-mono-nums">{stock.price.toFixed(2)}</div>
                <div className={cn("flex items-center gap-0.5 justify-end", isUp ? "text-up" : "text-down")}>
                  {isUp ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                  <span className="text-[10px] font-mono-nums">{formatPercent(stock.changePercent)}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
