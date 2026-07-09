"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Stock } from "@/mock/stocks";
import { type MockOrder } from "@/mock/orders";
import { getAccount } from "@/lib/account-storage";
import { executeBuy, executeSell, getMaxBuyQuantity, getAvailableSellQuantity, calcCommission, calcStampTax } from "@/lib/trade-engine";
import {
  X,
  Minus,
  Plus,
  Check,
  Loader2,
  ClipboardList,
  AlertTriangle,
  Lock,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { ClickRipple } from "@/components/interaction/ClickRipple";

type TradeSide = "buy" | "sell";
type OrderStep = "input" | "confirm" | "submitted" | "matching" | "filled";

interface TradePanelProps {
  stock: Stock;
  side?: TradeSide;
  onClose: () => void;
}

// AVAILABLE_FUNDS removed — now uses live account data

export default function TradePanel({
  stock,
  side: initialSide = "buy",
  onClose,
}: TradePanelProps) {
  const router = useRouter();
  const [side, setSide] = useState<TradeSide>(initialSide);
  const [price, setPrice] = useState(stock.price.toFixed(2));
  const [quantity, setQuantity] = useState(100);
  const [step, setStep] = useState<OrderStep>("input");
  const [orderType, setOrderType] = useState<"limit" | "market">("limit");
  const [error, setError] = useState<string | null>(null);

  const priceNum = parseFloat(price) || 0;
  const totalAmount = priceNum * quantity;
  const commission = calcCommission(totalAmount);
  const stampTax = side === "sell" ? calcStampTax(totalAmount) : 0;
  const netAmount =
    side === "buy"
      ? totalAmount + commission
      : totalAmount - commission - stampTax;
  const accountData = getAccount();
  const availableCash = accountData.availableCash;
  const maxBuy = getMaxBuyQuantity(priceNum);
  const availableSellQty = getAvailableSellQuantity(stock.code);
  const quantityLots = quantity / 100;

  const orderRef = useRef<MockOrder | null>(null);

  const handleSubmit = () => {
    setError(null);
    setStep("confirm");
  };

  const handleConfirmOrder = () => {
    const result = side === "buy"
      ? executeBuy({
          stockCode: stock.code,
          stockName: stock.name,
          sectorId: stock.sectorId,
          price: priceNum,
          quantity,
        })
      : executeSell({
          stockCode: stock.code,
          stockName: stock.name,
          price: priceNum,
          quantity,
        });

    if (!result.success) {
      setError(result.error ?? "交易失败");
      setStep("input");
      return;
    }

    orderRef.current = result.order ?? null;
    setStep("submitted");
    setTimeout(() => {
      setStep("matching");
    }, 1200);
    setTimeout(() => {
      setStep("filled");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("sentinel:account-updated"));
      }
    }, 3000);
  };

  const handleCancelConfirm = () => {
    setStep("input");
  };

  const handleReset = () => {
    setStep("input");
    orderRef.current = null;
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        {/* Panel */}
        <motion.div
          initial={{ y: 100, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 100, opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="relative z-10 w-[380px] max-h-[90vh] overflow-y-auto rounded-2xl"
          style={{
            background:
              "linear-gradient(145deg, rgba(255,255,255,0.075), rgba(255,255,255,0.025)), rgba(15, 22, 36, 0.92)",
            backdropFilter: "blur(24px) saturate(140%)",
            WebkitBackdropFilter: "blur(24px) saturate(140%)",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.08), 0 24px 80px rgba(0,0,0,0.6)",
          }}
        >
          {/* Header + Simulated badge */}
          <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)]">
            <div>
              <span className="text-sm font-semibold text-[var(--text-primary)]">
                {stock.name}
              </span>
              <span className="text-xs text-[var(--text-muted)] font-mono-nums ml-2">
                {stock.code}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                style={{
                  background: "rgba(212,165,116,0.12)",
                  color: "var(--accent)",
                  border: "1px solid rgba(212,165,116,0.25)",
                }}
              >
                模拟交易
              </span>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)] transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Content area with AnimatePresence for steps */}
          <AnimatePresence mode="wait">
            {step === "input" && (
              <motion.div
                key="input"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                data-demo-highlight="trade-inputs"
                className="p-4 space-y-4"
              >
                {/* Risk warning banner */}
                {stock.riskWarning && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-2 p-3 rounded-xl"
                    style={{
                      background: "rgba(251,191,36,0.1)",
                      border: "1px solid rgba(251,191,36,0.25)",
                    }}
                  >
                    <AlertTriangle
                      size={14}
                      className="text-yellow-400 mt-0.5 shrink-0"
                    />
                    <span className="text-xs text-yellow-300 leading-relaxed">
                      {stock.riskWarning}
                    </span>
                  </motion.div>
                )}

                {/* Buy/Sell tabs */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setSide("buy")}
                    className={cn(
                      "flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 btn-press",
                      side === "buy"
                        ? "bg-[var(--up)] text-[var(--bg-primary)]"
                        : "bg-[var(--up-bg)] text-[var(--up)] border border-[var(--up)]"
                    )}
                  >
                    买入
                  </button>
                  <button
                    onClick={() => setSide("sell")}
                    className={cn(
                      "flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 btn-press",
                      side === "sell"
                        ? "bg-[var(--down)] text-white"
                        : "bg-[var(--down-bg)] text-[var(--down)] border border-[var(--down)]"
                    )}
                  >
                    卖出
                  </button>
                </div>

                {/* Order type selector */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setOrderType("limit")}
                    className={cn(
                      "flex-1 py-2 rounded-lg text-xs font-medium transition-all duration-200",
                      orderType === "limit"
                        ? "bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]"
                        : "bg-[var(--surface-1)] text-[var(--text-muted)]"
                    )}
                  >
                    限价委托
                  </button>
                  <div
                    className="flex-1 relative group"
                    title="Demo暂不支持市价委托"
                  >
                    <button
                      disabled
                      className="w-full py-2 rounded-lg text-xs font-medium bg-[var(--surface-1)] text-[var(--text-muted)] opacity-40 cursor-not-allowed flex items-center justify-center gap-1"
                    >
                      <Lock size={10} />
                      市价委托
                    </button>
                  </div>
                </div>

                {/* Price input */}
                <div>
                  <label className="text-xs text-[var(--text-muted)] mb-1.5 flex items-center gap-1.5">
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                      style={{
                        background: "rgba(96,165,250,0.12)",
                        color: "#60A5FA",
                      }}
                    >
                      限价
                    </span>
                    委托价格 (元)
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setPrice((parseFloat(price) - 0.01).toFixed(2))
                      }
                      className="w-10 h-10 rounded-lg flex items-center justify-center bg-[var(--surface-2)] text-[var(--text-secondary)] hover:bg-[var(--surface-3)] transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <input
                      type="text"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="flex-1 h-10 px-3 rounded-lg bg-[var(--surface-1)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-center font-mono-nums text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
                    />
                    <button
                      onClick={() =>
                        setPrice((parseFloat(price) + 0.01).toFixed(2))
                      }
                      className="w-10 h-10 rounded-lg flex items-center justify-center bg-[var(--surface-2)] text-[var(--text-secondary)] hover:bg-[var(--surface-3)] transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                {/* Quantity input — in 手 (lots of 100) */}
                <div>
                  <label className="text-xs text-[var(--text-muted)] mb-1.5 block">
                    委托数量 (手) · 1手 = 100股
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setQuantity(Math.max(100, quantity - 100))
                      }
                      className="w-10 h-10 rounded-lg flex items-center justify-center bg-[var(--surface-2)] text-[var(--text-secondary)] hover:bg-[var(--surface-3)] transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <div className="flex-1 relative">
                      <input
                        type="number"
                        value={quantityLots}
                        onChange={(e) => {
                          const lots = parseInt(e.target.value) || 0;
                          setQuantity(Math.max(0, lots) * 100);
                        }}
                        className="w-full h-10 px-3 pr-10 rounded-lg bg-[var(--surface-1)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-center font-mono-nums text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
                        step={1}
                        min={0}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[var(--text-muted)]">
                        手
                      </span>
                    </div>
                    <button
                      onClick={() => setQuantity(quantity + 100)}
                      className="w-10 h-10 rounded-lg flex items-center justify-center bg-[var(--surface-2)] text-[var(--text-secondary)] hover:bg-[var(--surface-3)] transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)] mt-1 text-center font-mono-nums">
                    = {quantity.toLocaleString()}股
                  </div>
                  {side === "sell" && (
                    <div className="text-[10px] text-[var(--accent)] mt-0.5 text-center font-mono-nums">
                      可卖: {availableSellQty.toLocaleString()} 股
                    </div>
                  )}
                  {side === "buy" && priceNum > 0 && totalAmount + commission > availableCash && (
                    <div className="text-[10px] text-red-400 mt-0.5 text-center">
                      ⚠ 可用资金不足
                    </div>
                  )}
                  {side === "sell" && quantity > availableSellQty && (
                    <div className="text-[10px] text-red-400 mt-0.5 text-center">
                      ⚠ 超过可卖数量
                    </div>
                  )}
                </div>

                {/* Quick quantity buttons */}
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
                        className="flex-1 py-1.5 rounded-lg text-xs text-[var(--text-muted)] bg-[var(--surface-1)] hover:bg-[var(--surface-2)] hover:text-[var(--text-secondary)] transition-colors"
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>

                {/* Amount calculation — with commission & stamp tax */}
                <div className="p-3 rounded-xl bg-[var(--surface-1)] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--text-muted)]">交易金额</span>
                    <span className="text-[var(--text-primary)] font-mono-nums">
                      ¥
                      {totalAmount.toLocaleString("zh-CN", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--text-muted)]">
                      预估佣金 (0.025%)
                    </span>
                    <span className="text-[var(--text-secondary)] font-mono-nums">
                      ¥{commission.toFixed(2)}
                    </span>
                  </div>
                  {side === "sell" && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[var(--text-muted)]">
                        预估印花税 (0.05%)
                      </span>
                      <span className="text-[var(--text-secondary)] font-mono-nums">
                        ¥{stampTax.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-[var(--border-subtle)]">
                    <span className="text-[var(--text-muted)]">
                      {side === "buy" ? "预计扣款" : "预计到账"}
                    </span>
                    <span className="text-[var(--text-primary)] font-semibold font-mono-nums">
                      ¥
                      {netAmount.toLocaleString("zh-CN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--text-muted)]">可用资金</span>
                    <span className="text-[var(--text-secondary)] font-mono-nums">
                      ¥
                      {availableCash.toLocaleString("zh-CN", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--text-muted)]">
                      {side === "buy" ? "最大可买" : "最大可卖"}
                    </span>
                    <span className="text-[var(--accent)] font-mono-nums">
                      {side === "buy"
                        ? `${maxBuy.toLocaleString()}股`
                        : `${availableSellQty.toLocaleString()}股`}
                    </span>
                  </div>
                </div>

                {/* Error display */}
                {error && (
                  <div className="text-xs text-[var(--down)] bg-[var(--down)]/10 px-3 py-2 rounded-lg">
                    {error}
                  </div>
                )}

                {/* Submit button */}
                <ClickRipple>
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  disabled={quantity <= 0 || priceNum <= 0}
                  data-demo-highlight="confirm-buy"
                  className={cn(
                    "w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 btn-press",
                    side === "buy"
                      ? "bg-[var(--up)] text-[var(--bg-primary)] hover:shadow-[0_0_20px_rgba(52,211,153,0.3)]"
                      : "bg-[var(--down)] text-white hover:shadow-[0_0_20px_rgba(248,113,113,0.3)]",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  {side === "buy" ? "确认买入" : "确认卖出"}
                </motion.button>
                </ClickRipple>

                {/* Risk disclaimer */}
                <p className="text-[10px] text-[var(--text-muted)] text-center leading-relaxed opacity-60">
                  模拟交易，不构成投资建议。投资有风险，入市需谨慎。
                </p>
              </motion.div>
            )}

            {/* Confirmation dialog */}
            {step === "confirm" && (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="p-5 space-y-4"
              >
                <div className="text-center">
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">
                    委托确认
                  </h3>
                  <p className="text-[10px] text-[var(--text-muted)]">
                    请确认以下委托信息
                  </p>
                </div>

                <div
                  className="p-4 rounded-xl space-y-3"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--text-muted)]">股票</span>
                    <span className="text-[var(--text-primary)] font-medium">
                      {stock.name}{" "}
                      <span className="text-xs text-[var(--text-muted)] font-mono-nums">
                        {stock.code}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--text-muted)]">方向</span>
                    <span
                      className={cn(
                        "font-semibold",
                        side === "buy" ? "text-up" : "text-down"
                      )}
                    >
                      {side === "buy" ? "买入" : "卖出"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--text-muted)]">委托</span>
                    <span className="text-[var(--text-secondary)] font-mono-nums">
                      {priceNum.toFixed(2)}元 × {quantity}股
                    </span>
                  </div>
                  <div className="h-px bg-[var(--border-subtle)]" />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--text-muted)]">交易金额</span>
                    <span className="text-[var(--text-primary)] font-mono-nums font-semibold">
                      ¥
                      {totalAmount.toLocaleString("zh-CN", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--text-muted)]">佣金</span>
                    <span className="text-[var(--text-secondary)] font-mono-nums">
                      +¥{commission.toFixed(2)}
                    </span>
                  </div>
                  {side === "sell" && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[var(--text-muted)]">印花税</span>
                      <span className="text-[var(--text-secondary)] font-mono-nums">
                        +¥{stampTax.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="h-px bg-[var(--border-subtle)]" />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--text-muted)]">
                      {side === "buy" ? "实际扣款" : "实际到账"}
                    </span>
                    <span className="text-[var(--text-primary)] font-mono-nums font-bold">
                      ¥
                      {netAmount.toLocaleString("zh-CN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCancelConfirm}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-[var(--surface-2)] text-[var(--text-secondary)] hover:bg-[var(--surface-3)] transition-colors btn-press"
                  >
                    取消
                  </motion.button>
                  <ClickRipple>
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleConfirmOrder}
                    className={cn(
                      "flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 btn-press",
                      side === "buy"
                        ? "bg-[var(--up)] text-[var(--bg-primary)]"
                        : "bg-[var(--down)] text-white"
                    )}
                  >
                    确认委托
                  </motion.button>
                </ClickRipple>
                </div>
              </motion.div>
            )}

            {/* Order status steps */}
            {step !== "input" && step !== "confirm" && (
              <motion.div
                key="status"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="p-6 space-y-6"
              >
                {/* Order summary */}
                <div className="text-center space-y-1">
                  <div className="text-sm text-[var(--text-muted)]">
                    {side === "buy" ? "买入" : "卖出"} {stock.name}
                  </div>
                  <div className="text-lg font-bold text-[var(--text-primary)] font-mono-nums">
                    {priceNum.toFixed(2)} × {quantity}股
                  </div>
                  <div className="text-xs text-[var(--text-secondary)] font-mono-nums">
                    总金额 ¥
                    {totalAmount.toLocaleString("zh-CN", {
                      minimumFractionDigits: 2,
                    })}
                  </div>
                  {orderRef.current && (
                    <div className="text-[10px] text-[var(--text-muted)] font-mono-nums mt-1">
                      订单号: {orderRef.current.id}
                    </div>
                  )}
                </div>

                {/* Three-step progress timeline */}
                <div className="relative">
                  {/* Vertical connecting line */}
                  <div
                    className="absolute left-[15px] top-[20px] w-[2px] rounded-full"
                    style={{
                      height: "calc(100% - 40px)",
                      background:
                        step === "filled"
                          ? "var(--accent)"
                          : step === "matching"
                          ? "linear-gradient(180deg, var(--up), var(--accent-soft))"
                          : "var(--surface-2)",
                    }}
                  />
                  <div className="space-y-4 relative z-10">
                    {/* Step 1: Submitted */}
                    <StatusStep
                      label="订单已提交"
                      status={
                        step === "submitted"
                          ? "active"
                          : step === "matching" || step === "filled"
                          ? "done"
                          : "pending"
                      }
                      icon={<Check size={16} />}
                      delay={0}
                    />

                    {/* Step 2: Matching */}
                    <StatusStep
                      label="撮合中"
                      status={
                        step === "matching"
                          ? "active"
                          : step === "filled"
                          ? "done"
                          : "pending"
                      }
                      icon={
                        <Loader2
                          size={16}
                          className={
                            step === "matching" ? "animate-spin" : ""
                          }
                        />
                      }
                      delay={0.15}
                    />

                    {/* Step 3: Filled */}
                    <StatusStep
                      label="模拟成交"
                      status={step === "filled" ? "done" : "pending"}
                      icon={<Check size={16} />}
                      delay={0.3}
                      highlight
                    />
                  </div>
                </div>

                {/* Done button */}
                {step === "filled" && (
                  <div className="space-y-3">
                    {/* Filled details */}
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                      className="p-4 rounded-xl space-y-2"
                      style={{
                        background: "rgba(52,211,153,0.05)",
                        border: "1px solid rgba(52,211,153,0.12)",
                      }}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[var(--text-muted)]">
                          成交价格
                        </span>
                        <span className="text-[var(--text-primary)] font-mono-nums font-semibold">
                          {priceNum.toFixed(2)}元
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[var(--text-muted)]">
                          成交数量
                        </span>
                        <span className="text-[var(--text-primary)] font-mono-nums">
                          {quantity}股
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[var(--text-muted)]">
                          成交金额
                        </span>
                        <span className="text-[var(--text-primary)] font-mono-nums font-semibold">
                          ¥
                          {totalAmount.toLocaleString("zh-CN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[var(--text-muted)]">
                          佣金
                        </span>
                        <span className="text-[var(--text-secondary)] font-mono-nums">
                          ¥{commission.toFixed(2)}
                        </span>
                      </div>
                      {side === "sell" && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[var(--text-muted)]">
                            印花税
                          </span>
                          <span className="text-[var(--text-secondary)] font-mono-nums">
                            ¥{stampTax.toFixed(2)}
                          </span>
                        </div>
                      )}
                      {orderRef.current && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[var(--text-muted)]">
                            订单号
                          </span>
                          <span className="text-[var(--text-secondary)] font-mono-nums text-[10px]">
                            {orderRef.current.id}
                          </span>
                        </div>
                      )}
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="flex gap-2"
                    >
                      <button
                        onClick={handleReset}
                        className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-[var(--surface-2)] text-[var(--text-secondary)] hover:bg-[var(--surface-3)] transition-colors"
                      >
                        继续下单
                      </button>
                      <button
                        onClick={() => {
                          onClose();
                          router.push("/orders");
                        }}
                        data-demo-highlight="view-orders"
                        className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-[var(--surface-2)] text-[var(--text-secondary)] hover:bg-[var(--surface-3)] transition-colors flex items-center justify-center gap-1.5"
                      >
                        <ClipboardList size={14} />
                        查看订单
                      </button>
                      <button
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--bg-primary)] transition-colors"
                      >
                        关闭
                      </button>
                    </motion.div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function StatusStep({
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
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3, ease: "easeOut" }}
      className="flex items-center gap-3"
    >
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300",
          status === "done"
            ? "bg-[var(--up)] text-[var(--bg-primary)]"
            : status === "active"
            ? "bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]"
            : "bg-[var(--surface-2)] text-[var(--text-muted)]"
        )}
      >
        {icon}
      </div>
      <span
        className={cn(
          "text-sm transition-colors duration-300",
          status === "done"
            ? "text-[var(--text-primary)] font-medium"
            : status === "active"
            ? "text-[var(--accent)] font-medium"
            : "text-[var(--text-muted)]",
          highlight && status === "done" && "text-[var(--up)]"
        )}
      >
        {label}
      </span>
    </motion.div>
  );
}
