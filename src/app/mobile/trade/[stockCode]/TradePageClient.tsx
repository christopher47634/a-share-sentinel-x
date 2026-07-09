"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import MobileShell from "@/components/layout/MobileShell";
import AiResearchPanel from "@/components/ai/AiResearchPanel";
import DataSourceBadge from "@/components/market/DataSourceBadge";
import { getStockByCode } from "@/mock/stocks";
import { getKlineData } from "@/mock/kline";
import { type MockOrder } from "@/mock/orders";
import { getAccount, initializeAccount } from "@/lib/account-storage";
import {
  executeBuy,
  executeSell,
  getAvailableSellQuantity,
  getMaxBuyQuantity,
} from "@/lib/trade-engine";
import { cn, formatPercent } from "@/lib/utils";
import ErrorState from "@/components/common/ErrorState";
import MiniTrendChart from "@/components/stock/MiniTrendChart";
import TrendIntelligenceCard from "@/components/stock/TrendIntelligenceCard";
import type { MarketStockDetail } from "@/types/market";
import {
  ArrowLeft,
  Minus,
  Plus,
  Check,
  Loader2,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

type TradeSide = "buy" | "sell";
type OrderStep = "input" | "submitted" | "matching" | "filled";

export default function TradePageClient() {
  const params = useParams();
  const router = useRouter();
  const stockCode = params.stockCode as string;
  const stock = getStockByCode(stockCode);
  const mockKlineData = useMemo(() => getKlineData(stockCode), [stockCode]);

  const [side, setSide] = useState<TradeSide>("buy");
  const [price, setPrice] = useState(stock?.price.toFixed(2) || "0.00");
  const [priceEdited, setPriceEdited] = useState(false);
  const [quantity, setQuantity] = useState(100);
  const [step, setStep] = useState<OrderStep>("input");
  const [error, setError] = useState<string | null>(null);
  const [availableCash, setAvailableCash] = useState(0);
  const [availableSellQty, setAvailableSellQty] = useState(0);
  const [marketDetail, setMarketDetail] = useState<MarketStockDetail | null>(null);
  const orderRef = useRef<MockOrder | null>(null);

  useEffect(() => {
    initializeAccount();
    setAvailableCash(getAccount().availableCash);
    setAvailableSellQty(getAvailableSellQuantity(stockCode));
  }, [stockCode]);

  useEffect(() => {
    let cancelled = false;
    setMarketDetail(null);
    setPriceEdited(false);
    fetch("/api/market/stocks/" + stockCode)
      .then((response) => response.json())
      .then((data: MarketStockDetail) => {
        if (!cancelled && data?.quote) setMarketDetail(data);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [stockCode]);

  useEffect(() => {
    if (marketDetail?.quote && !priceEdited && step === "input") {
      setPrice(marketDetail.quote.price.toFixed(2));
    }
  }, [marketDetail?.quote, priceEdited, step]);

  if (!stock) {
    return (
      <MobileShell hideTabs>
        <div className="flex items-center justify-center h-screen p-4">
          <ErrorState
            title="未找到该股票"
            description="请检查股票代码是否正确"
            onRetry={() => router.push("/mobile")}
          />
        </div>
      </MobileShell>
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
  const priceNum = parseFloat(price) || 0;
  const totalAmount = priceNum * quantity;
  const maxBuy = priceNum > 0 ? getMaxBuyQuantity(priceNum) : 0;
  const canSubmit =
    priceNum > 0 &&
    quantity > 0 &&
    quantity % 100 === 0 &&
    (side === "buy" ? quantity <= maxBuy : quantity <= availableSellQty);

  const handleSubmit = () => {
    setError(null);
    const result =
      side === "buy"
        ? executeBuy({
            stockCode: displayStock.code,
            stockName: displayStock.name,
            sectorId: displayStock.sectorId,
            price: priceNum,
            quantity,
          })
        : executeSell({
            stockCode: displayStock.code,
            stockName: displayStock.name,
            price: priceNum,
            quantity,
          });

    if (!result.success) {
      setError(result.error ?? "模拟交易失败");
      return;
    }

    orderRef.current = result.order ?? null;
    setAvailableCash(result.updatedAccount?.availableCash ?? getAccount().availableCash);
    setAvailableSellQty(getAvailableSellQuantity(displayStock.code));
    setStep("submitted");
    setTimeout(() => {
      setStep("matching");
    }, 1200);
    setTimeout(() => {
      setStep("filled");
    }, 3000);
  };

  return (
    <MobileShell hideTabs>
      <div className="px-4 pt-2" style={{ paddingBottom: "calc(16px + env(safe-area-inset-bottom, 0px))" }}>
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-[var(--text-muted)] mb-4"
        >
          <ArrowLeft size={16} />
          返回
        </motion.button>

        {/* Stock header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl mb-4"
          style={{
            background: "linear-gradient(145deg, rgba(255,255,255,0.075), rgba(255,255,255,0.025)), rgba(15, 22, 36, 0.72)",
            backdropFilter: "blur(22px) saturate(140%)",
            WebkitBackdropFilter: "blur(22px) saturate(140%)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="min-w-0">
              <span className="block truncate text-base font-semibold text-[var(--text-primary)]">
                {displayStock.name}
              </span>
              <span className="text-xs text-[var(--text-muted)] font-mono-nums">
                {displayStock.code}
              </span>
            </div>
            <div className={cn("flex shrink-0 items-center gap-1", isUp ? "text-up" : "text-down")}>
              {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span className="text-xs font-semibold font-mono-nums">
                {formatPercent(displayStock.changePercent)}
              </span>
            </div>
          </div>
          <div className="flex items-end justify-between gap-3">
            <span className={cn("text-3xl font-bold font-mono-nums", isUp ? "text-up" : "text-down")}>
              {displayStock.price.toFixed(2)}
            </span>
            <div className="text-right text-[10px] leading-4 text-[var(--text-muted)]">
              <div>高 {displayStock.high?.toFixed?.(2) ?? "—"}</div>
              <div>低 {displayStock.low?.toFixed?.(2) ?? "—"}</div>
            </div>
          </div>
          {marketDetail && (
            <div className="mt-3">
              <DataSourceBadge
                source={marketDetail.quote.source}
                label={marketDetail.quote.sourceLabel}
                updatedAt={marketDetail.quote.updatedAt}
                fallbackUsed={marketDetail.fallbackUsed}
              />
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-4"
        >
          <MiniTrendChart data={klineData} positive={isUp} />
        </motion.div>

        {trendAnalysis && (
          <div className="mb-4">
            <TrendIntelligenceCard analysis={trendAnalysis} />
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === "input" ? (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              {/* Buy/Sell tabs */}
              <div className="flex gap-2">
                <button
                  onClick={() => setSide("buy")}
                  className={cn(
                    "flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-200",
                    side === "buy"
                       ? "text-[var(--bg-primary)]"
                       : "border"
                  )}
                   style={
                     side === "buy"
                       ? { background: "#2AB882", boxShadow: "0 0 16px rgba(42,184,130,0.2)" }
                       : { background: "rgba(42,184,130,0.08)", color: "#2AB882", borderColor: "rgba(42,184,130,0.3)" }
                   }
                 >
                  买入
                </button>
                <button
                  onClick={() => setSide("sell")}
                  className={cn(
                    "flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-200",
                     side === "sell"
                       ? "text-white"
                       : "border"
                   )}
                    style={
                      side === "sell"
                        ? { background: "#D46A5E", boxShadow: "0 0 16px rgba(212,106,94,0.2)" }
                        : { background: "rgba(212,106,94,0.08)", color: "#D46A5E", borderColor: "rgba(212,106,94,0.3)" }
                    }
                 >
                  卖出
                </button>
              </div>

              {/* Glass form area */}
              <div
                className="p-4 rounded-2xl space-y-4"
                style={{
                  background: "linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02)), rgba(15,22,36,0.6)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                {/* Price input */}
                <div>
                  <label className="text-xs text-[var(--text-muted)] mb-1.5 block">委托价格 (元)</label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setPriceEdited(true);
                        setPrice((parseFloat(price) - 0.01).toFixed(2));
                      }}
                      className="w-11 h-11 rounded-xl flex items-center justify-center bg-[var(--surface-2)] text-[var(--text-secondary)] active:bg-[var(--surface-3)]"
                    >
                      <Minus size={16} />
                    </button>
                    <input
                      type="text"
                      value={price}
                      onChange={(e) => {
                        setPriceEdited(true);
                        setPrice(e.target.value);
                      }}
                      className="flex-1 h-11 px-3 rounded-xl bg-[var(--surface-1)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-center font-mono-nums text-base focus:outline-none focus:border-[var(--accent)]"
                    />
                    <button
                      onClick={() => {
                        setPriceEdited(true);
                        setPrice((parseFloat(price) + 0.01).toFixed(2));
                      }}
                      className="w-11 h-11 rounded-xl flex items-center justify-center bg-[var(--surface-2)] text-[var(--text-secondary)] active:bg-[var(--surface-3)]"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                {/* Quantity input */}
                <div>
                  <label className="text-xs text-[var(--text-muted)] mb-1.5 block">委托数量 (股)</label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQuantity(Math.max(100, quantity - 100))}
                      className="w-11 h-11 rounded-xl flex items-center justify-center bg-[var(--surface-2)] text-[var(--text-secondary)] active:bg-[var(--surface-3)]"
                    >
                      <Minus size={16} />
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => {
                        const v = parseInt(e.target.value) || 0;
                        setQuantity(Math.floor(v / 100) * 100);
                      }}
                      className="flex-1 h-11 px-3 rounded-xl bg-[var(--surface-1)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-center font-mono-nums text-base focus:outline-none focus:border-[var(--accent)]"
                      step={100}
                    />
                    <button
                      onClick={() => setQuantity(quantity + 100)}
                      className="w-11 h-11 rounded-xl flex items-center justify-center bg-[var(--surface-2)] text-[var(--text-secondary)] active:bg-[var(--surface-3)]"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                {/* Quick buttons */}
                <div className="flex gap-2">
                  {["1/4", "1/2", "3/4", "全仓"].map((label, i) => {
                    const ratios = [0.25, 0.5, 0.75, 1];
                    const qty =
                      side === "buy"
                        ? Math.floor((maxBuy * ratios[i]) / 100) * 100
                        : Math.floor((availableSellQty * ratios[i]) / 100) * 100;
                    return (
                      <button
                        key={label}
                        onClick={() => setQuantity(qty)}
                        className="flex-1 py-2 rounded-xl text-xs text-[var(--text-muted)] bg-[var(--surface-1)] active:bg-[var(--surface-2)]"
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Info cards */}
              <div className="grid grid-cols-3 gap-2">
                <InfoCard label="交易金额" value={`¥${totalAmount.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
                <InfoCard label="可用资金" value={`¥${availableCash.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
                <InfoCard
                  label={side === "buy" ? "最大可买" : "最大可卖"}
                  value={side === "buy" ? `${maxBuy.toLocaleString()}股` : `${availableSellQty.toLocaleString()}股`}
                  valueClass="text-[var(--accent)]"
                />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-[rgba(239,68,68,0.28)] bg-[rgba(239,68,68,0.08)] px-3 py-2 text-xs leading-5 text-red-200"
                >
                  {error}
                </motion.div>
              )}

              {/* Submit button */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSubmit}
                disabled={!canSubmit}
                className={cn(
                  "w-full py-4 rounded-2xl text-base font-semibold transition-all",
                   side === "buy" ? "text-[var(--bg-primary)]" : "text-white",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
                style={{
                   background: side === "buy" ? "#2AB882" : "#D46A5E",
                   boxShadow:
                     side === "buy"
                       ? "0 0 24px rgba(42,184,130,0.25)"
                       : "0 0 24px rgba(212,106,94,0.25)",
                }}
              >
                {side === "buy" ? "确认买入" : "确认卖出"}
              </motion.button>

              {trendAnalysis && marketDetail?.quote && (
                <AiResearchPanel
                  stockCode={stockCode}
                  quote={marketDetail.quote}
                  analysis={trendAnalysis}
                />
              )}
            </motion.div>
          ) : (
            /* Order status steps */
            <motion.div
              key="status"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Summary */}
              <div
                className="p-5 rounded-2xl text-center"
                style={{
                  background: "linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02)), rgba(15,22,36,0.6)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div className="text-sm text-[var(--text-muted)] mb-1">
                  {side === "buy" ? "买入" : "卖出"} {displayStock.name}
                </div>
                <div className="text-xl font-bold text-[var(--text-primary)] font-mono-nums">
                  {priceNum.toFixed(2)} × {quantity}股
                </div>
                <div className="text-xs text-[var(--text-secondary)] font-mono-nums mt-1">
                  总金额 ¥{totalAmount.toLocaleString("zh-CN", { minimumFractionDigits: 2 })}
                </div>
                {orderRef.current && (
                  <div className="text-[10px] text-[var(--text-muted)] font-mono-nums mt-1">
                    订单号: {orderRef.current.id}
                  </div>
                )}
              </div>

              {/* Three steps */}
              <div
                className="p-5 rounded-2xl space-y-5"
                style={{
                  background: "linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02)), rgba(15,22,36,0.6)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <MobileStatusStep
                  label="订单已提交"
                  status={
                    step === "submitted" ? "active" : step === "matching" || step === "filled" ? "done" : "pending"
                  }
                  icon={<Check size={16} />}
                  delay={0}
                />
                <MobileStatusStep
                  label="撮合中"
                  status={
                    step === "matching" ? "active" : step === "filled" ? "done" : "pending"
                  }
                  icon={<Loader2 size={16} className={step === "matching" ? "animate-spin" : ""} />}
                  delay={0.15}
                />
                <MobileStatusStep
                  label="模拟成交"
                  status={step === "filled" ? "done" : "pending"}
                  icon={<Check size={16} />}
                  delay={0.3}
                  highlight
                />
              </div>

              {/* Done buttons */}
              {step === "filled" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex gap-3"
                >
                  <button
                    onClick={() => {
                      setStep("input");
                      orderRef.current = null;
                      setError(null);
                      setAvailableCash(getAccount().availableCash);
                      setAvailableSellQty(getAvailableSellQuantity(displayStock.code));
                    }}
                    className="flex-1 py-3 rounded-2xl text-sm font-medium bg-[var(--surface-2)] text-[var(--text-secondary)]"
                  >
                    继续下单
                  </button>
                  <button
                    onClick={() => router.back()}
                    className="flex-1 py-3 rounded-2xl text-sm font-medium bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]"
                  >
                    返回
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MobileShell>
  );
}

function InfoCard({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="min-w-0 p-3 rounded-xl bg-[var(--surface-1)]">
      <span className="text-[10px] text-[var(--text-muted)] block mb-0.5 truncate">{label}</span>
      <span className={cn("block truncate text-xs font-semibold font-mono-nums", valueClass || "text-[var(--text-primary)]")}>
        {value}
      </span>
    </div>
  );
}

function MobileStatusStep({
  label,
  status,
  icon,
  delay = 0,
  highlight = false,
}: {
  label: string;
  status: "pending" | "active" | "done";
  icon: React.ReactNode;
  delay?: number;
  highlight?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -15 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3, ease: "easeOut" }}
      className="flex items-center gap-3"
    >
      <motion.div
        animate={{ scale: status === "active" ? [1, 1.1, 1] : 1 }}
        transition={{ repeat: status === "active" ? Infinity : 0, duration: 1.5 }}
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
          status === "done"
            ? highlight
              ? "bg-[var(--accent)] text-[var(--bg-primary)]"
              : "bg-[var(--up)] text-[var(--bg-primary)]"
            : status === "active"
            ? "bg-[var(--accent-soft)] text-[var(--accent)]"
            : "bg-[var(--surface-2)] text-[var(--text-muted)]"
        )}
      >
        {status === "active" ? <Loader2 size={18} className="animate-spin" /> : icon}
      </motion.div>
      <div className="flex-1">
        <span
          className={cn(
            "text-sm font-medium transition-colors duration-300",
            status === "done"
              ? highlight
                ? "text-[var(--accent)]"
                : "text-[var(--up)]"
              : status === "active"
              ? "text-[var(--accent)]"
              : "text-[var(--text-muted)]"
          )}
        >
          {label}
        </span>
      </div>
      {status === "active" && (
        <motion.div
          className="w-2 h-2 rounded-full bg-[var(--accent)]"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ repeat: Infinity, duration: 1 }}
        />
      )}
    </motion.div>
  );
}
