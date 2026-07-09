"use client";

import { useMemo } from "react";
import {
  runSentinelCore,
  type Alert,
  type AlertLevel,
} from "@/lib/sentinel-core";
import { useLocalSentinelAccount } from "@/hooks/use-local-sentinel-account";

const DISCLAIMER = "本页面仅用于模拟实盘、市场观察和学习演示，不构成投资建议。";

function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

function cleanText(text: string): string {
  return text
    .replace(/\u4e70\u5165/g, "模拟开仓")
    .replace(/\u5356\u51fa/g, "模拟减仓")
    .replace(/\u6ee1\u4ed3/g, "高仓位")
    .replace(/\u6e05\u4ed3/g, "降低风险暴露")
    .replace(/\u5fc5\u6da8/g, "存在走强可能但需验证")
    .replace(/\u5fc5\u8dcc/g, "存在走弱风险但需验证")
    .replace(/\u7a33\u8d5a/g, "收益不确定")
    .replace(/\u4fdd\u8bc1\u6536\u76ca/g, "不保证收益")
    .replace(/\u5185\u5e55\u6d88\u606f/g, "未经验证信息")
    .replace(/\u786e\u5b9a\u4e0a\u6da8/g, "可能走强但需验证")
    .replace(/\u786e\u5b9a\u4e0b\u8dcc/g, "可能走弱但需验证")
    .replace(/\u76ee\u6807\u4ef7\u627f\u8bfa/g, "观察价位");
}

function alertTone(level: AlertLevel): string {
  const map: Record<AlertLevel, string> = {
    Low: "border-slate-400/20 bg-slate-400/10 text-slate-200",
    Medium: "border-amber-400/30 bg-amber-400/10 text-amber-200",
    High: "border-orange-400/30 bg-orange-400/10 text-orange-200",
    Risk: "border-red-400/40 bg-red-500/10 text-red-200",
  };
  return map[level];
}

function parseReviewSections(text: string): Array<{ title: string; body: string }> {
  const normalized = cleanText(text);
  return normalized
    .split(/(?=【)/g)
    .map(chunk => chunk.trim())
    .filter(Boolean)
    .map(chunk => {
      const closeIndex = chunk.indexOf("】");
      if (closeIndex === -1) return { title: "Review", body: chunk };
      return { title: chunk.slice(1, closeIndex), body: chunk.slice(closeIndex + 1).trim() };
    });
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <section className={cn("rounded-3xl border border-white/10 bg-slate-950/70 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl", className)}>{children}</section>;
}

function MetricCard({ label, value, hint, tone = "default" }: { label: string; value: string | number; hint?: string; tone?: "default" | "green" | "amber" | "red" | "cyan" }) {
  const toneClass = { default: "text-slate-50", green: "text-emerald-300", amber: "text-amber-300", red: "text-red-300", cyan: "text-cyan-300" }[tone];
  return <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"><div className="text-xs uppercase tracking-[0.22em] text-slate-500">{label}</div><div className={cn("mt-2 text-2xl font-semibold", toneClass)}>{value}</div>{hint ? <div className="mt-2 text-xs leading-5 text-slate-400">{hint}</div> : null}</div>;
}

function SectionTitle({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return <div className="mb-5">{eyebrow ? <div className="mb-2 text-xs font-semibold uppercase tracking-[0.26em] text-cyan-300">{eyebrow}</div> : null}<h2 className="text-xl font-semibold text-slate-50">{title}</h2>{description ? <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p> : null}</div>;
}

function AlertBadge({ level }: { level: AlertLevel }) {
  return <span className={cn("inline-flex rounded-full border px-3 py-1 text-xs font-semibold", alertTone(level))}>{level}</span>;
}

function SummaryList({ items }: { items: string[] }) {
  return <div className="space-y-2">{items.map(item => <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-sm leading-6 text-slate-300">{cleanText(item)}</div>)}</div>;
}

function PriorityAlertCard({ alert }: { alert: Alert }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><div className="flex flex-wrap items-center gap-2"><AlertBadge level={alert.level} /><span className="text-sm text-slate-400">{alert.code}</span><h3 className="text-base font-semibold text-slate-50">{alert.name}</h3></div><p className="mt-2 text-sm leading-6 text-slate-300">{cleanText(alert.title)}</p></div>
        <div className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-sm font-semibold text-cyan-200">Score {alert.score}</div>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div><div className="mb-2 text-xs uppercase tracking-[0.2em] text-slate-500">AI Explanation</div><p className="text-sm leading-6 text-slate-300">{cleanText(alert.aiExplanation)}</p></div>
        <div><div className="mb-2 text-xs uppercase tracking-[0.2em] text-slate-500">Risk Note</div><p className="text-sm leading-6 text-slate-300">{cleanText(alert.riskNote)}</p></div>
        <div><div className="mb-2 text-xs uppercase tracking-[0.2em] text-slate-500">Observation</div><ul className="space-y-1 text-sm text-slate-300">{alert.observationPoints.map(point => <li key={point} className="leading-5">• {cleanText(point)}</li>)}</ul></div>
      </div>
    </div>
  );
}

function ReviewSectionCard({ title, body }: { title: string; body: string }) {
  return <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"><div className="mb-2 text-sm font-semibold text-cyan-200">{title}</div><p className="text-sm leading-7 text-slate-300">{cleanText(body)}</p></div>;
}

export default function TradingJournalPage() {
  const sentinel = useMemo(() => runSentinelCore(), []);
  const { journal, alerts, risk, marketRadar } = sentinel;
  const reviewSections = parseReviewSections(journal.reviewText);

  // ─── Local Portfolio Sync ───
  const { snapshot, hasLocalPortfolio } = useLocalSentinelAccount();

  return (
    <main className="min-h-screen bg-[#070A12] px-6 py-8 text-slate-100">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-950 via-slate-950 to-violet-950/30 p-8 shadow-[0_24px_120px_rgba(76,29,149,0.24)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.16),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(56,189,248,0.12),transparent_28%)]" />
          <div className="relative">
            <div className="mb-3 text-xs font-semibold uppercase tracking-[0.32em] text-violet-300">Trading Journal</div>
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div><h1 className="text-4xl font-semibold tracking-tight text-white">AI 盘后复盘</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">将账户表现、市场环境、提醒质量、模拟交易、风险变化和交易计划执行情况沉淀为可复盘的投资日志。</p></div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4"><div className="text-xs uppercase tracking-[0.22em] text-slate-500">Review Date</div><div className="mt-2 text-2xl font-semibold text-slate-50">{journal.date}</div></div>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <MetricCard label="提醒总数" value={alerts.length} tone="cyan" />
          <MetricCard label="高优先级" value={journal.highPriorityAlerts.length} tone="amber" />
          <MetricCard label="有效提醒" value={journal.effectiveAlerts.length} tone="green" />
          <MetricCard label="风险等级" value={risk.overallRiskLevel} tone={risk.overallRiskLevel === "Low" ? "green" : "red"} />
          <MetricCard label="市场状态" value={marketRadar.marketRegime} />
          <MetricCard label="市场温度" value={marketRadar.marketTemperature} hint="Market Radar 输出" />
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <SectionTitle eyebrow="Account Review" title="今日账户表现" description="来自模拟账户资产、现金、持仓市值和盈亏数据。" />
            <SummaryList items={journal.accountSummary} />
            {hasLocalPortfolio && (
              <div className="mt-4 pt-3 border-t border-[var(--border-subtle)]">
                <div className="text-[10px] uppercase tracking-[0.2em] text-cyan-300 mb-2">Local Paper Account</div>
                <div className="space-y-1 text-xs text-[var(--text-secondary)]">
                  <div>本地持仓 {snapshot?.positions.length} 只 | 市值 ¥{(snapshot?.positionMarketValue ?? 0).toLocaleString("zh-CN")}</div>
                  {snapshot?.cash !== undefined && <div>现金 ¥{snapshot.cash.toLocaleString("zh-CN")} | 总资产 ¥{(snapshot.totalAsset ?? 0).toLocaleString("zh-CN")}</div>}
                  <div>更新于 {new Date(snapshot?.updatedAt || "").toLocaleTimeString("zh-CN")}</div>
                </div>
              </div>
            )}
          </Card>
          <Card><SectionTitle eyebrow="Market Context" title="今日市场环境" description="来自 Market Radar 的市场状态、市场温度和主线风格。" /><SummaryList items={journal.marketSummary} /></Card>
        </div>

        <Card>
          <SectionTitle eyebrow="Alert Review" title="今日提醒复盘" description="重点查看 High / Risk 级别提醒、持仓相关提醒和计划偏离提醒。" />
          <div className="mb-5 grid gap-4 md:grid-cols-4">{journal.alertSummary.map(item => <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-slate-300">{cleanText(item)}</div>)}</div>
          <div className="space-y-4">{journal.highPriorityAlerts.length > 0 ? journal.highPriorityAlerts.map(alert => <PriorityAlertCard key={alert.id} alert={alert} />) : <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-sm text-slate-400">今日暂无 High / Risk 级别提醒。</div>}</div>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card><SectionTitle eyebrow="Paper Trading Review" title="模拟交易回顾" description="基于模拟成交记录生成，不连接真实券商账户。" /><SummaryList items={journal.tradeSummary} /></Card>
          <Card><SectionTitle eyebrow="Risk Change" title="持仓风险变化" description="来自 Risk Shield 的风险等级、风险项和组合风险分数。" /><SummaryList items={journal.riskSummary} /></Card>
        </div>

        <Card><SectionTitle eyebrow="Next-day Watchlist" title="明日观察清单" description="由高优先级提醒、高风险持仓和当前组合风险共同生成。" /><div className="flex flex-wrap gap-3">{journal.nextDayWatchlist.length > 0 ? journal.nextDayWatchlist.map(item => <span key={item} className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm font-medium text-cyan-100">{item}</span>) : <span className="text-sm text-slate-500">暂无重点观察标的。</span>}</div></Card>

        <Card><SectionTitle eyebrow="AI Review" title="AI 盘后总结" description="按账户表现、市场环境、提醒质量、模拟交易、风险变化和规则优化分段展示。" /><div className="grid gap-4 lg:grid-cols-2">{reviewSections.map(section => <ReviewSectionCard key={`${section.title}-${section.body.slice(0, 16)}`} title={section.title} body={section.body} />)}</div></Card>

        <div className="rounded-3xl border border-amber-300/20 bg-amber-300/10 p-5 text-sm leading-6 text-amber-100">{DISCLAIMER}</div>
      </div>
    </main>
  );
}
