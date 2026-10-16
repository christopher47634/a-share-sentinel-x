"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Check, Loader2, ClipboardList } from "lucide-react";
import { useRouter } from "next/navigation";
import type { OrderForm } from "./useOrderForm";

/** 第三步：已提交 → 撮合中 → 已成交的模拟进度 */
export function ProgressStep({ form, onClose }: { form: OrderForm; onClose: () => void }) {
  const router = useRouter();
  const { stock, side, quantity, step, priceNum, totalAmount, commission, stampTax, order, reset } = form;
  return (
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
          {order && (
            <div className="text-[10px] text-[var(--text-muted)] font-mono-nums mt-1">
              订单号: {order.id}
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
              {order && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--text-muted)]">
                    订单号
                  </span>
                  <span className="text-[var(--text-secondary)] font-mono-nums text-[10px]">
                    {order.id}
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
                onClick={reset}
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
