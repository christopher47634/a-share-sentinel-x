"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { KlineBar } from "@/mock/kline";
import ChartTypeSwitcher, { ChartType } from "./ChartTypeSwitcher";
import type { MarketStockDetail, MarketTimeframe } from "@/types/market";

type TimeFrame = "intraday" | MarketTimeframe;

const TABS: { key: TimeFrame; label: string }[] = [
  { key: "intraday", label: "\u5206\u65f6" },
  { key: "minute", label: "1\u5206K" },
  { key: "day", label: "\u65e5K" },
  { key: "week", label: "\u5468K" },
  { key: "month", label: "\u6708K" },
];

const TIMEFRAME_COPY: Record<TimeFrame, string> = {
  intraday: "\u76d8\u4e2d\u5206\u65f6",
  minute: "\u4eca\u65e51\u5206\u949fK",
  day: "\u8fd1\u4e09\u5e74\u65e5\u7ebf",
  week: "\u8fd1\u4e09\u5e74\u5468\u7ebf",
  month: "\u8fd1\u4e09\u5e74\u6708\u7ebf",
};

function formatIntradayTime(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  const hour = `${date.getHours()}`.padStart(2, "0");
  const minute = `${date.getMinutes()}`.padStart(2, "0");
  return `${hour}:${minute}`;
}

function getTimeFromChartTick(time: unknown): number | null {
  if (typeof time === "number") return time;
  if (typeof time === "string") {
    const parsed = Date.parse(time);
    return Number.isFinite(parsed) ? Math.floor(parsed / 1000) : null;
  }
  if (time && typeof time === "object") {
    const value = time as { year?: number; month?: number; day?: number };
    if (value.year && value.month && value.day) {
      return Math.floor(new Date(value.year, value.month - 1, value.day).getTime() / 1000);
    }
  }
  return null;
}

function shouldShowIntradayAxisTick(timestamp: number): boolean {
  const date = new Date(timestamp * 1000);
  const hour = date.getHours();
  const minute = date.getMinutes();
  return minute === 0 || (minute === 30 && hour >= 9 && hour <= 11);
}

function formatDateLabel(timestamp: number): string {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(timestamp * 1000));
}

function buildRangeLabel(klineData: KlineBar[], timeframe: TimeFrame): string {
  if (klineData.length === 0) {
    return `${TIMEFRAME_COPY[timeframe]} · \u6682\u65e0\u6570\u636e`;
  }
  const first = klineData[0];
  const last = klineData[klineData.length - 1];
  if (timeframe === "minute") {
    return `${TIMEFRAME_COPY[timeframe]} · ${formatDateLabel(first.time)} ${formatIntradayTime(first.time)} — ${formatIntradayTime(last.time)} · ${klineData.length} \u6839`;
  }
  return `${TIMEFRAME_COPY[timeframe]} · ${formatDateLabel(first.time)} — ${formatDateLabel(last.time)} · ${klineData.length} \u6839`;
}

function generateSVGPath(data: KlineBar[]): string {
  if (data.length === 0) return "";
  const width = 800;
  const height = 320;
  const padding = 20;

  const closes = data.map((d) => d.close);
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const range = max - min || 1;

  const points = data.map((d, i) => {
    const x =
      data.length === 1
        ? width / 2
        : (i / (data.length - 1)) * (width - padding * 2) + padding;
    const y = height - padding - ((d.close - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  });

  return `M${points.join(" L")}`;
}

interface KlineChartProps {
  data: KlineBar[];
  stockCode: string;
}

export default function KlineChart({ data, stockCode }: KlineChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const priceSeriesRef = useRef<any>(null);
  const volumeSeriesRef = useRef<any>(null);
  const modulesRef = useRef<any>(null);
  const requestRef = useRef(0);

  const [activeTab, setActiveTab] = useState<TimeFrame>("day");
  const [chartData, setChartData] = useState<KlineBar[]>(data);
  const [rangeLabel, setRangeLabel] = useState(() => buildRangeLabel(data, "day"));
  const [periodLoading, setPeriodLoading] = useState(false);
  const [periodFallback, setPeriodFallback] = useState(false);
  const [periodError, setPeriodError] = useState("");
  const [chartType, setChartType] = useState<ChartType>("candlestick");
  const [showVolume, setShowVolume] = useState(true);
  const [loaded, setLoaded] = useState(false);

  const isIntraday = activeTab === "intraday";
  const usesMinuteAxis = activeTab === "intraday" || activeTab === "minute";
  const disabledChartTypes: ChartType[] = isIntraday ? ["candlestick", "bar"] : [];
  const hourMarkers = useMemo(() => {
    if (!usesMinuteAxis || chartData.length === 0) return [];

    const markerMap = new Map<string, { label: string; left: number }>();
    const lastIndex = Math.max(chartData.length - 1, 1);

    chartData.forEach((bar, index) => {
      const date = new Date(bar.time * 1000);
      const hour = date.getHours();
      const minute = date.getMinutes();
      const isFirst = index === 0;
      const isLast = index === chartData.length - 1;
      const isMorningHour = minute === 30 && hour >= 9 && hour <= 11;
      const isAfternoonHour = minute === 0 && hour >= 13 && hour <= 15;
      const shouldShow = isFirst || isLast || isMorningHour || isAfternoonHour;
      if (!shouldShow) return;

      const label = formatIntradayTime(bar.time);
      if (markerMap.has(label)) return;

      markerMap.set(label, {
        label,
        left: Math.min(96, Math.max(4, (index / lastIndex) * 100)),
      });
    });

    return [...markerMap.values()];
  }, [chartData, usesMinuteAxis]);

  useEffect(() => {
    requestRef.current += 1;
    setActiveTab("day");
    setChartType("candlestick");
    setChartData(data);
    setRangeLabel(buildRangeLabel(data, "day"));
    setPeriodFallback(false);
    setPeriodError("");
    setPeriodLoading(false);
  }, [stockCode, data]);

  const fillVisibleRange = useCallback((chart: any, klineData: KlineBar[]) => {
    if (!chart || klineData.length === 0) return;

    const width = containerRef.current?.clientWidth ?? 0;
    const barCount = Math.max(klineData.length, 1);
    const barSpacing = width > 0 ? Math.max(2.2, Math.min(16, width / barCount)) : 6;

    chart.timeScale().applyOptions({
      barSpacing,
      minBarSpacing: 1,
      rightOffset: 0,
      fixLeftEdge: true,
      fixRightEdge: true,
      lockVisibleTimeRangeOnResize: true,
    });

    chart.timeScale().setVisibleLogicalRange({
      from: -0.5,
      to: Math.max(barCount - 0.5, 0.5),
    });
  }, []);

  const createPriceSeries = useCallback(
    (chart: any, lc: any, klineData: KlineBar[]) => {
      let series: any;
      switch (chartType) {
        case "candlestick":
          series = chart.addSeries(lc.CandlestickSeries, {
            upColor: "#34D399",
            downColor: "#F87171",
            borderDownColor: "#F87171",
            borderUpColor: "#34D399",
            wickDownColor: "#F87171",
            wickUpColor: "#34D399",
          });
          series.setData(
            klineData.map((d) => ({
              time: d.time as any,
              open: d.open,
              high: d.high,
              low: d.low,
              close: d.close,
            }))
          );
          break;
        case "area":
          series = chart.addSeries(lc.AreaSeries, {
            lineColor: "#D4A574",
            topColor: "rgba(212,165,116,0.28)",
            bottomColor: "rgba(212,165,116,0.0)",
            lineWidth: 2,
          });
          series.setData(klineData.map((d) => ({ time: d.time as any, value: d.close })));
          break;
        case "line":
          series = chart.addSeries(lc.LineSeries, {
            color: "#D4A574",
            lineWidth: 2,
          });
          series.setData(klineData.map((d) => ({ time: d.time as any, value: d.close })));
          break;
        case "bar":
          series = chart.addSeries(lc.BarSeries, {
            upColor: "#34D399",
            downColor: "#F87171",
          });
          series.setData(
            klineData.map((d) => ({
              time: d.time as any,
              open: d.open,
              high: d.high,
              low: d.low,
              close: d.close,
            }))
          );
          break;
      }
      return series;
    },
    [chartType]
  );

  const createVolumeSeries = useCallback((chart: any, lc: any, klineData: KlineBar[]) => {
    const series = chart.addSeries(lc.HistogramSeries, {
      color: "#26a69a",
      priceFormat: { type: "volume" },
      priceScaleId: "volume",
    });
    chart.priceScale("volume").applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });
    series.setData(
      klineData.map((d) => ({
        time: d.time as any,
        value: d.volume,
        color: d.close >= d.open ? "rgba(52,211,153,0.35)" : "rgba(248,113,113,0.35)",
      }))
    );
    return series;
  }, []);

  useEffect(() => {
    if (!containerRef.current || chartData.length === 0) return;

    let chart: any = null;
    let resizeObserver: ResizeObserver | null = null;
    setLoaded(false);
    chartRef.current = null;
    priceSeriesRef.current = null;
    volumeSeriesRef.current = null;

    const initChart = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 100));

        if (!containerRef.current || containerRef.current.clientWidth === 0) {
          setTimeout(() => initChart(), 200);
          return;
        }

        const lc = await import("lightweight-charts");
        if (!containerRef.current) return;

        containerRef.current.innerHTML = "";

        chart = lc.createChart(containerRef.current, {
          width: containerRef.current.clientWidth,
          height: 320,
          layout: {
            background: { type: lc.ColorType.Solid, color: "transparent" },
            textColor: "#94A3B8",
            fontSize: 11,
          },
          grid: {
            vertLines: { color: "rgba(255, 255, 255, 0.04)" },
            horzLines: { color: "rgba(255, 255, 255, 0.04)" },
          },
          crosshair: {
            mode: lc.CrosshairMode.Normal,
            vertLine: {
              color: "rgba(212, 165, 116, 0.4)",
              labelBackgroundColor: "#D4A574",
            },
            horzLine: {
              color: "rgba(212, 165, 116, 0.4)",
              labelBackgroundColor: "#D4A574",
            },
          },
          rightPriceScale: {
            borderColor: "rgba(255, 255, 255, 0.06)",
          },
          timeScale: {
            borderColor: "rgba(255, 255, 255, 0.06)",
            timeVisible: usesMinuteAxis,
            secondsVisible: false,
            rightOffset: 0,
            fixLeftEdge: true,
            fixRightEdge: true,
            lockVisibleTimeRangeOnResize: true,
            tickMarkFormatter: usesMinuteAxis
              ? (time: unknown) => {
                  const timestamp = getTimeFromChartTick(time);
                  if (!timestamp || !shouldShowIntradayAxisTick(timestamp)) return "";
                  return formatIntradayTime(timestamp);
                }
              : undefined,
          },
        });

        chartRef.current = chart;
        modulesRef.current = lc;

        priceSeriesRef.current = createPriceSeries(chart, lc, chartData);
        if (showVolume) {
          volumeSeriesRef.current = createVolumeSeries(chart, lc, chartData);
        }

        fillVisibleRange(chart, chartData);
        setTimeout(() => setLoaded(true), 100);

        resizeObserver = new ResizeObserver((entries) => {
          if (entries[0] && chart) {
            chart.applyOptions({ width: entries[0].contentRect.width });
            requestAnimationFrame(() => fillVisibleRange(chart, chartData));
          }
        });
        resizeObserver.observe(containerRef.current);
      } catch (err) {
        console.error("Lightweight Charts init failed:", err);
        if (containerRef.current) {
          const path = generateSVGPath(chartData);
          containerRef.current.innerHTML = `
            <svg width="100%" height="320" viewBox="0 0 800 320" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="rgba(52,211,153,0.3)"/>
                  <stop offset="100%" stop-color="rgba(52,211,153,0)"/>
                </linearGradient>
              </defs>
              <path d="${path}" fill="none" stroke="#34D399" stroke-width="2"/>
              <path d="${path} L800,320 L0,320 Z" fill="url(#chartGrad)"/>
            </svg>
          `;
        }
        setLoaded(true);
      }
    };

    initChart();

    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      if (chart) {
        chart.remove();
        chart = null;
      }
      chartRef.current = null;
      priceSeriesRef.current = null;
      volumeSeriesRef.current = null;
    };
  }, [chartData, activeTab, createPriceSeries, createVolumeSeries, fillVisibleRange, showVolume, usesMinuteAxis]);

  useEffect(() => {
    const chart = chartRef.current;
    const lc = modulesRef.current;
    if (!chart || !lc || !loaded) return;

    if (priceSeriesRef.current) {
      try {
        chart.removeSeries(priceSeriesRef.current);
      } catch {
        /* series may already be gone */
      }
      priceSeriesRef.current = null;
    }

    priceSeriesRef.current = createPriceSeries(chart, lc, chartData);
    fillVisibleRange(chart, chartData);
  }, [chartType, loaded, chartData, createPriceSeries, fillVisibleRange]);

  useEffect(() => {
    const chart = chartRef.current;
    const lc = modulesRef.current;
    if (!chart || !lc || !loaded) return;

    if (showVolume) {
      if (!volumeSeriesRef.current) {
        volumeSeriesRef.current = createVolumeSeries(chart, lc, chartData);
      }
    } else if (volumeSeriesRef.current) {
      try {
        chart.removeSeries(volumeSeriesRef.current);
      } catch {
        /* already removed */
      }
      volumeSeriesRef.current = null;
    }
  }, [showVolume, loaded, chartData, createVolumeSeries]);

  async function handleTabSwitch(tab: TimeFrame) {
    if (tab === activeTab) return;

    if (tab === "intraday") {
      setChartType("area");
    }
    if (tab === "minute") {
      setChartType("candlestick");
    }
    if (activeTab === "intraday" && tab !== "intraday" && tab !== "minute") {
      setChartType("candlestick");
    }

    setActiveTab(tab);

    if (tab === "day") {
      requestRef.current += 1;
      setChartData(data);
      setRangeLabel(buildRangeLabel(data, tab));
      setPeriodFallback(false);
      setPeriodError("");
      setPeriodLoading(false);
      return;
    }

    const requestId = requestRef.current + 1;
    requestRef.current = requestId;
    setPeriodLoading(true);
    setPeriodError("");

    try {
      const queryTimeframe: MarketTimeframe = tab === "intraday" ? "minute" : tab;
      const response = await fetch(`/api/market/stocks/${stockCode}?timeframe=${queryTimeframe}`);
      if (!response.ok) throw new Error(`timeframe_fetch_failed_${response.status}`);
      const detail = (await response.json()) as MarketStockDetail;
      if (requestRef.current !== requestId) return;

      if (!detail.candles?.length) throw new Error("empty_candles");
      setChartData(detail.candles as KlineBar[]);
      setRangeLabel(buildRangeLabel(detail.candles as KlineBar[], tab));
      setPeriodFallback(detail.fallbackUsed);
    } catch {
      if (requestRef.current !== requestId) return;
      setChartData(data);
      setRangeLabel(buildRangeLabel(data, "day"));
      setPeriodFallback(true);
      setPeriodError("\u5468\u671f\u6570\u636e\u8bfb\u53d6\u5931\u8d25\uff0c\u5df2\u4e34\u65f6\u56de\u5230\u65e5\u7ebf\u3002");
    } finally {
      if (requestRef.current === requestId) setPeriodLoading(false);
    }
  }

  return (
    <div className="w-full">
      <div className="mb-3 flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
        <div data-demo-highlight="chart-type-switcher" className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1">
            {TABS.map((tab) => (
              <motion.button
                key={tab.key}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleTabSwitch(tab.key)}
                className={cn(
                  "relative overflow-hidden px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-200",
                  activeTab === tab.key
                    ? "text-[var(--accent)] border border-[var(--accent)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--surface-1)]"
                )}
              >
                {activeTab === tab.key && (
                  <motion.span
                    layoutId="timeframe-active-pill"
                    className="absolute inset-0 rounded-lg bg-[var(--accent-soft)]"
                    transition={{ type: "spring", stiffness: 420, damping: 34, mass: 0.55 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </motion.button>
            ))}
          </div>

          <div className="w-px h-4 bg-[rgba(255,255,255,0.08)]" />

          <ChartTypeSwitcher
            value={chartType}
            onChange={setChartType}
            disabled={disabledChartTypes}
          />

          <div className="w-px h-4 bg-[rgba(255,255,255,0.08)]" />

          <button
            onClick={() => setShowVolume((v) => !v)}
            className={cn(
              "px-2 py-1 rounded-md text-[10px] font-medium transition-all duration-200 border",
              showVolume
                ? "bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent)]"
                : "text-[var(--text-muted)] border-[rgba(255,255,255,0.06)] hover:text-[var(--text-secondary)] hover:bg-[var(--surface-1)]"
            )}
            title={showVolume ? "\u9690\u85cf\u6210\u4ea4\u91cf" : "\u663e\u793a\u6210\u4ea4\u91cf"}
          >
            {showVolume ? "\u6210\u4ea4\u91cf \u25cf" : "\u6210\u4ea4\u91cf"}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[10px] text-[var(--text-muted)]">
          <span className="rounded-full border border-white/10 bg-white/[0.035] px-2 py-1">
            {periodLoading ? "\u8bfb\u53d6\u771f\u5b9e\u5468\u671f\u6570\u636e\u2026" : rangeLabel}
          </span>
          {periodFallback && (
            <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-2 py-1 text-amber-200/80">
              \u6570\u636e\u6e90\u515c\u5e95
            </span>
          )}
          {periodError && <span className="text-amber-200/80">{periodError}</span>}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.995 }}
        animate={{
          opacity: loaded && !periodLoading ? 1 : 0.36,
          y: loaded && !periodLoading ? 0 : 4,
          scale: loaded && !periodLoading ? 1 : 0.997,
        }}
        transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full rounded-xl overflow-hidden"
        style={{
          background: "rgba(2, 6, 18, 0.5)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {(!loaded || periodLoading) && (
          <motion.div
            className="absolute inset-0 z-10"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(212,165,116,0.05), transparent)",
              backgroundSize: "200% 100%",
              animation: "shimmer 2s ease-in-out infinite",
            }}
          />
        )}

        {chartData.length === 0 && (
          <div className="absolute inset-0 z-20 flex items-center justify-center text-xs text-[var(--text-muted)]">
            \u6682\u65e0K\u7ebf\u6570\u636e
          </div>
        )}
        <div ref={containerRef} className="w-full" style={{ height: 320 }} />
        {usesMinuteAxis && hourMarkers.length > 1 && (
          <div className="pointer-events-none absolute inset-0 z-20">
            {hourMarkers.map((marker, index) => (
              <motion.div
                key={`${marker.label}-${index}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.04 + index * 0.025,
                  duration: 0.34,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="absolute top-0 bottom-0 flex -translate-x-1/2 flex-col items-center justify-end"
                style={{ left: `${marker.left}%` }}
              >
                <span className="absolute top-0 bottom-7 w-px bg-white/[0.045]" />
                <span className="mb-1 rounded-full border border-white/10 bg-[#050915]/80 px-1.5 py-0.5 text-[9px] font-medium text-[var(--text-muted)] shadow-[0_8px_20px_rgba(0,0,0,0.25)] backdrop-blur-sm">
                  {marker.label}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
