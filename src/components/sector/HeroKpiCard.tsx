"use client";

/**
 * HeroKpiCard — Glassmorphism KPI card for Hero area
 *
 * Desktop: gradient bg, soft border, blur, top highlight, border-radius 16px
 * Mobile (compact=true): border-radius 18px, height 70-76px, tighter padding
 */

import React from "react";

interface HeroKpiCardProps {
  label: string;
  value: string;
  tone: "positive" | "negative" | "neutral";
  compact?: boolean; // true for mobile
}

const VALUE_COLORS: Record<HeroKpiCardProps["tone"], string> = {
  positive: "#34d399",
  negative: "#fb7185",
  neutral: "#e5e7eb",
};

export default function HeroKpiCard({
  label,
  value,
  tone,
  compact = false,
}: HeroKpiCardProps) {
  const desktopBg =
    "linear-gradient(180deg, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0.025) 100%)";
  const mobileBg =
    "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.022) 100%)";

  return (
    <div
      className="relative flex-shrink-0"
      style={{
        background: compact ? mobileBg : desktopBg,
        border: compact
          ? "1px solid rgba(148,163,184,0.13)"
          : "1px solid rgba(148,163,184,0.16)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.06), 0 8px 24px rgba(0,0,0,0.18)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        borderRadius: compact ? "18px" : "16px",
        ...(compact
          ? { height: "73px", padding: "16px 18px" }
          : { padding: "14px 20px" }),
        minWidth: compact ? "100px" : undefined,
      }}
    >
      {/* Top highlight pseudo-element */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "12%",
          right: "12%",
          height: "1px",
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)",
          opacity: 0.55,
          pointerEvents: "none",
        }}
      />

      {/* Content */}
      <span
        style={{
          fontSize: "10px",
          color: "#64748b",
          opacity: 0.85,
          display: "block",
          lineHeight: 1.3,
        }}
      >
        {label}
      </span>
      <span
        className="font-mono-nums"
        style={{
          fontSize: compact ? "14px" : "14px",
          fontWeight: 600,
          color: VALUE_COLORS[tone],
          lineHeight: 1.4,
        }}
      >
        {value}
      </span>
    </div>
  );
}
