"use client";

import { LegacySvgDefs } from "./primitives";

/**
 * 算力 compute
 */
export function ComputeHero({ color }: { color: string }) {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 900 400"
      preserveAspectRatio="xMidYMid slice"
    >
      <LegacySvgDefs color={color} id="compute" />

      <rect
        x="520"
        y="100"
        width="200"
        height="200"
        rx="8"
        fill="none"
        stroke={color}
        strokeWidth="2.0"
        opacity="0.20"
      />
      <rect
        x="550"
        y="130"
        width="140"
        height="140"
        rx="4"
        fill={color}
        opacity="0.04"
      />
      <rect
        x="550"
        y="130"
        width="140"
        height="140"
        rx="4"
        fill="none"
        stroke={color}
        strokeWidth="1.2"
        opacity="0.15"
      />
      <rect
        x="590"
        y="170"
        width="60"
        height="60"
        rx="2"
        fill={color}
        opacity="0.06"
      />
      <rect
        x="590"
        y="170"
        width="60"
        height="60"
        rx="2"
        fill="none"
        stroke={color}
        strokeWidth="0.8"
        opacity="0.20"
      />

      {[550, 580, 610, 640, 670].map((x) => (
        <g key={`t${x}`}>
          <line x1={x} y1="100" x2={x} y2="72" stroke={color} strokeWidth="1.2" opacity="0.14" />
          <circle cx={x} cy="68" r="2" fill={color} opacity="0.20" />
        </g>
      ))}
      {[550, 580, 610, 640, 670].map((x) => (
        <g key={`b${x}`}>
          <line x1={x} y1="300" x2={x} y2="328" stroke={color} strokeWidth="1.2" opacity="0.14" />
          <circle cx={x} cy="332" r="2" fill={color} opacity="0.20" />
        </g>
      ))}
      {[150, 180, 210, 240, 270].map((y) => (
        <g key={`l${y}`}>
          <line x1="520" y1={y} x2="492" y2={y} stroke={color} strokeWidth="1.2" opacity="0.14" />
          <circle cx="488" cy={y} r="2" fill={color} opacity="0.20" />
        </g>
      ))}
      {[150, 180, 210, 240, 270].map((y) => (
        <g key={`r${y}`}>
          <line x1="720" y1={y} x2="748" y2={y} stroke={color} strokeWidth="1.2" opacity="0.14" />
          <circle cx="752" cy={y} r="2" fill={color} opacity="0.20" />
        </g>
      ))}

      <polyline points="752,150 790,150 790,90 850,90" fill="none" stroke={color} strokeWidth="1.0" opacity="0.12" />
      <polyline points="752,210 800,210 800,280 860,280" fill="none" stroke={color} strokeWidth="1.0" opacity="0.12" />
      <polyline points="752,240 780,240 780,320 840,320" fill="none" stroke={color} strokeWidth="0.8" opacity="0.10" />
      <polyline points="752,180 810,180 810,140 870,140" fill="none" stroke={color} strokeWidth="0.8" opacity="0.10" />
      <polyline points="488,180 450,180 450,120 400,120" fill="none" stroke={color} strokeWidth="0.8" opacity="0.06" />

      <circle cx="850" cy="90" r="2.5" fill={color} opacity="0.25" />
      <circle cx="860" cy="280" r="2" fill={color} opacity="0.20" />
      <circle cx="870" cy="140" r="2" fill={color} opacity="0.20" />
      <circle cx="840" cy="320" r="1.5" fill={color} opacity="0.18" />

      <circle cx="620" cy="200" r="30" fill={color} opacity="0.04" />
      <circle cx="620" cy="200" r="12" fill={color} opacity="0.12" filter="url(#compute-glow)" />
    </svg>
  );
}
