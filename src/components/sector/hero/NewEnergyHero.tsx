"use client";

import { LegacySvgDefs } from "./primitives";

/**
 * 新能源 new-energy
 */
export function NewEnergyHero({ color }: { color: string }) {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 900 400"
      preserveAspectRatio="xMidYMid slice"
    >
      <LegacySvgDefs color={color} id="ne" />

      <rect x="520" y="80" width="260" height="240" rx="10" fill="none" stroke={color} strokeWidth="1.8" opacity="0.16" />

      {[0, 1, 2, 3].map((col) =>
        [0, 1, 2, 3, 4].map((row) => (
          <g key={`cell-${col}-${row}`}>
            <rect
              x={540 + col * 58}
              y={100 + row * 42}
              width="48"
              height="34"
              rx="3"
              fill={color}
              opacity="0.03"
            />
            <rect
              x={540 + col * 58}
              y={100 + row * 42}
              width="48"
              height="34"
              rx="3"
              fill="none"
              stroke={color}
              strokeWidth="0.8"
              opacity="0.12"
            />
            <rect
              x={556 + col * 58}
              y={94 + row * 42}
              width="16"
              height="6"
              rx="1.5"
              fill={color}
              opacity="0.10"
            />
          </g>
        ))
      )}

      <line x1="520" y1="200" x2="780" y2="200" stroke={color} strokeWidth="2.0" opacity="0.08" strokeDasharray="8 12" />
      <line x1="530" y1="200" x2="770" y2="200" stroke={color} strokeWidth="1.0" opacity="0.18" strokeDasharray="4 16" />

      <path d="M 740 175 L 750 190 L 744 190 L 754 210 L 738 192 L 744 192 Z" fill={color} opacity="0.25" filter="url(#ne-glow)" />

      <line x1="520" y1="110" x2="530" y2="110" stroke={color} strokeWidth="2.5" opacity="0.18" />
      <line x1="520" y1="290" x2="530" y2="290" stroke={color} strokeWidth="2.5" opacity="0.18" />
    </svg>
  );
}
