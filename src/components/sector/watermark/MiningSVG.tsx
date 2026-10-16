"use client";



export function MiningSVG({ color, opacity }: { color: string; opacity: number }) {
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
