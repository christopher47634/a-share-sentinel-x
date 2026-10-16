"use client";

import { LegacySvgDefs } from "./primitives";

/**
 * 半导体 semiconductor
 */
export function SemiconductorHero({ color }: { color: string }) {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 900 400"
      preserveAspectRatio="xMidYMid slice"
    >
      <LegacySvgDefs color={color} id="semi" />

      <circle cx="650" cy="200" r="170" fill="none" stroke={color} strokeWidth="1.8" opacity="0.18" />
      <path d="M 635 370 L 650 358 L 665 370" fill="none" stroke={color} strokeWidth="1.5" opacity="0.18" />

      <circle cx="650" cy="200" r="145" fill="none" stroke={color} strokeWidth="1.0" opacity="0.14" />
      <circle cx="650" cy="200" r="120" fill="none" stroke={color} strokeWidth="0.8" opacity="0.12" />
      <circle cx="650" cy="200" r="95" fill="none" stroke={color} strokeWidth="0.6" opacity="0.10" />
      <circle cx="650" cy="200" r="70" fill="none" stroke={color} strokeWidth="0.5" opacity="0.08" />
      <circle cx="650" cy="200" r="45" fill="none" stroke={color} strokeWidth="0.4" opacity="0.06" />

      {[530, 570, 610, 650, 690, 730, 770].map((x) => (
        <line key={`v${x}`} x1={x} y1="35" x2={x} y2="365" stroke={color} strokeWidth="0.3" opacity="0.06" />
      ))}
      {[80, 120, 160, 200, 240, 280, 320].map((y) => (
        <line key={`h${y}`} x1="485" y1={y} x2="815" y2={y} stroke={color} strokeWidth="0.3" opacity="0.06" />
      ))}

      <rect x="610" y="160" width="40" height="40" fill={color} opacity="0.06" />
      <rect x="650" y="200" width="40" height="40" fill={color} opacity="0.05" />
      <rect x="570" y="120" width="40" height="40" fill={color} opacity="0.04" />
      <rect x="690" y="240" width="40" height="40" fill={color} opacity="0.04" />

      <circle cx="650" cy="200" r="30" fill={color} opacity="0.08" filter="url(#semi-glow)" />
    </svg>
  );
}
