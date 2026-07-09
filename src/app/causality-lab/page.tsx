"use client";

import { useMemo, useState } from "react";
import { runSentinelCore } from "@/lib/sentinel-core";
import DesktopShell from "@/components/layout/DesktopShell";
import GlassCard from "@/components/common/GlassCard";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  BarChart3,
  Layers,
  Wind,
  Newspaper,
  Briefcase,
  CheckSquare,
  ShieldAlert,
  Eye,
  ChevronRight,
  Activity,
} from "lucide-react";
import { useLocalSentinelAccount } from "@/hooks/use-local-sentinel-account";

// ─── Evidence Chain step definition ───
const EVIDENCE_STEPS = [
  { key: "marketFacts", label: "行情事实", icon: TrendingUp },
  { key: "structuralAttribution", label: "板块结构", icon: BarChart3 },
  { key: "marketStyleAttribution", label: "市场风格", icon: Wind },
  { key: "eventAttribution", label: "事件证据", icon: Newspaper },
  { key: "portfolioImpact", label: "持仓影响", icon: Briefcase },
  { key: "planCheck", label: "计划检查", icon: CheckSquare },
  { key: "riskNotes", label: "风险提示", icon: ShieldAlert },
] as const;

export default function CausalityLabPage() {
  const { causalityReports } = useMemo(() => runSentinelCore(), []);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const report = causalityReports[selectedIndex];

  // ─── Local Portfolio Sync ───
  const { snapshot, isHeld, heldCodes } = useLocalSentinelAccount();

  if (!report) {
    return (
      <DesktopShell>
        <div className="flex h-64 items-center justify-center">
          <p className="text-[var(--text-muted)]">暂无归因报告数据</p>
        </div>
      </DesktopShell>
    );
  }

  return (
    <DesktopShell>
      <div className="flex min-h-screen flex-col lg:flex-row">
        {/* ─── LEFT: Main Report Area ─── */}
        <div className="min-w-0 flex-1 p-4 md:p-6 lg:p-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--ai-violet-soft)]">
                <Activity size={18} className="text-[var(--ai-violet)]" />
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">
                  AI 归因解盘实验室
                </h1>
                <p className="text-xs text-[var(--text-muted)]">
                  Causality Lab — 分层归因 + 证据链
                </p>
              </div>
            </div>
          </motion.div>

          {/* Stock Tab Selector */}
          <div className="mb-6 flex flex-wrap gap-2">
            {causalityReports.map((r, i) => (
              <button
                key={r.code}
                onClick={() => setSelectedIndex(i)}
                className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                  i === selectedIndex
                    ? "bg-[var(--accent-soft)] text-[var(--accent)] ring-1 ring-[var(--accent)]/30"
                    : "bg-[var(--surface-1)] text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]"
                }`}
              >
                <span className="font-mono-nums">{r.code}</span>
                <span className="ml-2">{r.name}</span>
              </button>
            ))}
          </div>

          {/* Report Detail */}
          <AnimatePresence mode="wait">
            <motion.div
              key={report.code}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* ─── 一句话总结 ─── */}
              <GlassCard tilt={false} glow={false}>
                <div className="p-4 md:p-5">
                  <p className="text-lg font-semibold leading-relaxed text-[var(--accent)]">
                    {report.oneLineSummary}
                  </p>
                </div>
              </GlassCard>

              {/* ─── 行情事实层 ─── */}
              <GlassCard tilt={false} glow={false}>
                <div className="p-4 md:p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <TrendingUp size={16} className="text-[var(--ai-cyan)]" />
                    <h3 className="text-sm font-semibold text-[var(--ai-cyan)]">
                      行情事实层
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {report.marketFacts.map((fact, i) => (
                      <span
                        key={i}
                        className="rounded-lg bg-[var(--surface-2)] px-3 py-1.5 text-xs text-[var(--text-secondary)]"
                      >
                        {fact}
                      </span>
                    ))}
                  </div>
                </div>
              </GlassCard>

              {/* ─── 浅层归因层 ─── */}
              <GlassCard tilt={false} glow={false}>
                <div className="p-4 md:p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <Layers size={16} className="text-[var(--ai-cyan)]" />
                    <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                      浅层归因层
                    </h3>
                  </div>
                  <ul className="space-y-1.5">
                    {report.shallowAttribution.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-[var(--text-secondary)]"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </GlassCard>

              {/* ─── 结构归因层 ─── */}
              <GlassCard tilt={false} glow={false}>
                <div className="p-4 md:p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <BarChart3 size={16} className="text-[var(--ai-violet)]" />
                    <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                      结构归因层
                    </h3>
                  </div>
                  <ul className="space-y-1.5">
                    {report.structuralAttribution.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-[var(--text-secondary)]"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--ai-violet)]" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </GlassCard>

              {/* ─── 市场风格归因层 ─── */}
              <GlassCard tilt={false} glow={false}>
                <div className="p-4 md:p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <Wind size={16} className="text-[var(--ai-warning)]" />
                    <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                      市场风格归因层
                    </h3>
                  </div>
                  <ul className="space-y-1.5">
                    {report.marketStyleAttribution.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-[var(--text-secondary)]"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--ai-warning)]" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </GlassCard>

              {/* ─── 事件 / 政策 / 公司归因层 ─── */}
              <GlassCard tilt={false} glow={false}>
                <div className="p-4 md:p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <Newspaper size={16} className="text-[var(--ai-green)]" />
                    <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                      事件 / 政策 / 公司归因层
                    </h3>
                  </div>
                  <ul className="space-y-1.5">
                    {report.eventAttribution.map((item, i) => {
                      const isNoData = item.includes(
                        "当前系统未接入可验证实时公告"
                      );
                      return (
                        <li
                          key={i}
                          className={`flex items-start gap-2 text-sm ${
                            isNoData
                              ? "italic text-[var(--text-muted)]"
                              : "text-[var(--text-secondary)]"
                          }`}
                        >
                          <span
                            className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                              isNoData
                                ? "bg-[var(--text-muted)]"
                                : "bg-[var(--ai-green)]"
                            }`}
                          />
                          {item}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </GlassCard>

              {/* ─── 用户持仓影响层 ─── */}
              <GlassCard tilt={false} glow={false}>
                <div className="p-4 md:p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <Briefcase size={16} className="text-[var(--up)]" />
                    <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                      用户持仓影响层
                    </h3>
                  </div>
                  <ul className="space-y-1.5">
                    {report.portfolioImpact.map((item, i) => {
                      const isNotHeld = item.includes("不是用户模拟持仓");
                      return (
                        <li
                          key={i}
                          className={`flex items-start gap-2 text-sm ${
                            isNotHeld
                              ? "text-[var(--text-muted)]"
                              : "text-[var(--text-secondary)]"
                          }`}
                        >
                          <span
                            className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                              isNotHeld ? "bg-[var(--text-muted)]" : "bg-[var(--up)]"
                            }`}
                          />
                          {item}
                        </li>
                      );
                    })}
                  </ul>
                  {isHeld(report.code) && snapshot && (
                    <div className="mt-2 rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-400/10 text-cyan-200 border border-cyan-400/30 mb-2">本地模拟持仓相关</span>
                      {(() => {
                        const pos = snapshot.positions.find(p => p.code === report.code);
                        if (!pos) return null;
                        return (
                          <div className="grid grid-cols-2 gap-2 text-xs text-[var(--text-secondary)]">
                            <div>数量: {pos.quantity} 股</div>
                            <div>成本: ¥{pos.costPrice.toFixed(2)}</div>
                            <div>现价: ¥{(pos.currentPrice ?? 0).toFixed(2)}</div>
                            <div>市值: ¥{((pos.marketValue ?? 0)).toLocaleString("zh-CN")}</div>
                            {pos.unrealizedPnl !== undefined && (
                              <div className="col-span-2">浮动盈亏: <span className={pos.unrealizedPnl >= 0 ? "text-[var(--up)]" : "text-[var(--down)]"}>¥{pos.unrealizedPnl.toLocaleString("zh-CN")} ({(pos.unrealizedPnlPct ?? 0).toFixed(2)}%)</span></div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </GlassCard>

              {/* ─── 交易计划检查层 ─── */}
              <GlassCard tilt={false} glow={false}>
                <div className="p-4 md:p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <CheckSquare size={16} className="text-[var(--ai-cyan)]" />
                    <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                      交易计划检查层
                    </h3>
                  </div>
                  <ul className="space-y-1.5">
                    {report.planCheck.map((item, i) => {
                      const isNoPlan = item.includes("当前未记录该标的的交易计划");
                      return (
                        <li
                          key={i}
                          className={`flex items-start gap-2 text-sm ${
                            isNoPlan
                              ? "text-[var(--text-muted)]"
                              : "text-[var(--text-secondary)]"
                          }`}
                        >
                          <span
                            className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                              isNoPlan
                                ? "bg-[var(--text-muted)]"
                                : "bg-[var(--ai-cyan)]"
                            }`}
                          />
                          {item}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </GlassCard>

              {/* ─── 风险提示层 ─── */}
              <GlassCard
                tilt={false}
                glow={false}
                className="border-[var(--ai-danger)]/30"
              >
                <div className="p-4 md:p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <ShieldAlert size={16} className="text-[var(--ai-danger)]" />
                    <h3 className="text-sm font-semibold text-[var(--ai-danger)]">
                      风险提示层
                    </h3>
                  </div>
                  <ul className="space-y-1.5">
                    {report.riskNotes.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-[var(--text-secondary)]"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--ai-danger)]" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </GlassCard>

              {/* ─── 后续观察指标 ─── */}
              <GlassCard tilt={false} glow={false}>
                <div className="p-4 md:p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <Eye size={16} className="text-[var(--accent)]" />
                    <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                      后续观察指标
                    </h3>
                  </div>
                  <ol className="space-y-1.5">
                    {report.observationPoints.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-[var(--text-secondary)]"
                      >
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--surface-2)] text-xs text-[var(--text-muted)]">
                          {i + 1}
                        </span>
                        {item}
                      </li>
                    ))}
                  </ol>
                </div>
              </GlassCard>
            </motion.div>
          </AnimatePresence>

          {/* Compliance Disclaimer */}
          <div className="mt-8 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-1)] px-4 py-3 text-center text-xs text-[var(--text-muted)]">
            本内容仅用于模拟实盘、市场观察和学习演示，不构成投资建议。
          </div>

          {/* ─── 本地持仓未覆盖提示 ─── */}
          {heldCodes.filter(c => !causalityReports.some(r => r.code === c)).length > 0 && (
            <div className="text-xs text-[var(--text-muted)] mt-2">部分本地持仓暂不在内置 demo 解盘池中，可在 Watch Tower 中添加规则继续观察。</div>
          )}
        </div>

        {/* ─── RIGHT: Evidence Chain Sidebar ─── */}
        <aside className="hidden w-64 shrink-0 border-l border-[var(--border-subtle)] bg-[var(--surface-1)]/50 p-4 lg:block xl:w-72">
          <div className="sticky top-8">
            <h3 className="mb-5 flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
              <Activity size={16} className="text-[var(--ai-violet)]" />
              证据链
            </h3>

            <div className="relative space-y-0">
              {EVIDENCE_STEPS.map((step, i) => {
                const Icon = step.icon;
                const data =
                  report[step.key as keyof typeof report];
                const hasData =
                  Array.isArray(data) && data.length > 0;
                const isLast = i === EVIDENCE_STEPS.length - 1;

                return (
                  <div key={step.key} className="relative flex gap-3">
                    {/* Vertical connector line */}
                    {!isLast && (
                      <div className="absolute left-[11px] top-8 bottom-0 w-px bg-[var(--border-subtle)]" />
                    )}

                    {/* Dot */}
                    <div
                      className={`relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                        hasData
                          ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                          : "border-[var(--border-default)] bg-[var(--surface-1)]"
                      }`}
                    >
                      <Icon
                        size={12}
                        className={
                          hasData
                            ? "text-[var(--accent)]"
                            : "text-[var(--text-muted)]"
                        }
                      />
                    </div>

                    {/* Label */}
                    <div className="pb-5 pt-0.5">
                      <span
                        className={`text-xs font-medium ${
                          hasData
                            ? "text-[var(--text-primary)]"
                            : "text-[var(--text-muted)]"
                        }`}
                      >
                        {step.label}
                      </span>
                      {hasData && (
                        <span className="ml-2 rounded-full bg-[var(--accent-soft)] px-1.5 py-0.5 text-[10px] text-[var(--accent)]">
                          {data.length}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Link direction indicator */}
            <div className="mt-6 rounded-lg bg-[var(--surface-2)] p-3">
              <div className="mb-2 flex items-center gap-1 text-[10px] text-[var(--text-muted)]">
                <span className="rounded bg-[var(--accent-soft)] px-1.5 py-0.5 text-[var(--accent)]">
                  行情事实
                </span>
                <ChevronRight size={10} />
                <span>板块结构</span>
                <ChevronRight size={10} />
                <span>市场风格</span>
                <ChevronRight size={10} />
                <span>事件证据</span>
                <ChevronRight size={10} />
                <span>持仓影响</span>
                <ChevronRight size={10} />
                <span>计划检查</span>
                <ChevronRight size={10} />
                <span>风险提示</span>
              </div>
              <p className="text-[10px] leading-relaxed text-[var(--text-muted)]">
                从行情事实出发，逐层向上归因，最终影响持仓决策与风险判断。
              </p>
            </div>
          </div>
        </aside>

        {/* ─── Mobile: Evidence Chain (below) ─── */}
        <div className="border-t border-[var(--border-subtle)] px-4 py-5 lg:hidden">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
            <Activity size={16} className="text-[var(--ai-violet)]" />
            证据链
          </h3>
          <div className="flex items-center gap-1 overflow-x-auto pb-2 no-scrollbar">
            {EVIDENCE_STEPS.map((step, i) => {
              const Icon = step.icon;
              const data =
                report[step.key as keyof typeof report];
              const hasData = Array.isArray(data) && data.length > 0;
              const isLast = i === EVIDENCE_STEPS.length - 1;

              return (
                <div key={step.key} className="flex shrink-0 items-center gap-1">
                  <div
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs ${
                      hasData
                        ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                        : "bg-[var(--surface-1)] text-[var(--text-muted)]"
                    }`}
                  >
                    <Icon size={12} />
                    <span className="font-medium">{step.label}</span>
                  </div>
                  {!isLast && (
                    <ChevronRight size={12} className="text-[var(--text-muted)]" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DesktopShell>
  );
}
