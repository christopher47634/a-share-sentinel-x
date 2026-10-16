"use client";

import { LegacySvgDefs } from "./primitives";

/**
 * 矿山 mining
 */
export function MiningHero({ color }: { color: string }) {
  const gold = "#B8962E";

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 900 400"
      preserveAspectRatio="xMidYMid slice"
    >
      <LegacySvgDefs color={color} id="mining" />
      <defs>
        <filter id="mining-blur" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="10" />
        </filter>
        <radialGradient id="mining-fog" cx="72%" cy="45%" r="26%">
          <stop offset="0%" stopColor={gold} stopOpacity="0.14" />
          <stop offset="100%" stopColor={gold} stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect x="0" y="0" width="900" height="400" fill="url(#mining-fog)" />

      <g opacity="0.15" filter="url(#mining-blur)">
        <path d="M 540 100 L 590 115 L 640 140 L 700 132 L 760 155 L 830 145 L 880 158" fill="none" stroke={gold} strokeWidth="3.5" />
        <path d="M 560 210 L 620 200 L 680 218 L 740 205 L 800 225 L 860 215" fill="none" stroke={gold} strokeWidth="3" />
      </g>

      <path d="M 480 80 Q 580 65, 680 82 Q 780 100, 880 75 L 880 128 Q 775 155, 670 135 Q 570 115, 470 130 Z" fill={color} opacity="0.03" />
      <path d="M 470 130 Q 570 115, 670 135 Q 775 155, 880 128 L 880 180 Q 780 205, 675 185 Q 575 168, 475 180 Z" fill={color} opacity="0.025" />
      <path d="M 475 180 Q 575 168, 675 185 Q 780 205, 880 180 L 880 230 Q 780 255, 680 235 Q 580 218, 480 230 Z" fill={color} opacity="0.02" />
      <path d="M 480 230 Q 580 218, 680 235 Q 780 255, 880 230 L 880 280 Q 775 305, 670 285 Q 570 268, 470 280 Z" fill={color} opacity="0.015" />

      <path d="M 480 80 Q 580 65, 680 82 Q 780 100, 880 75" fill="none" stroke={color} strokeWidth="1.2" opacity="0.16" />
      <path d="M 470 130 Q 570 115, 670 135 Q 775 155, 880 128" fill="none" stroke={color} strokeWidth="1.0" opacity="0.14" />
      <path d="M 475 180 Q 575 168, 675 185 Q 780 205, 880 180" fill="none" stroke={color} strokeWidth="0.9" opacity="0.12" />
      <path d="M 480 230 Q 580 218, 680 235 Q 780 255, 880 230" fill="none" stroke={color} strokeWidth="0.8" opacity="0.10" />
      <path d="M 470 280 Q 570 268, 670 285 Q 775 305, 880 280" fill="none" stroke={color} strokeWidth="0.6" opacity="0.08" />
      <path d="M 475 330 Q 575 318, 675 335 Q 780 355, 880 330" fill="none" stroke={color} strokeWidth="0.5" opacity="0.06" />

      <path d="M 540 100 L 590 115 L 640 140 L 700 132 L 760 155 L 830 145 L 880 158" fill="none" stroke={gold} strokeWidth="2.4" opacity="0.28" />
      <path d="M 540 100 L 590 115 L 640 140 L 700 132 L 760 155 L 830 145 L 880 158" fill="none" stroke="#D4B85A" strokeWidth="0.8" opacity="0.16" />
      <path d="M 560 210 L 620 200 L 680 218 L 740 205 L 800 225 L 860 215" fill="none" stroke={gold} strokeWidth="1.8" opacity="0.22" />
      <path d="M 580 290 L 640 282 L 700 298 L 760 288 L 830 300" fill="none" stroke={gold} strokeWidth="1.2" opacity="0.16" />

      <circle cx="640" cy="140" r="10" fill={gold} opacity="0.06" />
      <circle cx="640" cy="140" r="5" fill={gold} opacity="0.12" />
      <circle cx="640" cy="140" r="2.5" fill="#D4B85A" opacity="0.28" />
      <circle cx="740" cy="205" r="8" fill={gold} opacity="0.05" />
      <circle cx="740" cy="205" r="4" fill={gold} opacity="0.10" />
      <circle cx="740" cy="205" r="2" fill="#D4B85A" opacity="0.24" />
      <circle cx="700" cy="298" r="6" fill={gold} opacity="0.04" />
      <circle cx="700" cy="298" r="3" fill={gold} opacity="0.08" />
      <circle cx="700" cy="298" r="1.5" fill="#D4B85A" opacity="0.20" />

      <path d="M 620 100 L 610 180" fill="none" stroke={color} strokeWidth="0.4" opacity="0.06" />
      <path d="M 750 160 L 740 240" fill="none" stroke={color} strokeWidth="0.4" opacity="0.05" />
      <path d="M 820 140 L 810 220" fill="none" stroke={color} strokeWidth="0.3" opacity="0.04" />
    </svg>
  );
}

// =====================================================================
//  SVG RESOLVER
// =====================================================================
