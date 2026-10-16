"use client";



export function SemiconductorSVG({ color, opacity }: { color: string; opacity: number }) {
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
