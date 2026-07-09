"use client";

import { motion } from "framer-motion";

interface SemiconductorCssVisualProps {
  accentColor: string;
  animationsEnabled: boolean;
}

/**
 * CSS/Framer visual for 半导体 (Semiconductor)
 * - Dark base
 * - Concentric circles (radial-gradient) for wafer rings
 * - Fine etch lines (repeating-conic-gradient)
 * - Subtle breathing animation
 * - Blue #6366f1 and purple #a855f7, low opacity
 * - High-end, restrained, precision manufacturing feel
 */
export default function SemiconductorCssVisual({
  accentColor,
  animationsEnabled,
}: SemiconductorCssVisualProps) {
  const blue = "#6366f1";
  const purple = "#a855f7";
  // Use accentColor as sector tint
  const tint = accentColor || blue;

  // Concentric ring sizes
  const rings = [
    { size: 70, color: blue, opacity: 0.18, stroke: 1.5 },
    { size: 58, color: blue, opacity: 0.14, stroke: 1.2 },
    { size: 46, color: purple, opacity: 0.12, stroke: 1 },
    { size: 34, color: blue, opacity: 0.1, stroke: 0.8 },
    { size: 22, color: purple, opacity: 0.08, stroke: 0.6 },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Subtle gradient base — uses accentColor */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 60% 50%, ${tint}06 0%, transparent 60%)`,
        }}
      />

      {/* Wafer circles — SVG */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 320 200"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Outer wafer ring */}
        <motion.circle
          cx="190"
          cy="100"
          r="80"
          fill="none"
          stroke={blue}
          strokeWidth="1.5"
          strokeOpacity="0.2"
          animate={
            animationsEnabled
              ? { r: [80, 82, 80], strokeOpacity: [0.2, 0.25, 0.2] }
              : undefined
          }
          transition={
            animationsEnabled
              ? { duration: 4, repeat: Infinity, ease: "easeInOut" }
              : undefined
          }
        />

        {/* Concentric rings */}
        {rings.map((ring, i) => (
          <motion.circle
            key={i}
            cx="190"
            cy="100"
            r={ring.size}
            fill="none"
            stroke={ring.color}
            strokeWidth={ring.stroke}
            strokeOpacity={ring.opacity}
            animate={
              animationsEnabled
                ? { strokeOpacity: [ring.opacity, ring.opacity * 1.3, ring.opacity] }
                : undefined
            }
            transition={
              animationsEnabled
                ? {
                    duration: 3 + i * 0.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.3,
                  }
                : undefined
            }
          />
        ))}

        {/* Wafer surface fill — very faint */}
        <circle cx="190" cy="100" r="78" fill={tint} opacity="0.02" />

        {/* Etch lines — radial */}
        {[0, 45, 90, 135].map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const x1 = 190 + Math.cos(rad) * 20;
          const y1 = 100 + Math.sin(rad) * 20;
          const x2 = 190 + Math.cos(rad) * 80;
          const y2 = 100 + Math.sin(rad) * 80;
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={i % 2 === 0 ? blue : purple}
              strokeWidth="0.5"
              strokeOpacity="0.12"
            />
          );
        })}

        {/* Cross lines */}
        <line x1="190" y1="22" x2="190" y2="178" stroke={blue} strokeWidth="0.5" strokeOpacity="0.1" />
        <line x1="112" y1="100" x2="268" y2="100" stroke={blue} strokeWidth="0.5" strokeOpacity="0.1" />

        {/* Die grid cells */}
        {[-2, -1, 0, 1, 2].map((col) =>
          [-1, 0, 1].map((row) => (
            <rect
              key={`die-${col}-${row}`}
              x={190 + col * 18 - 7}
              y={100 + row * 22 - 9}
              width="14"
              height="18"
              rx="1"
              fill="none"
              stroke={purple}
              strokeWidth="0.4"
              strokeOpacity="0.08"
            />
          ))
        )}

        {/* Center glow */}
        <motion.circle
          cx="190"
          cy="100"
          r="12"
          fill={tint}
          opacity="0.06"
          animate={
            animationsEnabled
              ? { opacity: [0.04, 0.08, 0.04], r: [12, 14, 12] }
              : undefined
          }
          transition={
            animationsEnabled
              ? { duration: 3.5, repeat: Infinity, ease: "easeInOut" }
              : undefined
          }
        />

        {/* Notch indicator */}
        <path
          d="M 186 179 L 190 174 L 194 179"
          fill="none"
          stroke={blue}
          strokeWidth="1"
          strokeOpacity="0.15"
        />
      </svg>

      {/* Conic gradient overlay for etch feel */}
      <div
        className="absolute inset-0"
        style={{
          background: `conic-gradient(from 0deg at 59.4% 50%, ${blue}03 0deg, transparent 15deg, ${purple}02 30deg, transparent 45deg, ${blue}03 60deg, transparent 75deg, ${purple}02 90deg, transparent 105deg, ${blue}03 120deg, transparent 135deg, ${purple}02 150deg, transparent 165deg, ${blue}03 180deg, transparent 195deg, ${purple}02 210deg, transparent 225deg, ${blue}03 240deg, transparent 255deg, ${purple}02 270deg, transparent 285deg, ${blue}03 300deg, transparent 315deg, ${purple}02 330deg, transparent 345deg, ${blue}03 360deg)`,
          opacity: 0.5,
        }}
      />
    </div>
  );
}
