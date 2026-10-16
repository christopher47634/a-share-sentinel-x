"use client";



export function BaijiuSVG({ color, opacity }: { color: string; opacity: number }) {
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
