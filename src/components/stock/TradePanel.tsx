"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { Stock } from "@/mock/stocks";
import { useOrderForm, type TradeSide } from "./trade-panel/useOrderForm";
import { InputStep } from "./trade-panel/InputStep";
import { ConfirmStep } from "./trade-panel/ConfirmStep";
import { ProgressStep } from "./trade-panel/ProgressStep";

interface TradePanelProps {
  stock: Stock;
  side?: TradeSide;
  onClose: () => void;
}

/** 下单弹窗：状态和计算在 useOrderForm，三个步骤各自一个组件 */

export default function TradePanel({
  stock,
  side: initialSide = "buy",
  onClose,
}: TradePanelProps) {
  const form = useOrderForm(stock, initialSide);

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
            {form.step === "input" && <InputStep form={form} />}
            {form.step === "confirm" && <ConfirmStep form={form} />}
            {form.step !== "input" && form.step !== "confirm" && <ProgressStep form={form} onClose={onClose} />}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
