"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  Brain,
  Loader2,
  MessageCircle,
  RadioTower,
  Send,
  ShieldAlert,
  Sparkles,
  X,
} from "lucide-react";
import DataSourceBadge from "@/components/market/DataSourceBadge";
import { cn, formatPercent } from "@/lib/utils";
import type { MarketSnapshot } from "@/types/market";

const DEFAULT_CODES = "600519,300750,688256,300308,000977,002371,688981,601899,300124,000858";
const HOME_AI_SUGGESTIONS = ["今天最该看哪只？", "现在市场风险在哪？", "给我一个盘中观察"];

export default function MarketPulse({ compact = false }: { compact?: boolean }) {
  const [snapshot, setSnapshot] = useState<MarketSnapshot | null>(null);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/market/snapshot?codes=${DEFAULT_CODES}`)
      .then((response) => response.json())
      .then((data: MarketSnapshot) => {
        if (!cancelled) setSnapshot(data);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => {
    const quotes = snapshot?.quotes ?? [];
    const up = quotes.filter((item) => item.changePercent >= 0).length;
    const avg = quotes.length
      ? quotes.reduce((sum, item) => sum + item.changePercent, 0) / quotes.length
      : 0;
    const leader = [...quotes].sort((a, b) => b.changePercent - a.changePercent)[0];
    return { up, total: quotes.length, avg, leader };
  }, [snapshot]);

  const assistantBrief = useMemo(() => {
    if (!snapshot || !stats.total) return "行情数据还在读取，等刷新完成后我会按真实行情给你解释。";
    const leaderText = stats.leader
      ? `${stats.leader.name} 当前领涨，涨跌幅 ${formatPercent(stats.leader.changePercent)}`
      : "暂时没有明显领涨样本";
    return `我已经读取 ${stats.total} 只核心样本：${stats.up} 只上涨，平均涨跌 ${formatPercent(Number(stats.avg.toFixed(2)))}。${leaderText}。你可以直接问我今天的风险、强势方向或具体个股。`;
  }, [snapshot, stats]);

  async function askAssistant(nextQuestion: string) {
    const text = nextQuestion.trim();
    if (!text) return;
    setAssistantOpen(true);
    setQuestion(text);

    const focusCode = stats.leader?.code ?? "600519";
    setAiLoading(true);
    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text, stockCode: focusCode }),
      });
      const data = (await response.json()) as { answer?: string };
      setAnswer(data.answer || assistantBrief);
    } catch {
      setAnswer(assistantBrief);
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className={cn(
        "glass relative overflow-hidden",
        compact ? "mx-4 my-3 p-4 rounded-2xl" : "p-4 md:p-5 rounded-2xl"
      )}
    >
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_15%_10%,rgba(212,165,116,0.16),transparent_34%),radial-gradient(circle_at_85%_20%,rgba(52,211,153,0.10),transparent_30%)]" />
      <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
              <RadioTower size={16} />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-[var(--text-primary)] md:text-base">
                真实行情脉冲
              </h2>
              <p className="text-[11px] text-[var(--text-muted)]">
                真实数据接入 · 指标可复算 · AI 只解释不瞎猜
              </p>
            </div>
          </div>
          {snapshot && (
            <DataSourceBadge
              source={snapshot.source}
              label={snapshot.sourceLabel}
              updatedAt={snapshot.updatedAt}
              fallbackUsed={snapshot.fallbackUsed}
            />
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 md:min-w-[420px]">
          <PulseMetric
            icon={<Activity size={14} />}
            label="样本热度"
            value={stats.total ? `${stats.up}/${stats.total}` : "—"}
            hint="上涨家数"
          />
          <PulseMetric
            icon={<Sparkles size={14} />}
            label="平均涨跌"
            value={stats.total ? formatPercent(Number(stats.avg.toFixed(2))) : "—"}
            hint="精选股票池"
            positive={stats.avg >= 0}
          />
          <PulseMetric
            icon={<Brain size={14} />}
            label="AI 观察"
            value={stats.leader?.name ?? "准备中"}
            hint={stats.leader ? `点开提问 · 领涨 ${formatPercent(stats.leader.changePercent)}` : "等待行情"}
            positive
            active={assistantOpen}
            onClick={() => setAssistantOpen((open) => !open)}
          />
        </div>
      </div>

      <AnimatePresence initial={false}>
        {assistantOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -6, height: 0 }}
            transition={{ duration: 0.22 }}
            className="relative z-10 mt-4 overflow-hidden"
          >
            <div className="rounded-2xl border border-white/10 bg-black/20 p-3 md:p-4">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
                    <MessageCircle size={15} />
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[var(--text-primary)]">首页 AI 行情助手</div>
                    <div className="truncate text-[11px] text-[var(--text-muted)]">
                      默认聚焦 {stats.leader?.name ?? "核心样本"}，也可以问整体市场。
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAssistantOpen(false)}
                  className="rounded-lg border border-white/10 p-1.5 text-[var(--text-muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  aria-label="关闭 AI 行情助手"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3 text-xs leading-6 text-[var(--text-secondary)]">
                {aiLoading ? (
                  <span className="flex items-center gap-2 text-[var(--accent)]">
                    <Loader2 size={14} className="animate-spin" />
                    正在读取行情和指标…
                  </span>
                ) : (
                  answer || assistantBrief
                )}
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {HOME_AI_SUGGESTIONS.map((item) => (
                  <button
                    type="button"
                    key={item}
                    onClick={() => askAssistant(item)}
                    className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-[11px] text-[var(--text-secondary)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  >
                    {item}
                  </button>
                ))}
              </div>

              <form
                className="mt-3 flex gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  askAssistant(question);
                }}
              >
                <input
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  placeholder="问行情、风险、强势方向、具体个股…"
                  className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]"
                />
                <button
                  type="submit"
                  disabled={aiLoading}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)] text-[var(--bg-primary)] transition disabled:opacity-50"
                  aria-label="发送给 AI 行情助手"
                >
                  <Send size={14} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {snapshot?.fallbackUsed && (
        <div className="relative z-10 mt-3 flex items-center gap-2 rounded-xl border border-amber-300/15 bg-amber-300/8 px-3 py-2 text-[11px] text-amber-200/80">
          <ShieldAlert size={13} />
          部分行情暂用模拟兜底，界面会持续标记数据源。
        </div>
      )}
    </motion.section>
  );
}

function PulseMetric({
  icon,
  label,
  value,
  hint,
  positive,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
  positive?: boolean;
  active?: boolean;
  onClick?: () => void;
}) {
  const content = (
    <>
      <div className="mb-1.5 flex items-center gap-1.5 text-[10px] text-[var(--text-muted)]">
        {icon}
        {label}
      </div>
      <div
        className={cn(
          "truncate text-sm font-bold font-mono-nums",
          positive === undefined ? "text-[var(--text-primary)]" : positive ? "text-up" : "text-down"
        )}
      >
        {value}
      </div>
      <div className="mt-0.5 truncate text-[10px] text-[var(--text-muted)]">{hint}</div>
    </>
  );

  const className = cn(
    "rounded-xl border border-white/10 bg-white/[0.035] p-3",
    onClick && "text-left transition hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/35",
    active && "border-[var(--accent)] bg-[var(--accent-soft)]"
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {content}
      </button>
    );
  }

  return <div className={className}>{content}</div>;
}
