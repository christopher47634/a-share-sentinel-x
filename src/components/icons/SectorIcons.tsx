"use client";

import React from "react";

/**
 * Professional financial terminal sector icons.
 * Thin lines, subtle, industry-specific — no cartoon/cheap SVG.
 * Each icon accepts size (default 20) and style props like lucide-react.
 */

type IconProps = { size?: number; style?: React.CSSProperties; className?: string };

const S = (size: number) => ({ width: size, height: size });

// 1. 光通信 — Fiber optic bundle with light transmission
export function OpticalIcon({ size = 20, style, className }: IconProps) {
  return (
    <svg {...S(size)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" className={className} style={style}>
      {/* Converging fiber lines */}
      <line x1="4" y1="4" x2="12" y2="12" />
      <line x1="4" y1="10" x2="12" y2="12" />
      <line x1="4" y1="16" x2="12" y2="12" />
      <line x1="20" y1="4" x2="12" y2="12" />
      <line x1="20" y1="10" x2="12" y2="12" />
      <line x1="20" y1="16" x2="12" y2="12" />
      {/* Light dots at endpoints */}
      <circle cx="4" cy="4" r="1.2" fill="currentColor" stroke="none" opacity="0.6" />
      <circle cx="4" cy="10" r="1.2" fill="currentColor" stroke="none" opacity="0.6" />
      <circle cx="4" cy="16" r="1.2" fill="currentColor" stroke="none" opacity="0.6" />
      <circle cx="20" cy="4" r="1.2" fill="currentColor" stroke="none" opacity="0.6" />
      <circle cx="20" cy="10" r="1.2" fill="currentColor" stroke="none" opacity="0.6" />
      <circle cx="20" cy="16" r="1.2" fill="currentColor" stroke="none" opacity="0.6" />
      {/* Central focal point */}
      <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" opacity="0.35" />
      {/* Light pulse ring */}
      <circle cx="12" cy="12" r="4" opacity="0.25" />
    </svg>
  );
}

// 2. 算力 — Chip core / compute matrix
export function ComputeIcon({ size = 20, style, className }: IconProps) {
  return (
    <svg {...S(size)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" className={className} style={style}>
      {/* CPU die */}
      <rect x="7" y="7" width="10" height="10" rx="1" />
      {/* Inner core */}
      <rect x="9.5" y="9.5" width="5" height="5" rx="0.5" opacity="0.5" />
      {/* Pin grid — top */}
      <line x1="9" y1="4" x2="9" y2="7" />
      <line x1="12" y1="4" x2="12" y2="7" />
      <line x1="15" y1="4" x2="15" y2="7" />
      {/* Pin grid — bottom */}
      <line x1="9" y1="17" x2="9" y2="20" />
      <line x1="12" y1="17" x2="12" y2="20" />
      <line x1="15" y1="17" x2="15" y2="20" />
      {/* Pin grid — left */}
      <line x1="4" y1="9" x2="7" y2="9" />
      <line x1="4" y1="12" x2="7" y2="12" />
      <line x1="4" y1="15" x2="7" y2="15" />
      {/* Pin grid — right */}
      <line x1="17" y1="9" x2="20" y2="9" />
      <line x1="17" y1="12" x2="20" y2="12" />
      <line x1="17" y1="15" x2="20" y2="15" />
    </svg>
  );
}

// 3. 半导体 — Wafer with scan lines
export function SemiconductorIcon({ size = 20, style, className }: IconProps) {
  return (
    <svg {...S(size)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" className={className} style={style}>
      {/* Wafer concentric circles */}
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="6" opacity="0.5" />
      <circle cx="12" cy="12" r="3" opacity="0.3" />
      {/* Grid scan lines — horizontal */}
      <line x1="3" y1="9" x2="21" y2="9" opacity="0.3" />
      <line x1="3" y1="15" x2="21" y2="15" opacity="0.3" />
      {/* Grid scan lines — vertical */}
      <line x1="9" y1="3" x2="9" y2="21" opacity="0.3" />
      <line x1="15" y1="3" x2="15" y2="21" opacity="0.3" />
      {/* Die mark at center */}
      <rect x="10.5" y="10.5" width="3" height="3" rx="0.5" fill="currentColor" stroke="none" opacity="0.3" />
    </svg>
  );
}

// 4. 新能源 — Battery outline with energy flow
export function NewEnergyIcon({ size = 20, style, className }: IconProps) {
  return (
    <svg {...S(size)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      {/* Battery body */}
      <rect x="5" y="6" width="14" height="12" rx="1.5" />
      {/* Battery terminal */}
      <rect x="19" y="9.5" width="1.5" height="5" rx="0.5" fill="currentColor" stroke="none" opacity="0.5" />
      {/* Energy level bars */}
      <rect x="7.5" y="8.5" width="2" height="7" rx="0.5" fill="currentColor" stroke="none" opacity="0.25" />
      <rect x="10.5" y="8.5" width="2" height="7" rx="0.5" fill="currentColor" stroke="none" opacity="0.2" />
      <rect x="13.5" y="8.5" width="2" height="7" rx="0.5" fill="currentColor" stroke="none" opacity="0.15" />
      {/* Energy flow arrows upward */}
      <line x1="10" y1="3" x2="10" y2="5.5" opacity="0.4" />
      <line x1="14" y1="3" x2="14" y2="5.5" opacity="0.4" />
      <line x1="9" y1="4" x2="10" y2="3" opacity="0.4" />
      <line x1="11" y1="4" x2="10" y2="3" opacity="0.4" />
      <line x1="13" y1="4" x2="14" y2="3" opacity="0.4" />
      <line x1="15" y1="4" x2="14" y2="3" opacity="0.4" />
    </svg>
  );
}

// 5. 机器人 — Mechanical arm joint + servo axis
export function RoboticsIcon({ size = 20, style, className }: IconProps) {
  return (
    <svg {...S(size)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      {/* Base */}
      <line x1="8" y1="20" x2="16" y2="20" />
      {/* Base column */}
      <line x1="12" y1="20" x2="12" y2="16" />
      {/* Joint 1 */}
      <circle cx="12" cy="16" r="1.5" fill="currentColor" stroke="none" opacity="0.4" />
      {/* Arm segment 1 */}
      <line x1="12" y1="16" x2="7" y2="10" />
      {/* Joint 2 */}
      <circle cx="7" cy="10" r="1.5" fill="currentColor" stroke="none" opacity="0.4" />
      {/* Arm segment 2 */}
      <line x1="7" y1="10" x2="12" y2="5" />
      {/* Joint 3 / end effector */}
      <circle cx="12" cy="5" r="1.5" fill="currentColor" stroke="none" opacity="0.4" />
      {/* Gripper */}
      <line x1="12" y1="5" x2="10" y2="2.5" />
      <line x1="12" y1="5" x2="14" y2="2.5" />
      {/* Servo axis arcs */}
      <path d="M10.5 16 A1.5 1.5 0 0 1 13.5 16" opacity="0.3" />
      <path d="M5.5 10 A1.5 1.5 0 0 1 8.5 10" opacity="0.3" />
    </svg>
  );
}

// 6. 低空经济 — Drone silhouette + flight path arc
export function LowAltitudeIcon({ size = 20, style, className }: IconProps) {
  return (
    <svg {...S(size)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" className={className} style={style}>
      {/* Quadcopter body */}
      <rect x="10" y="10" width="4" height="4" rx="1" />
      {/* Arms */}
      <line x1="10" y1="10" x2="6" y2="6" />
      <line x1="14" y1="10" x2="18" y2="6" />
      <line x1="10" y1="14" x2="6" y2="18" />
      <line x1="14" y1="14" x2="18" y2="18" />
      {/* Rotors */}
      <circle cx="6" cy="6" r="2.5" opacity="0.3" />
      <circle cx="18" cy="6" r="2.5" opacity="0.3" />
      <circle cx="6" cy="18" r="2.5" opacity="0.3" />
      <circle cx="18" cy="18" r="2.5" opacity="0.3" />
      {/* Flight path arc */}
      <path d="M3 21 Q12 1 21 21" strokeDasharray="2 2" opacity="0.35" />
    </svg>
  );
}

// 7. 白酒 — Premium glass bottle silhouette (BOTTLE not jar)
export function BaijiuIcon({ size = 20, style, className }: IconProps) {
  return (
    <svg {...S(size)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      {/* Bottle neck */}
      <path d="M10 2 L10 6 Q8 7 8 9 L8 20 Q8 21 9 21 L15 21 Q16 21 16 20 L16 9 Q16 7 14 6 L14 2 Z" />
      {/* Cap */}
      <rect x="9.5" y="1" width="5" height="1.5" rx="0.5" fill="currentColor" stroke="none" opacity="0.3" />
      {/* Liquid level line */}
      <line x1="9" y1="12" x2="15" y2="12" opacity="0.4" />
      {/* Liquid fill below */}
      <path d="M9 12 L9 20 Q9 21 10 21 L14 21 Q15 21 15 20 L15 12 Z" fill="currentColor" stroke="none" opacity="0.08" />
      {/* Refraction highlight */}
      <line x1="10.5" y1="8" x2="10.5" y2="19" opacity="0.15" />
    </svg>
  );
}

// 8. 矿山 — Ore vein cross-section / geological contour
export function MiningIcon({ size = 20, style, className }: IconProps) {
  return (
    <svg {...S(size)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" className={className} style={style}>
      {/* Geological layers */}
      <path d="M2 8 Q8 6 12 8 Q16 10 22 8" opacity="0.35" />
      <path d="M2 12 Q7 10 12 12 Q17 14 22 12" opacity="0.35" />
      <path d="M2 16 Q9 14 12 16 Q15 18 22 16" opacity="0.35" />
      {/* Ore vein — glowing diagonal */}
      <path d="M6 5 Q10 10 8 14 Q6 18 10 21" strokeWidth="1.8" opacity="0.6" />
      {/* Ore node highlights */}
      <circle cx="8" cy="10" r="1" fill="currentColor" stroke="none" opacity="0.5" />
      <circle cx="7" cy="14" r="1" fill="currentColor" stroke="none" opacity="0.5" />
      <circle cx="9" cy="18" r="1" fill="currentColor" stroke="none" opacity="0.5" />
    </svg>
  );
}

// 9. 军工 — Radar sweep + shield outline (NO weapons)
export function DefenseIcon({ size = 20, style, className }: IconProps) {
  return (
    <svg {...S(size)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" className={className} style={style}>
      {/* Shield outline */}
      <path d="M12 2 L20 6 L20 13 Q20 19 12 22 Q4 19 4 13 L4 6 Z" opacity="0.4" />
      {/* Radar arcs */}
      <path d="M12 12 m-7 0 a7 7 0 0 1 7 -7" opacity="0.5" />
      <path d="M12 12 m-4.5 0 a4.5 4.5 0 0 1 4.5 -4.5" opacity="0.35" />
      {/* Radar sweep line */}
      <line x1="12" y1="12" x2="19" y2="5" opacity="0.6" />
      {/* Coordinate cross */}
      <line x1="12" y1="7" x2="12" y2="17" opacity="0.2" />
      <line x1="7" y1="12" x2="17" y2="12" opacity="0.2" />
      {/* Center dot */}
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" opacity="0.5" />
    </svg>
  );
}

// 10. 医药 — Molecular chain + subtle ECG line
export function PharmaIcon({ size = 20, style, className }: IconProps) {
  return (
    <svg {...S(size)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      {/* Molecular nodes */}
      <circle cx="5" cy="8" r="2" />
      <circle cx="12" cy="5" r="2" />
      <circle cx="19" cy="8" r="2" />
      <circle cx="8" cy="14" r="2" />
      <circle cx="16" cy="14" r="2" />
      {/* Bonds */}
      <line x1="6.8" y1="9" x2="10.2" y2="6" />
      <line x1="13.8" y1="6" x2="17.2" y2="7" />
      <line x1="6.5" y1="10" x2="7" y2="12.2" />
      <line x1="13.5" y1="6.5" x2="15" y2="12.5" />
      <line x1="9.8" y1="14" x2="14.2" y2="14" />
      {/* Subtle ECG line at bottom */}
      <path d="M2 20 L7 20 L8 18 L9 22 L10 17 L11 21 L12 20 L22 20" opacity="0.3" />
    </svg>
  );
}

/** Default fallback icon — exported for use as `|| SectorFallback` */
export const SectorFallback = OpticalIcon;

/** Map of sector icon name → component, compatible with sector.icon string keys */
export const sectorIconMap: Record<string, React.ElementType> = {
  Zap: OpticalIcon,
  Cpu: ComputeIcon,
  MemoryStick: SemiconductorIcon,
  Mountain: MiningIcon,
  Sun: NewEnergyIcon,
  Bot: RoboticsIcon,
  Plane: LowAltitudeIcon,
  Shield: DefenseIcon,
  HeartPulse: PharmaIcon,
  Wine: BaijiuIcon,
};
