"use client";

import { LegacySvgDefs } from "./primitives";

/**
 * 机器人 robotics
 */
export function RoboticsHero({ color }: { color: string }) {
  const gold = "#C8A04A";
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 900 400"
      preserveAspectRatio="xMidYMid slice"
    >
      <LegacySvgDefs color={color} id="robot" />
      <defs>
        <filter id="robot-blur" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="10" />
        </filter>
        <radialGradient id="robot-fog" cx="72%" cy="45%" r="22%">
          <stop offset="0%" stopColor={gold} stopOpacity="0.14" />
          <stop offset="100%" stopColor={gold} stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect x="0" y="0" width="900" height="400" fill="url(#robot-fog)" />

      <g opacity="0.15" filter="url(#robot-blur)">
        <line x1="560" y1="315" x2="660" y2="200" stroke={gold} strokeWidth="3" />
        <line x1="660" y1="200" x2="745" y2="85" stroke={gold} strokeWidth="2.5" />
        <circle cx="560" cy="315" r="18" fill={gold} opacity="0.3" />
        <circle cx="660" cy="200" r="16" fill={gold} opacity="0.35" />
        <circle cx="745" cy="85" r="12" fill={gold} opacity="0.3" />
      </g>

      <path d="M 555 310 L 648 198 L 738 88" fill="none" stroke={color} strokeWidth="0.6" opacity="0.10" />
      <path d="M 565 320 L 672 202 L 752 82" fill="none" stroke={color} strokeWidth="0.6" opacity="0.10" />
      <line x1="650" y1="200" x2="670" y2="200" stroke={color} strokeWidth="0.5" opacity="0.12" />
      <line x1="660" y1="190" x2="660" y2="210" stroke={color} strokeWidth="0.5" opacity="0.12" />
      <line x1="735" y1="85" x2="755" y2="85" stroke={color} strokeWidth="0.5" opacity="0.12" />
      <line x1="745" y1="75" x2="745" y2="95" stroke={color} strokeWidth="0.5" opacity="0.12" />
      <path d="M 710 58 A 40 40 0 0 1 775 58" fill="none" stroke={gold} strokeWidth="0.5" opacity="0.12" strokeDasharray="3 4" />
      <ellipse cx="560" cy="345" rx="70" ry="8" fill="none" stroke={color} strokeWidth="0.3" opacity="0.08" strokeDasharray="2 6" />

      <ellipse cx="560" cy="345" rx="55" ry="11" fill={color} opacity="0.05" />
      <ellipse cx="560" cy="345" rx="55" ry="11" fill="none" stroke={color} strokeWidth="1.6" opacity="0.22" />
      <rect x="542" y="328" width="36" height="17" rx="4" fill={color} opacity="0.04" />
      <rect x="542" y="328" width="36" height="17" rx="4" fill="none" stroke={color} strokeWidth="1.4" opacity="0.20" />

      <circle cx="560" cy="315" r="24" fill="none" stroke={color} strokeWidth="0.4" opacity="0.08" />
      <circle cx="560" cy="315" r="18" fill={color} opacity="0.06" />
      <circle cx="560" cy="315" r="18" fill="none" stroke={color} strokeWidth="2.0" opacity="0.28" />
      <circle cx="560" cy="315" r="10" fill="none" stroke={color} strokeWidth="0.6" opacity="0.14" />
      <circle cx="560" cy="315" r="5" fill={gold} opacity="0.22" />

      <line x1="553" y1="312" x2="653" y2="197" stroke={color} strokeWidth="2.2" opacity="0.24" strokeLinecap="round" />
      <line x1="567" y1="318" x2="667" y2="203" stroke={color} strokeWidth="2.2" opacity="0.24" strokeLinecap="round" />
      <path d="M 553 312 L 653 197 L 667 203 L 567 318 Z" fill={color} opacity="0.04" />

      <circle cx="660" cy="200" r="22" fill="none" stroke={color} strokeWidth="0.5" opacity="0.10" />
      <circle cx="660" cy="200" r="16" fill={color} opacity="0.07" />
      <circle cx="660" cy="200" r="16" fill="none" stroke={color} strokeWidth="2.2" opacity="0.30" />
      <circle cx="660" cy="200" r="8" fill="none" stroke={color} strokeWidth="0.6" opacity="0.14" />
      <circle cx="660" cy="200" r="4.5" fill={gold} opacity="0.25" />

      <line x1="653" y1="197" x2="738" y2="82" stroke={color} strokeWidth="2.0" opacity="0.22" strokeLinecap="round" />
      <line x1="667" y1="203" x2="752" y2="88" stroke={color} strokeWidth="2.0" opacity="0.22" strokeLinecap="round" />
      <path d="M 653 197 L 738 82 L 752 88 L 667 203 Z" fill={color} opacity="0.04" />

      <circle cx="745" cy="85" r="13" fill={color} opacity="0.06" />
      <circle cx="745" cy="85" r="13" fill="none" stroke={color} strokeWidth="1.8" opacity="0.26" />
      <circle cx="745" cy="85" r="5" fill="none" stroke={color} strokeWidth="0.5" opacity="0.12" />
      <circle cx="745" cy="85" r="3.5" fill={gold} opacity="0.22" />

      <line x1="745" y1="85" x2="768" y2="48" stroke={color} strokeWidth="2.0" opacity="0.22" strokeLinecap="round" />
      <line x1="745" y1="85" x2="722" y2="48" stroke={color} strokeWidth="2.0" opacity="0.22" strokeLinecap="round" />
      <circle cx="768" cy="48" r="3.5" fill={gold} opacity="0.25" />
      <circle cx="722" cy="48" r="3.5" fill={gold} opacity="0.25" />
      <line x1="745" y1="85" x2="758" y2="55" stroke={color} strokeWidth="0.8" opacity="0.12" strokeLinecap="round" />
      <line x1="745" y1="85" x2="732" y2="55" stroke={color} strokeWidth="0.8" opacity="0.12" strokeLinecap="round" />
    </svg>
  );
}
