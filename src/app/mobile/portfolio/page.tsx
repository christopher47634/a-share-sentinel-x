"use client";

import { useEffect, useState } from "react";
import MobileShell from "@/components/layout/MobileShell";
import PositionCard from "@/components/portfolio/PositionCard";
import PortfolioReplayCard from "@/components/portfolio/PortfolioReplayCard";
import LocalLedgerCard from "@/components/portfolio/LocalLedgerCard";
import {
  initializeAccount,
  getAccount,
  getPositions,
  getTransactions,
  getPortfolioHistory,
  recordPortfolioSnapshot,
  isDemoModeActive,
  ensureDemoTradeSeeded,
  getDemoTransactions,
  getDemoAccountOverlay,
  applyDemoAccountOverlay,
} from "@/lib/account-storage";
import {
  downloadLocalLedgerBackup,
  syncLocalLedgerSnapshot,
} from "@/lib/local-ledger";
import { formatCurrency } from "@/lib/utils";
import type {
  AccountSummary,
  AccountTransaction,
  LocalLedgerSyncResult,
  PortfolioHistory,
  Position,
} from "@/types/account";
import { motion } from "framer-motion";
import { Package } from "lucide-react";

export default function MobilePortfolioPage() {
  const [account, setAccount] = useState<AccountSummary | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [transactions, setTransactions] = useState<AccountTransaction[]>([]);
  const [history, setHistory] = useState<PortfolioHistory[]>([]);
  const [ledgerStatus, setLedgerStatus] = useState<LocalLedgerSyncResult | null>(null);
  const [syncingLedger, setSyncingLedger] = useState(false);

  useEffect(() => {
    initializeAccount();
    const baseAccount = getAccount();
    const basePositions = getPositions();
    const baseTransactions = getTransactions();
    let nextAccount = baseAccount;
    let nextPositions = basePositions;
    let nextTransactions = baseTransactions;

    if (isDemoModeActive()) {
      ensureDemoTradeSeeded(); // 兜底：确保 demo 数据存在
      const overlay = getDemoAccountOverlay();
      const demoPositions = overlay.positions;

      // Merge positions
      const mergedPositions = [...basePositions];
      for (const dp of demoPositions) {
        const existing = mergedPositions.find((p) => p.stockCode === dp.stockCode);
        if (existing) {
          existing.quantity += dp.quantity;
          existing.availableQuantity += dp.availableQuantity;
          existing.marketValue += dp.marketValue;
          const totalQty = existing.quantity;
          existing.avgCost = totalQty > 0
            ? Number((((existing.avgCost * (totalQty - dp.quantity)) + (dp.avgCost * dp.quantity)) / totalQty).toFixed(2))
            : existing.avgCost;
          existing.unrealizedPnL += dp.unrealizedPnL;
          existing.todayPnL += dp.todayPnL;
        } else {
          mergedPositions.push(dp);
        }
      }

      const adjustedAccount = applyDemoAccountOverlay(baseAccount, overlay);
      nextAccount = adjustedAccount;
      nextPositions = mergedPositions;
      nextTransactions = [...getDemoTransactions(), ...baseTransactions];
    }

    const nextHistory = recordPortfolioSnapshot(nextAccount);
    setAccount(nextAccount);
    setPositions(nextPositions);
    setTransactions(nextTransactions);
    setHistory(nextHistory);
    void syncLocalLedgerSnapshot("mobile-portfolio-open").then(setLedgerStatus);
  }, []);

  const handleSyncLedger = async () => {
    setSyncingLedger(true);
    const result = await syncLocalLedgerSnapshot("mobile-manual-sync");
    setLedgerStatus(result);
    setHistory(getPortfolioHistory());
    setSyncingLedger(false);
  };

  const handleExportLedger = () => {
    downloadLocalLedgerBackup("mobile-export");
  };

  if (!account) {
    return (
      <MobileShell activeTab={3}>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
        </div>
      </MobileShell>
    );
  }

  const todayPnlColor =
    account.todayPnL > 0
      ? "text-up"
      : account.todayPnL < 0
      ? "text-down"
      : "text-[var(--text-secondary)]";

  return (
    <MobileShell activeTab={3}>
      {/* Compact Account Summary */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-4 mt-3 mb-2 p-5 rounded-2xl overflow-hidden relative page-enter"
        style={{
          background:
            "linear-gradient(135deg, rgba(212,165,116,0.12) 0%, rgba(255,255,255,0.04) 100%)",
          backdropFilter: "blur(24px) saturate(140%)",
          WebkitBackdropFilter: "blur(24px) saturate(140%)",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.08), 0 24px 80px rgba(0,0,0,0.42)",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 30% 20%, rgba(212,165,116,0.06), transparent 60%)",
          }}
        />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-[var(--text-muted)]">
              模拟总资产 (CNY)
            </span>
            <span className="text-[10px] text-[var(--text-muted)]">
              {positions.length} 只持仓
            </span>
          </div>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-xs text-[var(--text-secondary)]">¥</span>
            <span className="text-3xl font-bold text-[var(--text-primary)] font-mono-nums">
              {formatCurrency(account.totalAssets)}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div>
              <span className="text-[10px] text-[var(--text-muted)] block">
                今日盈亏
              </span>
              <span
                className={`text-sm font-semibold font-mono-nums ${todayPnlColor}`}
              >
                {account.todayPnL >= 0 ? "+" : ""}
                {formatCurrency(account.todayPnL)}
              </span>
            </div>
            <div className="w-px h-6 bg-[var(--border-subtle)]" />
            <div>
              <span className="text-[10px] text-[var(--text-muted)] block">
                可用资金
              </span>
              <span className="text-sm font-semibold text-[var(--text-primary)] font-mono-nums">
                ¥{formatCurrency(account.availableCash)}
              </span>
            </div>
            <div className="w-px h-6 bg-[var(--border-subtle)]" />
            <div>
              <span className="text-[10px] text-[var(--text-muted)] block">
                仓位
              </span>
              <span className="text-sm font-semibold text-[var(--text-primary)] font-mono-nums">
                {(account.positionRatio * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="px-4 pt-3 space-y-3">
        <PortfolioReplayCard
          account={account}
          history={history}
          transactions={transactions}
          compact
          delay={1}
        />
        <LocalLedgerCard
          status={ledgerStatus}
          syncing={syncingLedger}
          onSync={handleSyncLedger}
          onExport={handleExportLedger}
          delay={2}
        />
      </div>

      {/* Position List */}
      <div className="px-4 pt-3 pb-24">
        <div className="flex items-center gap-2 mb-3">
          <Package size={14} className="text-[var(--accent)]" />
          <span className="text-sm font-semibold text-[var(--text-primary)]">
            我的持仓
          </span>
        </div>

        {positions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex flex-col items-center justify-center py-16 gap-3"
          >
            <Package
              size={40}
              className="text-[var(--text-muted)] opacity-40"
            />
            <span className="text-sm text-[var(--text-muted)]">暂无持仓</span>
            <span className="text-xs text-[var(--text-muted)] opacity-60">
              下单交易后将在此显示持仓信息
            </span>
          </motion.div>
        ) : (
          <div className="space-y-2">
            {positions.map((pos, i) => (
              <PositionCard key={pos.stockCode} position={pos} index={i} />
            ))}
          </div>
        )}
      </div>
    </MobileShell>
  );
}
