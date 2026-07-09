"use client";

import { motion } from "framer-motion";
import type { SentinelDimension } from "@/types/agent";

interface Props {
  dimensions: SentinelDimension[];
}

const SVG_SIZE = 300;
const CENTER = SVG_SIZE / 2;
const MAX_RADIUS = 120;
const CONCENTRIC = [40, 80, 120];

function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleDeg: number
) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

export default function SentinelPulse({ dimensions }: Props) {
  const count = dimensions.length;
  const angleStep = 360 / count;

  // Build polygon points
  const polygonPoints = dimensions
    .map((d, i) => {
      const r = (d.value / 100) * MAX_RADIUS;
      const pt = polarToCartesian(CENTER, CENTER, r, i * angleStep);
      return `${pt.x},${pt.y}`;
    })
    .join(" ");

  // Axis lines and labels
  const axes = dimensions.map((d, i) => {
    const outer = polarToCartesian(CENTER, CENTER, MAX_RADIUS + 24, i * angleStep);
    const inner = polarToCartesian(CENTER, CENTER, MAX_RADIUS, i * angleStep);
    return {
      x1: CENTER,
      y1: CENTER,
      x2: inner.x,
      y2: inner.y,
      labelX: outer.x,
      labelY: outer.y,
      label: d.label,
      color: d.color,
      angle: i * angleStep,
    };
  });

  return (
    <div className="w-full max-w-sm mx-auto">
      <motion.svg
        viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
        className="w-full h-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {/* Concentric reference circles */}
        {CONCENTRIC.map((r) => (
          <circle
            key={r}
            cx={CENTER}
            cy={CENTER}
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1"
          />
        ))}

        {/* Axis lines */}
        {axes.map((axis, i) => (
          <line
            key={`axis-${i}`}
            x1={axis.x1}
            y1={axis.y1}
            x2={axis.x2}
            y2={axis.y2}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="1"
          />
        ))}

        {/* Data polygon — animated from 0 scale */}
        <motion.polygon
          points={polygonPoints}
          fill="rgba(6, 182, 212, 0.15)"
          stroke="rgba(6, 182, 212, 0.8)"
          strokeWidth="2"
          strokeLinejoin="round"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            duration: 0.8,
            delay: 0.2,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          style={{ transformOrigin: `${CENTER}px ${CENTER}px` }}
        />

        {/* Data points */}
        {dimensions.map((d, i) => {
          const r = (d.value / 100) * MAX_RADIUS;
          const pt = polarToCartesian(CENTER, CENTER, r, i * angleStep);
          return (
            <motion.circle
              key={`dot-${i}`}
              cx={pt.x}
              cy={pt.y}
              r="4"
              fill={d.color || "rgba(6, 182, 212, 0.9)"}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                duration: 0.4,
                delay: 0.6 + i * 0.08,
                ease: "easeOut",
              }}
            />
          );
        })}

        {/* Labels at axis ends */}
        {axes.map((axis, i) => (
          <motion.text
            key={`label-${i}`}
            x={axis.labelX}
            y={axis.labelY}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={axis.color || "var(--text-secondary)"}
            fontSize="11"
            fontFamily="system-ui, sans-serif"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.4 + i * 0.06 }}
          >
            {axis.label}
          </motion.text>
        ))}

        {/* Center title */}
        <motion.text
          x={CENTER}
          y={CENTER}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="var(--text-primary)"
          fontSize="13"
          fontWeight="700"
          fontFamily="system-ui, sans-serif"
          letterSpacing="0.15em"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          SENTINEL
        </motion.text>
        <motion.text
          x={CENTER}
          y={CENTER + 16}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="rgba(6, 182, 212, 0.7)"
          fontSize="11"
          fontWeight="600"
          fontFamily="system-ui, sans-serif"
          letterSpacing="0.2em"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          PULSE
        </motion.text>
      </motion.svg>

      {/* Dimension legend */}
      <div className="flex flex-wrap justify-center gap-3 mt-4">
        {dimensions.map((d, i) => (
          <motion.div
            key={d.label}
            className="flex items-center gap-1.5"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.7 + i * 0.06 }}
          >
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{ backgroundColor: d.color || "rgba(6, 182, 212, 0.9)" }}
            />
            <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider">
              {d.label}
            </span>
            <span className="text-[11px] font-mono-nums text-[var(--text-secondary)]">
              {d.value}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
