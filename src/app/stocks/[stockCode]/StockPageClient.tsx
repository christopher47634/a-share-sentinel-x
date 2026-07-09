"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";

import { motion } from "framer-motion";
import DesktopShell from "@/components/layout/DesktopShell";
import KlineChart from "@/components/stock/KlineChart";
import OrderBook from "@/components/stock/OrderBook";
import TradePanel from "@/components/stock/TradePanel";
import TrendIntelligenceCard from "@/components/stock/TrendIntelligenceCard";
import AiResearchPanel from "@/components/ai/AiResearchPanel";
import DataSourceBadge from "@/components/market/DataSourceBadge";
import { getStockByCode } from "@/mock/stocks";
import { getKlineData } from "@/mock/kline";
import { getSectorById } from "@/mock/sectors";
import { cn, formatPercent } from "@/lib/utils";
import ErrorState from "@/components/common/ErrorState";
import type { MarketStockDetail } from "@/types/market";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Activity,
  Repeat,
  Building2,
  AlertTriangle,
  LineChart,
  ArrowRightLeft,
} from "lucide-react";

export default function StockPageClient() {
  const params = useParams();
  const router = useRouter();
  const stockCode = params.stockCode as string;
  const stock = getStockByCode(stockCode);
  const mockKlineData = useMemo(() => getKlineData(stockCode), [stockCode]);
  const [marketDetail, setMarketDetail] = useState<MarketStockDetail | null>(null);
  const sector = stock ? getSectorById(stock.sectorId) : undefined;
  const [showTrade, setShowTrade] = useState(false);
  const [tradeSide, setTradeSide] = useState<"buy" | "sell">("buy");

  useEffect(() => {
    let cancelled = false;
    setMarketDetail(null);
    fetch(`/api/market/stocks/${stockCode}`)
      .then((response) => response.json())
      .then((data: MarketStockDetail) => {
        if (!cancelled && data?.quote) setMarketDetail(data);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [stockCode]);

  if (!stock) {
    return (
      <DesktopShell>
        <div className="flex items-center justify-center h-screen p-6">
          <ErrorState
            title="未找到该股票"
            description="请检查股票代码是否正确"
            onRetry={() => router.push("/")}
          />
        </div>
      </DesktopShell>
    );
  }

  const displayStock = marketDetail?.quote
    ? {
        ...stock,
        ...marketDetail.quote,
        sectorId: stock.sectorId,
        riskWarning: stock.riskWarning,
      }
    : stock;
  const klineData = marketDetail?.candles?.length ? marketDetail.candles : mockKlineData;
  const trendAnalysis = marketDetail?.analysis;
  const isUp = displayStock.changePercent >= 0;

  // Calculate moving averages from kline data
  const closes = klineData.map((d) => d.close);
  const calcMA = (period: number) => {
    if (closes.length < period) return null;
    const slice = closes.slice(-period);
    return slice.reduce((a, b) => a + b, 0) / period;
  };
  const ma5 = calcMA(5);
  const ma10 = calcMA(10);
  const ma20 = calcMA(20);

  // Stock analysis text based on performance
  const analysisText =
    trendAnalysis?.summary ??
    (displayStock.changePercent > 3
      ? "今日强势上涨，成交活跃，短期趋势偏多"
      : displayStock.changePercent < -2
        ? "今日跌幅较大，注意风险，建议观望"
        : "今日窄幅震荡，成交温和");

  const handleBuy = () => {
    setTradeSide("buy");
    setShowTrade(true);
  };

  const handleSell = () => {
    setTradeSide("sell");
    setShowTrade(true);
  };

  return (
    <DesktopShell>
      <div className="p-4 md:p-6 pb-20 md:pb-5 space-y-4 md:space-y-5 page-enter">
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ArrowLeft size={16} />
          返回
        </motion.button>

        {/* Risk warning banner for high-volatility stocks */}
        {displayStock.riskWarning && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2.5 p-3.5 rounded-xl"
            style={{
              background: "rgba(251,191,36,0.08)",
              border: "1px solid rgba(251,191,36,0.2)",
            }}
          >
            <AlertTriangle
              size={15}
              className="text-yellow-400 mt-0.5 shrink-0"
            />
            <span className="text-xs text-yellow-300/90 leading-relaxed">
              {displayStock.riskWarning}
            </span>
          </motion.div>
        )}

        {/* Stock Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass p-5 rounded-2xl"
        >
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 md:gap-3 mb-1 flex-wrap">
                <h1 className="text-lg md:text-xl font-bold text-[var(--text-primary)]">
                  {displayStock.name}
                </h1>
                <span className="text-xs md:text-sm text-[var(--text-muted)] font-mono-nums">
                  {displayStock.code}
                </span>
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                  style={{
                    background: "rgba(52,211,153,0.1)",
                    color: "#34D399",
                    border: "1px solid rgba(52,211,153,0.2)",
                  }}
                >
                  已收盘
                </span>
                <span className="text-[10px] text-[var(--text-muted)] font-mono-nums">
                  15:00:00
                </span>
                <button
                  onClick={() =>
                    router.push(`/sectors/${displayStock.sectorId}`)
                  }
                  className="px-2 py-0.5 rounded-md text-[10px] text-[var(--accent)] bg-[var(--accent-soft)] border border-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--bg-primary)] transition-colors"
                >
                  {displayStock.sectorId}
                </button>
                {marketDetail && (
                  <DataSourceBadge
                    source={marketDetail.quote.source}
                    label={marketDetail.quote.sourceLabel}
                    updatedAt={marketDetail.quote.updatedAt}
                    fallbackUsed={marketDetail.fallbackUsed}
                  />
                )}
              </div>
              <div className="flex items-baseline gap-2 md:gap-3">
                <span
                  className={cn(
                    "text-2xl md:text-3xl font-bold font-mono-nums",
                    isUp ? "text-up" : "text-down"
                  )}
                >
                  {displayStock.price.toFixed(2)}
                </span>
                <div className={cn("flex items-center gap-1", isUp ? "text-up" : "text-down")}>
                  {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  <span className="text-xs md:text-sm font-semibold font-mono-nums">
                    {formatPercent(displayStock.changePercent)}
                  </span>
                  <span className="text-[11px] md:text-xs font-mono-nums">
                    ({displayStock.changeAmount > 0 ? "+" : ""}
                    {displayStock.changeAmount.toFixed(2)})
                  </span>
                </div>
              </div>
            </div>

            {/* Buy/Sell buttons — glassmorphism */}
            <div className="flex gap-2 shrink-0">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleBuy}
                data-demo-highlight="buy-button"
                className="relative px-5 md:px-6 py-2 md:py-2.5 rounded-xl text-sm font-semibold text-white transition-all btn-press mobile-press overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(52,211,153,0.25) 0%, rgba(52,211,153,0.08) 100%)',
                  border: '1px solid rgba(52,211,153,0.35)',
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 2px 12px rgba(52,211,153,0.15), inset 0 1px 0 rgba(255,255,255,0.06)',
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                }}
              >
                <span className="relative z-10 text-[#34D399] font-bold">买入</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleSell}
                className="relative px-5 md:px-6 py-2 md:py-2.5 rounded-xl text-sm font-semibold text-white transition-all btn-press mobile-press overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(248,113,113,0.25) 0%, rgba(248,113,113,0.08) 100%)',
                  border: '1px solid rgba(248,113,113,0.35)',
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 2px 12px rgba(248,113,113,0.15), inset 0 1px 0 rgba(255,255,255,0.06)',
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                }}
              >
                <span className="relative z-10 text-[#F87171] font-bold">卖出</span>
              </motion.button>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-4 pt-3 border-t border-[var(--border-subtle)]">
            <StatItem label="成交额" value={displayStock.turnover} icon={<BarChart3 size={12} />} />
            <StatItem label="换手率" value={`${displayStock.turnoverRate}%`} icon={<Repeat size={12} />} />
            <StatItem label="市值" value={displayStock.marketCap} icon={<Building2 size={12} />} />
            <StatItem label="PE" value={displayStock.pe.toFixed(1)} icon={<Activity size={12} />} />
            <StatItem label="最高" value={displayStock.high.toFixed(2)} className="text-up" />
            <StatItem label="最低" value={displayStock.low.toFixed(2)} className="text-down" />
            <StatItem label="开盘" value={displayStock.open.toFixed(2)} />
            <StatItem label="昨收" value={displayStock.prevClose.toFixed(2)} />
          </div>
        </motion.div>

        {/* Main content: Chart + OrderBook */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* K-line chart */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="md:col-span-9 glass p-4 rounded-2xl"
          >
            <KlineChart data={klineData} stockCode={stockCode} />
          </motion.div>

          {/* Order book */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
            className="md:col-span-3 glass p-4 rounded-2xl"
          >
            <OrderBook currentPrice={displayStock.price} prevClose={displayStock.prevClose} />
          </motion.div>
        </div>

        {trendAnalysis && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-8">
              <TrendIntelligenceCard analysis={trendAnalysis} />
            </div>
            <div className="md:col-span-4">
              <AiResearchPanel
                stockCode={stockCode}
                quote={marketDetail.quote}
                analysis={trendAnalysis}
              />
            </div>
          </div>
        )}

        {/* Technical Indicators + Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Technical indicators */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="md:col-span-5 glass p-4 rounded-2xl"
          >
            <div className="flex items-center gap-2 mb-3">
              <LineChart size={14} className="text-[var(--accent)]" />
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                技术指标
              </h3>
              <span className="text-[10px] text-[var(--text-muted)]">
                MA均线
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "MA5", value: ma5, color: "#D4A574" },
                { label: "MA10", value: ma10, color: "#60A5FA" },
                { label: "MA20", value: ma20, color: "#A78BFA" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="p-2.5 rounded-lg"
                  style={{ background: "rgba(255,255,255,0.02)" }}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <div
                      className="w-2 h-0.5 rounded-full"
                      style={{ background: item.color }}
                    />
                    <span className="text-[10px] text-[var(--text-muted)]">
                      {item.label}
                    </span>
                  </div>
                  <span
                    className="text-sm font-semibold font-mono-nums"
                    style={{ color: item.color }}
                  >
                    {item.value !== null ? item.value.toFixed(2) : "—"}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Analysis + Capital flow */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.4 }}
            className="md:col-span-7 glass p-4 rounded-2xl"
          >
            <div className="flex items-center gap-2 mb-3">
              <ArrowRightLeft size={14} className="text-[var(--accent)]" />
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                盘面分析
              </h3>
            </div>
            <div className="space-y-3">
              {/* Analysis text */}
              <div className="p-3 rounded-lg" style={{ background: "rgba(255,255,255,0.02)" }}>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      background:
                        displayStock.changePercent > 0
                          ? "var(--up)"
                          : displayStock.changePercent < 0
                            ? "var(--down)"
                            : "var(--accent)",
                    }}
                  />
                  <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
                    个股分析
                  </span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {analysisText}
                </p>
              </div>

              {/* Capital flow */}
              {sector && (
                <div className="p-3 rounded-lg" style={{ background: "rgba(255,255,255,0.02)" }}>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        background: sector.capitalInflow.startsWith("+")
                          ? "var(--up)"
                          : "var(--down)",
                      }}
                    />
                    <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
                      资金流向
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--text-secondary)]">
                      所属板块 {sector.name} 当日资金流向
                    </span>
                    <span
                      className={cn(
                        "text-xs font-semibold font-mono-nums",
                        sector.capitalInflow.startsWith("+")
                          ? "text-up"
                          : "text-down"
                      )}
                    >
                      {sector.capitalInflow}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-[var(--text-muted)]">
                      板块涨跌幅
                    </span>
                    <span
                      className={cn(
                        "text-xs font-semibold font-mono-nums",
                        sector.changePercent >= 0 ? "text-up" : "text-down"
                      )}
                    >
                      {formatPercent(sector.changePercent)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Trade Panel Overlay */}
      {showTrade && (
        <TradePanel
          stock={displayStock}
          side={tradeSide}
          onClose={() => setShowTrade(false)}
        />
      )}
    </DesktopShell>
  );
}

function StatItem({
  label,
  value,
  icon,
  className,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
        {icon}
        {label}
      </span>
      <span
        className={cn(
          "text-xs font-semibold text-[var(--text-primary)] font-mono-nums",
          className
        )}
      >
        {value}
      </span>
    </div>
  );
}
