"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { AgentState, AgentRole, AgentStatus } from "@/types/agent";

interface Props {
  agents: AgentState[];
  className?: string;
}

const STATUS_COLOR: Record<AgentStatus, string> = {
  running: "#06b6d4",
  idle: "var(--text-muted, #64748B)",
  success: "var(--up, #22c55e)",
  warning: "#f59e0b",
  error: "var(--down, #ef4444)",
};

const STATUS_LABEL: Record<AgentStatus, string> = {
  running: "Running",
  idle: "Idle",
  success: "Success",
  warning: "Warning",
  error: "Error",
};

const ROLE_ABBREV: Record<AgentRole, string> = {
  data: "DATA",
  portfolio: "PORT",
  market: "MKT",
  signal: "SIG",
  watch: "WCH",
  attribution: "ATTR",
  risk: "RISK",
  explain: "EXPL",
  review: "REV",
  compliance: "CMPL",
};

export default function AgentStatusStrip({ agents, className }: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div
      className={cn(
        "glass flex items-center gap-1 px-4 py-2.5 overflow-x-auto no-scrollbar",
        className
      )}
      style={{
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.05), 0 -8px 24px rgba(0,0,0,0.3)",
      }}
    >
      {agents.map((agent, idx) => {
        const isHovered = hoveredId === agent.id;
        const color = STATUS_COLOR[agent.status];
        const isRunning = agent.status === "running";

        return (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.35,
              delay: idx * 0.05,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className="relative flex-shrink-0"
            onMouseEnter={() => setHoveredId(agent.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            {/* Agent chip */}
            <div
              className={cn(
                "flex items-center gap-1.5 px-2 py-1 rounded-[var(--radius-sm)] cursor-default transition-all duration-200",
                "bg-[var(--chip-bg)] border border-[var(--chip-border)]"
              )}
              style={
                isHovered
                  ? {
                      borderColor: color,
                      boxShadow: `0 0 12px ${color}33`,
                    }
                  : undefined
              }
            >
              {/* Status dot */}
              <motion.div
                className="flex-shrink-0 rounded-full"
                style={{
                  width: 6,
                  height: 6,
                  backgroundColor: color,
                }}
                animate={
                  isRunning
                    ? { opacity: [1, 0.3, 1], scale: [1, 1.4, 1] }
                    : {}
                }
                transition={
                  isRunning
                    ? { duration: 1.4, repeat: Infinity, ease: "easeInOut" }
                    : {}
                }
              />

              {/* Agent name abbreviation */}
              <span
                className="text-[10px] font-semibold uppercase tracking-wider leading-none"
                style={{ color: "var(--chip-text, rgba(255,255,255,0.7))" }}
              >
                {ROLE_ABBREV[agent.role] || agent.role}
              </span>
            </div>

            {/* Tooltip */}
            <AnimatedTooltip
              show={isHovered}
              agent={agent}
              color={color}
            />
          </motion.div>
        );
      })}
    </div>
  );
}

/* ── Inline tooltip sub-component ── */

function AnimatedTooltip({
  show,
  agent,
  color,
}: {
  show: boolean;
  agent: AgentState;
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4, scale: 0.96 }}
      animate={
        show
          ? { opacity: 1, y: 0, scale: 1 }
          : { opacity: 0, y: 4, scale: 0.96 }
      }
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none",
        !show && "invisible"
      )}
    >
      <div
        className="px-3 py-2 rounded-[var(--radius-sm)] text-left whitespace-nowrap"
        style={{
          background:
            "linear-gradient(145deg, rgba(15,22,36,0.95), rgba(10,16,28,0.95))",
          border: `1px solid ${color}44`,
          boxShadow: `0 8px 24px rgba(0,0,0,0.5), 0 0 12px ${color}22`,
          backdropFilter: "blur(18px)",
        }}
      >
        {/* Agent name + status */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-[var(--text-primary)]">
            {agent.name}
          </span>
          <span
            className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded"
            style={{
              backgroundColor: `${color}22`,
              color,
              border: `1px solid ${color}44`,
            }}
          >
            {STATUS_LABEL[agent.status]}
          </span>
        </div>

        {/* Last run */}
        <div className="flex items-center gap-2 text-[10px]">
          <span className="text-[var(--text-muted)]">Last run:</span>
          <span className="font-mono text-[var(--text-secondary)]">
            {agent.lastRunAt}
          </span>
        </div>

        {/* Duration */}
        {agent.durationMs > 0 && (
          <div className="flex items-center gap-2 text-[10px] mt-0.5">
            <span className="text-[var(--text-muted)]">Duration:</span>
            <span className="font-mono text-[var(--text-secondary)]">
              {(agent.durationMs / 1000).toFixed(1)}s
            </span>
          </div>
        )}

        {/* Error */}
        {agent.error && (
          <div className="mt-1 text-[10px]" style={{ color }}>
            {agent.error}
          </div>
        )}
      </div>
    </motion.div>
  );
}
