"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { cn, formatPercent } from "@/lib/utils";
import type { Sector } from "@/mock/sectors";
import {
  TrendingUp,
  TrendingDown,
  Flame,
  Crown,
} from "lucide-react";
import { sectorIconMap, SectorFallback } from "@/components/icons/SectorIcons";
import VisualCardComparison from "@/components/visual-lab/VisualCardComparison";
import { MagneticSurface } from "@/components/interaction/MagneticSurface";

const iconMap = sectorIconMap;

function MiniSparkline({ color }: { color: string }) {
  const points = Array.from({ length: 12 }, (_, i) => {
    const x = (i / 11) * 80;
    const y = 20 + Math.sin(i * 0.8 + Math.random()) * 10 + (Math.random() - 0.5) * 5;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width="80" height="30" viewBox="0 0 80 30" className="opacity-60">
      <motion.polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.5, delay: 0.5 }}
      />
    </svg>
  );
}

interface AdvancedSectorCardProps {
  sector: Sector;
  mode: "css" | "canvas";
  animationsEnabled: boolean;
  index?: number;
}

export default function AdvancedSectorCard({
  sector,
  mode,
  animationsEnabled,
  index = 0,
}: AdvancedSectorCardProps) {
  const router = useRouter();
  const Icon = iconMap[sector.icon] || SectorFallback;
  const isUp = sector.changePercent >= 0;
  const isTop3 = sector.hotRank <= 3;
  const isRank1 = sector.hotRank === 1;

  return (
    <MagneticSurface intensity="subtle">
    <motion.div
      key={sector.id}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={animationsEnabled ? { opacity: 1, y: 0, scale: 1 } : { opacity: 1 }}
      transition={{
        duration: 0.5,
        delay: 0.3 + index * 0.08,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      whileHover={animationsEnabled ? { scale: 1.02, y: -4 } : undefined}
      onClick={() => router.push(`/sectors/${sector.id}`)}
      className={cn(
        "group relative overflow-hidden rounded-2xl cursor-pointer",
        isRank1 && "rank-1-glow",
        "card-interactive mobile-press"
      )}
      style={{
        background:
          "linear-gradient(135deg, rgba(21,29,45,0.96) 0%, rgba(13,20,33,0.98) 55%, rgba(8,13,24,1) 100%)",
        backdropFilter: "blur(22px) saturate(140%)",
        WebkitBackdropFilter: "blur(22px) saturate(140%)",
        border: isRank1
          ? "1px solid rgba(212,165,116,0.20)"
          : isTop3
            ? "1px solid rgba(198,166,112,0.14)"
            : "1px solid rgba(255,255,255,0.08)",
        boxShadow: isRank1
          ? "inset 0 1px 0 rgba(255,255,255,0.04), 0 0 30px rgba(212,165,116,0.08), 0 0 20px rgba(0,0,0,0.3)"
          : "inset 0 1px 0 rgba(255,255,255,0.04), 0 0 20px rgba(0,0,0,0.3)",
      }}
    >
      {/* Visual background layer — CSS or Canvas based on mode */}
      <VisualCardComparison
        sector={sector}
        mode={mode}
        animationsEnabled={animationsEnabled}
      />

      {/* Dark overlay for text readability */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, rgba(2,6,18,0.65) 0%, rgba(2,6,18,0.45) 40%, transparent 70%)",
        }}
      />

      {/* Top highlight glass overlay */}
      <div
        className="absolute inset-0 pointer-events-none rounded-2xl"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.035) 0%, transparent 42%)",
        }}
      />

      {/* Rank 1 shimmer accent */}
      {isRank1 && (
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(212,165,116,0.1), transparent)",
            backgroundSize: "200% 100%",
            animation: animationsEnabled ? "shimmer 4s ease-in-out infinite" : "none",
          }}
        />
      )}

      {/* Content — z-10 above all backgrounds */}
      <div className="relative z-10 p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div
            className={cn(
              "rounded-xl flex items-center justify-center",
              isTop3 ? "w-10 h-10" : "w-9 h-9"
            )}
            style={{
              background: `${sector.accentColor}${isTop3 ? "28" : "20"}`,
              border: `1px solid ${sector.accentColor}${isTop3 ? "40" : "30"}`,
            }}
          >
            <Icon
              size={isTop3 ? 20 : 18}
              style={{ color: sector.accentColor }}
            />
          </div>
          <div className="flex items-center gap-1">
            {/* Micro status chip — dark glass bg */}
            <div
              className="flex items-center gap-1 transition-all duration-200"
              style={{
                height: "21px",
                padding: "3px 8px",
                borderRadius: "6px",
                background: "rgba(8,12,24,0.45)",
                backdropFilter: "blur(11px)",
                WebkitBackdropFilter: "blur(11px)",
                border: "1px solid rgba(255,255,255,0.13)",
                boxShadow: "0 0 10px rgba(255,190,90,0.08)",
              }}
            >
              {isRank1 ? (
                <Crown size={10} className="text-[var(--accent)]" />
              ) : (
                <Flame
                  size={9}
                  className="text-[var(--accent)] opacity-60"
                />
              )}
              <span
                className="font-mono-nums"
                style={{
                  fontSize: "10.5px",
                  fontWeight: isTop3 ? 600 : 500,
                  color: isTop3
                    ? "var(--accent)"
                    : "rgba(255,255,255,0.70)",
                  lineHeight: 1,
                }}
              >
                #{sector.hotRank}
              </span>
            </div>
          </div>
        </div>

        {/* Name */}
        <h3
          className="font-semibold mb-1"
          style={{
            fontSize: isTop3 ? "15px" : "14px",
            color: "rgba(255,255,255,0.92)",
          }}
        >
          {sector.name}
        </h3>

        {/* Change */}
        <div className="flex items-center gap-1.5 mb-2">
          {isUp ? (
            <TrendingUp size={12} className="text-up" />
          ) : (
            <TrendingDown size={12} className="text-down" />
          )}
          <span
            className={cn(
              "font-bold font-mono-nums",
              isUp ? "text-up" : "text-down"
            )}
            style={{
              fontSize: isTop3 ? "14px" : "13px",
            }}
          >
            {formatPercent(sector.changePercent)}
          </span>
        </div>

        {/* Sparkline */}
        <MiniSparkline color={isUp ? "var(--up)" : "var(--down)"} />

        {/* Stats */}
        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-[rgba(255,255,255,0.06)]">
          <div>
            <span
              style={{
                fontSize: "10.5px",
                color: "rgba(255,255,255,0.40)",
                display: "block",
              }}
            >
              成交额
            </span>
            <span
              className="font-mono-nums"
              style={{
                fontSize: "12px",
                color: "rgba(255,255,255,0.50)",
              }}
            >
              {sector.turnover}
            </span>
          </div>
          <div className="text-right">
            <span
              style={{
                fontSize: "10.5px",
                color: "rgba(255,255,255,0.40)",
                display: "block",
              }}
            >
              资金流
            </span>
            <span
              className={cn(
                "font-mono-nums",
                sector.capitalInflow.startsWith("+")
                  ? "text-up"
                  : "text-down"
              )}
              style={{ fontSize: "12px" }}
            >
              {sector.capitalInflow}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
    </MagneticSurface>
  );
}
