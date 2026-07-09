"use client";

import { useEffect, useMemo, useState } from "react";
import DesktopShell from "@/components/layout/DesktopShell";
import IndexTicker from "@/components/market/IndexTicker";
import HotSectorGrid from "@/components/market/HotSectorGrid";
import MarketOverview from "@/components/market/MarketOverview";
import RankingList from "@/components/market/RankingList";
import Watchlist from "@/components/market/Watchlist";
import MarketPulse from "@/components/market/MarketPulse";
import MetricCard from "@/components/common/MetricCard";
import { parseAmountYi, useMarketSnapshot } from "@/hooks/useMarketSnapshot";
import { Layers } from "lucide-react";
import {
  initializeAccount,
  getAccount,
} from "@/lib/account-storage";
import type { AccountSummary } from "@/types/account";

const DEFAULT_ACCOUNT: AccountSummary = {
  totalAssets: 1_000_000,
  availableCash: 1_000_000,
  marketValue: 0,
  totalPnL: 0,
  todayPnL: 0,
  riskLevel: "low",
  positionRatio: 0,
  updatedAt: new Date().toISOString(),
};

export default function DesktopHomePage() {
  const { quotes } = useMarketSnapshot();
  const topGainers = useMemo(
    () => [...quotes].sort((a, b) => b.changePercent - a.changePercent).slice(0, 8),
    [quotes]
  );
  const topByTurnover = useMemo(
    () => [...quotes].sort((a, b) => parseAmountYi(b.turnover) - parseAmountYi(a.turnover)).slice(0, 8),
    [quotes]
  );
  const [account, setAccount] = useState<AccountSummary>(DEFAULT_ACCOUNT);

  useEffect(() => {
    initializeAccount();
    const stored = getAccount();
    setAccount(stored);
  }, []);

  const todayPnlPercent =
    account.totalAssets > 0 && account.todayPnL !== 0
      ? (account.todayPnL / (account.totalAssets - account.todayPnL)) * 100
      : 0;

  return (
    <DesktopShell>
      {/* Top Index Ticker */}
      <IndexTicker />

      {/* Main Content */}
      <div className="p-4 md:p-6 pb-20 md:pb-6 space-y-4 md:space-y-6 page-enter">
        {/* Account & Market Summary Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard
            label="模拟总资产"
            value={account.totalAssets}
            prefix="¥"
            change={Number(todayPnlPercent.toFixed(2))}
            delay={0}
          />
          <MetricCard
            label="今日盈亏"
            value={account.todayPnL}
            prefix="¥"
            suffix=""
            change={Number(todayPnlPercent.toFixed(2))}
            delay={1}
          />
          <MetricCard
            label="持仓市值"
            value={account.marketValue}
            prefix="¥"
            delay={2}
          />
          <MetricCard
            label="可用资金"
            value={account.availableCash}
            prefix="¥"
            delay={3}
          />
        </div>

        <MarketPulse />

        {/* Section Header: Hot Sectors */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers size={18} className="text-[var(--accent)]" />
            <h2 className="text-base font-semibold text-[var(--text-primary)]">
              热门板块
            </h2>
            <span className="text-xs text-[var(--text-muted)]">
              实时更新
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
            <div className="w-1.5 h-1.5 rounded-full bg-up pulse-dot" />
            盘中 · 交易中
          </div>
        </div>

        {/* Hot Sector Grid */}
        <HotSectorGrid />

        {/* Bottom Section: Rankings + Sentiment + Watchlist */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Market Sentiment */}
          <div className="md:col-span-3">
            <MarketOverview />
          </div>

          {/* Top Gainers */}
          <div className="md:col-span-3">
            <RankingList
              title="涨幅榜"
              stocks={topGainers}
              valueKey="changePercent"
              delay={5}
            />
          </div>

          {/* Top by Turnover */}
          <div className="md:col-span-3">
            <RankingList
              title="成交额榜"
              stocks={topByTurnover}
              valueKey="turnover"
              delay={6}
            />
          </div>

          {/* Watchlist */}
          <div className="md:col-span-3">
            <Watchlist delay={7} />
          </div>
        </div>
      </div>
    </DesktopShell>
  );
}
