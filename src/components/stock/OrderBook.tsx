"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface OrderLevel {
  price: number;
  volume: number;
  label: string;
}

interface OrderBookProps {
  currentPrice: number;
  prevClose: number;
}

function generateOrderBook(currentPrice: number, prevClose: number) {
  const asks: OrderLevel[] = [];
  const bids: OrderLevel[] = [];
  const isUp = currentPrice >= prevClose;
  const step = currentPrice * 0.001;

  for (let i = 5; i >= 1; i--) {
    asks.push({
      price: parseFloat((currentPrice + step * i).toFixed(2)),
      volume: Math.floor(Math.random() * 500 + 50) * 100,
      label: `卖${6 - i}`,
    });
  }

  for (let i = 1; i <= 5; i++) {
    bids.push({
      price: parseFloat((currentPrice - step * i).toFixed(2)),
      volume: Math.floor(Math.random() * 500 + 50) * 100,
      label: `买${i}`,
    });
  }

  const maxVolume = Math.max(
    ...asks.map((a) => a.volume),
    ...bids.map((b) => b.volume)
  );

  return { asks, bids, maxVolume, isUp };
}

export default function OrderBook({ currentPrice, prevClose }: OrderBookProps) {
  const { asks, bids, maxVolume } = generateOrderBook(currentPrice, prevClose);

  return (
    <div className="space-y-0.5 font-mono-nums text-xs">
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-1.5 text-[10px] text-[var(--text-muted)]">
        <span className="w-12">盘口</span>
        <span className="flex-1 text-right">价格</span>
        <span className="w-20 text-right">数量</span>
      </div>

      {/* Asks (sells) - reversed so 卖5 is at top */}
      {[...asks].reverse().map((level, i) => {
        const barWidth = (level.volume / maxVolume) * 100;
        return (
          <motion.div
            key={level.label}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            className="relative flex items-center justify-between px-2 py-1"
          >
            <div
              className="absolute right-0 top-0 bottom-0 opacity-[0.08]"
              style={{
                width: `${barWidth}%`,
                background: "var(--down)",
              }}
            />
            <span className="relative w-12 text-[var(--text-muted)]">
              {level.label}
            </span>
            <span className="relative flex-1 text-right text-down">
              {level.price.toFixed(2)}
            </span>
            <span className="relative w-20 text-right text-[var(--text-secondary)]">
              {level.volume.toLocaleString()}
            </span>
          </motion.div>
        );
      })}

      {/* Current Price */}
      <div className="flex items-center justify-center py-2 my-0.5 border-y border-[var(--border-subtle)]">
        <span
          className={cn(
            "text-lg font-bold",
            currentPrice >= prevClose ? "text-up" : "text-down"
          )}
        >
          {currentPrice.toFixed(2)}
        </span>
        <span className="ml-2 text-xs text-[var(--text-muted)]">现价</span>
      </div>

      {/* Bids (buys) */}
      {bids.map((level, i) => {
        const barWidth = (level.volume / maxVolume) * 100;
        return (
          <motion.div
            key={level.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + i * 0.03 }}
            className="relative flex items-center justify-between px-2 py-1"
          >
            <div
              className="absolute right-0 top-0 bottom-0 opacity-[0.08]"
              style={{
                width: `${barWidth}%`,
                background: "var(--up)",
              }}
            />
            <span className="relative w-12 text-[var(--text-muted)]">
              {level.label}
            </span>
            <span className="relative flex-1 text-right text-up">
              {level.price.toFixed(2)}
            </span>
            <span className="relative w-20 text-right text-[var(--text-secondary)]">
              {level.volume.toLocaleString()}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
