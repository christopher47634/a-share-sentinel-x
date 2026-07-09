"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ClipboardList, BarChart3, PlayCircle, AlertCircle } from "lucide-react";
import { getOrders, MockOrder } from "@/mock/orders";
import { getDemoOrders, isDemoModeActive, ensureDemoTradeSeeded } from "@/lib/account-storage";
import EmptyState from "@/components/common/EmptyState";
import DesktopShell from "@/components/layout/DesktopShell";

const STATUS_MAP: Record<
  MockOrder["status"],
  { label: string; color: string; bg: string }
> = {
  submitted: {
    label: "已提交",
    color: "#60A5FA",
    bg: "rgba(96,165,250,0.12)",
  },
  matching: {
    label: "撮合中",
    color: "#FBBF24",
    bg: "rgba(251,191,36,0.12)",
  },
  partial_filled: {
    label: "部分成交",
    color: "#A78BFA",
    bg: "rgba(167,139,250,0.12)",
  },
  filled: {
    label: "已成交",
    color: "#34D399",
    bg: "rgba(52,211,153,0.12)",
  },
  cancelled: {
    label: "已撤单",
    color: "#94A3B8",
    bg: "rgba(148,163,184,0.12)",
  },
  rejected: {
    label: "已拒绝",
    color: "#EF4444",
    bg: "rgba(239,68,68,0.12)",
  },
};

function formatTime(ts: number): string {
  if (!ts) return "-";
  const d = new Date(ts);
  return d.toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60_000) return "刚刚";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}分钟前`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}小时前`;
  return new Date(ts).toLocaleDateString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<MockOrder[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (isDemoModeActive()) {
      ensureDemoTradeSeeded(); // 兜底：确保 demo 数据存在
    }
    const normalOrders = getOrders();
    const demoOrders = isDemoModeActive() ? getDemoOrders<MockOrder & { source?: string }>() : [];
    setOrders([...demoOrders, ...normalOrders]);
  }, []);

  const handleStartDemo = () => {
    try {
      localStorage.setItem("demoMode", "true");
      localStorage.setItem("demoModeStep", "0");
    } catch {
      // ignore
    }
    router.push("/");
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <DesktopShell>
    <div className="p-4 md:p-6 pb-20 md:pb-6 max-w-5xl mx-auto page-enter">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-3 mb-6"
      >
        <ClipboardList size={20} className="text-[var(--accent)]" />
        <h1 className="text-lg font-semibold text-[var(--text-primary)]">
          委托订单
        </h1>
        <span className="text-sm text-[var(--text-muted)]">
          共 {orders.length} 笔
        </span>
      </motion.div>

      {orders.length === 0 ? (
        <div className="space-y-4">
          <EmptyState
            icon={<ClipboardList size={40} />}
            title="暂无委托订单"
            description="下单后将在此显示委托记录"
          />
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex items-center justify-center gap-3"
          >
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-[var(--surface-2)] text-[var(--text-secondary)] hover:bg-[var(--surface-3)] transition-colors"
            >
              <BarChart3 size={15} />
              返回市场
            </button>
            <button
              onClick={handleStartDemo}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--bg-primary)] transition-colors"
            >
              <PlayCircle size={15} />
              开始演示
            </button>
          </motion.div>
        </div>
      ) : (
        <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          data-demo-highlight="order-table"
          className="glass overflow-x-auto rounded-xl hidden md:block"
        >
          {/* Table Header */}
          <div className="grid grid-cols-[160px_1fr_70px_90px_80px_110px_80px_140px] gap-2 px-5 py-3 text-xs font-medium text-[var(--text-muted)] border-b border-[var(--border-subtle)]">
            <span>委托编号</span>
            <span>股票</span>
            <span>方向</span>
            <span className="text-right">价格</span>
            <span className="text-right">数量</span>
            <span className="text-right">金额</span>
            <span className="text-center">状态</span>
            <span className="text-right">委托时间</span>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-[var(--border-subtle)]">
            <AnimatePresence initial={false}>
              {orders.map((order, i) => {
                const st = STATUS_MAP[order.status];
                const isExpanded = expandedId === order.id;
                const fillPercent =
                  order.quantity > 0
                    ? (order.filledQuantity / order.quantity) * 100
                    : 0;
                const netAmount =
                  order.side === "buy"
                    ? order.totalAmount +
                      (order.commission || 0) +
                      (order.stampTax || 0)
                    : order.totalAmount -
                      (order.commission || 0) -
                      (order.stampTax || 0);

                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.25, delay: i * 0.03 }}
                  >
                    <div
                      onClick={() => toggleExpand(order.id)}
                      className="grid grid-cols-[160px_1fr_70px_90px_80px_110px_80px_140px] gap-2 px-5 py-3 text-sm items-center hover:bg-[var(--surface-2)] transition-colors duration-150 cursor-pointer row-interactive"
                    >
                      <span className="text-[var(--text-secondary)] text-xs font-mono font-semibold">
                        {order.id}
                      </span>
                      <span className="text-[var(--text-primary)] font-medium truncate">
                        {order.stockName}
                        <span className="ml-1.5 text-[var(--text-muted)] text-xs">
                          {order.stockCode}
                        </span>
                      </span>
                      <span
                        className="text-sm font-medium"
                        style={{
                          color:
                            order.side === "buy"
                              ? "var(--up)"
                              : "var(--down)",
                        }}
                      >
                        {order.side === "buy" ? "买入" : "卖出"}
                      </span>
                      <span className="text-right text-[var(--text-primary)] font-mono">
                        {order.price.toFixed(2)}
                      </span>
                      <span className="text-right text-[var(--text-secondary)] font-mono">
                        {order.quantity.toLocaleString()}
                      </span>
                      <span className="text-right text-[var(--text-secondary)] font-mono">
                        {order.totalAmount.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                      <span className="flex justify-center items-center gap-1">
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{ color: st.color, backgroundColor: st.bg }}
                        >
                          {st.label}
                        </span>
                        {(order as MockOrder & { source?: string }).source === 'demo' && (
                          <span
                            className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                            style={{ color: '#D4A574', background: 'rgba(212,165,116,0.12)' }}
                          >
                            演示
                          </span>
                        )}
                      </span>
                      <span className="text-right text-[var(--text-muted)] text-xs">
                        {relativeTime(order.createdAt)}
                      </span>
                    </div>

                    {/* Expanded detail row */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 py-4 bg-[var(--surface-1)] border-t border-[var(--border-subtle)]">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                              {/* Commission */}
                              <div>
                                <span className="text-[var(--text-muted)] block mb-1">
                                  佣金
                                </span>
                                <span className="text-[var(--text-primary)] font-mono-nums">
                                  {order.commission
                                    ? `¥${order.commission.toFixed(2)}`
                                    : "-"}
                                </span>
                              </div>
                              {/* Stamp tax */}
                              <div>
                                <span className="text-[var(--text-muted)] block mb-1">
                                  印花税
                                </span>
                                <span className="text-[var(--text-primary)] font-mono-nums">
                                  {order.stampTax
                                    ? `¥${order.stampTax.toFixed(2)}`
                                    : "¥0.00"}
                                </span>
                              </div>
                              {/* Net amount */}
                              <div>
                                <span className="text-[var(--text-muted)] block mb-1">
                                  {order.side === "buy"
                                    ? "实际扣款"
                                    : "实际到账"}
                                </span>
                                <span className="text-[var(--text-primary)] font-mono-nums font-semibold">
                                  {order.commission
                                    ? `¥${netAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                                    : "-"}
                                </span>
                              </div>
                              {/* Avg fill price */}
                              <div>
                                <span className="text-[var(--text-muted)] block mb-1">
                                  成交均价
                                </span>
                                <span className="text-[var(--text-primary)] font-mono-nums">
                                  {order.avgFillPrice
                                    ? `¥${order.avgFillPrice.toFixed(2)}`
                                    : "-"}
                                </span>
                              </div>
                              {/* Created time */}
                              <div>
                                <span className="text-[var(--text-muted)] block mb-1">
                                  委托时间
                                </span>
                                <span className="text-[var(--text-secondary)] font-mono-nums text-[11px]">
                                  {formatTime(order.createdAt)}
                                </span>
                              </div>
                              {/* Filled time */}
                              <div>
                                <span className="text-[var(--text-muted)] block mb-1">
                                  成交时间
                                </span>
                                <span className="text-[var(--text-secondary)] font-mono-nums text-[11px]">
                                  {formatTime(order.filledAt || 0)}
                                </span>
                              </div>
                            </div>

                            {/* Partial fill progress bar */}
                            {order.status === "partial_filled" &&
                              order.filledQuantity > 0 && (
                                <div className="mt-3 pt-3 border-t border-[var(--border-subtle)]">
                                  <div className="flex items-center justify-between text-xs mb-1.5">
                                    <span className="text-[var(--text-muted)]">
                                      成交进度
                                    </span>
                                    <span className="text-[var(--text-secondary)] font-mono-nums">
                                      {order.filledQuantity.toLocaleString()} /{" "}
                                      {order.quantity.toLocaleString()} 股
                                      ({fillPercent.toFixed(0)}%)
                                    </span>
                                  </div>
                                  <div className="w-full h-2 rounded-full bg-[var(--surface-2)] overflow-hidden">
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{
                                        width: `${fillPercent}%`,
                                      }}
                                      transition={{
                                        duration: 0.5,
                                        ease: "easeOut",
                                      }}
                                      className="h-full rounded-full"
                                      style={{
                                        background:
                                          "linear-gradient(90deg, var(--accent), #A78BFA)",
                                      }}
                                    />
                                  </div>
                                </div>
                              )}

                            {/* Rejected reason */}
                            {order.status === "rejected" &&
                              order.rejectReason && (
                                <div className="mt-3 pt-3 border-t border-[var(--border-subtle)]">
                                  <div className="flex items-start gap-2 p-2.5 rounded-lg"
                                    style={{
                                      background: "rgba(239,68,68,0.08)",
                                      border: "1px solid rgba(239,68,68,0.15)",
                                    }}
                                  >
                                    <AlertCircle
                                      size={14}
                                      className="text-red-400 mt-0.5 shrink-0"
                                    />
                                    <span className="text-xs text-red-400">
                                      拒绝原因: {order.rejectReason}
                                    </span>
                                  </div>
                                </div>
                              )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Mobile Order Cards */}
        <div className="md:hidden space-y-3" data-demo-highlight="order-table">
          {orders.map((order, i) => {
            const st = STATUS_MAP[order.status];
            const isExpanded = expandedId === order.id;
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: i * 0.03 }}
                className="glass rounded-xl overflow-hidden"
              >
                <div
                  onClick={() => toggleExpand(order.id)}
                  className="px-4 py-3 cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[var(--text-primary)] font-medium text-sm">
                        {order.stockName}
                      </span>
                      <span className="text-[var(--text-muted)] text-xs font-mono">
                        {order.stockCode}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="px-2 py-0.5 rounded text-xs font-medium"
                        style={{
                          color: order.side === "buy" ? "var(--up)" : "var(--down)",
                          background: order.side === "buy" ? "rgba(52,211,153,0.1)" : "rgba(239,68,68,0.1)",
                        }}
                      >
                        {order.side === "buy" ? "买入" : "卖出"}
                      </span>
                      <span
                        className="px-2 py-0.5 rounded text-xs font-medium"
                        style={{ color: st.color, backgroundColor: st.bg }}
                      >
                        {st.label}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--text-primary)] font-mono">
                      ¥{order.price.toFixed(2)}
                    </span>
                    <span className="text-[var(--text-secondary)] font-mono">
                      ×{order.quantity.toLocaleString()}
                    </span>
                    <span className="text-[var(--text-primary)] font-mono font-medium">
                      ¥{order.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-[var(--text-muted)] text-[11px]">
                      {relativeTime(order.createdAt)}
                    </span>
                    {(order as MockOrder & { source?: string }).source === 'demo' && (
                      <span
                        className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                        style={{ color: '#D4A574', background: 'rgba(212,165,116,0.12)' }}
                      >
                        演示
                      </span>
                    )}
                  </div>
                </div>

                {/* Expanded detail */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 py-3 bg-[var(--surface-1)] border-t border-[var(--border-subtle)] text-xs">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <span className="text-[var(--text-muted)] block mb-0.5">委托编号</span>
                            <span className="text-[var(--text-secondary)] font-mono text-[11px]">{order.id}</span>
                          </div>
                          <div>
                            <span className="text-[var(--text-muted)] block mb-0.5">委托时间</span>
                            <span className="text-[var(--text-secondary)] font-mono text-[11px]">{formatTime(order.createdAt)}</span>
                          </div>
                          {order.commission !== undefined && (
                            <div>
                              <span className="text-[var(--text-muted)] block mb-0.5">佣金</span>
                              <span className="text-[var(--text-primary)] font-mono">¥{order.commission.toFixed(2)}</span>
                            </div>
                          )}
                          {order.stampTax !== undefined && (
                            <div>
                              <span className="text-[var(--text-muted)] block mb-0.5">印花税</span>
                              <span className="text-[var(--text-primary)] font-mono">¥{order.stampTax.toFixed(2)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
        </>
      )}

      {/* Disclaimer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-center"
      >
        <p className="text-[10px] text-[var(--text-muted)] leading-relaxed opacity-50">
          本系统为模拟交易平台，所有数据均为虚拟数据，不涉及真实资金和证券。投资有风险，入市需谨慎。
        </p>
      </motion.div>
    </div>
    </DesktopShell>
  );
}
