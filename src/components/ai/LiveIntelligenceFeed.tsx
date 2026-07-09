"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { IntelligenceEvent } from "@/types/agent";

interface Props {
  events: IntelligenceEvent[];
  className?: string;
}

const LEVEL_CONFIG: Record<
  IntelligenceEvent["level"],
  { color: string; bg: string; label: string }
> = {
  info: {
    color: "#06b6d4",
    bg: "rgba(6, 182, 212, 0.12)",
    label: "INFO",
  },
  warning: {
    color: "#f59e0b",
    bg: "rgba(245, 158, 11, 0.12)",
    label: "WARN",
  },
  critical: {
    color: "var(--down, #ef4444)",
    bg: "rgba(239, 68, 68, 0.12)",
    label: "CRIT",
  },
  success: {
    color: "var(--up, #22c55e)",
    bg: "rgba(34, 197, 94, 0.12)",
    label: "OK",
  },
};

const AGENT_LABELS: Record<string, string> = {
  data: "Data",
  portfolio: "Portfolio",
  market: "Market",
  signal: "Signal",
  watch: "Watch",
  attribution: "Attrib",
  risk: "Risk",
  explain: "Explain",
  review: "Review",
  compliance: "Compliance",
};

export default function LiveIntelligenceFeed({
  events,
  className,
}: Props) {
  const visible = events.slice(0, 8);

  return (
    <div
      className={cn(
        "glass p-4 flex flex-col gap-1",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-primary)]">
          LIVE INTELLIGENCE FEED
        </h3>
        <motion.span
          className="inline-block w-2 h-2 rounded-full"
          style={{ backgroundColor: "#06b6d4" }}
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Event list */}
      <div className="flex flex-col gap-0 max-h-[480px] overflow-y-auto no-scrollbar">
        <AnimatePresence initial={false}>
          {visible.map((event, idx) => {
            const cfg = LEVEL_CONFIG[event.level];
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{
                  duration: 0.35,
                  delay: idx * 0.04,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                className="flex items-start gap-3 py-2.5 border-b border-[var(--border-subtle)] last:border-b-0 group"
              >
                {/* Level dot */}
                <div className="flex-shrink-0 mt-0.5">
                  <motion.div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: cfg.color }}
                    animate={
                      event.level === "critical"
                        ? { opacity: [1, 0.5, 1] }
                        : {}
                    }
                    transition={
                      event.level === "critical"
                        ? { duration: 1, repeat: Infinity }
                        : {}
                    }
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Meta row: timestamp + agent chip */}
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-mono tracking-wider text-[var(--text-muted)]">
                      {event.timestamp}
                    </span>
                    <span
                      className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider"
                      style={{
                        backgroundColor: cfg.bg,
                        color: cfg.color,
                        border: `1px solid ${cfg.color}33`,
                      }}
                    >
                      {AGENT_LABELS[event.agent] || event.agent}
                    </span>
                  </div>

                  {/* Message */}
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-2 group-hover:text-[var(--text-primary)] transition-colors duration-200">
                    {event.message}
                  </p>

                  {/* Related stock/sector */}
                  {(event.relatedStock || event.relatedSector) && (
                    <div className="flex items-center gap-2 mt-1">
                      {event.relatedStock && (
                        <span className="text-[10px] font-mono-nums text-[var(--text-accent)]">
                          {event.relatedStock}
                        </span>
                      )}
                      {event.relatedSector && (
                        <span className="text-[10px] text-[var(--text-muted)]">
                          {event.relatedSector}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {visible.length === 0 && (
          <div className="py-8 text-center text-xs text-[var(--text-muted)]">
            No intelligence events yet
          </div>
        )}
      </div>
    </div>
  );
}
