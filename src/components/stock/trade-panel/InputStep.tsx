"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Minus, Plus, AlertTriangle, Lock } from "lucide-react";
import { ClickRipple } from "@/components/interaction/ClickRipple";
import type { OrderForm } from "./useOrderForm";

/** 第一步：填写方向、委托类型、价格和数量，显示费用试算 */
export function InputStep({ form }: { form: OrderForm }) {
  const { stock, side, setSide, price, setPrice, nudgePrice, quantity, setQuantity, quantityLots, orderType, setOrderType, error, priceNum, totalAmount, commission, stampTax, netAmount, availableCash, availableSellQty, maxBuy, submit } = form;
  return (
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
                nudgePrice(-1)
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
                nudgePrice(1)
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
          onClick={submit}
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
  );
}
