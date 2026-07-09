"use client";

import { motion } from "framer-motion";

interface OpticalCssVisualProps {
  accentColor: string;
  animationsEnabled: boolean;
}

/**
 * CSS/Framer visual for 光通信 (Optical Communication)
 * - Diagonal gradient lines (top-right to bottom-left)
 * - Small dots moving along lines slowly
 * - Gold #c9a84c and cyan #22d3ee, low opacity
 * - Elegant, financial terminal feel
 */
export default function OpticalCssVisual({
  accentColor,
  animationsEnabled,
}: OpticalCssVisualProps) {
  const gold = "#c9a84c";
  const cyan = "#22d3ee";
  // Use accentColor as a subtle tint overlay to bind the visual to the sector
  const tint = accentColor || gold;

  // Define diagonal lines from top-right to bottom-left
  const lines = [
    { x1: "100%", y1: "0%", x2: "0%", y2: "100%", color: gold, opacity: 0.25, width: 1.5 },
    { x1: "90%", y1: "0%", x2: "-10%", y2: "100%", color: cyan, opacity: 0.18, width: 1.2 },
    { x1: "110%", y1: "10%", x2: "10%", y2: "110%", color: gold, opacity: 0.15, width: 1 },
    { x1: "95%", y1: "-5%", x2: "-5%", y2: "95%", color: cyan, opacity: 0.12, width: 0.8 },
    { x1: "105%", y1: "5%", x2: "5%", y2: "105%", color: gold, opacity: 0.1, width: 0.6 },
  ];

  // Dots that travel along lines
  const dots = [
    { delay: 0, duration: 6, color: gold, size: 3 },
    { delay: 2, duration: 8, color: cyan, size: 2.5 },
    { delay: 4, duration: 7, color: gold, size: 2 },
    { delay: 1, duration: 9, color: cyan, size: 2 },
    { delay: 3, duration: 7.5, color: gold, size: 1.8 },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Subtle gradient base — uses accentColor for sector binding */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 70% 30%, ${tint}08 0%, transparent 60%)`,
        }}
      />

      {/* SVG lines */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 320 200"
        preserveAspectRatio="none"
      >
        {lines.map((line, i) => (
          <motion.line
            key={i}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke={line.color}
            strokeWidth={line.width}
            strokeOpacity={line.opacity}
            strokeDasharray="8 16"
            initial={{ strokeDashoffset: 0 }}
            animate={
              animationsEnabled
                ? { strokeDashoffset: [-24, 0] }
                : { strokeDashoffset: 0 }
            }
            transition={
              animationsEnabled
                ? {
                    duration: 4 + i * 0.5,
                    repeat: Infinity,
                    ease: "linear",
                  }
                : undefined
            }
          />
        ))}

        {/* Dots traveling along the main diagonal */}
        {dots.map((dot, i) => {
          const startX = 320;
          const startY = 0;
          const endX = 0;
          const endY = 200;
          return (
            <motion.circle
              key={`dot-${i}`}
              r={dot.size}
              fill={dot.color}
              opacity={0.35}
              initial={{ cx: startX, cy: startY }}
              animate={
                animationsEnabled
                  ? {
                      cx: [startX, endX, startX],
                      cy: [startY, endY, startY],
                    }
                  : { cx: startX, cy: startY }
              }
              transition={
                animationsEnabled
                  ? {
                      duration: dot.duration,
                      repeat: Infinity,
                      delay: dot.delay,
                      ease: "linear",
                    }
                  : undefined
              }
            />
          );
        })}
      </svg>

      {/* Very faint horizontal scan line */}
      {animationsEnabled && (
        <motion.div
          className="absolute left-0 right-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${tint}20 50%, transparent 100%)`,
          }}
          initial={{ top: "0%" }}
          animate={{ top: ["0%", "100%", "0%"] }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        />
      )}
    </div>
  );
}
