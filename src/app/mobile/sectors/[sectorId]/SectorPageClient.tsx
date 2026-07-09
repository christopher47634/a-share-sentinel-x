"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import MobileShell from "@/components/layout/MobileShell";
import { getSectorById } from "@/mock/sectors";
import { getStocksBySector } from "@/mock/stocks";
import { cn, formatPercent } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowDownRight,
  Flame,
  ArrowUpDown,
} from "lucide-react";
import { sectorIconMap, SectorFallback } from "@/components/icons/SectorIcons";
import SectorHeroArtwork from "@/components/sector/SectorHeroArtwork";
import MobileCanvasWrapper from "@/components/sector-visuals/MobileCanvasWrapper";
import HeroKpiCard from "@/components/sector/HeroKpiCard";
import ErrorState from "@/components/common/ErrorState";

const iconMap = sectorIconMap;

type SortKey = "turnover" | "changePercent" | "price" | "turnoverRate";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "turnover", label: "成交额" },
  { key: "changePercent", label: "涨跌幅" },
  { key: "price", label: "价格" },
  { key: "turnoverRate", label: "换手率" },
];

function parseTurnover(tv: string): number {
  return parseFloat(tv.replace("亿", "")) || 0;
}

export default function SectorPageClient() {
  const params = useParams();
  const router = useRouter();
  const sectorId = params.sectorId as string;
  const sector = getSectorById(sectorId);
  const [sortKey, setSortKey] = useState<SortKey>("turnover");
  const [sortAsc, setSortAsc] = useState(false);
  const [showSortPicker, setShowSortPicker] = useState(false);

  const sectorStocks = useMemo(() => {
    const raw = getStocksBySector(sectorId);
    return [...raw].sort((a, b) => {
      let aVal: number;
      let bVal: number;
      switch (sortKey) {
        case "turnover": aVal = parseTurnover(a.turnover); bVal = parseTurnover(b.turnover); break;
        case "changePercent": aVal = a.changePercent; bVal = b.changePercent; break;
        case "price": aVal = a.price; bVal = b.price; break;
        case "turnoverRate": aVal = a.turnoverRate; bVal = b.turnoverRate; break;
        default: aVal = 0; bVal = 0;
      }
      return sortAsc ? aVal - bVal : bVal - aVal;
    });
  }, [sectorId, sortKey, sortAsc]);

  if (!sector) {
    return (
      <MobileShell>
        <div className="flex items-center justify-center h-screen p-4">
          <ErrorState
            title="未找到该板块"
            description="请检查板块地址是否正确"
            onRetry={() => router.push("/mobile")}
          />
        </div>
      </MobileShell>
    );
  }

  const Icon = iconMap[sector.icon] || SectorFallback;
  const isUp = sector.changePercent >= 0;

  return (
    <MobileShell activeTab={1}>
      {/* Hero area - ~30% of viewport */}
      <motion.div
        layoutId={`sector-card-${sector.id}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden"
        style={{
          background:
            "linear-gradient(145deg, rgba(255,255,255,0.075), rgba(255,255,255,0.025)), rgba(15, 22, 36, 0.72)",
          backdropFilter: "blur(22px) saturate(140%)",
          WebkitBackdropFilter: "blur(22px) saturate(140%)",
          minHeight: "30vh",
        }}
      >
        {/* SectorHeroArtwork — P1-F: wide landscape hero, lower opacity on mobile to not overpower text/KPI */}
        <div style={{ opacity: 0.7 }}>
          <SectorHeroArtwork
            visualType={sector.visualType}
            accentColor={sector.accentColor}
          />
        </div>

        {/* Mobile Canvas 2D background — behind text/KPI, reduced size */}
        <div style={{ opacity: 0.5 }}>
          <MobileCanvasWrapper
            visualType={sector.visualType}
            width={360}
            height={200}
          />
        </div>

        <div className="relative z-10 p-4">
          {/* Back button */}
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => router.push("/mobile")}
            className="flex items-center gap-1.5 text-sm text-[var(--text-muted)] mb-4"
          >
            <ArrowLeft size={16} />
            返回
          </motion.button>

          {/* Sector info */}
          <div className="flex items-center gap-3 mb-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
                delay: 0.1,
              }}
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                background: `${sector.accentColor}28`,
                border: `1px solid ${sector.accentColor}40`,
              }}
            >
              <Icon size={24} style={{ color: sector.accentColor }} />
            </motion.div>
            <div>
              <h1 className="text-lg font-bold text-[var(--text-primary)]">
                {sector.name}
              </h1>
              <p className="text-xs text-[var(--text-muted)]">
                {sector.description}
              </p>
            </div>
          </div>

          {/* Change + rank */}
          <div className="flex items-center justify-between mb-4">
            <div
              className={cn(
                "text-2xl font-bold font-mono-nums",
                isUp ? "text-up" : "text-down"
              )}
            >
              {formatPercent(sector.changePercent)}
            </div>
            <div className="flex items-center gap-1">
              <Flame size={12} className="text-[var(--accent)]" />
              <span className="text-xs text-[var(--accent)] font-mono-nums">
                热度 #{sector.hotRank}
              </span>
            </div>
          </div>

          {/* Horizontal scroll stat cards */}
          <div className="flex gap-2.5 overflow-x-auto no-scrollbar fade-mask-right scroll-snap-x pb-1">
            <HeroKpiCard label="成交额" value={sector.turnover} tone="neutral" compact />
            <HeroKpiCard
              label="资金流入"
              value={sector.capitalInflow}
              tone={sector.capitalInflow.startsWith("+") ? "positive" : "negative"}
              compact
            />
            <HeroKpiCard
              label="涨跌家数"
              value={`${sectorStocks.filter(s => s.changePercent >= 0).length}↑ ${sectorStocks.filter(s => s.changePercent < 0).length}↓`}
              tone={sectorStocks.filter(s => s.changePercent >= 0).length > sectorStocks.filter(s => s.changePercent < 0).length ? "positive" : "negative"}
              compact
            />
            <HeroKpiCard
              label="成分股"
              value={`${sectorStocks.length}只`}
              tone="neutral"
              compact
            />
          </div>
        </div>
      </motion.div>

      {/* Stock list section */}
      <div className="px-4 pt-4 pb-24">
        {/* Sort trigger */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-[var(--text-primary)]">
            成分股
          </span>
          <button
            onClick={() => setShowSortPicker(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[var(--text-muted)] bg-[var(--surface-1)]"
          >
            <ArrowUpDown size={12} />
            {SORT_OPTIONS.find((s) => s.key === sortKey)?.label}
            {sortAsc ? "↑" : "↓"}
          </button>
        </div>

        {/* Full-width stock list */}
        <div className="space-y-0.5">
          {sectorStocks.map((stock, i) => {
            const stockIsUp = stock.changePercent >= 0;
            return (
              <motion.div
                key={stock.code}
                layoutId={`mobile-stock-${stock.code}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  layout: { type: "spring", stiffness: 350, damping: 30 },
                  delay: i * 0.02,
                }}
                onClick={() => router.push(`/mobile/trade/${stock.code}`)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[var(--surface-1)] transition-colors cursor-pointer"
                style={{
                  background:
                    "linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02)), rgba(15,22,36,0.6)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <span
                  className={cn(
                    "w-5 text-center text-[10px] font-mono-nums",
                    i < 3
                      ? "text-[var(--accent)] font-semibold"
                      : "text-[var(--text-muted)]"
                  )}
                >
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-[var(--text-primary)] font-medium">
                    {stock.name}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] font-mono-nums ml-1.5">
                    {stock.code}
                  </span>
                </div>
                <span className="text-sm font-semibold text-[var(--text-primary)] font-mono-nums">
                  {stock.price.toFixed(2)}
                </span>
                <div
                  className={cn(
                    "flex items-center gap-0.5 min-w-[72px] justify-end",
                    stockIsUp ? "text-up" : "text-down"
                  )}
                >
                  {stockIsUp ? (
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

      {/* Sort picker bottom sheet */}
      <AnimatePresence>
        {showSortPicker && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowSortPicker(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-8 rounded-t-2xl"
              style={{
                background:
                  "linear-gradient(145deg, rgba(255,255,255,0.075), rgba(255,255,255,0.025)), rgba(15, 22, 36, 0.95)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                borderTop: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              <div className="w-10 h-1 rounded-full bg-[var(--surface-3)] mx-auto mb-4" />
              <p className="text-sm font-semibold text-[var(--text-primary)] mb-3">
                排序方式
              </p>
              <div className="space-y-1">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => {
                      if (sortKey === opt.key) {
                        setSortAsc(!sortAsc);
                      } else {
                        setSortKey(opt.key);
                        setSortAsc(false);
                      }
                      setShowSortPicker(false);
                    }}
                    className={cn(
                      "w-full text-left px-4 py-3 rounded-xl text-sm transition-colors",
                      sortKey === opt.key
                        ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                        : "text-[var(--text-secondary)] hover:bg-[var(--surface-1)]"
                    )}
                  >
                    {opt.label}
                    {sortKey === opt.key && (
                      <span className="ml-2 text-[var(--text-muted)]">
                        {sortAsc ? "升序" : "降序"}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </MobileShell>
  );
}


