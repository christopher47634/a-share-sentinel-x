"use client";

import { useMemo } from "react";
import MobileShell from "@/components/layout/MobileShell";
import { motion } from "framer-motion";
import { cn, formatPercent } from "@/lib/utils";
import MarketPulse from "@/components/market/MarketPulse";
import { sectors } from "@/mock/sectors";
import { useMarketIndexSnapshot } from "@/hooks/useMarketIndexSnapshot";
import { useMarketSnapshot } from "@/hooks/useMarketSnapshot";
import { ArrowUpRight, ArrowDownRight, Eye, ChevronRight } from "lucide-react";
import { sectorIconMap, SectorFallback } from "@/components/icons/SectorIcons";
import SectorVisualBackground from "@/components/sector/SectorVisualBackground";
import MobileCanvasWrapper from "@/components/sector-visuals/MobileCanvasWrapper";

const iconMap = sectorIconMap;

function AssetCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-4 mt-3 mb-2 p-5 rounded-2xl overflow-hidden relative"
      style={{
        background:
          "linear-gradient(135deg, rgba(212,165,116,0.12) 0%, rgba(255,255,255,0.04) 100%)",
        backdropFilter: "blur(24px) saturate(140%)",
        WebkitBackdropFilter: "blur(24px) saturate(140%)",
        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.08), 0 24px 80px rgba(0,0,0,0.42)",
      }}
    >
      {/* Subtle dark gold ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 30% 20%, rgba(212,165,116,0.06), transparent 60%)",
        }}
      />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-[var(--text-muted)]">
            模拟总资产 (CNY)
          </span>
          <Eye size={14} className="text-[var(--text-muted)]" />
        </div>
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-xs text-[var(--text-secondary)]">¥</span>
          <span className="text-3xl font-bold text-[var(--text-primary)] font-mono-nums">
            1,256,789.56
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div>
            <span className="text-[10px] text-[var(--text-muted)] block">
              今日盈亏
            </span>
            <span className="text-sm font-semibold text-up font-mono-nums">
              +28,956.78
            </span>
          </div>
          <div className="w-px h-6 bg-[var(--border-subtle)]" />
          <div>
            <span className="text-[10px] text-[var(--text-muted)] block">
              收益率
            </span>
            <span className="text-sm font-semibold text-up font-mono-nums">
              +2.34%
            </span>
          </div>
          <div className="w-px h-6 bg-[var(--border-subtle)]" />
          <div>
            <span className="text-[10px] text-[var(--text-muted)] block">
              持仓
            </span>
            <span className="text-sm font-semibold text-[var(--text-primary)] font-mono-nums">
              5只
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function IndexCards() {
  const { indices } = useMarketIndexSnapshot();
  return (
    <div className="px-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-[var(--text-primary)]">
          市场指数
        </span>
        <span className="text-[10px] text-[var(--text-muted)]">
          滑动查看更多
        </span>
      </div>
      <div className="flex gap-3 overflow-x-auto no-scrollbar scroll-snap-x fade-mask-right pb-1">
        {indices.map((idx, i) => (
          <motion.div
            key={idx.code}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            className="flex-shrink-0 w-[140px] p-3.5 rounded-xl"
            style={{
              background:
                "linear-gradient(145deg, rgba(255,255,255,0.075), rgba(255,255,255,0.025)), rgba(15,22,36,0.72)",
              backdropFilter: "blur(22px) saturate(140%)",
              WebkitBackdropFilter: "blur(22px) saturate(140%)",
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
            }}
          >
            <span className="text-xs text-[var(--text-muted)] block mb-1">
              {idx.name}
            </span>
            <span
              className={cn(
                "text-base font-bold font-mono-nums block mb-0.5",
                idx.changePercent >= 0 ? "text-up" : "text-down"
              )}
            >
              {idx.price.toFixed(2)}
            </span>
            <span
              className={cn(
                "text-xs font-mono-nums px-1.5 py-0.5 rounded inline-block",
                idx.changePercent >= 0 ? "text-up bg-up" : "text-down bg-down"
              )}
            >
              {formatPercent(idx.changePercent)}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function SectorCards() {
  const sortedSectors = [...sectors]
    .sort((a, b) => a.hotRank - b.hotRank)
    .slice(0, 10);
  return (
    <div className="px-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-[var(--text-primary)]">
          热门板块
        </span>
        <div className="flex items-center gap-1 text-[var(--text-muted)]">
          <span className="text-[10px]">更多</span>
          <ChevronRight size={12} />
        </div>
      </div>
      <div className="flex gap-3 overflow-x-auto no-scrollbar scroll-snap-x fade-mask-right pb-1">
        {sortedSectors.map((sector, i) => {
          const Icon = iconMap[sector.icon] || SectorFallback;
          const isUp = sector.changePercent >= 0;
          return (
            <motion.div
              key={sector.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.04 }}
              className="flex-shrink-0 w-[120px] p-3.5 rounded-xl relative overflow-hidden group mobile-press"
              style={{
                background:
                  "linear-gradient(145deg, rgba(255,255,255,0.075), rgba(255,255,255,0.025)), rgba(15,22,36,0.72)",
                backdropFilter: "blur(22px) saturate(140%)",
                WebkitBackdropFilter: "blur(22px) saturate(140%)",
                border: "1px solid rgba(255,255,255,0.12)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
              }}
            >
              {/* SectorVisualBackground — P1-E: right-side industry watermark */}
              <SectorVisualBackground
                visualType={sector.visualType}
                accentColor={sector.accentColor}
                intensity="subtle"
              />

              {/* Mobile Canvas 2D background — behind text, reduced size */}
              <MobileCanvasWrapper
                visualType={sector.visualType}
                width={120}
                height={120}
              />

              {/* Content — z-10 above backgrounds */}
              <div className="relative z-10">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center mb-2"
                  style={{ background: `${sector.accentColor}20` }}
                >
                  <Icon size={16} style={{ color: sector.accentColor }} />
                </div>
                <span className="text-xs font-medium text-[var(--text-primary)] block mb-1">
                  {sector.name}
                </span>
                <span
                  className={cn(
                    "text-sm font-bold font-mono-nums",
                    isUp ? "text-up" : "text-down"
                  )}
                >
                  {formatPercent(sector.changePercent)}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function MiniRanking() {
  const { quotes } = useMarketSnapshot();
  const topGainers = useMemo(
    () => [...quotes].sort((a, b) => b.changePercent - a.changePercent).slice(0, 6),
    [quotes]
  );
  return (
    <div className="px-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-[var(--text-primary)]">
          涨幅榜
        </span>
        <div className="flex items-center gap-1 text-[var(--text-muted)]">
          <span className="text-[10px]">更多</span>
          <ChevronRight size={12} />
        </div>
      </div>
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background:
            "linear-gradient(145deg, rgba(255,255,255,0.075), rgba(255,255,255,0.025)), rgba(15,22,36,0.72)",
          backdropFilter: "blur(22px) saturate(140%)",
          WebkitBackdropFilter: "blur(22px) saturate(140%)",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
        }}
      >
        {topGainers.map((stock, i) => {
          const isUp = stock.changePercent >= 0;
          return (
            <motion.div
              key={stock.code}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.04 }}
              className={cn(
                "flex items-center gap-3 px-4 py-3 mobile-press",
                i < topGainers.length - 1 &&
                  "border-b border-[var(--border-subtle)]"
              )}
            >
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
              <div className="flex-1">
                <span className="text-sm text-[var(--text-primary)]">
                  {stock.name}
                </span>
                <span className="text-[10px] text-[var(--text-muted)] font-mono-nums ml-2">
                  {stock.code}
                </span>
              </div>
              <span className="text-sm font-semibold text-[var(--text-primary)] font-mono-nums">
                {stock.price.toFixed(2)}
              </span>
              <div
                className={cn(
                  "flex items-center gap-0.5 min-w-[68px] justify-end",
                  isUp ? "text-up" : "text-down"
                )}
              >
                {isUp ? (
                  <ArrowUpRight size={10} />
                ) : (
                  <ArrowDownRight size={10} />
                )}
                <span className="text-xs font-semibold font-mono-nums">
                  {formatPercent(stock.changePercent)}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function MarketBar() {
  const { breadth } = useMarketIndexSnapshot();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.15 }}
      className="flex items-center justify-between px-4 py-2 border-b border-[var(--border-subtle)]"
      style={{ background: "var(--surface-1)" }}
    >
      <div className="flex items-center gap-4 text-[10px] text-[var(--text-muted)]">
        <span>
          总成{" "}
          <span className="text-[var(--accent)] font-mono-nums">
            {breadth.totalTurnover}
          </span>
        </span>
        <span>
          涨 <span className="text-up font-mono-nums">{breadth.upCount}</span>
        </span>
        <span>
          跌{" "}
          <span className="text-down font-mono-nums">
            {breadth.downCount}
          </span>
        </span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-1 h-1 rounded-full bg-up pulse-dot" />
        <span className="text-[10px] text-[var(--text-muted)]">
          盘中 · 交易中
        </span>
      </div>
    </motion.div>
  );
}

export default function MobileHomePage() {
  return (
    <MobileShell>
      <MarketBar />
      <AssetCard />
      <MarketPulse compact />
      <IndexCards />
      <SectorCards />
      <MiniRanking />
      <div className="h-4" />
    </MobileShell>
  );
}
