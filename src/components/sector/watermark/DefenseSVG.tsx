"use client";



export function DefenseSVG({ color, opacity }: { color: string; opacity: number }) {
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
