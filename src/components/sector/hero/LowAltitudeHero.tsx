"use client";

import { LegacySvgDefs } from "./primitives";

/**
 * 低空经济 low-altitude
 */
export function LowAltitudeHero({ color }: { color: string }) {
  const cyan = "#3AB5E8";

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 900 400"
      preserveAspectRatio="xMidYMid slice"
    >
      <LegacySvgDefs color={color} id="la" />
      <defs>
        <filter id="la-blur" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="10" />
        </filter>
        <filter id="la-blur-wide" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
        <radialGradient id="la-fog" cx="68%" cy="50%" r="28%">
          <stop offset="0%" stopColor={cyan} stopOpacity="0.16" />
          <stop offset="100%" stopColor={cyan} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="la-radar-fan" cx="68%" cy="88%" r="55%">
          <stop offset="0%" stopColor={cyan} stopOpacity="0.06" />
          <stop offset="60%" stopColor={cyan} stopOpacity="0.02" />
          <stop offset="100%" stopColor={cyan} stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect x="0" y="0" width="900" height="400" fill="url(#la-fog)" />
      <path d="M 650 350 L 800 60 A 280 280 0 0 0 860 200 Z" fill="url(#la-radar-fan)" />

      <g opacity="0.16" filter="url(#la-blur)">
        <path d="M 530 320 Q 600 200, 700 140 T 850 50" fill="none" stroke={cyan} strokeWidth="3" />
        <path d="M 510 300 Q 580 220, 680 160 T 830 80" fill="none" stroke={cyan} strokeWidth="2.5" />
      </g>

      <circle cx="650" cy="350" r="12" fill={cyan} opacity="0.06" />
      <circle cx="650" cy="350" r="6" fill={cyan} opacity="0.30" />
      <circle cx="650" cy="350" r="3" fill="#fff" opacity="0.25" />

      <path d="M 650 350 A 100 100 0 0 1 745 280" fill="none" stroke={color} strokeWidth="1.4" opacity="0.18" />
      <path d="M 650 350 A 160 160 0 0 1 800 230" fill="none" stroke={color} strokeWidth="1.0" opacity="0.12" />
      <path d="M 650 350 A 230 230 0 0 1 860 160" fill="none" stroke={color} strokeWidth="0.7" opacity="0.08" />
      <path d="M 650 350 A 300 300 0 0 1 880 100" fill="none" stroke={color} strokeWidth="0.4" opacity="0.05" />

      <line x1="650" y1="350" x2="745" y2="280" stroke={color} strokeWidth="0.5" opacity="0.08" />
      <line x1="650" y1="350" x2="800" y2="230" stroke={color} strokeWidth="0.4" opacity="0.06" />
      <line x1="650" y1="350" x2="780" y2="120" stroke={color} strokeWidth="0.4" opacity="0.06" />
      <line x1="650" y1="350" x2="860" y2="200" stroke={color} strokeWidth="0.3" opacity="0.05" />

      <path d="M 530 320 Q 600 200, 700 140 T 850 50" fill="none" stroke={color} strokeWidth="2.0" opacity="0.24" />
      <path d="M 510 300 Q 580 220, 680 160 T 830 80" fill="none" stroke={color} strokeWidth="1.4" opacity="0.18" />
      <path d="M 550 340 Q 620 240, 720 170 T 870 65" fill="none" stroke={color} strokeWidth="0.8" opacity="0.10" />

      <circle cx="640" cy="180" r="8" fill={cyan} opacity="0.06" />
      <circle cx="640" cy="180" r="4" fill={cyan} opacity="0.35" />
      <circle cx="640" cy="180" r="2" fill="#fff" opacity="0.20" />

      <circle cx="720" cy="130" r="6" fill={cyan} opacity="0.05" />
      <circle cx="720" cy="130" r="3" fill={cyan} opacity="0.28" />

      <circle cx="800" cy="80" r="5" fill={cyan} opacity="0.04" />
      <circle cx="800" cy="80" r="2.5" fill={cyan} opacity="0.22" />

      <circle cx="780" cy="100" r="4" fill={cyan} opacity="0.04" />
      <circle cx="780" cy="100" r="2" fill={cyan} opacity="0.18" />

      <g transform="translate(848, 46) scale(0.8)">
        <path d="M 0 0 L 12 -6 L 8 0 L 12 6 Z" fill={cyan} opacity="0.32" />
        <line x1="0" y1="0" x2="-6" y2="0" stroke={cyan} strokeWidth="1.5" opacity="0.25" />
        <line x1="-3" y1="-4" x2="-3" y2="4" stroke={cyan} strokeWidth="1" opacity="0.20" />
      </g>

      <line x1="540" y1="220" x2="860" y2="220" stroke={color} strokeWidth="0.3" opacity="0.05" />
      <line x1="560" y1="160" x2="860" y2="160" stroke={color} strokeWidth="0.3" opacity="0.04" />
      <line x1="580" y1="100" x2="860" y2="100" stroke={color} strokeWidth="0.3" opacity="0.03" />
      <text x="862" y="223" fill={color} opacity="0.06" fontSize="6" fontFamily="monospace">500m</text>
      <text x="862" y="163" fill={color} opacity="0.05" fontSize="6" fontFamily="monospace">1000m</text>
      <text x="862" y="103" fill={color} opacity="0.04" fontSize="6" fontFamily="monospace">1500m</text>
    </svg>
  );
}
