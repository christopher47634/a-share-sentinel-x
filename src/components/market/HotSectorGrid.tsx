"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { sectors } from "@/mock/sectors";
import { cn, formatPercent } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  Flame,
  Crown,
} from "lucide-react";
import { sectorIconMap, SectorFallback } from "@/components/icons/SectorIcons";
import { useRef, useState, useEffect } from "react";
import SectorVisualBackground from "@/components/sector/SectorVisualBackground";
import HoverGlow from "@/components/sector-visuals/HoverGlow";
import { isCanvasVisualsEnabled } from "@/lib/feature-flags";
import { getSectorCanvas } from "@/components/sector-visuals/getSectorCanvas";

const iconMap = sectorIconMap;

function MiniSparkline({ color }: { color: string }) {
  // Generate a random sparkline path
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

/** Wrapper that measures its container and renders the correct canvas */
function CanvasCardBackground({ visualType, hoverIntensity = 0 }: { visualType: string; hoverIntensity?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      setDims({ width: Math.round(rect.width), height: Math.round(rect.height) });
    };
    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const hasSize = dims.width > 0 && dims.height > 0;

  const CanvasComponent = getSectorCanvas(visualType);

  return (
    <div ref={containerRef} className="absolute inset-0 z-0">
      {hasSize && CanvasComponent && (
        <CanvasComponent
          width={dims.width}
          height={dims.height}
          animationsEnabled
          hoverIntensity={hoverIntensity}
        />
      )}
      {/* Dark overlay for text readability over canvas — P5-A1 visual fix: reduced from 0.35 to restore background visibility */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "rgba(2,6,18,0.12)" }}
      />
    </div>
  );
}

export default function HotSectorGrid() {
  const router = useRouter();
  const sortedSectors = [...sectors].sort((a, b) => a.hotRank - b.hotRank);
  const [hoveredSectorId, setHoveredSectorId] = useState<string | null>(null);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch(!window.matchMedia("(hover: hover)").matches);
  }, []);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3" id="sectors">
      {sortedSectors.map((sector, i) => {
        const Icon = iconMap[sector.icon] || SectorFallback;
        const isUp = sector.changePercent >= 0;
        const isTop3 = i < 3;
        const isRank1 = i === 0;
        const hasCanvasVisual = isCanvasVisualsEnabled() && !!getSectorCanvas(sector.visualType);

        return (
          <motion.div
            key={sector.id}
            data-demo-highlight={
              sector.id === "optical-communication"
                ? "optical-communication"
                : undefined
            }
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.5,
              delay: 0.3 + i * 0.06,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={isTouch ? { scale: 0.98 } : undefined}
            onClick={() => router.push(`/sectors/${sector.id}`)}
            onMouseEnter={() => setHoveredSectorId(sector.id)}
            onMouseLeave={() => setHoveredSectorId(null)}
            className={cn(
              "group relative overflow-hidden rounded-2xl cursor-pointer",
              isRank1 && "rank-1-glow"
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
            {/* SectorVisualBackground — P1H-cardfix-2: full-card industry watermark */}
            <SectorVisualBackground
              visualType={sector.visualType}
              accentColor={sector.accentColor}
              intensity="subtle"
            />

            {/* Layer 2: Canvas background for all sectors (feature-flagged) */}
            {hasCanvasVisual && (
              <CanvasCardBackground
                visualType={sector.visualType}
                hoverIntensity={hoveredSectorId === sector.id ? 1 : 0}
              />
            )}

            {/* Layer 3: Left-side dark overlay — ensures text readability — P5-A1 visual fix: reduced from 0.65/0.45 */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(90deg, rgba(2,6,18,0.48) 0%, rgba(2,6,18,0.25) 40%, transparent 70%)',
              }}
            />

            {/* HoverGlow for upgraded cards */}
            {hasCanvasVisual && (
              <HoverGlow
                enabled
                color={sector.accentColor}
                radius={170}
                opacity={0.14}
              />
            )}

            {/* Top highlight glass overlay */}
            <div
              className="absolute inset-0 pointer-events-none rounded-2xl"
              style={{
                background: "linear-gradient(180deg, rgba(255,255,255,0.035) 0%, transparent 42%)",
              }}
            />

            {/* Rank 1 shimmer border accent */}
            {isRank1 && (
              <div
                className="absolute inset-0 pointer-events-none opacity-30"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(212,165,116,0.1), transparent)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 4s ease-in-out infinite",
                }}
              />
            )}

            {/* Content — z-10 above backgrounds */}
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

              {/* Name — shared layout transition with detail page */}
              <motion.h3
                layoutId={`sector-name-${sector.id}`}
                className="font-semibold mb-1"
                style={{
                  fontSize: isTop3 ? "15px" : "14px",
                  color: "rgba(255,255,255,0.92)",
                }}
              >
                {sector.name}
              </motion.h3>

              {/* Change — shared layout transition with detail page */}
              <div className="flex items-center gap-1.5 mb-2">
                {isUp ? (
                  <TrendingUp size={12} className="text-up" />
                ) : (
                  <TrendingDown size={12} className="text-down" />
                )}
                <motion.span
                  layoutId={`sector-change-${sector.id}`}
                  className={cn(
                    "font-bold font-mono-nums",
                    isUp ? "text-up" : "text-down"
                  )}
                  style={{
                    fontSize: isTop3 ? "14px" : "13px",
                  }}
                >
                  {formatPercent(sector.changePercent)}
                </motion.span>
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
        );
      })}
    </div>
  );
}
