"use client";



export function OpticalSVG({ color, opacity }: { color: string; opacity: number }) {
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
