"use client";

import { motion } from "framer-motion";

interface ComputeCssVisualProps {
  accentColor: string;
  animationsEnabled: boolean;
}

/**
 * CSS/Framer visual for 算力 (Computing Power)
 * - Dark base with subtle blue-purple gradient
 * - CSS grid lines (repeating-linear-gradient)
 * - Chip outline (CSS border rectangle) in center
 * - Subtle pulse animation on the chip
 * - Blue #3b82f6 and purple #8b5cf6, low opacity
 * - Precise, cold, rational
 */
export default function ComputeCssVisual({
  accentColor,
  animationsEnabled,
}: ComputeCssVisualProps) {
  const blue = "#3b82f6";
  const purple = "#8b5cf6";
  // Use accentColor as sector tint
  const tint = accentColor || blue;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Subtle gradient base — uses accentColor */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 50% 50%, ${tint}06 0%, transparent 70%)`,
        }}
      />

      {/* Grid lines */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            repeating-linear-gradient(0deg, ${blue}0a 0px, ${blue}0a 1px, transparent 1px, transparent 24px),
            repeating-linear-gradient(90deg, ${purple}0a 0px, ${purple}0a 1px, transparent 1px, transparent 24px)
          `,
          opacity: 0.6,
        }}
      />

      {/* Chip outline — centered */}
      <div
        className="absolute"
        style={{
          top: "18%",
          left: "25%",
          right: "25%",
          bottom: "18%",
          border: `1.5px solid ${blue}1a`,
          borderRadius: "4px",
        }}
      >
        {/* Inner die */}
        <div
          className="absolute"
          style={{
            top: "15%",
            left: "15%",
            right: "15%",
            bottom: "15%",
            border: `1px solid ${purple}14`,
            borderRadius: "2px",
            background: `${tint}04`,
          }}
        />

        {/* Core glow */}
        <motion.div
          className="absolute"
          style={{
            top: "30%",
            left: "30%",
            right: "30%",
            bottom: "30%",
            borderRadius: "2px",
            background: `radial-gradient(circle, ${tint}12 0%, transparent 70%)`,
          }}
          animate={
            animationsEnabled
              ? { opacity: [0.5, 1, 0.5] }
              : { opacity: 0.7 }
          }
          transition={
            animationsEnabled
              ? { duration: 3, repeat: Infinity, ease: "easeInOut" }
              : undefined
          }
        />

        {/* Horizontal pin lines — top */}
        {[20, 35, 50, 65, 80].map((pct, i) => (
          <div
            key={`top-${i}`}
            className="absolute"
            style={{
              top: "-6px",
              left: `${pct}%`,
              width: "1px",
              height: "6px",
              background: `${blue}18`,
            }}
          />
        ))}
        {/* Horizontal pin lines — bottom */}
        {[20, 35, 50, 65, 80].map((pct, i) => (
          <div
            key={`bottom-${i}`}
            className="absolute"
            style={{
              bottom: "-6px",
              left: `${pct}%`,
              width: "1px",
              height: "6px",
              background: `${blue}18`,
            }}
          />
        ))}
        {/* Vertical pin lines — left */}
        {[25, 50, 75].map((pct, i) => (
          <div
            key={`left-${i}`}
            className="absolute"
            style={{
              left: "-6px",
              top: `${pct}%`,
              width: "6px",
              height: "1px",
              background: `${purple}18`,
            }}
          />
        ))}
        {/* Vertical pin lines — right */}
        {[25, 50, 75].map((pct, i) => (
          <div
            key={`right-${i}`}
            className="absolute"
            style={{
              right: "-6px",
              top: `${pct}%`,
              width: "6px",
              height: "1px",
              background: `${purple}18`,
            }}
          />
        ))}
      </div>

      {/* Subtle circuit trace — right side */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 320 200"
        preserveAspectRatio="none"
      >
        <motion.polyline
          points="240,72 270,72 270,100"
          fill="none"
          stroke={blue}
          strokeWidth="0.8"
          strokeOpacity="0.15"
          initial={{ pathLength: 0 }}
          animate={animationsEnabled ? { pathLength: 1 } : { pathLength: 1 }}
          transition={{ duration: 2, delay: 0.5 }}
        />
        <motion.polyline
          points="240,120 265,120 265,150"
          fill="none"
          stroke={purple}
          strokeWidth="0.8"
          strokeOpacity="0.12"
          initial={{ pathLength: 0 }}
          animate={animationsEnabled ? { pathLength: 1 } : { pathLength: 1 }}
          transition={{ duration: 2, delay: 1 }}
        />
        <motion.polyline
          points="80,72 55,72 55,45"
          fill="none"
          stroke={blue}
          strokeWidth="0.8"
          strokeOpacity="0.15"
          initial={{ pathLength: 0 }}
          animate={animationsEnabled ? { pathLength: 1 } : { pathLength: 1 }}
          transition={{ duration: 2, delay: 0.8 }}
        />
      </svg>
    </div>
  );
}
