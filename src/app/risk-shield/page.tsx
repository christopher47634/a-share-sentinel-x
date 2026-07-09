"use client";

import { useMemo } from "react";
import {
  runSentinelCore,
  type Alert,
  type AlertLevel,
  type RiskItem,
  type RiskLevel,
} from "@/lib/sentinel-core";
import { useLocalSentinelAccount } from "@/hooks/use-local-sentinel-account";

const DISCLAIMER = "本页面仅用于模拟实盘、市场观察和学习演示，不构成投资建议。";

function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

function riskTone(level: RiskLevel): string {
  const map: Record<RiskLevel, string> = {
    Low: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
    Medium: "border-amber-400/30 bg-amber-400/10 text-amber-200",
    High: "border-orange-400/30 bg-orange-400/10 text-orange-200",
    Critical: "border-red-400/40 bg-red-500/10 text-red-200",
  };
  return map[level];
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

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-3xl border border-white/10 bg-slate-950/70 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl", className)}>
      {children}
    </section>
  );
}

function MetricCard({ label, value, hint, tone = "default" }: { label: string; value: string | number; hint?: string; tone?: "default" | "green" | "amber" | "red" | "cyan" }) {
  const toneClass = { default: "text-slate-50", green: "text-emerald-300", amber: "text-amber-300", red: "text-red-300", cyan: "text-cyan-300" }[tone];
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="text-xs uppercase tracking-[0.22em] text-slate-500">{label}</div>
      <div className={cn("mt-2 text-2xl font-semibold", toneClass)}>{value}</div>
      {hint ? <div className="mt-2 text-xs leading-5 text-slate-400">{hint}</div> : null}
    </div>
  );
}

function SectionTitle({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return (
    <div className="mb-5">
      {eyebrow ? <div className="mb-2 text-xs font-semibold uppercase tracking-[0.26em] text-cyan-300">{eyebrow}</div> : null}
      <h2 className="text-xl font-semibold text-slate-50">{title}</h2>
      {description ? <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p> : null}
    </div>
  );
}

function RiskBadge({ level }: { level: RiskLevel }) {
  return <span className={cn("inline-flex rounded-full border px-3 py-1 text-xs font-semibold", riskTone(level))}>{level}</span>;
}

function AlertBadge({ level }: { level: AlertLevel }) {
  return <span className={cn("inline-flex rounded-full border px-3 py-1 text-xs font-semibold", alertTone(level))}>{level}</span>;
}

function RiskScoreBar({ score, level }: { score: number; level: RiskLevel }) {
  return (
    <div>
      <div className="mb-3 flex items-end justify-between">
        <div>
          <div className="text-sm text-slate-400">Risk Score</div>
          <div className="mt-1 text-5xl font-semibold text-slate-50">{score}</div>
        </div>
        <RiskBadge level={level} />
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-800">
        <div className={cn("h-full rounded-full transition-all", level === "Low" && "bg-emerald-400", level === "Medium" && "bg-amber-400", level === "High" && "bg-orange-400", level === "Critical" && "bg-red-500")} style={{ width: `${Math.min(Math.max(score, 0), 100)}%` }} />
      </div>
      <div className="mt-3 grid grid-cols-4 gap-2 text-[11px] text-slate-500">
        <span>Low</span><span>Medium</span><span>High</span><span className="text-right">Critical</span>
      </div>
    </div>
  );
}

function RiskItemCard({ item }: { item: RiskItem }) {
  return (
    <div className={cn("rounded-2xl border p-4", item.level === "Critical" && "border-red-400/40 bg-red-500/10", item.level === "High" && "border-orange-400/30 bg-orange-400/10", item.level === "Medium" && "border-amber-400/30 bg-amber-400/10", item.level === "Low" && "border-emerald-400/25 bg-emerald-400/10")}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2"><RiskBadge level={item.level} /><h3 className="text-base font-semibold text-slate-50">{item.title}</h3></div>
          <p className="mt-3 text-sm leading-6 text-slate-300">{item.reason}</p>
        </div>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <div><div className="mb-2 text-xs uppercase tracking-[0.2em] text-slate-500">Affected Positions</div><div className="flex flex-wrap gap-2">{item.affectedPositions.length > 0 ? item.affectedPositions.map(p => <span key={p} className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-slate-300">{p}</span>) : <span className="text-sm text-slate-500">暂无直接关联标的</span>}</div></div>
        <div><div className="mb-2 text-xs uppercase tracking-[0.2em] text-slate-500">Evidence</div><ul className="space-y-1 text-sm text-slate-300">{item.evidence.map(e => <li key={e} className="leading-5">• {e}</li>)}</ul></div>
        <div><div className="mb-2 text-xs uppercase tracking-[0.2em] text-slate-500">Observation</div><ul className="space-y-1 text-sm text-slate-300">{item.observationPoints.map(p => <li key={p} className="leading-5">• {p}</li>)}</ul></div>
      </div>
    </div>
  );
}

function AlertRiskCard({ alert }: { alert: Alert }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2"><AlertBadge level={alert.level} /><span className="text-sm text-slate-400">{alert.code}</span><h3 className="text-base font-semibold text-slate-50">{alert.name}</h3></div>
          <p className="mt-2 text-sm leading-6 text-slate-300">{alert.title}</p>
        </div>
        <div className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-sm font-semibold text-cyan-200">Score {alert.score}</div>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-300">{alert.riskNote}</p>
    </div>
  );
}

export default function RiskShieldPage() {
  const sentinel = useMemo(() => runSentinelCore(), []);
  const { risk, alerts, marketRadar } = sentinel;
  const riskAlerts = alerts.filter(a => a.level === "Risk");
  const highAlerts = alerts.filter(a => a.level === "High");
  const planAlerts = alerts.filter(a => a.relatedToPlan);
  const positionAlerts = alerts.filter(a => a.relatedToPosition);

  // ─── Local Portfolio Sync ───
  const { snapshot, hasLocalPortfolio } = useLocalSentinelAccount();

  return (
    <main className="min-h-screen bg-[#070A12] px-6 py-8 text-slate-100">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-950 via-slate-950 to-cyan-950/30 p-8 shadow-[0_24px_120px_rgba(8,47,73,0.28)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.16),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(245,158,11,0.12),transparent_28%)]" />
          <div className="relative">
            <div className="mb-3 text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300">Risk Shield</div>
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div><h1 className="text-4xl font-semibold tracking-tight text-white">风险护盾</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">从模拟账户、持仓集中度、市场状态、AI 盯盘提醒和交易计划偏离中识别组合风险，帮助用户理解“风险来自哪里”。</p></div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4"><div className="text-xs uppercase tracking-[0.22em] text-slate-500">Current Risk</div><div className="mt-2 flex items-center gap-3"><RiskBadge level={risk.overallRiskLevel} /><span className="text-2xl font-semibold text-slate-50">{risk.riskScore}/100</span></div></div>
            </div>
          </div>
        </header>

        {hasLocalPortfolio && (
          <div className="glass p-4 rounded-2xl">
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-primary)] mb-3">Local Portfolio Exposure</h3>
            <div className="grid grid-cols-3 gap-3">
              <div><div className="text-[10px] text-[var(--text-muted)]">持仓数</div><div className="font-mono-nums text-sm text-[var(--text-primary)]">{snapshot?.positions.length}</div></div>
              <div><div className="text-[10px] text-[var(--text-muted)]">持仓市值</div><div className="font-mono-nums text-sm text-[var(--text-primary)]">¥{(snapshot?.positionMarketValue ?? 0).toLocaleString("zh-CN")}</div></div>
              <div><div className="text-[10px] text-[var(--text-muted)]">更新时间</div><div className="text-xs text-[var(--text-muted)]">{new Date(snapshot?.updatedAt || "").toLocaleTimeString("zh-CN")}</div></div>
            </div>
            <p className="text-[10px] text-[var(--text-muted)] mt-2">当前为本地模拟账户风险摘要，组合风险仍以 demo riskEngine 为主。</p>
          </div>
        )}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <MetricCard label="风险等级" value={risk.overallRiskLevel} tone={risk.overallRiskLevel === "Low" ? "green" : "red"} />
          <MetricCard label="风险分数" value={`${risk.riskScore}/100`} tone="amber" />
          <MetricCard label="风险项" value={risk.riskItems.length} hint="来自持仓、市场和提醒联动" />
          <MetricCard label="市场状态" value={marketRadar.marketRegime} tone="cyan" />
          <MetricCard label="市场温度" value={marketRadar.marketTemperature} hint="Market Radar 输出" />
          <MetricCard label="Risk / High" value={`${riskAlerts.length} / ${highAlerts.length}`} hint="提醒驱动风险" tone="red" />
        </section>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card><SectionTitle eyebrow="Risk Score" title="组合风险评分" description="风险分数来自集中度、市场状态、高风险持仓和计划偏离提醒。" /><RiskScoreBar score={risk.riskScore} level={risk.overallRiskLevel} /></Card>
          <Card><SectionTitle eyebrow="AI Risk Explanation" title="AI 风险解释" description="该解释只用于模拟账户观察，不形成交易动作。" /><p className="text-sm leading-7 text-slate-300">{risk.explanation}</p><div className="mt-5 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm leading-6 text-amber-100">{DISCLAIMER}</div></Card>
        </div>

        <Card><SectionTitle eyebrow="Risk Sources" title="风险来源列表" description="每个风险项都必须有影响持仓、证据数据和后续观察指标。" /><div className="space-y-4">{risk.riskItems.length > 0 ? risk.riskItems.map(item => <RiskItemCard key={item.id} item={item} />) : <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-5 text-sm text-emerald-100">当前未识别到明显组合风险项。</div>}</div></Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card><SectionTitle eyebrow="Observation Checklist" title="后续观察清单" description="系统只给出观察方向，不给出交易指令。" /><div className="space-y-3">{risk.observationPoints.map((point, i) => <div key={point} className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3"><div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-300/10 text-xs font-semibold text-cyan-200">{i + 1}</div><div className="text-sm leading-6 text-slate-300">{point}</div></div>)}</div></Card>
          <Card><SectionTitle eyebrow="Alert-driven Risk" title="提醒驱动风险" description="从 Risk、High、计划偏离和持仓相关提醒中提取风险线索。" /><div className="mb-5 grid grid-cols-2 gap-3"><MetricCard label="Risk Alerts" value={riskAlerts.length} tone="red" /><MetricCard label="High Alerts" value={highAlerts.length} tone="amber" /><MetricCard label="Plan Related" value={planAlerts.length} /><MetricCard label="Position Related" value={positionAlerts.length} tone="cyan" /></div><div className="space-y-3">{[...riskAlerts, ...highAlerts, ...planAlerts].filter((a, i, arr) => arr.findIndex(x => x.id === a.id) === i).slice(0, 5).map(a => <AlertRiskCard key={a.id} alert={a} />)}</div></Card>
        </div>
      </div>
    </main>
  );
}
