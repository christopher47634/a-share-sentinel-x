"use client";

import { useMemo } from "react";
import DesktopShell from "@/components/layout/DesktopShell";
import MetricCard from "@/components/common/MetricCard";
import GlassCard from "@/components/common/GlassCard";
import SentinelPulse from "@/components/ai/SentinelPulse";
import LiveIntelligenceFeed from "@/components/ai/LiveIntelligenceFeed";
import AgentStatusStrip from "@/components/ai/AgentStatusStrip";
import { getAgentStates } from "@/lib/agent-orchestrator";
import {
  runSentinelCore,
  generateSentinelDemoData,
} from "@/lib/sentinel-core";
import type { RiskLevel, AlertLevel } from "@/lib/sentinel-core";
import type { IntelligenceEvent, SentinelDimension, AgentStatus } from "@/types/agent";
import { motion } from "framer-motion";
import { useLocalSentinelAccount } from "@/hooks/use-local-sentinel-account";

function formatMoney(val: number): string {
  if (val >= 1e8) return (val / 1e8).toFixed(2) + " 亿";
  if (val >= 1e4) return (val / 1e4).toFixed(2) + " 万";
  return val.toFixed(2);
}

function getRiskBadge(risk: RiskLevel) {
  const colorMap: Record<RiskLevel, { bg: string; text: string; label: string }> = {
    Low: { bg: "rgba(34, 197, 94, 0.12)", text: "var(--ai-green)", label: "Low" },
    Medium: { bg: "rgba(245, 158, 11, 0.12)", text: "var(--ai-warning)", label: "Medium" },
    High: { bg: "rgba(239, 68, 68, 0.12)", text: "var(--ai-danger)", label: "High" },
    Critical: { bg: "rgba(239, 68, 68, 0.18)", text: "var(--ai-danger)", label: "Critical" },
  };
  return colorMap[risk] || colorMap.Medium;
}

function getAlertBadge(level: AlertLevel) {
  const map: Record<AlertLevel, { bg: string; text: string }> = {
    High: { bg: "rgba(239, 68, 68, 0.12)", text: "var(--ai-danger)" },
    Risk: { bg: "rgba(239, 68, 68, 0.18)", text: "var(--ai-danger)" },
    Medium: { bg: "rgba(245, 158, 11, 0.12)", text: "var(--ai-warning)" },
    Low: { bg: "rgba(34, 197, 94, 0.12)", text: "var(--ai-green)" },
  };
  return map[level] || map.Medium;
}

export default function CommandCenterPage() {
  // ─── Sentinel Core Engine ───
  const demoData = useMemo(() => generateSentinelDemoData(), []);
  const sentinel = useMemo(() => runSentinelCore(), []);
  const { marketRadar, signals, alerts, risk, causalityReports } = sentinel;
  const account = demoData.account;

  // ─── Local Portfolio Sync ───
  const { snapshot, hasLocalPortfolio } = useLocalSentinelAccount();

  const cumulativeReturn = account.totalReturnPct;
  const positionPercent = account.positions.length > 0
    ? account.positions.reduce((sum, p) => sum + p.positionRatio, 0) * 100
    : 0;
  const riskBadge = getRiskBadge(risk.overallRiskLevel);

  // Alert stats
  const riskHighCount = alerts.filter(
    (a) => a.level === "High" || a.level === "Risk"
  ).length;
  const topAlerts = [...alerts]
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const today = new Date();
  const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  // Stagger delay helper
  const staggerItem = (i: number) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: 0.4,
      delay: i * 0.06,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  });

  // ─── Intelligence Feed from Core ───
  const feedEvents = useMemo((): IntelligenceEvent[] => {
    const now = new Date();
    const ts = (offsetMin: number) => {
      const d = new Date(now.getTime() - offsetMin * 60_000);
      return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    };

    return [
      {
        id: "core-data",
        timestamp: ts(0),
        agent: "data",
        message: "Sentinel Core 数据引擎已启动，市场快照加载完成",
        level: "success",
      },
      {
        id: "core-market",
        timestamp: ts(0.5),
        agent: "market",
        message: `市场温度 ${marketRadar.marketTemperature}，状态为 ${marketRadar.marketRegime}`,
        level: "info",
      },
      {
        id: "core-watch",
        timestamp: ts(1),
        agent: "watch",
        message: `检测到 ${signals.length} 个盯盘信号，${alerts.length} 条提醒`,
        level: signals.length > 5 ? "warning" : "info",
      },
      {
        id: "core-alert",
        timestamp: ts(1.5),
        agent: "signal",
        message: `生成 ${alerts.length} 条提醒（High/Risk: ${riskHighCount}）`,
        level: riskHighCount > 0 ? "warning" : "info",
      },
      {
        id: "core-risk",
        timestamp: ts(2),
        agent: "risk",
        message: `当前组合风险等级 ${risk.overallRiskLevel}，风险评分 ${risk.riskScore}`,
        level:
          risk.overallRiskLevel === "High" || risk.overallRiskLevel === "Critical"
            ? "critical"
            : "info",
      },
      {
        id: "core-explain",
        timestamp: ts(2.5),
        agent: "explain",
        message: `已生成 ${causalityReports.length} 条归因报告`,
        level: "success",
      },
    ];
  }, [marketRadar, signals, alerts, risk, causalityReports, riskHighCount]);

  // ─── Sentinel Pulse Dimensions ───
  const pulseDimensions = useMemo((): SentinelDimension[] => {
    return [
      {
        label: "Market Heat",
        value: Math.round(marketRadar.marketTemperature),
        color: "var(--accent)",
        description: "市场热度",
      },
      {
        label: "Exposure",
        value: Math.round((account.marketValue / account.totalAsset) * 100),
        color: "var(--up)",
        description: "持仓暴露",
      },
      {
        label: "Signals",
        value: Math.min(100, signals.length * 10),
        color: "var(--down)",
        description: "信号压力",
      },
      {
        label: "Risk Load",
        value: Math.round(risk.riskScore),
        color: "var(--ai-warning)",
        description: "风险负载",
      },
      {
        label: "Activity",
        value: 85,
        color: "var(--ai-cyan)",
        description: "Agent 活跃度",
      },
    ];
  }, [marketRadar, account, signals, risk]);

  // ─── Agent States (updated from engine) ───
  const agentStates = useMemo(() => {
    const base = getAgentStates();
    return base.map((a) => {
      if (a.role === "market")
        return {
          ...a,
          status: "success" as AgentStatus,
          outputSummary: `市场温度 ${marketRadar.marketTemperature}，${marketRadar.marketRegime}`,
        };
      if (a.role === "watch")
        return {
          ...a,
          status: signals.length > 0 ? ("success" as AgentStatus) : ("idle" as AgentStatus),
          outputSummary: `检测到 ${signals.length} 个盯盘信号`,
        };
      if (a.role === "signal")
        return {
          ...a,
          status: signals.length > 0 ? ("success" as AgentStatus) : ("idle" as AgentStatus),
          outputSummary: `生成 ${signals.length} 个信号，${alerts.length} 条提醒`,
        };
      if (a.role === "risk")
        return {
          ...a,
          status: "success" as AgentStatus,
          outputSummary: `风险等级 ${risk.overallRiskLevel}，评分 ${risk.riskScore}`,
        };
      if (a.role === "explain")
        return {
          ...a,
          status:
            causalityReports.length > 0 ? ("success" as AgentStatus) : ("idle" as AgentStatus),
          outputSummary: `已生成 ${causalityReports.length} 条归因报告`,
        };
      return a;
    });
  }, [marketRadar, signals, alerts, risk, causalityReports]);

  return (
    <DesktopShell>
      <div className="p-4 md:p-6 lg:p-8 space-y-6">
        {/* ─── Header ─── */}
        <motion.div
          {...staggerItem(0)}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2"
        >
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              A-Share Sentinel X
            </h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              AI 原生模拟实盘指挥舱
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-[var(--text-secondary)]">
              {dateStr}
            </span>
            <span
              className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase"
              style={{
                backgroundColor: "rgba(6, 182, 212, 0.12)",
                color: "var(--ai-cyan)",
                border: "1px solid rgba(6, 182, 212, 0.3)",
              }}
            >
              Sentinel Core
            </span>
          </div>
        </motion.div>

        {/* ─── Desktop 3-col Layout ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Left Column (2/3 width) ── */}
          <div className="lg:col-span-2 space-y-6">
            {/* ── Account Metrics (2×4) ── */}
            <motion.div
              {...staggerItem(1)}
              className="grid grid-cols-2 sm:grid-cols-4 gap-3"
            >
              <MetricCard
                label="总资产"
                value={formatMoney(account.totalAsset)}
                delay={0}
              />
              <MetricCard
                label="今日盈亏"
                value={account.todayPnl}
                prefix={account.todayPnl >= 0 ? "+¥" : "-¥"}
                suffix=""
                change={0}
                delay={1}
              />
              <MetricCard
                label="累计收益率"
                value={`${cumulativeReturn >= 0 ? "+" : ""}${cumulativeReturn.toFixed(2)}%`}
                change={cumulativeReturn}
                delay={2}
              />
              <MetricCard
                label="现金余额"
                value={formatMoney(account.cash)}
                delay={3}
              />
              <MetricCard
                label="持仓市值"
                value={formatMoney(account.marketValue)}
                delay={4}
              />
              <MetricCard
                label="当前仓位"
                value={`${positionPercent.toFixed(1)}%`}
                delay={5}
              />
              <MetricCard
                label="最大回撤"
                value={`${account.maxDrawdownPct ?? 0}%`}
                delay={6}
              />
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: 7 * 0.08,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                className="glass p-4 flex flex-col gap-1.5 group relative overflow-hidden"
                style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)" }}
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(ellipse at 50% 0%, rgba(212,165,116,0.04), transparent 60%)",
                  }}
                />
                <span className="relative z-10 text-xs text-[var(--text-muted)] uppercase tracking-wider font-medium">
                  风险等级
                </span>
                <div className="relative z-10 flex items-baseline gap-1.5">
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider"
                    style={{
                      backgroundColor: riskBadge.bg,
                      color: riskBadge.text,
                      border: `1px solid ${riskBadge.text}44`,
                    }}
                  >
                    {riskBadge.label}
                  </span>
                </div>
              </motion.div>
            </motion.div>

            {/* === 本地持仓联动 === */}
            {hasLocalPortfolio ? (
              <div className="glass p-4 rounded-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-400/10 text-emerald-200 border border-emerald-400/30">Local Portfolio Synced</span>
                  <span className="text-xs text-[var(--text-muted)]">更新于 {new Date(snapshot?.updatedAt || "").toLocaleTimeString("zh-CN")}</span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div><span className="text-[var(--text-muted)]">持仓数</span> <span className="font-mono-nums text-[var(--text-primary)]">{snapshot?.positions.length}</span></div>
                  <div><span className="text-[var(--text-muted)]">持仓市值</span> <span className="font-mono-nums text-[var(--text-primary)]">¥{(snapshot?.positionMarketValue ?? 0).toLocaleString("zh-CN")}</span></div>
                  <div><span className="text-[var(--text-muted)]">现金</span> <span className="font-mono-nums text-[var(--text-primary)]">¥{(snapshot?.cash ?? 0).toLocaleString("zh-CN")}</span></div>
                </div>
              </div>
            ) : (
              <div className="glass p-4 rounded-2xl">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-400/10 text-slate-400 border border-slate-400/20">Demo Portfolio Mode</span>
                <span className="ml-2 text-xs text-[var(--text-muted)]">暂无本地模拟持仓</span>
              </div>
            )}

            {/* ── Market Status Bar ── */}
            <motion.div {...staggerItem(2)}>
              <GlassCard className="p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8">
                  {/* Market Temperature */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs uppercase tracking-wider text-[var(--text-muted)]">
                      市场温度
                    </span>
                    <span className="text-xl font-bold font-mono-nums text-[var(--text-primary)]">
                      {marketRadar.marketTemperature}°C
                    </span>
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold"
                      style={{
                        backgroundColor: "rgba(34, 197, 94, 0.12)",
                        color: "var(--ai-green)",
                      }}
                    >
                      {marketRadar.marketRegime}
                    </span>
                  </div>

                  {/* Divider */}
                  <div className="hidden sm:block w-px h-8 bg-[var(--border-subtle)]" />

                  {/* Market Style + Hot Sectors */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs uppercase tracking-wider text-[var(--text-muted)]">
                      风格
                    </span>
                    <span className="text-sm font-semibold text-[var(--text-primary)]">
                      {marketRadar.marketStyle}
                    </span>
                  </div>

                  {/* Divider */}
                  <div className="hidden sm:block w-px h-8 bg-[var(--border-subtle)]" />

                  {/* Hot Sectors */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs uppercase tracking-wider text-[var(--text-muted)]">
                      热点
                    </span>
                    <span className="text-sm font-semibold text-[var(--text-primary)]">
                      {marketRadar.hotSectors.slice(0, 3).map((s) => s.name).join("、")}
                    </span>
                  </div>

                  {/* Divider */}
                  <div className="hidden sm:block w-px h-8 bg-[var(--border-subtle)]" />

                  {/* AI One-liner */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      {marketRadar.oneLineSummary}
                    </p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            {/* ── 盯盘摘要 ── */}
            <motion.div {...staggerItem(3)}>
              <GlassCard className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-primary)]">
                    盯盘摘要
                  </h3>
                  <span className="text-[10px] font-mono-nums text-[var(--text-muted)]">
                    {signals.length} 信号 · {alerts.length} 提醒
                    {riskHighCount > 0 && (
                      <span style={{ color: "var(--ai-danger)", marginLeft: 4 }}>
                        ({riskHighCount} 高风险)
                      </span>
                    )}
                  </span>
                </div>
                {topAlerts.length > 0 ? (
                  <div className="space-y-2">
                    {topAlerts.map((alert) => {
                      const badge = getAlertBadge(alert.level);
                      return (
                        <div
                          key={alert.id}
                          className="flex items-start gap-2 text-xs"
                        >
                          <span
                            className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider flex-shrink-0"
                            style={{
                              backgroundColor: badge.bg,
                              color: badge.text,
                              border: `1px solid ${badge.text}44`,
                            }}
                          >
                            {alert.level}
                          </span>
                          <span className="font-mono-nums text-[var(--text-accent)] flex-shrink-0">
                            {alert.code}
                          </span>
                          <span className="text-[var(--text-secondary)] truncate">
                            {alert.name} · {alert.title}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-[var(--text-muted)]">
                    暂无盯盘提醒
                  </p>
                )}
              </GlassCard>
            </motion.div>

            {/* ── 解盘摘要 ── */}
            <motion.div {...staggerItem(4)}>
              <GlassCard className="p-4">
                <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-primary)] mb-3">
                  解盘摘要
                </h3>
                {causalityReports.length > 0 ? (
                  <div className="space-y-2.5">
                    {causalityReports.slice(0, 3).map((report) => (
                      <div key={report.code} className="flex items-start gap-2 text-xs">
                        <span className="font-mono-nums text-[var(--text-accent)] flex-shrink-0">
                          {report.code}
                        </span>
                        <span className="font-medium text-[var(--text-primary)] flex-shrink-0">
                          {report.name}
                        </span>
                        <span className="text-[var(--text-secondary)] truncate">
                          {report.oneLineSummary}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[var(--text-muted)]">
                    暂无归因报告
                  </p>
                )}
              </GlassCard>
            </motion.div>

            {/* ── 风险摘要 ── */}
            <motion.div {...staggerItem(5)}>
              <GlassCard className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-primary)]">
                    风险摘要
                  </h3>
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider"
                      style={{
                        backgroundColor: riskBadge.bg,
                        color: riskBadge.text,
                        border: `1px solid ${riskBadge.text}44`,
                      }}
                    >
                      {risk.overallRiskLevel}
                    </span>
                    <span className="text-[10px] font-mono-nums text-[var(--text-muted)]">
                      评分 {risk.riskScore}
                    </span>
                  </div>
                </div>
                {risk.riskItems.length > 0 ? (
                  <div className="space-y-2">
                    {risk.riskItems.slice(0, 3).map((item) => (
                      <div key={item.id} className="text-xs text-[var(--text-secondary)]">
                        <span
                          className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider mr-1.5"
                          style={{
                            backgroundColor: item.level === "High" || item.level === "Critical"
                              ? "rgba(239, 68, 68, 0.12)"
                              : "rgba(245, 158, 11, 0.12)",
                            color: item.level === "High" || item.level === "Critical"
                              ? "var(--ai-danger)"
                              : "var(--ai-warning)",
                            border: `1px solid ${item.level === "High" || item.level === "Critical" ? "var(--ai-danger)" : "var(--ai-warning)"}44`,
                          }}
                        >
                          {item.level}
                        </span>
                        <span className="font-medium text-[var(--text-primary)]">
                          {item.title}
                        </span>
                        {item.reason && (
                          <span className="text-[var(--text-muted)] ml-1">— {item.reason}</span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[var(--text-muted)]">
                    暂无风险项
                  </p>
                )}
              </GlassCard>
            </motion.div>

            {/* ── Sentinel Pulse ── */}
            <motion.div {...staggerItem(6)}>
              <GlassCard className="p-6 flex justify-center">
                <SentinelPulse dimensions={pulseDimensions} />
              </GlassCard>
            </motion.div>
          </div>

          {/* ── Right Column (1/3 width) ── */}
          <motion.div {...staggerItem(7)} className="lg:col-span-1">
            <LiveIntelligenceFeed
              events={feedEvents}
              className="h-full"
            />
          </motion.div>
        </div>

        {/* ── Agent Status Strip ── */}
        <motion.div {...staggerItem(8)}>
          <AgentStatusStrip agents={agentStates} />
        </motion.div>

        {/* ── Risk Disclaimer ── */}
        <p className="text-[10px] text-[var(--text-muted)] text-center mt-6">
          本内容仅用于模拟实盘、市场观察和学习演示，不构成投资建议。
        </p>
      </div>
    </DesktopShell>
  );
}
