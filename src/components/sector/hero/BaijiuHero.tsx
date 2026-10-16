"use client";

import { LegacySvgDefs } from "./primitives";

/**
 * 白酒 baijiu
 */
export function BaijiuHero({ color }: { color: string }) {
  const amber = "#D4A574";
  const amberDark = "#B8864A";

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 900 400"
      preserveAspectRatio="xMidYMid slice"
    >
      <LegacySvgDefs color={color} id="baijiu" />
      <defs>
        <filter id="baijiu-blur" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="12" />
        </filter>
        <radialGradient id="baijiu-fog" cx="70%" cy="50%" r="24%">
          <stop offset="0%" stopColor={amber} stopOpacity="0.18" />
          <stop offset="100%" stopColor={amber} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="baijiu-liquid-glow" cx="50%" cy="55%" r="40%">
          <stop offset="0%" stopColor={amber} stopOpacity="0.10" />
          <stop offset="100%" stopColor={amber} stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect x="0" y="0" width="900" height="400" fill="url(#baijiu-fog)" />

      <g opacity="0.14" filter="url(#baijiu-blur)">
        <path
          d="M 620 60 C 620 50, 640 40, 650 40 C 660 40, 680 50, 680 60 L 685 90 C 710 120, 720 160, 715 210 C 710 250, 690 290, 660 310 C 640 324, 620 324, 600 310 C 570 290, 550 250, 545 210 C 540 160, 550 120, 575 90 L 580 60 C 580 50, 595 40, 605 40 C 615 40, 620 50, 620 60"
          fill={amber}
          stroke={amber}
          strokeWidth="3"
          opacity="0.3"
        />
      </g>

      <path
        d="M 620 60 C 620 50, 640 40, 650 40 C 660 40, 680 50, 680 60 L 685 90 C 710 120, 720 160, 715 210 C 710 250, 690 290, 660 310 C 640 324, 620 324, 600 310 C 570 290, 550 250, 545 210 C 540 160, 550 120, 575 90 L 580 60 C 580 50, 595 40, 605 40 C 615 40, 620 50, 620 60"
        fill={amber}
        opacity="0.06"
      />
      <path
        d="M 620 60 C 620 50, 640 40, 650 40 C 660 40, 680 50, 680 60 L 685 90 C 710 120, 720 160, 715 210 C 710 250, 690 290, 660 310 C 640 324, 620 324, 600 310 C 570 290, 550 250, 545 210 C 540 160, 550 120, 575 90 L 580 60 C 580 50, 595 40, 605 40 C 615 40, 620 50, 620 60"
        fill="none"
        stroke={color}
        strokeWidth="2.0"
        opacity="0.24"
      />

      <path
        d="M 618 62 C 618 52, 638 42, 648 42 C 658 42, 678 52, 678 62 L 683 92 C 708 122, 718 162, 713 212 C 708 252, 688 292, 658 312"
        fill="none"
        stroke={amber}
        strokeWidth="0.6"
        opacity="0.14"
      />

      <ellipse cx="630" cy="235" rx="55" ry="60" fill="url(#baijiu-liquid-glow)" />
      <ellipse cx="630" cy="240" rx="45" ry="45" fill={amber} opacity="0.05" />

      <path
        d="M 555 190 Q 600 178, 640 190 Q 680 202, 715 190"
        fill="none"
        stroke={amber}
        strokeWidth="1.4"
        opacity="0.24"
      />

      <path d="M 558 212 Q 602 202, 642 212 Q 682 222, 712 212" fill="none" stroke={amber} strokeWidth="1.0" opacity="0.18" />
      <path d="M 562 232 Q 608 224, 646 232 Q 680 240, 708 232" fill="none" stroke={amber} strokeWidth="0.8" opacity="0.14" />
      <path d="M 566 250 Q 612 244, 650 250 Q 682 256, 704 250" fill="none" stroke={amberDark} strokeWidth="0.6" opacity="0.10" />

      <ellipse cx="650" cy="40" rx="22" ry="6" fill={amber} opacity="0.06" />
      <ellipse cx="650" cy="40" rx="22" ry="6" fill="none" stroke={color} strokeWidth="1.0" opacity="0.20" />
      <ellipse cx="650" cy="40" rx="16" ry="4" fill="none" stroke={amber} strokeWidth="0.5" opacity="0.12" />

      <path d="M 555 130 Q 630 118, 705 130" fill="none" stroke={color} strokeWidth="0.8" opacity="0.14" />
      <path d="M 558 135 Q 630 124, 702 135" fill="none" stroke={amber} strokeWidth="0.4" opacity="0.10" />

      <circle cx="740" cy="150" r="2.5" fill={amber} opacity="0.14" />
      <circle cx="748" cy="175" r="2" fill={amber} opacity="0.12" />
      <circle cx="742" cy="200" r="1.5" fill={amber} opacity="0.10" />

      <path d="M 610 100 L 605 250" fill="none" stroke="#fff" strokeWidth="0.4" opacity="0.06" />
    </svg>
  );
}
