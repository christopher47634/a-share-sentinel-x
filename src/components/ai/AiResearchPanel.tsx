"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Bot, Loader2, Send, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MarketIndicatorSnapshot, MarketQuote } from "@/types/market";

const suggestions = ["这只票现在风险在哪？", "趋势有没有变强？", "和同板块相比怎么看？"];

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
  const [answer, setAnswer] = useState(() => analysis.summary);
  const [loading, setLoading] = useState(false);

  const intro = useMemo(
    () => `${quote.name} · ${quote.price.toFixed(2)} · 趋势分 ${analysis.trendScore}`,
    [quote.name, quote.price, analysis.trendScore]
  );

  async function ask(nextQuestion: string) {
    const text = nextQuestion.trim();
    if (!text) return;
    setLoading(true);
    setQuestion(text);
    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text, stockCode }),
      });
      const data = (await response.json()) as { answer?: string };
      setAnswer(data.answer || "AI 暂时没有返回内容。");
    } catch {
      setAnswer("AI 服务暂时不可用，我会继续保留本地趋势解释。");
    } finally {
      setLoading(false);
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
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">AI 研究助手</h3>
            <p className="text-[11px] text-[var(--text-muted)]">{intro}</p>
          </div>
        </div>
        <Sparkles size={16} className="text-[var(--accent)]" />
      </div>

      <div className="relative z-10 rounded-xl border border-white/10 bg-black/15 p-3 text-xs leading-6 text-[var(--text-secondary)] whitespace-pre-line min-h-[124px]">
        {loading ? (
          <span className="flex items-center gap-2 text-[var(--accent)]">
            <Loader2 size={14} className="animate-spin" />
            正在读取行情和指标…
          </span>
        ) : (
          answer
        )}
      </div>

      <div className="relative z-10 mt-3 flex flex-wrap gap-2">
        {suggestions.map((item) => (
          <button
            key={item}
            onClick={() => ask(item)}
            className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-[11px] text-[var(--text-secondary)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
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
          placeholder="问走势、风险、对比、持仓影响…"
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
        AI 输出仅用于研究辅助，不构成投资建议；关键数据请以官方行情源为准。
      </p>
    </motion.aside>
  );
}
