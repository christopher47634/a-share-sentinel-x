"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Bot, Briefcase, FileText, Loader2, RotateCcw, Send, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAccount, getPositions } from "@/lib/account-storage";
import type { Position } from "@/types/account";
import type { MarketIndicatorSnapshot, MarketQuote } from "@/types/market";

interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

const DEFAULT_SUGGESTIONS = ["这只票现在风险在哪？", "趋势有没有变强？", "近期有公告或事件吗？"];
const HELD_SUGGESTIONS = ["按我的持仓成本和计划怎么看？", "离止损/目标观察线风险如何？", "近期有公告或事件吗？"];

export default function AiResearchPanel({
  stockCode,
  quote,
  analysis,
  compact = false,
}: {
  stockCode: string;
  quote: MarketQuote;
  analysis: MarketIndicatorSnapshot;
  compact?: boolean;
}) {
  const [question, setQuestion] = useState("");
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [streamingText, setStreamingText] = useState("");
  const [loading, setLoading] = useState(false);
  const [providerLabel, setProviderLabel] = useState<string | null>(null);
  const [announcementsCount, setAnnouncementsCount] = useState<number | null>(null);
  const [heldPosition, setHeldPosition] = useState<Position | null>(null);
  const [totalAssets, setTotalAssets] = useState<number>(1_000_000);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const syncPosition = () => {
      try {
        const positions = getPositions();
        const account = getAccount();
        setHeldPosition(positions.find((p) => p.stockCode === stockCode) ?? null);
        setTotalAssets(account.totalAssets || 1_000_000);
      } catch {
        setHeldPosition(null);
      }
    };
    syncPosition();
    window.addEventListener("sentinel:account-updated", syncPosition);
    window.addEventListener("storage", syncPosition);
    return () => {
      window.removeEventListener("sentinel:account-updated", syncPosition);
      window.removeEventListener("storage", syncPosition);
    };
  }, [stockCode]);

  // 切换标的时重置多轮上下文，避免把上一只票的历史混进当前标的分析
  useEffect(() => {
    setTurns([]);
    setStreamingText("");
    setProviderLabel(null);
    setAnnouncementsCount(null);
  }, [stockCode]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [turns, streamingText]);

  const intro = useMemo(
    () => `${quote.name} · ${quote.price.toFixed(2)} · 趋势分 ${analysis.trendScore}`,
    [quote.name, quote.price, analysis.trendScore]
  );

  const suggestions = heldPosition ? HELD_SUGGESTIONS : DEFAULT_SUGGESTIONS;

  function buildPortfolioContext() {
    if (!heldPosition) return undefined;
    const marketValue = quote.price * heldPosition.quantity;
    const positionRatio = totalAssets > 0 ? marketValue / totalAssets : heldPosition.positionRatio;
    const unrealizedPnlPct =
      heldPosition.avgCost > 0 ? ((quote.price - heldPosition.avgCost) / heldPosition.avgCost) * 100 : 0;
    return {
      position: {
        stockCode: heldPosition.stockCode,
        stockName: heldPosition.stockName,
        quantity: heldPosition.quantity,
        availableQuantity: heldPosition.availableQuantity,
        avgCost: heldPosition.avgCost,
        positionRatio,
        unrealizedPnlPct,
        plan: heldPosition.plan,
        stopLossPrice: heldPosition.stopLossPrice,
        targetPrice: heldPosition.targetPrice,
      },
      portfolioSummary: {
        totalAssets,
        positionRatio,
      },
    };
  }

  async function ask(nextQuestion: string) {
    const text = nextQuestion.trim();
    if (!text || loading) return;

    const historySnapshot = turns.slice(-6);
    setTurns((prev) => [...prev, { role: "user", content: text }]);
    setQuestion("");
    setStreamingText("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: text,
          stockCode,
          history: historySnapshot,
          portfolioContext: buildPortfolioContext(),
          stream: true,
        }),
      });

      if (!response.ok) {
        const errText = response.status === 429 ? "请求过于频繁，请稍后再试。" : "AI 服务暂时不可用，请稍后重试。";
        setTurns((prev) => [...prev, { role: "assistant", content: errText }]);
        return;
      }

      const contentType = response.headers.get("content-type") ?? "";
      if (contentType.includes("text/event-stream") && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let accumulated = "";
        let finalAnswer = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const frames = buffer.split("\n\n");
          buffer = frames.pop() ?? "";
          for (const frame of frames) {
            const line = frame.trim();
            if (!line.startsWith("data:")) continue;
            try {
              const evt = JSON.parse(line.slice(5).trim()) as {
                type?: string;
                text?: string;
                answer?: string;
                provider?: string;
                announcementsCount?: number;
              };
              if (evt.type === "delta" && typeof evt.text === "string") {
                accumulated += evt.text;
                setStreamingText(accumulated);
              } else if (evt.type === "done") {
                if (typeof evt.answer === "string") finalAnswer = evt.answer;
                if (typeof evt.provider === "string") setProviderLabel(evt.provider);
                if (typeof evt.announcementsCount === "number") setAnnouncementsCount(evt.announcementsCount);
              }
            } catch {
              // 忽略残缺 SSE 帧
            }
          }
        }

        const resolved = (finalAnswer || accumulated).trim() || "AI 暂时没有返回内容。";
        setTurns((prev) => [...prev, { role: "assistant", content: resolved }]);
        setStreamingText("");
      } else {
        const data = (await response.json()) as {
          answer?: string;
          provider?: string;
          announcementsCount?: number;
        };
        if (data.provider) setProviderLabel(data.provider);
        if (typeof data.announcementsCount === "number") setAnnouncementsCount(data.announcementsCount);
        setTurns((prev) => [...prev, { role: "assistant", content: data.answer || "AI 暂时没有返回内容。" }]);
      }
    } catch {
      setTurns((prev) => [
        ...prev,
        { role: "assistant", content: "AI 服务暂时不可用，我会继续保留本地趋势解释。" },
      ]);
    } finally {
      setLoading(false);
      setStreamingText("");
    }
  }

  return (
    <motion.aside
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={cn("glass relative overflow-hidden rounded-2xl p-4", compact && "mx-4")}
    >
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_100%_0%,rgba(99,102,241,0.12),transparent_36%)]" />
      <div className="relative z-10 mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
            <Bot size={17} />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">AI 研究副驾</h3>
            <p className="text-[11px] text-[var(--text-muted)]">{intro}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {turns.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setTurns([]);
                setStreamingText("");
              }}
              title="清空当前对话"
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 text-[var(--text-muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              <RotateCcw size={12} />
            </button>
          )}
          <Sparkles size={16} className="text-[var(--accent)]" />
        </div>
      </div>

      {/* Context badges */}
      <div className="relative z-10 mb-2.5 flex flex-wrap items-center gap-1.5 text-[10px]">
        {heldPosition && (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-emerald-300">
            <Briefcase size={10} />
            已注入持仓{heldPosition.plan ? "与交易计划" : ""}
          </span>
        )}
        {announcementsCount !== null && (
          <span className="inline-flex items-center gap-1 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2 py-0.5 text-cyan-200">
            <FileText size={10} />
            近期公告 {announcementsCount} 条
          </span>
        )}
        {providerLabel && (
          <span className="ml-auto rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[var(--text-muted)]">
            {providerLabel === "local-research-engine" ? "本地研究引擎" : providerLabel}
          </span>
        )}
      </div>

      {/* Multi-turn stream area */}
      <div
        ref={scrollRef}
        className="relative z-10 max-h-[280px] min-h-[132px] space-y-2.5 overflow-y-auto rounded-xl border border-white/10 bg-black/15 p-3 text-xs leading-6 text-[var(--text-secondary)]"
      >
        {turns.length === 0 && !loading ? (
          <div className="whitespace-pre-line">{analysis.summary}</div>
        ) : (
          turns.map((turn, idx) => (
            <div
              key={`${turn.role}-${idx}`}
              className={cn(
                "rounded-lg px-2.5 py-2 whitespace-pre-line",
                turn.role === "user"
                  ? "ml-6 border border-[var(--accent)]/30 bg-[var(--accent-soft)] text-[var(--text-primary)]"
                  : "mr-2 border border-white/5 bg-white/[0.03] text-[var(--text-secondary)]"
              )}
            >
              {turn.content}
            </div>
          ))
        )}

        {loading && (
          <div className="mr-2 rounded-lg border border-white/5 bg-white/[0.03] px-2.5 py-2 whitespace-pre-line text-[var(--text-secondary)]">
            {streamingText ? (
              <span>
                {streamingText}
                <span className="ml-0.5 inline-block h-3 w-1.5 animate-pulse bg-[var(--accent)] align-middle" />
              </span>
            ) : (
              <span className="flex items-center gap-2 text-[var(--accent)]">
                <Loader2 size={14} className="animate-spin" />
                正在读取实时行情、公开公告与持仓上下文…
              </span>
            )}
          </div>
        )}
      </div>

      <div className="relative z-10 mt-3 flex flex-wrap gap-2">
        {suggestions.map((item) => (
          <button
            key={item}
            type="button"
            disabled={loading}
            onClick={() => ask(item)}
            className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-[11px] text-[var(--text-secondary)] transition hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:opacity-50"
          >
            {item}
          </button>
        ))}
      </div>

      <form
        className="relative z-10 mt-3 flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          ask(question);
        }}
      >
        <input
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="追问走势、公告、止损纪律、仓位影响…"
          className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]"
        />
        <button
          type="submit"
          disabled={loading}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)] text-[var(--bg-primary)] transition disabled:opacity-50"
        >
          <Send size={14} />
        </button>
      </form>

      <p className="relative z-10 mt-3 text-[10px] leading-4 text-[var(--text-muted)]">
        AI 输出仅用于研究辅助，不构成投资建议；关键数据请以交易所官方公告与行情源为准。
      </p>
    </motion.aside>
  );
}
