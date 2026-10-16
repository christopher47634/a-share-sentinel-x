"use client";



export function NewEnergySVG({ color, opacity }: { color: string; opacity: number }) {
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
