"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { cn, formatCurrency } from "@/lib/utils";
import type { Position } from "@/types/account";
import type { PositionPlanPatch } from "@/lib/account-storage";
import { getSectorById } from "@/mock/sectors";
import { Check, ClipboardEdit, Package, X } from "lucide-react";

const GRID_COLS =
  "minmax(140px, 1.3fr) minmax(90px, 0.8fr) minmax(90px, 0.8fr) minmax(90px, 0.8fr) minmax(90px, 0.8fr) minmax(110px, 1fr) minmax(110px, 1fr) minmax(100px, 0.9fr)";

interface PositionTableProps {
  positions: Position[];
  delay?: number;
  onUpdatePlan?: (stockCode: string, patch: PositionPlanPatch) => void;
}

export default function PositionTable({
  positions,
  delay = 0,
  onUpdatePlan,
}: PositionTableProps) {
  const router = useRouter();
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [planDraft, setPlanDraft] = useState("");
  const [stopDraft, setStopDraft] = useState("");
  const [targetDraft, setTargetDraft] = useState("");

  const startEdit = (pos: Position) => {
    setEditingCode(pos.stockCode);
    setPlanDraft(pos.plan ?? "");
    setStopDraft(pos.stopLossPrice ? String(pos.stopLossPrice) : "");
    setTargetDraft(pos.targetPrice ? String(pos.targetPrice) : "");
  };

  const commitEdit = (stockCode: string) => {
    const parsePrice = (raw: string): number | undefined => {
      const trimmed = raw.trim();
      if (!trimmed) return undefined;
      const n = Number(trimmed);
      return Number.isFinite(n) && n > 0 ? n : undefined;
    };
    onUpdatePlan?.(stockCode, {
      plan: planDraft.trim() || undefined,
      stopLossPrice: parsePrice(stopDraft),
      targetPrice: parsePrice(targetDraft),
    });
    setEditingCode(null);
  };

  if (positions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: delay * 0.08 }}
        className="glass p-8 flex flex-col items-center justify-center gap-3"
      >
        <Package size={40} className="text-[var(--text-muted)] opacity-50" />
        <span className="text-sm text-[var(--text-muted)]">暂无持仓</span>
        <span className="text-xs text-[var(--text-muted)] opacity-60">
          下单交易后将在此显示持仓信息
        </span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: delay * 0.08,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      data-demo-highlight="portfolio-table"
      className="glass overflow-hidden rounded-xl"
    >
      {/* Component Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <Package size={16} className="text-[var(--accent)]" />
          <span className="text-sm font-semibold text-[var(--text-primary)]">
            持仓明细
          </span>
          <span className="text-xs text-[var(--text-muted)]">
            共 {positions.length} 只
          </span>
        </div>
      </div>

      {/* Table Header Row */}
      <div
        className="grid px-5 py-2.5 text-[10px] font-medium text-[var(--text-muted)] border-b border-[var(--border-subtle)]"
        style={{ gridTemplateColumns: GRID_COLS }}
      >
        <span>股票</span>
        <span>板块</span>
        <span className="text-right">持仓/可用</span>
        <span className="text-right">成本价</span>
        <span className="text-right">现价</span>
        <span className="text-right">市值</span>
        <span className="text-right">浮动盈亏</span>
        <span className="text-right">今日盈亏</span>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-[var(--border-subtle)]">
        {positions.map((pos, i) => {
          const sector = getSectorById(pos.sectorId);
          const pnlColor =
            pos.unrealizedPnL > 0
              ? "text-up"
              : pos.unrealizedPnL < 0
              ? "text-down"
              : "text-[var(--text-secondary)]";
          const todayColor =
            pos.todayPnL > 0
              ? "text-up"
              : pos.todayPnL < 0
              ? "text-down"
              : "text-[var(--text-secondary)]";

          const isEditing = editingCode === pos.stockCode;
          const hasPlanMeta = Boolean(pos.plan || pos.stopLossPrice || pos.targetPrice);

          return (
            <motion.div
              key={pos.stockCode}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, delay: i * 0.03 }}
              className="hover:bg-[var(--surface-2)] transition-colors duration-150"
            >
              <div
                onClick={() => router.push(`/stocks/${pos.stockCode}`)}
                className="grid px-5 text-sm items-center cursor-pointer row-interactive"
                style={{
                  gridTemplateColumns: GRID_COLS,
                  minHeight: "68px",
                }}
              >
                {/* Stock Name + Code */}
                <div className="flex flex-col justify-center">
                  <span className="text-[var(--text-primary)] font-medium">
                    {pos.stockName}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] font-mono-nums">
                    {pos.stockCode}
                  </span>
                </div>

                {/* Sector */}
                <span className="text-[10px] text-[var(--text-muted)] truncate">
                  {sector?.name || pos.sectorId}
                </span>

                {/* Quantity / Available */}
                <div className="flex flex-col items-end">
                  <span className="text-xs text-[var(--text-primary)] font-mono-nums">
                    {pos.quantity.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] font-mono-nums">
                    /{pos.availableQuantity.toLocaleString()}
                  </span>
                </div>

                {/* Avg Cost */}
                <span className="text-right text-xs text-[var(--text-secondary)] font-mono-nums">
                  ¥{pos.avgCost.toFixed(2)}
                </span>

                {/* Current Price */}
                <span className="text-right text-xs font-semibold text-[var(--text-primary)] font-mono-nums">
                  ¥{pos.currentPrice.toFixed(2)}
                </span>

                {/* Market Value */}
                <span className="text-right text-xs text-[var(--text-primary)] font-mono-nums">
                  ¥{formatCurrency(pos.marketValue)}
                </span>

                {/* Unrealized P&L */}
                <span
                  className={cn(
                    "text-right text-xs font-semibold font-mono-nums",
                    pnlColor
                  )}
                >
                  {pos.unrealizedPnL >= 0 ? "+" : ""}
                  {formatCurrency(pos.unrealizedPnL)}
                </span>

                {/* Today P&L */}
                <span
                  className={cn(
                    "text-right text-xs font-mono-nums",
                    todayColor
                  )}
                >
                  {pos.todayPnL >= 0 ? "+" : ""}
                  {formatCurrency(pos.todayPnL)}
                </span>
              </div>

              {onUpdatePlan && (
                <div className="px-5 pb-3 -mt-1 flex flex-wrap items-center gap-2 text-[11px]">
                  {isEditing ? (
                    <div
                      className="flex flex-wrap items-center gap-2 w-full rounded-lg border border-white/10 bg-black/20 p-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="text"
                        value={planDraft}
                        onChange={(e) => setPlanDraft(e.target.value)}
                        placeholder="交易计划（如：不追高，等待回调再观察）"
                        maxLength={200}
                        className="flex-1 min-w-[180px] rounded border border-white/10 bg-white/[0.04] px-2 py-1 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                      />
                      <input
                        type="number"
                        step="0.01"
                        value={stopDraft}
                        onChange={(e) => setStopDraft(e.target.value)}
                        placeholder="止损观察线"
                        className="w-24 rounded border border-white/10 bg-white/[0.04] px-2 py-1 text-xs font-mono-nums text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                      />
                      <input
                        type="number"
                        step="0.01"
                        value={targetDraft}
                        onChange={(e) => setTargetDraft(e.target.value)}
                        placeholder="目标观察价"
                        className="w-24 rounded border border-white/10 bg-white/[0.04] px-2 py-1 text-xs font-mono-nums text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                      />
                      <button
                        type="button"
                        onClick={() => commitEdit(pos.stockCode)}
                        className="inline-flex items-center gap-1 rounded bg-[var(--accent)] px-2.5 py-1 text-xs font-medium text-[var(--bg-primary)]"
                      >
                        <Check size={12} />
                        保存
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingCode(null)}
                        className="inline-flex items-center gap-1 rounded border border-white/10 px-2 py-1 text-xs text-[var(--text-muted)]"
                      >
                        <X size={12} />
                        取消
                      </button>
                    </div>
                  ) : (
                    <>
                      {hasPlanMeta ? (
                        <div className="flex flex-wrap items-center gap-2 text-[var(--text-secondary)]">
                          {pos.plan && (
                            <span className="rounded bg-white/[0.04] px-2 py-0.5">
                              计划：{pos.plan}
                            </span>
                          )}
                          {pos.stopLossPrice !== undefined && (
                            <span className="rounded bg-red-500/10 px-2 py-0.5 font-mono-nums text-red-300">
                              止损线 ¥{pos.stopLossPrice.toFixed(2)}
                            </span>
                          )}
                          {pos.targetPrice !== undefined && (
                            <span className="rounded bg-emerald-500/10 px-2 py-0.5 font-mono-nums text-emerald-300">
                              目标价 ¥{pos.targetPrice.toFixed(2)}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[var(--text-muted)] opacity-70">
                          未设置交易计划与止损/目标观察线
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          startEdit(pos);
                        }}
                        className="ml-auto inline-flex items-center gap-1 rounded border border-white/10 px-2 py-0.5 text-[11px] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                      >
                        <ClipboardEdit size={11} />
                        {hasPlanMeta ? "编辑计划" : "设置交易计划"}
                      </button>
                    </>
                  )}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
