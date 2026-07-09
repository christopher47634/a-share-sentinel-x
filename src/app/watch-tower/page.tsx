"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { runSentinelCore, generateSentinelDemoData } from "@/lib/sentinel-core";
import { type WatchRule, loadRules, addRule, removeRule, toggleRule } from "@/lib/watch-rule-storage";
import { evaluateWatchRules, explainRuleTrigger } from "@/lib/watch-rule-engine";
import DesktopShell from "@/components/layout/DesktopShell";
import GlassCard from "@/components/common/GlassCard";
import { motion, AnimatePresence } from "framer-motion";
import type { AlertLevel, SignalType, Alert, Signal } from "@/lib/sentinel-core";
import { useLocalSentinelAccount } from "@/hooks/use-local-sentinel-account";

// ─── helpers ───

function alertBadge(level: AlertLevel) {
  const map: Record<AlertLevel, { bg: string; text: string; border: string }> = {
    High: {
      bg: "rgba(239,68,68,0.12)",
      text: "var(--ai-danger)",
      border: "rgba(239,68,68,0.5)",
    },
    Risk: {
      bg: "rgba(239,68,68,0.18)",
      text: "var(--ai-danger)",
      border: "rgba(239,68,68,0.7)",
    },
    Medium: {
      bg: "rgba(245,158,11,0.12)",
      text: "var(--ai-warning)",
      border: "rgba(245,158,11,0.4)",
    },
    Low: {
      bg: "rgba(100,116,139,0.08)",
      text: "var(--text-muted)",
      border: "rgba(100,116,139,0.3)",
    },
  };
  return map[level] || map.Medium;
}

function signalTypeBadge(type: SignalType) {
  const map: Record<SignalType, { bg: string; text: string }> = {
    PRICE: { bg: "rgba(56,189,248,0.1)", text: "var(--ai-cyan)" },
    VOLUME: { bg: "rgba(139,92,246,0.1)", text: "var(--ai-violet)" },
    SPEED: { bg: "rgba(34,197,94,0.1)", text: "var(--ai-green)" },
    SECTOR: { bg: "rgba(245,158,11,0.1)", text: "var(--ai-warning)" },
    POSITION: { bg: "rgba(212,165,116,0.12)", text: "var(--text-accent)" },
    PLAN: { bg: "rgba(239,68,68,0.1)", text: "var(--ai-danger)" },
    RISK: { bg: "rgba(239,68,68,0.15)", text: "var(--ai-danger)" },
  };
  return map[type] || map.PRICE;
}

function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(" ");
}

// ─── Alert Card ───

function AlertCard({ alert, heldCodes }: { alert: Alert; heldCodes?: string[] }) {
  const [expanded, setExpanded] = useState(false);
  const badge = alertBadge(alert.level);
  const isDanger = alert.level === "High" || alert.level === "Risk";

  return (
    <GlassCard
      className="p-4 cursor-pointer"
      glow={isDanger}
    >
      <div onClick={() => setExpanded(!expanded)}>
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <span
            className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider"
            style={{
              backgroundColor: badge.bg,
              color: badge.text,
              border: `1px solid ${badge.border}`,
            }}
          >
            {alert.level}
          </span>
          <span className="font-mono text-[11px] text-[var(--text-accent)]">
            {alert.code}
          </span>
          <span className="text-sm font-medium text-[var(--text-primary)] truncate">
            {alert.name}
          </span>
          <span className="ml-auto font-mono-nums text-[11px] text-[var(--text-muted)]">
            {alert.score}
          </span>
        </div>

        {/* Title */}
        <p className="text-xs font-semibold text-[var(--text-primary)] mb-1.5">
          {alert.title}
        </p>

        {/* Signal chips */}
        <div className="flex flex-wrap gap-1 mb-2">
          {alert.signals.map((s) => (
            <span
              key={s.id}
              className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium"
              style={{
                backgroundColor: "rgba(255,255,255,0.03)",
                color: "var(--text-secondary)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {s.signalName}
            </span>
          ))}
        </div>

        {/* Tags row */}
        <div className="flex items-center gap-2 mb-2">
          {alert.relatedToPosition && (
            <span
              className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold"
              style={{
                backgroundColor: "rgba(52,211,153,0.1)",
                color: "var(--up)",
                border: "1px solid rgba(52,211,153,0.25)",
              }}
            >
              持仓相关
            </span>
          )}
          {alert.relatedToPlan && (
            <span
              className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold"
              style={{
                backgroundColor: "rgba(239,68,68,0.1)",
                color: "var(--ai-danger)",
                border: "1px solid rgba(239,68,68,0.25)",
              }}
            >
              计划偏离
            </span>
          )}
          {heldCodes && heldCodes.includes(alert.code) && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold bg-cyan-400/10 text-cyan-300 border border-cyan-400/30">本地持仓</span>
          )}
          <span className="ml-auto text-[9px] font-mono text-[var(--text-muted)]">
            {new Date(alert.createdAt).toLocaleTimeString("zh-CN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        {/* Expand toggle */}
        <button
          className="text-[10px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
        >
          {expanded ? "收起 ▲" : "展开详情 ▼"}
        </button>

        {/* Expanded details */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="mt-3 pt-3 border-t border-[var(--border-subtle)] space-y-2.5 text-[11px]">
                {/* Evidence */}
                {alert.evidence.length > 0 && (
                  <div>
                    <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                      证据
                    </span>
                    <ul className="mt-1 space-y-0.5">
                      {alert.evidence.map((e, i) => (
                        <li
                          key={i}
                          className="text-[var(--text-secondary)] pl-3 relative before:content-['·'] before:absolute before:left-0 before:text-[var(--text-muted)]"
                        >
                          {e}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* AI Explanation */}
                <div>
                  <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                    AI 解读
                  </span>
                  <p className="mt-1 text-[var(--text-secondary)] leading-relaxed">
                    {alert.aiExplanation}
                  </p>
                </div>

                {/* Risk Note */}
                <div
                  className="p-2 rounded"
                  style={{ background: "rgba(239,68,68,0.06)" }}
                >
                  <span className="text-[10px] font-semibold text-[var(--ai-danger)] uppercase tracking-wider">
                    风险提示
                  </span>
                  <p className="mt-1 text-[var(--text-secondary)]">
                    {alert.riskNote}
                  </p>
                </div>

                {/* Observation Points */}
                {alert.observationPoints.length > 0 && (
                  <div>
                    <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                      后续观察
                    </span>
                    <ul className="mt-1 space-y-0.5">
                      {alert.observationPoints.map((pt, i) => (
                        <li
                          key={i}
                          className="text-[var(--text-secondary)] pl-3 relative before:content-['▸'] before:absolute before:left-0 before:text-[var(--text-accent)] before:text-[10px]"
                        >
                          {pt}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GlassCard>
  );
}

// ─── Signal Table (collapsible) ───

function SignalTable({ signals }: { signals: Signal[] }) {
  const [open, setOpen] = useState(false);

  return (
    <GlassCard className="p-4">
      <div
        className="flex items-center justify-between cursor-pointer select-none"
        onClick={() => setOpen(!open)}
      >
        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-primary)]">
          信号列表
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono-nums text-[var(--text-muted)]">
            {signals.length} 条信号
          </span>
          <span className="text-[10px] text-[var(--text-muted)]">
            {open ? "收起 ▲" : "展开 ▼"}
          </span>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="mt-3 pt-3 border-t border-[var(--border-subtle)] max-h-[420px] overflow-y-auto">
              {/* Header row */}
              <div className="flex items-center gap-2 py-1.5 px-2 text-[9px] text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-subtle)] sticky top-0 bg-[rgba(15,22,36,0.95)] backdrop-blur-sm">
                <span className="w-16 flex-shrink-0">代码</span>
                <span className="flex-1 min-w-0">名称</span>
                <span className="w-36 flex-shrink-0">信号</span>
                <span className="w-16 flex-shrink-0 text-center">类型</span>
                <span className="w-10 flex-shrink-0 text-right">分数</span>
                <span className="w-10 flex-shrink-0 text-center">持仓</span>
                <span className="w-10 flex-shrink-0 text-center">计划</span>
              </div>
              {signals.map((s) => {
                const typeBadge = signalTypeBadge(s.signalType);
                return (
                  <div
                    key={s.id}
                    className="flex items-center gap-2 py-1.5 px-2 text-[10px] border-b border-[var(--border-subtle)] hover:bg-[rgba(255,255,255,0.01)] transition-colors"
                  >
                    <span className="w-16 flex-shrink-0 font-mono text-[var(--text-accent)]">
                      {s.code}
                    </span>
                    <span className="flex-1 min-w-0 text-[var(--text-primary)] truncate">
                      {s.name}
                    </span>
                    <span className="w-36 flex-shrink-0 text-[var(--text-secondary)] truncate">
                      {s.signalName}
                    </span>
                    <span className="w-16 flex-shrink-0 text-center">
                      <span
                        className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-semibold"
                        style={{
                          backgroundColor: typeBadge.bg,
                          color: typeBadge.text,
                        }}
                      >
                        {s.signalType}
                      </span>
                    </span>
                    <span className="w-10 flex-shrink-0 text-right font-mono-nums text-[var(--text-muted)]">
                      {s.score}
                    </span>
                    <span className="w-10 flex-shrink-0 text-center">
                      {s.relatedToPosition ? (
                        <span className="text-[var(--up)] text-xs">●</span>
                      ) : (
                        <span className="text-[var(--text-muted)] text-xs">○</span>
                      )}
                    </span>
                    <span className="w-10 flex-shrink-0 text-center">
                      {s.relatedToPlan ? (
                        <span className="text-[var(--ai-danger)] text-xs">●</span>
                      ) : (
                        <span className="text-[var(--text-muted)] text-xs">○</span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}

// ─── page ───

export default function WatchTowerPage() {
  const sentinel = useMemo(() => runSentinelCore(), []);
  const demoData = useMemo(() => generateSentinelDemoData(), []);
  const { signals, alerts } = sentinel;

  // ─── Local Portfolio Sync ───
  const { snapshot, hasLocalPortfolio, heldCodes } = useLocalSentinelAccount();

  // ── User Watch Rules state ──
  const [rules, setRules] = useState<WatchRule[]>([]);
  const [newSymbol, setNewSymbol] = useState("");
  const [newName, setNewName] = useState("");
  const [newPricePct, setNewPricePct] = useState("");
  const [newVolumeRatio, setNewVolumeRatio] = useState("");

  useEffect(() => {
    setRules(loadRules());
  }, []);

  const userTriggers = useMemo(
    () => evaluateWatchRules(rules, demoData.stocks, demoData.sectors),
    [rules, demoData]
  );

  const handleAddRule = useCallback(() => {
    if (!newSymbol || !newName) return;
    const rule = addRule({
      symbol: newSymbol,
      name: newName,
      rules: {
        priceChangePct: newPricePct ? Number(newPricePct) : undefined,
        volumeRatio: newVolumeRatio ? Number(newVolumeRatio) : undefined,
      },
      enabled: true,
    });
    setRules(prev => [...prev, rule]);
    setNewSymbol(""); setNewName(""); setNewPricePct(""); setNewVolumeRatio("");
  }, [newSymbol, newName, newPricePct, newVolumeRatio]);

  const handleDeleteRule = useCallback((id: string) => {
    removeRule(id);
    setRules(prev => prev.filter(r => r.id !== id));
  }, []);

  const handleToggleRule = useCallback((id: string) => {
    const updated = toggleRule(id);
    setRules(updated);
  }, []);

  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  // Stats
  const highCount = alerts.filter((a) => a.level === "High").length;
  const riskCount = alerts.filter((a) => a.level === "Risk").length;
  const positionCount = alerts.filter((a) => a.relatedToPosition).length;
  const planCount = alerts.filter((a) => a.relatedToPlan).length;

  // Plan Guard alerts
  const planAlerts = alerts.filter((a) => a.relatedToPlan);
  // Portfolio Impact alerts
  const positionAlerts = alerts.filter((a) => a.relatedToPosition);

  // stagger helper
  const stagger = (i: number) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: 0.45,
      delay: i * 0.07,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  });

  return (
    <DesktopShell>
      <div className="p-4 md:p-6 lg:p-8 space-y-5">
        {/* ─── Header ─── */}
        <motion.div
          {...stagger(0)}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2"
        >
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              Watch Tower
            </h1>
            <p className="text-sm text-[var(--text-muted)] mt-0.5">
              AI 自动盯盘塔
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-[var(--text-secondary)]">
              {timeStr}
            </span>
            <span
              className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider"
              style={{
                backgroundColor: "rgba(139,92,246,0.12)",
                color: "var(--ai-violet)",
                border: "1px solid rgba(139,92,246,0.3)",
              }}
            >
              Watching
            </span>
          </div>
        </motion.div>

        {/* ─── Overview Stats ─── */}
        <motion.div
          {...stagger(1)}
          className="grid grid-cols-3 sm:grid-cols-6 gap-3"
        >
          <div className="glass p-3.5 flex flex-col gap-1">
            <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-medium">
              信号总数
            </span>
            <span className="text-xl font-bold font-mono-nums text-[var(--text-primary)]">
              {signals.length}
            </span>
          </div>
          <div className="glass p-3.5 flex flex-col gap-1">
            <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-medium">
              提醒总数
            </span>
            <span className="text-xl font-bold font-mono-nums text-[var(--text-primary)]">
              {alerts.length}
            </span>
          </div>
          <div className="glass p-3.5 flex flex-col gap-1">
            <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-medium">
              High
            </span>
            <span
              className="text-xl font-bold font-mono-nums"
              style={{ color: "var(--ai-danger)" }}
            >
              {highCount}
            </span>
          </div>
          <div className="glass p-3.5 flex flex-col gap-1">
            <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-medium">
              Risk
            </span>
            <span
              className="text-xl font-bold font-mono-nums"
              style={{ color: "var(--ai-danger)" }}
            >
              {riskCount}
            </span>
          </div>
          <div className="glass p-3.5 flex flex-col gap-1">
            <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-medium">
              持仓相关
            </span>
            <span
              className="text-xl font-bold font-mono-nums"
              style={{ color: "var(--up)" }}
            >
              {positionCount}
            </span>
          </div>
          <div className="glass p-3.5 flex flex-col gap-1">
            <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-medium">
              计划偏离
            </span>
            <span
              className="text-xl font-bold font-mono-nums"
              style={{ color: "var(--ai-warning)" }}
            >
              {planCount}
            </span>
          </div>
        </motion.div>

        {/* ─── Alert Cards ─── */}
        <motion.div {...stagger(2)}>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-[var(--text-primary)]">
              AI 提醒
            </h2>
            <span className="text-[10px] font-mono-nums text-[var(--text-muted)]">
              ({alerts.length})
            </span>
          </div>

          {alerts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {alerts.map((alert, i) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.35,
                    delay: 0.3 + i * 0.06,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                >
                  <AlertCard alert={alert} heldCodes={heldCodes} />
                </motion.div>
              ))}
            </div>
          ) : (
            <GlassCard className="p-4">
              <p className="text-xs text-[var(--text-muted)]">
                当前暂无盯盘提醒，系统持续监控中...
              </p>
            </GlassCard>
          )}
        </motion.div>

        {/* ─── Signal Table ─── */}
        <motion.div {...stagger(3)}>
          <SignalTable signals={signals} />
        </motion.div>

        {/* ─── Plan Guard ─── */}
        {planAlerts.length > 0 && (
          <motion.div {...stagger(4)}>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-[var(--text-primary)]">
                Plan Guard
              </h2>
              <span className="text-[10px] text-[var(--text-muted)]">
                交易计划守门员
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {planAlerts.map((alert, i) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: 0.2 + i * 0.05,
                  }}
                >
                  <AlertCard alert={alert} heldCodes={heldCodes} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ─── Portfolio Impact ─── */}
        {positionAlerts.length > 0 && (
          <motion.div {...stagger(5)}>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-[var(--text-primary)]">
                Portfolio Impact
              </h2>
              <span className="text-[10px] text-[var(--text-muted)]">
                持仓影响提醒
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {positionAlerts.map((alert, i) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: 0.2 + i * 0.05,
                  }}
                >
                  <AlertCard alert={alert} heldCodes={heldCodes} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* === 用户规则管理 (Watch Rules Panel) === */}
        <motion.div {...stagger(6)}>
          <div className="glass p-4 rounded-2xl mb-5" style={{ border: "1px solid rgba(255,255,255,0.08)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)" }}>
            <div className="mb-3">
              <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-[0.2em]">Watch Rules</span>
              <h2 className="text-sm font-semibold text-[var(--text-primary)] mt-0.5">我的盯盘规则</h2>
              <p className="text-xs text-[var(--text-muted)] mt-1">添加关注标的并设置触发阈值，AI 将持续监控并生成提醒。</p>
            </div>

            {/* 添加规则表单 */}
            <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="grid gap-3 md:grid-cols-4">
                <input 
                  placeholder="股票代码 (如 688256)" 
                  value={newSymbol}
                  onChange={e => setNewSymbol(e.target.value)}
                  className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500"
                />
                <input 
                  placeholder="股票名称" 
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500"
                />
                <input 
                  placeholder="涨跌幅阈值 % (如 3)" 
                  type="number"
                  value={newPricePct}
                  onChange={e => setNewPricePct(e.target.value)}
                  className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500"
                />
                <input 
                  placeholder="量比阈值 (如 2)" 
                  type="number"
                  value={newVolumeRatio}
                  onChange={e => setNewVolumeRatio(e.target.value)}
                  className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500"
                />
              </div>
              <button 
                onClick={handleAddRule}
                className="mt-3 rounded-xl bg-cyan-500/20 border border-cyan-400/30 px-4 py-2 text-sm font-medium text-cyan-200 hover:bg-cyan-500/30 transition-colors"
              >
                添加盯盘规则
              </button>
            </div>

            {/* 规则列表 */}
            <div className="space-y-3">
              {rules.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-500">
                  暂无盯盘规则。请添加关注标的和阈值。
                </div>
              ) : (
                rules.map(rule => (
                  <div key={rule.id} className={cn(
                    "rounded-2xl border p-4 transition-all",
                    rule.enabled 
                      ? "border-cyan-400/30 bg-cyan-400/10" 
                      : "border-white/10 bg-white/[0.04] opacity-60"
                  )}>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-400">{rule.symbol}</span>
                        <span className="font-semibold text-slate-50">{rule.name}</span>
                        {rule.enabled ? (
                          <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-xs text-emerald-200">监控中</span>
                        ) : (
                          <span className="rounded-full border border-slate-400/20 bg-slate-400/10 px-2 py-0.5 text-xs text-slate-400">已暂停</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleToggleRule(rule.id)} className="rounded-lg border border-white/10 px-3 py-1 text-xs text-slate-300 hover:bg-white/[0.06] transition-colors">
                          {rule.enabled ? "暂停" : "开启"}
                        </button>
                        <button onClick={() => handleDeleteRule(rule.id)} className="rounded-lg border border-red-400/20 px-3 py-1 text-xs text-red-300 hover:bg-red-500/10 transition-colors">
                          删除
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
                      {rule.rules.priceChangePct !== undefined && <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5">涨跌幅 ≥ {rule.rules.priceChangePct}%</span>}
                      {rule.rules.volumeRatio !== undefined && <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5">量比 ≥ {rule.rules.volumeRatio}</span>}
                      {rule.rules.drawdownPct !== undefined && <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5">回撤 ≥ {rule.rules.drawdownPct}%</span>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>

        {/* === 本地持仓盯盘 === */}
        <div className="glass p-4 rounded-2xl">
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-primary)] mb-3">Local Portfolio Watch</h3>
          {hasLocalPortfolio ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                <div><div className="text-[10px] text-[var(--text-muted)]">持仓数</div><div className="font-mono-nums text-sm text-[var(--text-primary)]">{snapshot?.positions.length}</div></div>
                <div><div className="text-[10px] text-[var(--text-muted)]">持仓代码</div><div className="font-mono text-xs text-[var(--text-primary)]">{heldCodes.join(", ")}</div></div>
                <div><div className="text-[10px] text-[var(--text-muted)]">持仓相关提醒</div><div className="font-mono-nums text-sm text-[var(--ai-cyan)]">{alerts.filter(a => heldCodes.includes(a.code)).length}</div></div>
                <div><div className="text-[10px] text-[var(--text-muted)]">更新时间</div><div className="text-xs text-[var(--text-muted)]">{new Date(snapshot?.updatedAt || "").toLocaleTimeString("zh-CN")}</div></div>
              </div>
              <p className="text-[10px] text-[var(--text-muted)]">买入新股票后，这里会参与本地持仓盯盘。</p>
            </>
          ) : (
            <p className="text-xs text-[var(--text-muted)]">暂无本地模拟持仓。在交易页面买入股票后，持仓信息将显示在此处。</p>
          )}
        </div>

        {/* === 用户规则触发提醒 (User Rule Alerts) === */}
        {userTriggers.length > 0 && (
          <motion.div {...stagger(7)}>
            <div className="glass p-4 rounded-2xl mb-5" style={{ border: "1px solid rgba(255,255,255,0.08)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)" }}>
              <div className="mb-3">
                <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-[0.2em]">User Rule Alerts</span>
                <h2 className="text-sm font-semibold text-[var(--text-primary)] mt-0.5">用户规则触发提醒</h2>
                <p className="text-xs text-[var(--text-muted)] mt-1">以下提醒来自您设置的盯盘规则，表明关注标的已达到预设阈值。</p>
              </div>
              <div className="space-y-4">
                {userTriggers.map(signal => (
                  <div key={`${signal.ruleId}-${signal.symbol}`} className={cn(
                    "rounded-2xl border p-4",
                    signal.severity === "High" && "border-red-400/40 bg-red-500/10",
                    signal.severity === "Medium" && "border-amber-400/30 bg-amber-400/10",
                    signal.severity === "Low" && "border-cyan-400/30 bg-cyan-400/10"
                  )}>
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-semibold",
                        signal.severity === "High" && "bg-red-500/20 text-red-200",
                        signal.severity === "Medium" && "bg-amber-500/20 text-amber-200",
                        signal.severity === "Low" && "bg-cyan-500/20 text-cyan-200"
                      )}>{signal.severity}</span>
                      <span className="text-sm text-slate-400">{signal.symbol}</span>
                      <span className="font-semibold text-slate-50">{signal.name}</span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{signal.trigger}</p>
                    <div className="mt-2 space-y-1">
                      {signal.evidence.map((e, i) => (
                        <div key={i} className="text-xs text-slate-500">• {e}</div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* === 规则触发解释 (Rule Explanation) === */}
        {userTriggers.length > 0 && (
          <motion.div {...stagger(8)}>
            <div className="glass p-4 rounded-2xl mb-5" style={{ border: "1px solid rgba(255,255,255,0.08)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)" }}>
              <div className="mb-3">
                <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-[0.2em]">Rule Explanation</span>
                <h2 className="text-sm font-semibold text-[var(--text-primary)] mt-0.5">为什么触发</h2>
                <p className="text-xs text-[var(--text-muted)] mt-1">逐条展示盯盘规则触发的原因和证据链。</p>
              </div>
              <div className="space-y-4">
                {userTriggers.map(signal => {
                  const rule = rules.find(r => r.id === signal.ruleId);
                  if (!rule) return null;
                  const explanation = explainRuleTrigger(rule, signal);
                  return (
                    <div key={`explain-${signal.ruleId}`} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="text-sm text-slate-400">{rule.symbol}</span>
                        <span className="font-semibold text-slate-50">{rule.name}</span>
                      </div>
                      <pre className="whitespace-pre-wrap text-sm leading-6 text-slate-300 font-sans">{explanation}</pre>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* ─── Footer: compliance ─── */}
        <motion.div {...stagger(9)}>
          <div className="text-center py-4">
            <p className="text-[10px] text-[var(--text-muted)] leading-relaxed">
              本页面展示的所有提醒与信号均为 AI 自动盯盘引擎生成的模拟数据，
              不构成任何投资建议。所有操作请以实际账户与合规流程为准。
              Sentinel Core · A-Share Sentinel X
            </p>
          </div>
        </motion.div>
      </div>
    </DesktopShell>
  );
}
