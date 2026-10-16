"use client";



export function RoboticsSVG({ color, opacity }: { color: string; opacity: number }) {
  // Large mechanical arm with prominent joints + scan lines + positioning crosshairs
  // Recognizable as: robot / mechanical structure
  const jointColor = color || "#F59E0B";
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 320 180"
      preserveAspectRatio="xMidYMid slice"
      style={{ opacity }}
    >
      {/* Base platform — wide */}
      <ellipse cx="80" cy="170" rx="65" ry="10" fill="none" stroke={jointColor} strokeWidth="1.5" opacity="0.24" />
      <rect x="60" y="160" width="40" height="12" rx="3" fill="none" stroke={jointColor} strokeWidth="1.2" opacity="0.22" />

      {/* Joint 1 — shoulder — large prominent circle */}
      <circle cx="80" cy="145" r="22" fill="none" stroke={jointColor} strokeWidth="2.2" opacity="0.34" />
      <circle cx="80" cy="145" r="14" fill="none" stroke={jointColor} strokeWidth="1.2" opacity="0.22" />
      <circle cx="80" cy="145" r="6" fill={jointColor} opacity="0.20" />

      {/* Lower arm — thick */}
      <line x1="80" y1="145" x2="165" y2="72" stroke={jointColor} strokeWidth="2.2" opacity="0.30" />
      {/* Arm panel detail */}
      <line x1="90" y1="135" x2="155" y2="80" stroke={jointColor} strokeWidth="0.8" opacity="0.14" />

      {/* Joint 2 — elbow — large */}
      <circle cx="165" cy="72" r="18" fill="none" stroke={jointColor} strokeWidth="2.2" opacity="0.34" />
      <circle cx="165" cy="72" r="11" fill="none" stroke={jointColor} strokeWidth="1.0" opacity="0.22" />
      <circle cx="165" cy="72" r="5" fill={jointColor} opacity="0.22" />

      {/* Upper arm */}
      <line x1="165" y1="72" x2="230" y2="22" stroke={jointColor} strokeWidth="1.8" opacity="0.28" />

      {/* Gripper — two fingers spread */}
      <line x1="230" y1="22" x2="248" y2="-2" stroke={jointColor} strokeWidth="1.8" opacity="0.28" />
      <line x1="230" y1="22" x2="212" y2="-2" stroke={jointColor} strokeWidth="1.8" opacity="0.28" />
      <circle cx="248" cy="-2" r="4" fill={jointColor} opacity="0.24" />
      <circle cx="212" cy="-2" r="4" fill={jointColor} opacity="0.24" />

      {/* Scan crosshair at gripper */}
      <line x1="220" y1="15" x2="240" y2="15" stroke={jointColor} strokeWidth="0.8" opacity="0.18" />
      <line x1="230" y1="5" x2="230" y2="25" stroke={jointColor} strokeWidth="0.8" opacity="0.18" />

      {/* Motion arc */}
      <path
        d="M 215 5 A 35 35 0 0 1 260 5"
        fill="none"
        stroke={jointColor}
        strokeWidth="1.0"
        opacity="0.16"
        strokeDasharray="4 4"
      />

      {/* Positioning grid lines — subtle */}
      <line x1="0" y1="90" x2="320" y2="90" stroke={jointColor} strokeWidth="0.4" opacity="0.08" />
      <line x1="160" y1="0" x2="160" y2="180" stroke={jointColor} strokeWidth="0.4" opacity="0.08" />

      {/* Small sensor dots */}
      <circle cx="230" cy="22" r="8" fill={jointColor} opacity="0.08" />
    </svg>
  );
}
