"use client";

import { useEffect, useState } from "react";
import DesktopShell from "@/components/layout/DesktopShell";
import AccountOverviewCard from "@/components/portfolio/AccountOverviewCard";
import PositionTable from "@/components/portfolio/PositionTable";
import AssetAllocation from "@/components/portfolio/AssetAllocation";
import PortfolioMiniChart from "@/components/portfolio/PortfolioMiniChart";
import TransactionList from "@/components/portfolio/TransactionList";
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
import type {
  AccountSummary,
  Position,
  AccountTransaction,
  PortfolioHistory,
  LocalLedgerSyncResult,
} from "@/types/account";
import { Briefcase } from "lucide-react";
import { motion } from "framer-motion";

export default function PortfolioPage() {
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

      // Merge positions: if demo stockCode already exists, merge quantity; otherwise add
      const mergedPositions = [...basePositions];
      for (const dp of demoPositions) {
        const existing = mergedPositions.find((p) => p.stockCode === dp.stockCode);
        if (existing) {
          existing.quantity += dp.quantity;
          existing.availableQuantity += dp.availableQuantity;
          existing.marketValue += dp.marketValue;
          // Recalculate avg cost based on weighted average
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

      // Merge transactions: demo txs first
      const demoTxs = getDemoTransactions();
      const mergedTxs = [...demoTxs, ...baseTransactions];

      // Apply overlay to account
      const adjustedAccount = applyDemoAccountOverlay(baseAccount, overlay);

      nextAccount = adjustedAccount;
      nextPositions = mergedPositions;
      nextTransactions = mergedTxs;
    }

    const nextHistory = recordPortfolioSnapshot(nextAccount);
    setAccount(nextAccount);
    setPositions(nextPositions);
    setTransactions(nextTransactions);
    setHistory(nextHistory);
    void syncLocalLedgerSnapshot("portfolio-open").then(setLedgerStatus);
  }, []);

  const handleSyncLedger = async () => {
    setSyncingLedger(true);
    const result = await syncLocalLedgerSnapshot("manual-sync");
    setLedgerStatus(result);
    setHistory(getPortfolioHistory());
    setSyncingLedger(false);
  };

  const handleExportLedger = () => {
    downloadLocalLedgerBackup("manual-export");
  };

  if (!account) {
    return (
      <DesktopShell>
        <div className="flex items-center justify-center h-screen">
          <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
        </div>
      </DesktopShell>
    );
  }

  return (
    <DesktopShell>
      <div className="p-4 md:p-6 pb-20 md:pb-6 space-y-4 md:space-y-5 max-w-7xl mx-auto page-enter">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-3"
        >
          <Briefcase size={20} className="text-[var(--accent)]" />
          <h1 className="text-lg font-semibold text-[var(--text-primary)]">
            持仓中心
          </h1>
          <span className="text-sm text-[var(--text-muted)]">
            共 {positions.length} 只持仓
          </span>
        </motion.div>

        {/* Account Overview */}
        <AccountOverviewCard account={account} delay={0} />

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_360px]">
          <PortfolioReplayCard
            account={account}
            history={history}
            transactions={transactions}
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

        {/* Main: Position Table + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
          {/* Position Table */}
          <PositionTable positions={positions} delay={1} />

          {/* Sidebar */}
          <div className="space-y-5">
            <PortfolioMiniChart history={history} delay={2} />
            <AssetAllocation
              account={account}
              positions={positions}
              delay={3}
            />
          </div>
        </div>

        {/* Transaction List */}
        <TransactionList transactions={transactions} delay={4} />

        {/* Disclaimer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-[10px] text-[var(--text-muted)] leading-relaxed opacity-50 pb-4"
        >
          本系统为模拟交易平台，所有数据均为虚拟数据，不涉及真实资金和证券。投资有风险，入市需谨慎。
        </motion.p>
      </div>
    </DesktopShell>
  );
}
