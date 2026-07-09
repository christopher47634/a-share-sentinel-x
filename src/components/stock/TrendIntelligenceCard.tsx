"use client";

import { motion } from "framer-motion";
import { Activity, Gauge, LineChart, ShieldAlert, Waves } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MarketIndicatorSnapshot } from "@/types/market";

export default function TrendIntelligenceCard({
  analysis,
  compact = false,
}: {
  analysis: MarketIndicatorSnapshot;
  compact?: boolean;
}) {
  const score = analysis.trendScore;
  const risk = analysis.riskScore;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={cn("glass p-4 rounded-2xl overflow-hidden relative", compact && "mx-4")}
    >
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_0%,rgba(212,165,116,0.11),transparent_38%)]" />
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div>
          <div className="mb-1.5 flex items-center gap-2">
            <LineChart size={15} className="text-[var(--accent)]" />
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">趋势智能</h3>
            <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-[var(--text-muted)]">
              可复算
            </span>
          </div>
          <p className="max-w-xl text-xs leading-5 text-[var(--text-secondary)]">
            {analysis.summary}
          </p>
        </div>
        <ScoreOrb score={score} label={analysis.trendLabel} />
      </div>

      <div className="relative z-10 mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
        <IndicatorPill icon={<Gauge size={13} />} label="趋势分" value={String(score)} tone={score >= 60 ? "up" : score < 42 ? "down" : "neutral"} />
        <IndicatorPill icon={<ShieldAlert size={13} />} label="风险分" value={String(risk)} tone={risk >= 60 ? "down" : "up"} />
        <IndicatorPill icon={<Activity size={13} />} label="RSI14" value={analysis.rsi14?.toString() ?? "—"} tone={analysis.rsi14 && analysis.rsi14 > 70 ? "down" : "neutral"} />
        <IndicatorPill icon={<Waves size={13} />} label="量能" value={analysis.volumeRatio ? `${analysis.volumeRatio}x` : "—"} tone={analysis.volumeRatio && analysis.volumeRatio > 1.25 ? "up" : "neutral"} />
      </div>

      <div className="relative z-10 mt-4 grid gap-2 md:grid-cols-3">
        {analysis.bullets.map((item) => (
          <div key={item} className="rounded-xl border border-white/8 bg-black/10 px-3 py-2 text-[11px] leading-5 text-[var(--text-secondary)]">
            {item}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function ScoreOrb({ score, label }: { score: number; label: string }) {
  const bg = `conic-gradient(from 180deg, var(--accent) 0deg, var(--accent) ${score * 3.6}deg, rgba(255,255,255,0.08) ${score * 3.6}deg)`;
  return (
    <div className="hidden sm:flex flex-col items-center gap-1">
      <div className="relative h-16 w-16 rounded-full p-[3px]" style={{ background: bg }}>
        <div className="flex h-full w-full items-center justify-center rounded-full bg-[rgba(7,13,25,0.92)] text-lg font-bold text-[var(--text-primary)] font-mono-nums">
          {score}
        </div>
      </div>
      <span className="text-[10px] text-[var(--text-muted)]">{label}</span>
    </div>
  );
}

function IndicatorPill({
  icon,
  label,
  value,
  tone = "neutral",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: "up" | "down" | "neutral";
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
      <div className="mb-1 flex items-center gap-1.5 text-[10px] text-[var(--text-muted)]">
        {icon}
        {label}
      </div>
      <div className={cn("text-base font-bold font-mono-nums", tone === "up" ? "text-up" : tone === "down" ? "text-down" : "text-[var(--text-primary)]")}>
        {value}
      </div>
    </div>
  );
}
