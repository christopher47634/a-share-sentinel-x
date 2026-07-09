"use client";

import { useMemo } from "react";
import { runSentinelCore } from "@/lib/sentinel-core";
import DesktopShell from "@/components/layout/DesktopShell";
import GlassCard from "@/components/common/GlassCard";
import { motion } from "framer-motion";
import type {
  MarketRegime,
  SentinelSector,
  SentinelStock,
} from "@/lib/sentinel-core";
import { useLocalSentinelAccount } from "@/hooks/use-local-sentinel-account";

// ─── helpers ───

function regimeBadge(regime: MarketRegime) {
  const map: Record<MarketRegime, { bg: string; text: string; border: string }> = {
    "全面强势": {
      bg: "rgba(34,197,94,0.12)",
      text: "var(--ai-green)",
      border: "rgba(34,197,94,0.4)",
    },
    "结构性强势": {
      bg: "rgba(6,182,212,0.12)",
      text: "var(--ai-cyan)",
      border: "rgba(6,182,212,0.4)",
    },
    "震荡偏强": {
      bg: "rgba(245,158,11,0.12)",
      text: "var(--ai-warning)",
      border: "rgba(245,158,11,0.4)",
    },
    "震荡分化": {
      bg: "rgba(249,115,22,0.12)",
      text: "#F97316",
      border: "rgba(249,115,22,0.4)",
    },
    "弱势调整": {
      bg: "rgba(239,68,68,0.12)",
      text: "var(--ai-danger)",
      border: "rgba(239,68,68,0.4)",
    },
    "恐慌下跌": {
      bg: "rgba(239,68,68,0.18)",
      text: "var(--ai-danger)",
      border: "rgba(239,68,68,0.6)",
    },
  };
  return map[regime] || map["震荡偏强"];
}

function pct(v: number): string {
  const s = v > 0 ? "+" : "";
  return `${s}${v.toFixed(2)}%`;
}

function changeColor(v: number): string {
  if (v > 0) return "text-[var(--up)]";
  if (v < 0) return "text-[var(--down)]";
  return "text-[var(--text-secondary)]";
}

// ─── sub-components ───

function BriefCard({ brief }: { brief: string }) {
  const sections = brief.split(/\n/).filter(Boolean);

  // Parse each line to extract the tag and content
  const parsed = sections.map((line) => {
    const m = line.match(/^【(.+?)】(.*)$/);
    if (m) return { tag: m[1], content: m[2].trim() };
    return { tag: null, content: line.trim() };
  });

  return (
    <GlassCard
      className="p-5"
      glow={false}
    >
      <div
        className="relative rounded-2xl p-[1px]"
        style={{
          background: "linear-gradient(135deg, rgba(212,165,116,0.35), rgba(212,165,116,0.08), transparent 70%)",
        }}
      >
        <div
          className="rounded-2xl p-4 space-y-3"
          style={{
            background: "linear-gradient(145deg, rgba(255,255,255,0.04), rgba(15,22,36,0.6))",
            backdropFilter: "blur(16px)",
          }}
        >
          <h3 className="text-sm font-bold tracking-[0.15em] text-[var(--text-accent)] flex items-center gap-2">
            <span className="text-base">🧠</span>
            AI 市场简报
          </h3>
          <div className="space-y-2.5">
            {parsed.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.06, duration: 0.35 }}
                className="text-xs leading-relaxed"
              >
                {item.tag && (
                  <span
                    className="inline-flex items-center px-1.5 py-0.5 rounded mr-1.5 text-[10px] font-semibold tracking-wider"
                    style={{
                      backgroundColor: "rgba(212,165,116,0.12)",
                      color: "var(--text-accent)",
                      border: "1px solid rgba(212,165,116,0.25)",
                    }}
                  >
                    {item.tag}
                  </span>
                )}
                <span className="text-[var(--text-secondary)]">{item.content}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

function SectorRow({
  sector,
  rank,
}: {
  sector: SentinelSector;
  rank: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.05, duration: 0.3 }}
      className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-[rgba(255,255,255,0.02)] transition-colors"
    >
      <span className="text-[10px] font-mono text-[var(--text-muted)] w-4 text-right">
        {rank}
      </span>
      <span className="text-sm font-medium text-[var(--text-primary)] flex-1 min-w-0 truncate">
        {sector.name}
      </span>
      <span
        className={`text-xs font-mono-nums font-semibold w-16 text-right ${changeColor(sector.changePct)}`}
      >
        {pct(sector.changePct)}
      </span>
      <span className="text-[10px] font-mono-nums text-[var(--text-muted)] w-10 text-right">
        {(sector.heatScore ?? 0).toFixed(0)}
      </span>
      <span className="text-[10px] font-mono-nums text-[var(--text-muted)] w-16 text-right">
        <span className="text-[var(--up)]">{sector.upCount}</span>
        <span className="text-[var(--text-muted)]">/</span>
        <span className="text-[var(--down)]">{sector.downCount}</span>
      </span>
      {sector.leadingStock && (
        <span className="text-[10px] text-[var(--text-secondary)] w-28 text-right truncate">
          {sector.leadingStock}
          {sector.leadingStockChangePct !== undefined && (
            <span className={changeColor(sector.leadingStockChangePct)}>
              {" "}
              {pct(sector.leadingStockChangePct)}
            </span>
          )}
        </span>
      )}
    </motion.div>
  );
}

function StockRow({
  stock,
  rank,
  isHeld = false,
}: {
  stock: SentinelStock;
  rank: number;
  isHeld?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.04, duration: 0.3 }}
      className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-[rgba(255,255,255,0.02)] transition-colors"
    >
      <span className="text-[10px] font-mono text-[var(--text-muted)] w-16 flex-shrink-0">
        {stock.code}
      </span>
      <span className="text-sm text-[var(--text-primary)] flex-1 min-w-0 truncate">
        {stock.name}
        {isHeld && <span className="inline-flex items-center px-1 py-0.5 rounded text-[9px] font-semibold bg-cyan-400/10 text-cyan-300 border border-cyan-400/30 ml-1">持仓</span>}
      </span>
      <span
        className={`text-xs font-mono-nums font-semibold w-16 text-right ${changeColor(stock.changePct)}`}
      >
        {pct(stock.changePct)}
      </span>
      <span className="text-[10px] font-mono-nums text-[var(--text-secondary)] w-14 text-right">
        量比 {(stock.volumeRatio ?? 0).toFixed(2)}
      </span>
      <span className="text-[10px] text-[var(--text-muted)] w-20 text-right truncate">
        {stock.sector ?? "-"}
      </span>
    </motion.div>
  );
}

// ─── page ───

export default function MarketRadarPage() {
  const sentinel = useMemo(() => runSentinelCore(), []);
  const { marketRadar } = sentinel;

  // ─── Local Portfolio Sync ───
  const { isHeld } = useLocalSentinelAccount();

  const regimeStyle = regimeBadge(marketRadar.marketRegime);
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  // stagger helper
  const stagger = (i: number) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: 0.45,
      delay: i * 0.07,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  });

  return (
    <DesktopShell>
      <div className="p-4 md:p-6 lg:p-8 space-y-5">
        {/* ─── Header ─── */}
        <motion.div
          {...stagger(0)}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2"
        >
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              Market Radar
            </h1>
            <p className="text-sm text-[var(--text-muted)] mt-0.5">
              AI 自动看盘雷达
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-[var(--text-secondary)]">
              {timeStr}
            </span>
            <span
              className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider"
              style={{
                backgroundColor: "rgba(6,182,212,0.12)",
                color: "var(--ai-cyan)",
                border: "1px solid rgba(6,182,212,0.3)",
              }}
            >
              Live
            </span>
          </div>
        </motion.div>

        {/* ─── Two-column layout ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* ── Left: Market Data (2/3) ── */}
          <div className="lg:col-span-2 space-y-5">
            {/* 1. Market Temperature Overview */}
            <motion.div
              {...stagger(1)}
              className="grid grid-cols-3 sm:grid-cols-6 gap-3"
            >
              {/* Temperature */}
              <div className="glass p-3.5 flex flex-col gap-1 col-span-3 sm:col-span-1">
                <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-medium">
                  市场温度
                </span>
                <span className="text-2xl font-bold font-mono-nums text-[var(--text-primary)]">
                  {marketRadar.marketTemperature}°
                </span>
              </div>

              {/* Regime */}
              <div className="glass p-3.5 flex flex-col gap-1 col-span-3 sm:col-span-1">
                <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-medium">
                  市场状态
                </span>
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold w-fit"
                  style={{
                    backgroundColor: regimeStyle.bg,
                    color: regimeStyle.text,
                    border: `1px solid ${regimeStyle.border}`,
                  }}
                >
                  {marketRadar.marketRegime}
                </span>
              </div>

              {/* Style */}
              <div className="glass p-3.5 flex flex-col gap-1 col-span-3 sm:col-span-1">
                <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-medium">
                  市场风格
                </span>
                <span className="text-sm font-semibold text-[var(--text-primary)]">
                  {marketRadar.marketStyle}
                </span>
              </div>

              {/* Up/Down/Flat counts */}
              <div className="glass p-3.5 flex flex-col gap-1 col-span-3 sm:col-span-3">
                <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-medium">
                  涨跌分布
                </span>
                <div className="flex items-baseline gap-2 font-mono-nums text-sm">
                  <span className="text-[var(--up)] font-semibold">
                    ↑ {marketRadar.upCount}
                  </span>
                  <span className="text-[var(--text-muted)]">
                    {marketRadar.flatCount}
                  </span>
                  <span className="text-[var(--down)] font-semibold">
                    ↓ {marketRadar.downCount}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* 2. Hot Sectors */}
            <motion.div {...stagger(2)}>
              <GlassCard className="p-4">
                <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-primary)] mb-3">
                  热门板块
                </h3>
                {/* Header */}
                <div className="flex items-center gap-3 py-1.5 px-3 text-[10px] text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-subtle)]">
                  <span className="w-4" />
                  <span className="flex-1">板块</span>
                  <span className="w-16 text-right">涨跌幅</span>
                  <span className="w-10 text-right">热度</span>
                  <span className="w-16 text-right">涨/跌</span>
                  <span className="w-28 text-right">领涨股</span>
                </div>
                {marketRadar.hotSectors.slice(0, 8).map((s, i) => (
                  <SectorRow key={s.name} sector={s} rank={i + 1} />
                ))}
              </GlassCard>
            </motion.div>

            {/* 3. Weak Sectors */}
            <motion.div {...stagger(3)}>
              <GlassCard className="p-4">
                <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-primary)] mb-3">
                  弱势板块
                </h3>
                <div className="flex items-center gap-3 py-1.5 px-3 text-[10px] text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-subtle)]">
                  <span className="w-4" />
                  <span className="flex-1">板块</span>
                  <span className="w-16 text-right">涨跌幅</span>
                  <span className="w-10 text-right">热度</span>
                  <span className="w-16 text-right">涨/跌</span>
                  <span className="w-28 text-right">领涨股</span>
                </div>
                {marketRadar.weakSectors.slice(0, 5).map((s, i) => (
                  <SectorRow key={s.name} sector={s} rank={i + 1} />
                ))}
              </GlassCard>
            </motion.div>

            {/* 4. Hot Stocks */}
            <motion.div {...stagger(4)}>
              <GlassCard className="p-4">
                <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-primary)] mb-3">
                  强势个股
                </h3>
                <div className="flex items-center gap-3 py-1.5 px-3 text-[10px] text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-subtle)]">
                  <span className="w-16">代码</span>
                  <span className="flex-1">名称</span>
                  <span className="w-16 text-right">涨跌幅</span>
                  <span className="w-14 text-right">量比</span>
                  <span className="w-20 text-right">板块</span>
                </div>
                {marketRadar.hotStocks.slice(0, 8).map((s, i) => (
                  <StockRow key={s.code} stock={s} rank={i} isHeld={isHeld(s.code)} />
                ))}
              </GlassCard>
            </motion.div>

            {/* 5. High Volume Stocks */}
            <motion.div {...stagger(5)}>
              <GlassCard className="p-4">
                <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-primary)] mb-3">
                  高量比个股
                </h3>
                <div className="flex items-center gap-3 py-1.5 px-3 text-[10px] text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-subtle)]">
                  <span className="w-16">代码</span>
                  <span className="flex-1">名称</span>
                  <span className="w-16 text-right">涨跌幅</span>
                  <span className="w-14 text-right">量比</span>
                  <span className="w-20 text-right">板块</span>
                </div>
                {marketRadar.highVolumeStocks.slice(0, 8).map((s, i) => (
                  <StockRow key={s.code} stock={s} rank={i} isHeld={isHeld(s.code)} />
                ))}
              </GlassCard>
            </motion.div>

            {/* 6. Risk Signals */}
            <motion.div {...stagger(6)}>
              <GlassCard className="p-4">
                <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-primary)] mb-3">
                  风险暗流
                </h3>
                {marketRadar.riskSignals.length > 0 ? (
                  <div className="space-y-2">
                    {marketRadar.riskSignals.map((sig, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 text-xs text-[var(--text-secondary)] px-2 py-1.5 rounded"
                        style={{ background: "rgba(239,68,68,0.06)" }}
                      >
                        <span className="text-[var(--ai-danger)] mt-0.5">⚠</span>
                        {sig}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[var(--text-muted)]">
                    当前未识别到极端系统性风险信号
                  </p>
                )}
              </GlassCard>
            </motion.div>
          </div>

          {/* ── Right: AI Brief (1/3) ── */}
          <div className="space-y-5">
            <motion.div {...stagger(2)}>
              <BriefCard brief={marketRadar.brief} />
            </motion.div>

            {/* Observation Points */}
            <motion.div {...stagger(3)}>
              <GlassCard className="p-4">
                <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-primary)] mb-3">
                  观察要点
                </h3>
                <div className="space-y-2">
                  {marketRadar.observationPoints.map((pt, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 + i * 0.05 }}
                      className="flex items-start gap-2 text-xs text-[var(--text-secondary)]"
                    >
                      <span className="text-[var(--text-accent)] mt-0.5 text-[10px]">
                        {i + 1}.
                      </span>
                      {pt}
                    </motion.div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>

            {/* One-line Summary */}
            <motion.div {...stagger(4)}>
              <GlassCard className="p-4">
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed italic">
                  &ldquo;{marketRadar.oneLineSummary}&rdquo;
                </p>
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </div>
    </DesktopShell>
  );
}
