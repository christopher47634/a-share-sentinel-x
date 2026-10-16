"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ClickRipple } from "@/components/interaction/ClickRipple";
import type { OrderForm } from "./useOrderForm";

/** 第二步：核对委托信息后确认下单 */
export function ConfirmStep({ form }: { form: OrderForm }) {
  const { stock, side, quantity, priceNum, totalAmount, commission, stampTax, netAmount, confirm, cancelConfirm } = form;
  return (
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
            onClick={cancelConfirm}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-[var(--surface-2)] text-[var(--text-secondary)] hover:bg-[var(--surface-3)] transition-colors btn-press"
          >
            取消
          </motion.button>
          <ClickRipple>
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={confirm}
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
  );
}
