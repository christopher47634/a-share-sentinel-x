"use client";

/**
 * SectorVisualBackground — P1H-cardfix-2: Large recognizable industry watermark graphics
 *
 * Each sector has a DOMINANT industry silhouette (45-70% of card area) that is
 * recognizable without reading any text. Scale 1.4-2.2x, stroke 1.5-2.5px.
 *
 * Three-layer structure per card:
 *   Layer 1: Large industry watermark SVG (full card, low opacity)
 *   Layer 2: Ambient glow (very faint)
 *   Layer 3: Left-side dark overlay (handled by parent HotSectorGrid)
 */

export type SectorVisualType =
  | "optical"
  | "compute"
  | "semiconductor"
  | "mining"
  | "new-energy"
  | "robotics"
  | "low-altitude"
  | "defense"
  | "medicine"
  | "baijiu";

interface SectorVisualBackgroundProps {
  visualType: SectorVisualType;
  accentColor: string;
  intensity?: "subtle" | "medium" | "strong";
  className?: string;
}

// ---- helpers ----

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}

function rgba(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}

/**
 * P1H-cardfix-2 intensity mapping:
 *   subtle  → card grid watermark opacity 0.26-0.30
 *   medium  → detail hero watermark opacity 0.30-0.34
 *   strong  → hero hover/featured 0.34-0.40
 */
function watermarkOpacity(intensity: "subtle" | "medium" | "strong"): number {
  switch (intensity) {
    case "strong":
      return 0.36;
    case "medium":
      return 0.30;
    case "subtle":
    default:
      return 0.28;
  }
}

function ambientOpacity(intensity: "subtle" | "medium" | "strong"): number {
  switch (intensity) {
    case "strong":
      return 0.14;
    case "medium":
      return 0.12;
    case "subtle":
    default:
      return 0.10;
  }
}

// ---- Per-sector SVG Watermarks (FULL CARD coverage, large recognizable silhouettes) ----

function OpticalSVG({ color, opacity }: { color: string; opacity: number }) {
  // 3-5 large fiber optic bundles shooting from lower-left to upper-right
  // Recognizable as: fiber optics / light beams / data transmission
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 320 180"
      preserveAspectRatio="xMidYMid slice"
      style={{ opacity }}
    >
      {/* Fiber bundle 1 — main bold curve */}
      <path
        d="M -10 190 C 50 150, 120 90, 200 50 S 300 0, 340 -20"
        fill="none"
        stroke={color}
        strokeWidth="2.2"
        opacity="0.34"
      />
      {/* Fiber glow 1 */}
      <path
        d="M -10 190 C 50 150, 120 90, 200 50 S 300 0, 340 -20"
        fill="none"
        stroke={color}
        strokeWidth="8"
        opacity="0.10"
      />

      {/* Fiber bundle 2 */}
      <path
        d="M 0 200 C 60 168, 140 108, 220 65 S 320 8, 350 -10"
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        opacity="0.28"
      />
      {/* Fiber glow 2 */}
      <path
        d="M 0 200 C 60 168, 140 108, 220 65 S 320 8, 350 -10"
        fill="none"
        stroke={color}
        strokeWidth="6"
        opacity="0.08"
      />

      {/* Fiber bundle 3 */}
      <path
        d="M 20 210 C 80 180, 160 120, 240 78 S 330 20, 360 5"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        opacity="0.22"
      />

      {/* Fiber bundle 4 — thinner accent */}
      <path
        d="M -5 175 C 30 145, 90 95, 160 60 S 260 10, 320 -15"
        fill="none"
        stroke={color}
        strokeWidth="1.2"
        opacity="0.18"
      />

      {/* Data light points along main fiber */}
      <circle cx="80" cy="120" r="3.5" fill={color} opacity="0.30" />
      <circle cx="80" cy="120" r="10" fill={color} opacity="0.08" />
      <circle cx="160" cy="70" r="3" fill={color} opacity="0.32" />
      <circle cx="160" cy="70" r="9" fill={color} opacity="0.07" />
      <circle cx="240" cy="32" r="2.5" fill={color} opacity="0.28" />
      <circle cx="240" cy="32" r="8" fill={color} opacity="0.06" />
      <circle cx="50" cy="150" r="2" fill={color} opacity="0.24" />

      {/* Connection node at intersection */}
      <circle cx="200" cy="50" r="5" fill={color} opacity="0.12" />
      <circle cx="200" cy="50" r="2" fill={color} opacity="0.30" />
    </svg>
  );
}

function ComputeSVG({ color, opacity }: { color: string; opacity: number }) {
  // Large chip outline (50-60% of card) + circuit traces + cold blue core glow
  // Recognizable as: chip / CPU / AI computing
  const chipColor = color || "#6366f1";
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 320 180"
      preserveAspectRatio="xMidYMid slice"
      style={{ opacity }}
    >
      {/* Main chip body — large centered rectangle */}
      <rect
        x="80"
        y="15"
        width="160"
        height="150"
        rx="8"
        fill="none"
        stroke={chipColor}
        strokeWidth="2.2"
        opacity="0.32"
      />
      {/* Inner die */}
      <rect
        x="100"
        y="35"
        width="120"
        height="110"
        rx="5"
        fill={chipColor}
        opacity="0.04"
      />
      <rect
        x="100"
        y="35"
        width="120"
        height="110"
        rx="5"
        fill="none"
        stroke={chipColor}
        strokeWidth="1.5"
        opacity="0.24"
      />

      {/* Core processing glow */}
      <rect
        x="130"
        y="60"
        width="60"
        height="60"
        rx="4"
        fill={chipColor}
        opacity="0.08"
      />
      <circle cx="160" cy="90" r="18" fill={chipColor} opacity="0.12" />
      <circle cx="160" cy="90" r="6" fill={chipColor} opacity="0.25" />

      {/* Top pins — 7 */}
      {[105, 120, 135, 155, 175, 190, 205].map((x) => (
        <g key={`t${x}`}>
          <line
            x1={x}
            y1="15"
            x2={x}
            y2="-2"
            stroke={chipColor}
            strokeWidth="1.5"
            opacity="0.28"
          />
          <circle cx={x} cy="-4" r="2.5" fill={chipColor} opacity="0.28" />
        </g>
      ))}
      {/* Bottom pins — 7 */}
      {[105, 120, 135, 155, 175, 190, 205].map((x) => (
        <g key={`b${x}`}>
          <line
            x1={x}
            y1="165"
            x2={x}
            y2="182"
            stroke={chipColor}
            strokeWidth="1.5"
            opacity="0.28"
          />
          <circle cx={x} cy="184" r="2.5" fill={chipColor} opacity="0.28" />
        </g>
      ))}
      {/* Left pins — 4 */}
      {[40, 65, 95, 120].map((y) => (
        <g key={`l${y}`}>
          <line
            x1="80"
            y1={y}
            x2="60"
            y2={y}
            stroke={chipColor}
            strokeWidth="1.5"
            opacity="0.26"
          />
          <circle cx="57" cy={y} r="2.5" fill={chipColor} opacity="0.26" />
        </g>
      ))}
      {/* Right pins — 4 */}
      {[40, 65, 95, 120].map((y) => (
        <g key={`r${y}`}>
          <line
            x1="240"
            y1={y}
            x2="260"
            y2={y}
            stroke={chipColor}
            strokeWidth="1.5"
            opacity="0.26"
          />
          <circle cx="263" cy={y} r="2.5" fill={chipColor} opacity="0.26" />
        </g>
      ))}

      {/* Circuit traces — right side */}
      <polyline
        points="263,40 290,40 290,20"
        fill="none"
        stroke={chipColor}
        strokeWidth="1.2"
        opacity="0.20"
      />
      <polyline
        points="263,65 295,65 295,95"
        fill="none"
        stroke={chipColor}
        strokeWidth="1.2"
        opacity="0.18"
      />
      <polyline
        points="263,95 285,95 285,120"
        fill="none"
        stroke={chipColor}
        strokeWidth="1.0"
        opacity="0.16"
      />
      {/* Circuit traces — left side */}
      <polyline
        points="57,40 30,40 30,18"
        fill="none"
        stroke={chipColor}
        strokeWidth="1.2"
        opacity="0.20"
      />
      <polyline
        points="57,65 25,65 25,95"
        fill="none"
        stroke={chipColor}
        strokeWidth="1.2"
        opacity="0.18"
      />

      {/* Grid pattern inside die — subtle */}
      {[0, 1, 2, 3].map((i) => (
        <line
          key={`gh${i}`}
          x1="105"
          y1={50 + i * 25}
          x2="215"
          y2={50 + i * 25}
          stroke={chipColor}
          strokeWidth="0.5"
          opacity="0.10"
        />
      ))}
      {[0, 1, 2, 3, 4].map((i) => (
        <line
          key={`gv${i}`}
          x1={115 + i * 25}
          y1="40"
          x2={115 + i * 25}
          y2="140"
          stroke={chipColor}
          strokeWidth="0.5"
          opacity="0.10"
        />
      ))}
    </svg>
  );
}

function SemiconductorSVG({ color, opacity }: { color: string; opacity: number }) {
  // Large wafer disc (60%+ of card) with concentric rings + cut lines + circuit overlay
  // Recognizable as: wafer / semiconductor manufacturing
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 320 180"
      preserveAspectRatio="xMidYMid slice"
      style={{ opacity }}
    >
      {/* Large wafer circle — dominant, centered */}
      <circle
        cx="180"
        cy="90"
        r="110"
        fill="none"
        stroke={color}
        strokeWidth="2.2"
        opacity="0.32"
      />
      {/* Concentric wafer rings */}
      <circle cx="180" cy="90" r="92" fill="none" stroke={color} strokeWidth="1.5" opacity="0.24" />
      <circle cx="180" cy="90" r="74" fill="none" stroke={color} strokeWidth="1.2" opacity="0.20" />
      <circle cx="180" cy="90" r="56" fill="none" stroke={color} strokeWidth="1.0" opacity="0.16" />
      <circle cx="180" cy="90" r="38" fill="none" stroke={color} strokeWidth="0.8" opacity="0.14" />
      <circle cx="180" cy="90" r="20" fill="none" stroke={color} strokeWidth="0.6" opacity="0.12" />

      {/* Wafer surface fill — very faint */}
      <circle cx="180" cy="90" r="108" fill={color} opacity="0.03" />

      {/* Cut lines — grid pattern on wafer */}
      <line x1="180" y1="-20" x2="180" y2="200" stroke={color} strokeWidth="0.8" opacity="0.18" />
      <line x1="80" y1="90" x2="280" y2="90" stroke={color} strokeWidth="0.8" opacity="0.18" />
      <line x1="105" y1="15" x2="255" y2="165" stroke={color} strokeWidth="0.6" opacity="0.14" />
      <line x1="255" y1="15" x2="105" y2="165" stroke={color} strokeWidth="0.6" opacity="0.14" />

      {/* Die grid cells — small squares on wafer */}
      {[0, 1, 2, 3, 4].map((col) =>
        [0, 1, 2].map((row) => (
          <rect
            key={`die-${col}-${row}`}
            x={120 + col * 28}
            y={30 + row * 35}
            width="20"
            height="26"
            rx="2"
            fill="none"
            stroke={color}
            strokeWidth="0.6"
            opacity="0.12"
          />
        ))
      )}

      {/* Notch indicator — bottom */}
      <path
        d="M 172 199 L 180 192 L 188 199"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        opacity="0.24"
      />

      {/* Highlight arc — top-right */}
      <path
        d="M 240 25 A 95 95 0 0 1 290 90"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        opacity="0.26"
      />

      {/* Center glow */}
      <circle cx="180" cy="90" r="15" fill={color} opacity="0.06" />
    </svg>
  );
}

function MiningSVG({ color, opacity }: { color: string; opacity: number }) {
  // Large rock strata cross-section + bold gold ore veins + metallic glow spots
  // Recognizable as: mining / ore veins / geological strata
  const gold = "#B8860B";
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 320 180"
      preserveAspectRatio="xMidYMid slice"
      style={{ opacity }}
    >
      {/* Rock strata contour lines — sweeping across full width */}
      <path
        d="M -10 28 Q 80 18, 160 32 Q 240 46, 330 30"
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        opacity="0.24"
      />
      <path
        d="M -10 55 Q 70 42, 155 58 Q 245 74, 340 52"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        opacity="0.20"
      />
      <path
        d="M -10 85 Q 90 72, 160 88 Q 250 104, 340 82"
        fill="none"
        stroke={color}
        strokeWidth="1.2"
        opacity="0.17"
      />
      <path
        d="M -10 115 Q 80 102, 155 118 Q 240 134, 340 112"
        fill="none"
        stroke={color}
        strokeWidth="1.0"
        opacity="0.15"
      />
      <path
        d="M -10 148 Q 75 135, 158 152 Q 245 168, 340 145"
        fill="none"
        stroke={color}
        strokeWidth="0.8"
        opacity="0.12"
      />

      {/* Gold ore vein 1 — bold main vein */}
      <path
        d="M -5 40 L 50 52 L 100 68 L 150 58 L 200 75 L 260 62 L 330 78"
        fill="none"
        stroke={gold}
        strokeWidth="2.5"
        opacity="0.36"
      />
      {/* Glow along main vein */}
      <path
        d="M -5 40 L 50 52 L 100 68 L 150 58 L 200 75 L 260 62 L 330 78"
        fill="none"
        stroke={gold}
        strokeWidth="10"
        opacity="0.08"
      />

      {/* Gold ore vein 2 — secondary */}
      <path
        d="M 20 100 L 80 92 L 140 108 L 200 95 L 270 112 L 340 98"
        fill="none"
        stroke={gold}
        strokeWidth="2.0"
        opacity="0.28"
      />

      {/* Ore deposit glow spots */}
      <circle cx="100" cy="68" r="8" fill={gold} opacity="0.12" />
      <circle cx="100" cy="68" r="3" fill={gold} opacity="0.32" />
      <circle cx="200" cy="75" r="7" fill={gold} opacity="0.10" />
      <circle cx="200" cy="75" r="2.5" fill={gold} opacity="0.30" />
      <circle cx="140" cy="108" r="6" fill={gold} opacity="0.08" />
      <circle cx="140" cy="108" r="2" fill={gold} opacity="0.26" />

      {/* Rock fracture lines */}
      <path
        d="M 120 20 L 130 55 L 118 90 L 135 125"
        fill="none"
        stroke={color}
        strokeWidth="0.8"
        opacity="0.14"
      />
      <path
        d="M 230 15 L 225 50 L 240 85 L 228 130"
        fill="none"
        stroke={color}
        strokeWidth="0.7"
        opacity="0.12"
      />
    </svg>
  );
}

function NewEnergySVG({ color, opacity }: { color: string; opacity: number }) {
  // Large battery/PV array + bold green energy flow + charging glow points
  // Recognizable as: battery / solar / new energy
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 320 180"
      preserveAspectRatio="xMidYMid slice"
      style={{ opacity }}
    >
      {/* Battery module outer frame — large */}
      <rect
        x="30"
        y="15"
        width="180"
        height="150"
        rx="10"
        fill="none"
        stroke={color}
        strokeWidth="2.0"
        opacity="0.30"
      />
      {/* Battery terminal cap */}
      <rect
        x="100"
        y="5"
        width="40"
        height="12"
        rx="3"
        fill={color}
        opacity="0.12"
      />
      <rect
        x="100"
        y="5"
        width="40"
        height="12"
        rx="3"
        fill="none"
        stroke={color}
        strokeWidth="1.2"
        opacity="0.26"
      />

      {/* 3x2 battery cells */}
      {[0, 1, 2].map((col) =>
        [0, 1].map((row) => (
          <g key={`cell-${col}-${row}`}>
            <rect
              x={48 + col * 55}
              y={30 + row * 65}
              width="44"
              height="52"
              rx="4"
              fill={color}
              opacity="0.035"
            />
            <rect
              x={48 + col * 55}
              y={30 + row * 65}
              width="44"
              height="52"
              rx="4"
              fill="none"
              stroke={color}
              strokeWidth="1.2"
              opacity="0.22"
            />
          </g>
        ))
      )}

      {/* Bold energy flow line — sweeping arc from left to right */}
      <path
        d="M 230 160 C 250 120, 270 70, 310 30"
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        opacity="0.30"
      />
      {/* Energy flow glow */}
      <path
        d="M 230 160 C 250 120, 270 70, 310 30"
        fill="none"
        stroke={color}
        strokeWidth="10"
        opacity="0.10"
      />

      {/* Charging energy particles along the flow */}
      <circle cx="245" cy="135" r="4" fill={color} opacity="0.22" />
      <circle cx="245" cy="135" r="10" fill={color} opacity="0.06" />
      <circle cx="270" cy="90" r="3.5" fill={color} opacity="0.26" />
      <circle cx="270" cy="90" r="9" fill={color} opacity="0.07" />
      <circle cx="295" cy="50" r="3" fill={color} opacity="0.24" />
      <circle cx="295" cy="50" r="8" fill={color} opacity="0.06" />

      {/* Lightning bolt — prominent */}
      <path
        d="M 265 105 L 278 130 L 270 130 L 288 165 L 258 128 L 268 128 Z"
        fill={color}
        opacity="0.26"
      />

      {/* Solar panel grid lines — subtle texture in battery cells */}
      {[0, 1, 2].map((col) =>
        [0, 1].map((row) => (
          <g key={`grid-${col}-${row}`}>
            <line
              x1={48 + col * 55}
              y1={55 + row * 65}
              x2={92 + col * 55}
              y2={55 + row * 65}
              stroke={color}
              strokeWidth="0.5"
              opacity="0.10"
            />
            <line
              x1={70 + col * 55}
              y1={30 + row * 65}
              x2={70 + col * 55}
              y2={82 + row * 65}
              stroke={color}
              strokeWidth="0.5"
              opacity="0.10"
            />
          </g>
        ))
      )}
    </svg>
  );
}

function RoboticsSVG({ color, opacity }: { color: string; opacity: number }) {
  // Large mechanical arm with prominent joints + scan lines + positioning crosshairs
  // Recognizable as: robot / mechanical structure
  const jointColor = color || "#F59E0B";
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 320 180"
      preserveAspectRatio="xMidYMid slice"
      style={{ opacity }}
    >
      {/* Base platform — wide */}
      <ellipse cx="80" cy="170" rx="65" ry="10" fill="none" stroke={jointColor} strokeWidth="1.5" opacity="0.24" />
      <rect x="60" y="160" width="40" height="12" rx="3" fill="none" stroke={jointColor} strokeWidth="1.2" opacity="0.22" />

      {/* Joint 1 — shoulder — large prominent circle */}
      <circle cx="80" cy="145" r="22" fill="none" stroke={jointColor} strokeWidth="2.2" opacity="0.34" />
      <circle cx="80" cy="145" r="14" fill="none" stroke={jointColor} strokeWidth="1.2" opacity="0.22" />
      <circle cx="80" cy="145" r="6" fill={jointColor} opacity="0.20" />

      {/* Lower arm — thick */}
      <line x1="80" y1="145" x2="165" y2="72" stroke={jointColor} strokeWidth="2.2" opacity="0.30" />
      {/* Arm panel detail */}
      <line x1="90" y1="135" x2="155" y2="80" stroke={jointColor} strokeWidth="0.8" opacity="0.14" />

      {/* Joint 2 — elbow — large */}
      <circle cx="165" cy="72" r="18" fill="none" stroke={jointColor} strokeWidth="2.2" opacity="0.34" />
      <circle cx="165" cy="72" r="11" fill="none" stroke={jointColor} strokeWidth="1.0" opacity="0.22" />
      <circle cx="165" cy="72" r="5" fill={jointColor} opacity="0.22" />

      {/* Upper arm */}
      <line x1="165" y1="72" x2="230" y2="22" stroke={jointColor} strokeWidth="1.8" opacity="0.28" />

      {/* Gripper — two fingers spread */}
      <line x1="230" y1="22" x2="248" y2="-2" stroke={jointColor} strokeWidth="1.8" opacity="0.28" />
      <line x1="230" y1="22" x2="212" y2="-2" stroke={jointColor} strokeWidth="1.8" opacity="0.28" />
      <circle cx="248" cy="-2" r="4" fill={jointColor} opacity="0.24" />
      <circle cx="212" cy="-2" r="4" fill={jointColor} opacity="0.24" />

      {/* Scan crosshair at gripper */}
      <line x1="220" y1="15" x2="240" y2="15" stroke={jointColor} strokeWidth="0.8" opacity="0.18" />
      <line x1="230" y1="5" x2="230" y2="25" stroke={jointColor} strokeWidth="0.8" opacity="0.18" />

      {/* Motion arc */}
      <path
        d="M 215 5 A 35 35 0 0 1 260 5"
        fill="none"
        stroke={jointColor}
        strokeWidth="1.0"
        opacity="0.16"
        strokeDasharray="4 4"
      />

      {/* Positioning grid lines — subtle */}
      <line x1="0" y1="90" x2="320" y2="90" stroke={jointColor} strokeWidth="0.4" opacity="0.08" />
      <line x1="160" y1="0" x2="160" y2="180" stroke={jointColor} strokeWidth="0.4" opacity="0.08" />

      {/* Small sensor dots */}
      <circle cx="230" cy="22" r="8" fill={jointColor} opacity="0.08" />
    </svg>
  );
}

function LowAltitudeSVG({ color, opacity }: { color: string; opacity: number }) {
  // Large radar concentric circles + flight trajectory arc + aircraft/track point
  // Recognizable as: radar / low-altitude flight / air routes
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 320 180"
      preserveAspectRatio="xMidYMid slice"
      style={{ opacity }}
    >
      {/* Radar origin point — bottom center */}
      <circle cx="140" cy="175" r="6" fill={color} opacity="0.30" />
      <circle cx="140" cy="175" r="14" fill={color} opacity="0.08" />

      {/* Radar concentric arcs — large sweeping */}
      <path
        d="M 140 175 A 60 60 0 0 1 195 130"
        fill="none"
        stroke={color}
        strokeWidth="2.0"
        opacity="0.28"
      />
      <path
        d="M 140 175 A 100 100 0 0 1 230 100"
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        opacity="0.22"
      />
      <path
        d="M 140 175 A 150 150 0 0 1 275 65"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        opacity="0.18"
      />
      <path
        d="M 140 175 A 200 200 0 0 1 310 20"
        fill="none"
        stroke={color}
        strokeWidth="1.2"
        opacity="0.14"
      />

      {/* Radar sweep radial lines */}
      <line x1="140" y1="175" x2="195" y2="130" stroke={color} strokeWidth="0.8" opacity="0.14" />
      <line x1="140" y1="175" x2="275" y2="65" stroke={color} strokeWidth="0.6" opacity="0.10" />
      <line x1="140" y1="175" x2="310" y2="20" stroke={color} strokeWidth="0.5" opacity="0.08" />

      {/* Flight trajectory — bold sweeping curve */}
      <path
        d="M 30 165 Q 100 80, 190 50 T 320 -10"
        fill="none"
        stroke={color}
        strokeWidth="2.2"
        opacity="0.32"
      />
      {/* Trajectory glow */}
      <path
        d="M 30 165 Q 100 80, 190 50 T 320 -10"
        fill="none"
        stroke={color}
        strokeWidth="8"
        opacity="0.08"
      />

      {/* Aircraft / track points */}
      <circle cx="120" cy="80" r="5" fill={color} opacity="0.28" />
      <circle cx="120" cy="80" r="12" fill={color} opacity="0.06" />
      <circle cx="190" cy="50" r="4" fill={color} opacity="0.26" />
      <circle cx="190" cy="50" r="10" fill={color} opacity="0.05" />
      <circle cx="260" cy="22" r="3" fill={color} opacity="0.22" />

      {/* Small aircraft silhouette at head of trajectory */}
      <path
        d="M 188 48 L 196 44 L 192 50 L 196 56 L 188 52 Z"
        fill={color}
        opacity="0.26"
      />
    </svg>
  );
}

function DefenseSVG({ color, opacity }: { color: string; opacity: number }) {
  // Large shield/lock-on frame + dark red scan lines + hexagonal armor texture
  // Recognizable as: defense / radar lock / military equipment
  const darkRed = color || "#EF4444";
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 320 180"
      preserveAspectRatio="xMidYMid slice"
      style={{ opacity }}
    >
      {/* Large shield shape — dominant */}
      <path
        d="M 160 10 L 260 45 L 260 110 Q 260 155, 160 175 Q 60 155, 60 110 L 60 45 Z"
        fill="none"
        stroke={darkRed}
        strokeWidth="2.2"
        opacity="0.30"
      />
      {/* Shield inner */}
      <path
        d="M 160 30 L 240 58 L 240 108 Q 240 142, 160 160 Q 80 142, 80 108 L 80 58 Z"
        fill="none"
        stroke={darkRed}
        strokeWidth="1.5"
        opacity="0.22"
      />
      {/* Shield core fill */}
      <path
        d="M 160 50 L 215 70 L 215 105 Q 215 128, 160 142 Q 105 128, 105 105 L 105 70 Z"
        fill={darkRed}
        opacity="0.04"
      />

      {/* Lock-on targeting frame — corner brackets */}
      <path d="M 85 35 L 85 25 L 95 25" fill="none" stroke={darkRed} strokeWidth="1.8" opacity="0.30" />
      <path d="M 235 35 L 235 25 L 225 25" fill="none" stroke={darkRed} strokeWidth="1.8" opacity="0.30" />
      <path d="M 85 145 L 85 155 L 95 155" fill="none" stroke={darkRed} strokeWidth="1.8" opacity="0.30" />
      <path d="M 235 145 L 235 155 L 225 155" fill="none" stroke={darkRed} strokeWidth="1.8" opacity="0.30" />

      {/* Scan line — horizontal sweep */}
      <line x1="50" y1="90" x2="270" y2="90" stroke={darkRed} strokeWidth="1.0" opacity="0.16" />

      {/* Hexagonal armor pattern — scattered */}
      {[
        [130, 50],
        [190, 50],
        [160, 78],
        [110, 90],
        [210, 90],
        [130, 118],
        [190, 118],
      ].map(([cx, cy], i) => (
        <polygon
          key={`hex-${i}`}
          points={`${cx},${cy - 12} ${cx + 10},${cy - 6} ${cx + 10},${cy + 6} ${cx},${cy + 12} ${cx - 10},${cy + 6} ${cx - 10},${cy - 6}`}
          fill="none"
          stroke={darkRed}
          strokeWidth="0.7"
          opacity="0.12"
        />
      ))}

      {/* Center crosshair */}
      <line x1="145" y1="90" x2="175" y2="90" stroke={darkRed} strokeWidth="1.2" opacity="0.24" />
      <line x1="160" y1="75" x2="160" y2="105" stroke={darkRed} strokeWidth="1.2" opacity="0.24" />
      <circle cx="160" cy="90" r="5" fill={darkRed} opacity="0.18" />
      <circle cx="160" cy="90" r="2" fill={darkRed} opacity="0.32" />
    </svg>
  );
}

function MedicineSVG({ color, opacity }: { color: string; opacity: number }) {
  // Large molecular structure + bond connections + bio pulse line
  // Recognizable as: medicine / biotech / molecular
  const pink = color || "#EC4899";
  const nodeColor = "#a78bfa";
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 320 180"
      preserveAspectRatio="xMidYMid slice"
      style={{ opacity }}
    >
      {/* Large molecule nodes — prominent circles */}
      {/* Node A — top left */}
      <circle cx="80" cy="50" r="16" fill={nodeColor} opacity="0.06" />
      <circle cx="80" cy="50" r="16" fill="none" stroke={nodeColor} strokeWidth="2.0" opacity="0.32" />
      <circle cx="80" cy="50" r="6" fill={nodeColor} opacity="0.20" />

      {/* Node B — top right */}
      <circle cx="220" cy="35" r="18" fill={nodeColor} opacity="0.06" />
      <circle cx="220" cy="35" r="18" fill="none" stroke={nodeColor} strokeWidth="2.0" opacity="0.32" />
      <circle cx="220" cy="35" r="7" fill={nodeColor} opacity="0.22" />

      {/* Node C — center */}
      <circle cx="150" cy="90" r="20" fill={nodeColor} opacity="0.05" />
      <circle cx="150" cy="90" r="20" fill="none" stroke={nodeColor} strokeWidth="2.2" opacity="0.34" />
      <circle cx="150" cy="90" r="8" fill={nodeColor} opacity="0.22" />

      {/* Node D — bottom left */}
      <circle cx="70" cy="140" r="14" fill={nodeColor} opacity="0.06" />
      <circle cx="70" cy="140" r="14" fill="none" stroke={nodeColor} strokeWidth="1.8" opacity="0.28" />
      <circle cx="70" cy="140" r="5" fill={nodeColor} opacity="0.18" />

      {/* Node E — bottom right */}
      <circle cx="250" cy="120" r="15" fill={nodeColor} opacity="0.06" />
      <circle cx="250" cy="120" r="15" fill="none" stroke={nodeColor} strokeWidth="1.8" opacity="0.30" />
      <circle cx="250" cy="120" r="6" fill={nodeColor} opacity="0.20" />

      {/* Chemical bonds — thick connecting lines */}
      <line x1="80" y1="50" x2="150" y2="90" stroke={pink} strokeWidth="2.0" opacity="0.26" />
      <line x1="220" y1="35" x2="150" y2="90" stroke={pink} strokeWidth="2.0" opacity="0.26" />
      <line x1="150" y1="90" x2="70" y2="140" stroke={pink} strokeWidth="1.8" opacity="0.22" />
      <line x1="150" y1="90" x2="250" y2="120" stroke={pink} strokeWidth="1.8" opacity="0.22" />
      <line x1="80" y1="50" x2="220" y2="35" stroke={pink} strokeWidth="1.2" opacity="0.16" />
      <line x1="70" y1="140" x2="250" y2="120" stroke={pink} strokeWidth="1.0" opacity="0.12" />

      {/* Bio pulse line — bold ECG across bottom */}
      <path
        d="M 10 168 L 60 168 L 80 155 L 100 180 L 120 140 L 140 172 L 155 162 L 180 168 L 320 168"
        fill="none"
        stroke={pink}
        strokeWidth="2.0"
        opacity="0.28"
      />
      {/* Pulse glow */}
      <path
        d="M 10 168 L 60 168 L 80 155 L 100 180 L 120 140 L 140 172 L 155 162 L 180 168 L 320 168"
        fill="none"
        stroke={pink}
        strokeWidth="6"
        opacity="0.08"
      />
    </svg>
  );
}

function BaijiuSVG({ color, opacity }: { color: string; opacity: number }) {
  // Premium baijiu bottle silhouette + amber liquid waves + faint oriental pattern
  // Recognizable as: high-end baijiu / liquor / amber luxury
  const amber = color || "#D4A574";
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 320 180"
      preserveAspectRatio="xMidYMid slice"
      style={{ opacity }}
    >
      {/* Bottle cap — prominent */}
      <rect x="138" y="5" width="24" height="14" rx="3" fill={amber} opacity="0.14" />
      <rect x="138" y="5" width="24" height="14" rx="3" fill="none" stroke={amber} strokeWidth="1.5" opacity="0.30" />

      {/* Slim neck */}
      <rect x="142" y="19" width="16" height="38" rx="3" fill="none" stroke={amber} strokeWidth="1.8" opacity="0.30" />

      {/* Neck-shoulder transition curves */}
      <path
        d="M 142 57 Q 142 66, 122 72 L 122 72"
        fill="none"
        stroke={amber}
        strokeWidth="1.5"
        opacity="0.28"
      />
      <path
        d="M 158 57 Q 158 66, 178 72 L 178 72"
        fill="none"
        stroke={amber}
        strokeWidth="1.5"
        opacity="0.28"
      />

      {/* Rounded square shoulders + main body — large */}
      <path
        d="M 122 72 Q 112 72, 112 84 L 112 150 Q 112 164, 126 164 L 174 164 Q 188 164, 188 150 L 188 84 Q 188 72, 178 72"
        fill="none"
        stroke={amber}
        strokeWidth="2.2"
        opacity="0.34"
      />

      {/* Body fill — faint */}
      <rect x="112" y="84" width="76" height="66" rx="5" fill={amber} opacity="0.03" />

      {/* Label zone — center band */}
      <rect x="118" y="88" width="64" height="40" rx="3" fill="none" stroke={amber} strokeWidth="0.8" opacity="0.14" />

      {/* Vertical label line — center */}
      <line x1="150" y1="92" x2="150" y2="155" stroke={amber} strokeWidth="0.8" opacity="0.16" />

      {/* Amber liquid wave ripples — bold at bottom */}
      <path
        d="M 116 138 Q 140 130, 150 138 Q 160 146, 184 138"
        fill="none"
        stroke={amber}
        strokeWidth="1.8"
        opacity="0.28"
      />
      <path
        d="M 114 148 Q 140 140, 152 148 Q 164 156, 186 148"
        fill="none"
        stroke={amber}
        strokeWidth="1.5"
        opacity="0.22"
      />
      <path
        d="M 116 156 Q 138 150, 148 156 Q 158 162, 182 156"
        fill="none"
        stroke={amber}
        strokeWidth="1.0"
        opacity="0.16"
      />

      {/* Faint oriental pattern — top of bottle */}
      <path
        d="M 128 82 Q 140 78, 150 82 Q 160 86, 172 82"
        fill="none"
        stroke={amber}
        strokeWidth="0.6"
        opacity="0.12"
      />
      <path
        d="M 125 86 Q 140 82, 150 86 Q 160 90, 175 86"
        fill="none"
        stroke={amber}
        strokeWidth="0.5"
        opacity="0.10"
      />

      {/* Amber radial glow behind bottle */}
      <ellipse cx="150" cy="110" rx="55" ry="65" fill={amber} opacity="0.04" />

      {/* Small decorative diamond on label */}
      <path
        d="M 142 105 L 150 100 L 158 105 L 150 110 Z"
        fill="none"
        stroke={amber}
        strokeWidth="0.8"
        opacity="0.16"
      />
    </svg>
  );
}

// ---- SVG overlay resolver ----

function getWatermarkSVG(
  visualType: SectorVisualType,
  color: string,
  opacity: number
) {
  switch (visualType) {
    case "optical":
      return <OpticalSVG color={color} opacity={opacity} />;
    case "compute":
      return <ComputeSVG color={color} opacity={opacity} />;
    case "semiconductor":
      return <SemiconductorSVG color={color} opacity={opacity} />;
    case "mining":
      return <MiningSVG color={color} opacity={opacity} />;
    case "new-energy":
      return <NewEnergySVG color={color} opacity={opacity} />;
    case "robotics":
      return <RoboticsSVG color={color} opacity={opacity} />;
    case "low-altitude":
      return <LowAltitudeSVG color={color} opacity={opacity} />;
    case "defense":
      return <DefenseSVG color={color} opacity={opacity} />;
    case "medicine":
      return <MedicineSVG color={color} opacity={opacity} />;
    case "baijiu":
      return <BaijiuSVG color={color} opacity={opacity} />;
    default:
      return null;
  }
}

// ---- main component ----

export default function SectorVisualBackground({
  visualType,
  accentColor,
  intensity = "subtle",
  className = "",
}: SectorVisualBackgroundProps) {
  const wmOpacity = watermarkOpacity(intensity);
  const ambOp = ambientOpacity(intensity);

  return (
    <>
      {/* Layer 1: Full-card industry watermark SVG */}
      {getWatermarkSVG(visualType, accentColor, wmOpacity)}

      {/* Layer 2: Subtle ambient glow from accent color */}
      <div
        className={`absolute inset-0 pointer-events-none ${className}`}
        style={{
          background: `radial-gradient(ellipse at 70% 50%, ${rgba(accentColor, ambOp)}, transparent 65%)`,
        }}
      />
    </>
  );
}
