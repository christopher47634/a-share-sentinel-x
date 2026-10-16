"use client";



export function LowAltitudeSVG({ color, opacity }: { color: string; opacity: number }) {
  // Large radar concentric circles + flight trajectory arc + aircraft/track point
  // Recognizable as: radar / low-altitude flight / air routes
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 320 180"
      preserveAspectRatio="xMidYMid slice"
      style={{ opacity }}
    >
      {/* Radar origin point — bottom center */}
      <circle cx="140" cy="175" r="6" fill={color} opacity="0.30" />
      <circle cx="140" cy="175" r="14" fill={color} opacity="0.08" />

      {/* Radar concentric arcs — large sweeping */}
      <path
        d="M 140 175 A 60 60 0 0 1 195 130"
        fill="none"
        stroke={color}
        strokeWidth="2.0"
        opacity="0.28"
      />
      <path
        d="M 140 175 A 100 100 0 0 1 230 100"
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        opacity="0.22"
      />
      <path
        d="M 140 175 A 150 150 0 0 1 275 65"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        opacity="0.18"
      />
      <path
        d="M 140 175 A 200 200 0 0 1 310 20"
        fill="none"
        stroke={color}
        strokeWidth="1.2"
        opacity="0.14"
      />

      {/* Radar sweep radial lines */}
      <line x1="140" y1="175" x2="195" y2="130" stroke={color} strokeWidth="0.8" opacity="0.14" />
      <line x1="140" y1="175" x2="275" y2="65" stroke={color} strokeWidth="0.6" opacity="0.10" />
      <line x1="140" y1="175" x2="310" y2="20" stroke={color} strokeWidth="0.5" opacity="0.08" />

      {/* Flight trajectory — bold sweeping curve */}
      <path
        d="M 30 165 Q 100 80, 190 50 T 320 -10"
        fill="none"
        stroke={color}
        strokeWidth="2.2"
        opacity="0.32"
      />
      {/* Trajectory glow */}
      <path
        d="M 30 165 Q 100 80, 190 50 T 320 -10"
        fill="none"
        stroke={color}
        strokeWidth="8"
        opacity="0.08"
      />

      {/* Aircraft / track points */}
      <circle cx="120" cy="80" r="5" fill={color} opacity="0.28" />
      <circle cx="120" cy="80" r="12" fill={color} opacity="0.06" />
      <circle cx="190" cy="50" r="4" fill={color} opacity="0.26" />
      <circle cx="190" cy="50" r="10" fill={color} opacity="0.05" />
      <circle cx="260" cy="22" r="3" fill={color} opacity="0.22" />

      {/* Small aircraft silhouette at head of trajectory */}
      <path
        d="M 188 48 L 196 44 L 192 50 L 196 56 L 188 52 Z"
        fill={color}
        opacity="0.26"
      />
    </svg>
  );
}
