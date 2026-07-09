"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";


import { motion, AnimatePresence } from "framer-motion";
import DesktopShell from "@/components/layout/DesktopShell";
import { getSectorById } from "@/mock/sectors";
import { getStocksBySector } from "@/mock/stocks";
import { getSectorTrend } from "@/mock/kline";
import { cn, formatPercent } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowDownRight,
  Flame,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  ShieldCheck,
  Shield,
} from "lucide-react";
import { sectorIconMap, SectorFallback } from "@/components/icons/SectorIcons";
import SectorHeroArtwork from "@/components/sector/SectorHeroArtwork";
import HeroKpiCard from "@/components/sector/HeroKpiCard";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import { isCanvasVisualsEnabled } from "@/lib/feature-flags";
import { getSectorCanvas } from "@/components/sector-visuals/getSectorCanvas";

const iconMap = sectorIconMap;

/** Canvas 2D background for sector detail hero — measures container dynamically */
function CanvasHeroBackground({
  visualType,
}: {
  visualType: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      setDims({ width: Math.round(rect.width), height: Math.round(rect.height) });
    };
    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if (!isCanvasVisualsEnabled()) return null;
  const CanvasComponent = getSectorCanvas(visualType);
  if (!CanvasComponent) return null;

  const hasSize = dims.width > 0 && dims.height > 0;

  return (
    <div ref={containerRef} className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      {hasSize && (
        <CanvasComponent
          width={dims.width}
          height={dims.height}
          animationsEnabled
        />
      )}
      {/* Dark overlay for text readability */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "rgba(2,6,18,0.3)" }}
      />
    </div>
  );
}

type SortKey = "turnover" | "changePercent" | "name" | "price" | "turnoverRate" | "marketCap";

const SORT_LABELS: Record<SortKey, string> = {
  turnover: "成交额",
  changePercent: "涨幅",
  name: "名称",
  price: "价格",
  turnoverRate: "换手率",
  marketCap: "市值",
};

function parseMarketCap(mc: string): number {
  const num = parseFloat(mc.replace("亿", ""));
  return isNaN(num) ? 0 : num;
}

function parseTurnover(tv: string): number {
  const num = parseFloat(tv.replace("亿", ""));
  return isNaN(num) ? 0 : num;
}

export default function SectorPageClient() {
  const params = useParams();
  const router = useRouter();
  const sectorId = params.sectorId as string;
  const sector = getSectorById(sectorId);
  const [sortKey, setSortKey] = useState<SortKey>("turnover");
  const [sortAsc, setSortAsc] = useState(false);

  const sectorStocks = useMemo(() => {
    const raw = getStocksBySector(sectorId);
    return [...raw].sort((a, b) => {
      let aVal: number;
      let bVal: number;
      switch (sortKey) {
        case "turnover":
          aVal = parseTurnover(a.turnover); bVal = parseTurnover(b.turnover); break;
        case "changePercent":
          aVal = a.changePercent; bVal = b.changePercent; break;
        case "name":
          return sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
        case "price":
          aVal = a.price; bVal = b.price; break;
        case "turnoverRate":
          aVal = a.turnoverRate; bVal = b.turnoverRate; break;
        case "marketCap":
          aVal = parseMarketCap(a.marketCap); bVal = parseMarketCap(b.marketCap); break;
        default:
          aVal = 0; bVal = 0;
      }
      return sortAsc ? aVal - bVal : bVal - aVal;
    });
  }, [sectorId, sortKey, sortAsc]);

  const trendData = getSectorTrend(sectorId);

  if (!sector) {
    return (
      <DesktopShell>
        <div className="flex items-center justify-center h-screen p-6">
          <ErrorState
            title="未找到该板块"
            description="请检查板块地址是否正确"
            onRetry={() => router.push("/")}
          />
        </div>
      </DesktopShell>
    );
  }

  const Icon = iconMap[sector.icon] || SectorFallback;
  const isUp = sector.changePercent >= 0;

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  return (
    <DesktopShell>
      <div className="p-4 md:p-6 pb-20 md:pb-6 space-y-4 md:space-y-6 page-enter">
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ArrowLeft size={16} />
          返回首页
        </motion.button>

        {/* Sector Hero — with SectorVisualBackground (medium intensity, right-side watermark) */}
        <motion.div
          layoutId={`sector-card-${sector.id}`}
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative overflow-hidden rounded-2xl p-6"
          style={{
            background:
              "linear-gradient(145deg, rgba(255,255,255,0.075), rgba(255,255,255,0.025)), rgba(15, 22, 36, 0.72)",
            backdropFilter: "blur(22px) saturate(140%)",
            WebkitBackdropFilter: "blur(22px) saturate(140%)",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.08), 0 24px 80px rgba(0,0,0,0.42)",
          }}
        >
          {/* SectorHeroArtwork — P1-F: wide landscape hero artwork, independent from small card watermarks */}
          <SectorHeroArtwork
            visualType={sector.visualType}
            accentColor={sector.accentColor}
          />

          {/* Canvas 2D animated background — feature-flagged */}
          <CanvasHeroBackground
            visualType={sector.visualType}
          />

          <div className="relative z-10 flex items-start justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ scale: 0, rotate: -15 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                  delay: 0.2,
                }}
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{
                  background: `${sector.accentColor}28`,
                  border: `1px solid ${sector.accentColor}40`,
                }}
              >
                <Icon size={28} style={{ color: sector.accentColor }} />
              </motion.div>
              <div>
                <motion.h1
                  layoutId={`sector-name-${sectorId}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-2xl font-bold text-[var(--text-primary)]"
                >
                  {sector.name}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 }}
                  className="text-sm text-[var(--text-muted)] mt-0.5"
                >
                  {sector.description}
                </motion.p>
              </div>
            </div>

            <div className="text-right">
              {/* Risk level badge */}
              <RiskLevelBadge level={sector.riskLevel} />
              <motion.div
                layoutId={`sector-change-${sectorId}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className={cn(
                  "text-3xl font-bold font-mono-nums",
                  isUp ? "text-up" : "text-down"
                )}
              >
                {formatPercent(sector.changePercent)}
              </motion.div>
              <div className="flex items-center gap-1 mt-1">
                <Flame size={12} className="text-[var(--accent)]" />
                <span className="text-xs text-[var(--accent)] font-mono-nums">
                  热度 #{sector.hotRank}
                </span>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative z-10 flex items-center gap-3 mt-5 pt-4"
          >
            <HeroKpiCard label="成交额" value={sector.turnover} tone="neutral" />
            <HeroKpiCard
              label="资金流入"
              value={sector.capitalInflow}
              tone={sector.capitalInflow.startsWith("+") ? "positive" : "negative"}
            />
            <HeroKpiCard
              label="涨跌家数"
              value={`${sectorStocks.filter(s => s.changePercent >= 0).length}↑ ${sectorStocks.filter(s => s.changePercent < 0).length}↓`}
              tone={sectorStocks.filter(s => s.changePercent >= 0).length > sectorStocks.filter(s => s.changePercent < 0).length ? "positive" : "negative"}
            />
            <HeroKpiCard label="成分股数" value={`${sectorStocks.length}`} tone="neutral" />
          </motion.div>
        </motion.div>

        {/* Sector trend chart */}
        <SectorTrendChart
          data={trendData}
          color={sector.accentColor}
          trend={sector.trend}
          capitalInflow={sector.capitalInflow}
          riskLevel={sector.riskLevel}
        />
        {sectorStocks.length === 0 ? (
          <EmptyState title="暂无成分股数据" description="该板块暂无成分股信息" />
        ) : (
        <>
        {/* Sort controls */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center gap-2"
        >
          <span className="text-xs text-[var(--text-muted)] mr-1">排序：</span>
          {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
            <button
              key={key}
              onClick={() => handleSort(key)}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs transition-all duration-200",
                sortKey === key
                  ? "bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)] bg-[var(--surface-1)]"
              )}
            >
              {SORT_LABELS[key]}
              {sortKey === key &&
                (sortAsc ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
            </button>
          ))}
        </motion.div>

        {/* Stock list with layoutId sorting animation */}
        <div className="glass p-3 md:p-4 rounded-2xl">
          {/* Desktop header */}
          <div className="hidden md:flex items-center gap-3 px-2 py-2 text-[10px] text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-subtle)] mb-1">
            <span className="w-10">序号</span>
            <span className="flex-1">股票</span>
            <span className="w-20 text-right">现价</span>
            <span className="w-20 text-right">涨跌幅</span>
            <span className="w-20 text-right">成交额</span>
            <span className="w-16 text-right">换手率</span>
            <span className="w-20 text-right">市值</span>
          </div>

          <AnimatePresence>
            {sectorStocks.map((stock, i) => {
              const stockIsUp = stock.changePercent >= 0;
              return (
                <motion.div
                  key={stock.code}
                  layoutId={`stock-row-${stock.code}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    layout: { type: "spring", stiffness: 350, damping: 30 },
                    opacity: { duration: 0.2 },
                    delay: i * 0.02,
                  }}
                  onClick={() => router.push(`/stocks/${stock.code}`)}
                  data-demo-highlight={i === 0 ? "first-stock" : undefined}
                  className="flex items-center gap-2 md:gap-3 px-2 py-2.5 rounded-lg hover:bg-[var(--surface-1)] transition-colors cursor-pointer group row-interactive mobile-press"
                >
                  <span
                    className={cn(
                      "w-7 md:w-10 text-xs font-mono-nums shrink-0",
                      i < 3
                        ? "text-[var(--accent)] font-semibold"
                        : "text-[var(--text-muted)]"
                    )}
                  >
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 md:gap-2">
                      <span className="text-sm text-[var(--text-primary)] font-medium group-hover:text-[var(--accent)] transition-colors truncate">
                        {stock.name}
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)] font-mono-nums hidden sm:inline">
                        {stock.code}
                      </span>
                    </div>
                    {/* Mobile: show code below name */}
                    <span className="text-[10px] text-[var(--text-muted)] font-mono-nums sm:hidden">
                      {stock.code}
                    </span>
                  </div>
                  <span className="w-16 md:w-20 text-right text-sm font-semibold text-[var(--text-primary)] font-mono-nums shrink-0">
                    {stock.price.toFixed(2)}
                  </span>
                  <div
                    className={cn(
                      "w-16 md:w-20 text-right flex items-center justify-end gap-0.5 shrink-0",
                      stockIsUp ? "text-up" : "text-down"
                    )}
                  >
                    {stockIsUp ? (
                      <ArrowUpRight size={12} />
                    ) : (
                      <ArrowDownRight size={12} />
                    )}
                    <span className="text-xs font-semibold font-mono-nums">
                      {formatPercent(stock.changePercent)}
                    </span>
                  </div>
                  <span className="hidden md:block w-20 text-right text-xs text-[var(--text-secondary)] font-mono-nums">
                    {stock.turnover}
                  </span>
                  <span className="hidden md:block w-16 text-right text-xs text-[var(--text-secondary)] font-mono-nums">
                    {stock.turnoverRate}%
                  </span>
                  <span className="hidden md:block w-20 text-right text-xs text-[var(--text-secondary)] font-mono-nums">
                    {stock.marketCap}
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
        </>
        )}
      </div>
    </DesktopShell>
  );
}

/* Sector Trend Area Chart using ECharts */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SectorTrendChart({
  data,
  color,
  trend,
  capitalInflow,
  riskLevel,
}: {
  data: { time: number; value: number }[];
  color: string;
  trend: "up" | "down" | "sideways";
  capitalInflow: string;
  riskLevel: "low" | "medium" | "high";
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chartInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    let disposed = false;

    const init = async () => {
      try {
        const echarts = await import("echarts");
        if (disposed || !containerRef.current) return;

        const chart = echarts.init(containerRef.current);
        chartInstanceRef.current = chart;

        const dates = data.map((d) => {
          const date = new Date(d.time * 1000);
          return `${date.getMonth() + 1}/${date.getDate()}`;
        });
        const values = data.map((d) => d.value);

        chart.setOption({
          backgroundColor: "transparent",
          grid: {
            left: "3%",
            right: "3%",
            top: "10%",
            bottom: "5%",
            containLabel: true,
          },
          tooltip: {
            trigger: "axis",
            backgroundColor: "rgba(10, 22, 40, 0.95)",
            borderColor: "rgba(255, 255, 255, 0.12)",
            textStyle: { color: "#E2E8F0", fontSize: 12 },
            extraCssText:
              "backdrop-filter: blur(16px); border-radius: 8px; box-shadow: 0 8px 32px rgba(0,0,0,0.4);",
          },
          xAxis: {
            type: "category",
            data: dates,
            axisLine: { lineStyle: { color: "rgba(255,255,255,0.06)" } },
            axisTick: { show: false },
            axisLabel: { color: "#64748B", fontSize: 10 },
          },
          yAxis: {
            type: "value",
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: { color: "#64748B", fontSize: 10 },
            splitLine: { lineStyle: { color: "rgba(255,255,255,0.04)" } },
          },
          series: [
            {
              type: "line",
              data: values,
              smooth: true,
              showSymbol: false,
              lineStyle: { color, width: 2 },
              areaStyle: {
                color: {
                  type: "linear",
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [
                    { offset: 0, color: `${color}40` },
                    { offset: 1, color: `${color}05` },
                  ],
                },
              },
            },
          ],
        });

        const observer = new ResizeObserver(() => chart.resize());
        observer.observe(containerRef.current);

        return () => observer.disconnect();
      } catch (err) {
        console.error("ECharts init failed:", err);
      }
    };

    init();

    return () => {
      disposed = true;
      if (chartInstanceRef.current) {
        chartInstanceRef.current.dispose();
        chartInstanceRef.current = null;
      }
    };
  }, [data, color]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="glass p-4 rounded-2xl"
    >
      <div className="flex items-baseline gap-2 mb-3">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">
          板块趋势
        </h3>
        <span className="text-[10px] text-[var(--text-muted)]">近60日走势</span>
      </div>
      <div ref={containerRef} className="w-full" style={{ height: 200 }} />

      {/* Trend analysis text */}
      <div className="mt-3 pt-3 border-t border-[var(--border-subtle)] flex items-start gap-2">
        <div className="flex items-center gap-1.5 shrink-0">
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background:
                trend === "up"
                  ? "var(--up)"
                  : trend === "down"
                    ? "var(--down)"
                    : "var(--accent)",
            }}
          />
          <span className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider">
            板块分析
          </span>
        </div>
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          {trend === "up" &&
            "近一月板块整体呈上行趋势，资金持续流入，关注龙头股表现"}
          {trend === "down" &&
            "近期板块承压，资金净流出，注意控制仓位"}
          {trend === "sideways" &&
            "板块维持震荡格局，量能萎缩，等待方向选择"}
          {riskLevel === "high" && "。高风险板块，注意仓位管理。"}
          {riskLevel === "medium" && "。中等风险，适度参与。"}
          {riskLevel === "low" && "。风险可控。"}
          {capitalInflow.startsWith("+") ? " 当日主力资金净流入。" : " 当日主力资金净流出。"}
        </p>
      </div>
    </motion.div>
  );
}

function RiskLevelBadge({ level }: { level: "low" | "medium" | "high" }) {
  const config = {
    low: {
      label: "低风险",
      color: "#34D399",
      bg: "rgba(52,211,153,0.12)",
      border: "rgba(52,211,153,0.25)",
      icon: <ShieldCheck size={12} />,
    },
    medium: {
      label: "中风险",
      color: "#FBBF24",
      bg: "rgba(251,191,36,0.12)",
      border: "rgba(251,191,36,0.25)",
      icon: <Shield size={12} />,
    },
    high: {
      label: "高风险",
      color: "#EF4444",
      bg: "rgba(239,68,68,0.12)",
      border: "rgba(239,68,68,0.25)",
      icon: <ShieldAlert size={12} />,
    },
  };
  const c = config[level];
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium mb-2"
      style={{
        color: c.color,
        background: c.bg,
        border: `1px solid ${c.border}`,
      }}
    >
      {c.icon}
      {c.label}
    </span>
  );
}
