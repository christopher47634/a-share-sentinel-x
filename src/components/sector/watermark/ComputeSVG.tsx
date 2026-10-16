"use client";



export function ComputeSVG({ color, opacity }: { color: string; opacity: number }) {
  // Large chip outline (50-60% of card) + circuit traces + cold blue core glow
  // Recognizable as: chip / CPU / AI computing
  const chipColor = color || "#6366f1";
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 320 180"
      preserveAspectRatio="xMidYMid slice"
      style={{ opacity }}
    >
      {/* Main chip body — large centered rectangle */}
      <rect
        x="80"
        y="15"
        width="160"
        height="150"
        rx="8"
        fill="none"
        stroke={chipColor}
        strokeWidth="2.2"
        opacity="0.32"
      />
      {/* Inner die */}
      <rect
        x="100"
        y="35"
        width="120"
        height="110"
        rx="5"
        fill={chipColor}
        opacity="0.04"
      />
      <rect
        x="100"
        y="35"
        width="120"
        height="110"
        rx="5"
        fill="none"
        stroke={chipColor}
        strokeWidth="1.5"
        opacity="0.24"
      />

      {/* Core processing glow */}
      <rect
        x="130"
        y="60"
        width="60"
        height="60"
        rx="4"
        fill={chipColor}
        opacity="0.08"
      />
      <circle cx="160" cy="90" r="18" fill={chipColor} opacity="0.12" />
      <circle cx="160" cy="90" r="6" fill={chipColor} opacity="0.25" />

      {/* Top pins — 7 */}
      {[105, 120, 135, 155, 175, 190, 205].map((x) => (
        <g key={`t${x}`}>
          <line
            x1={x}
            y1="15"
            x2={x}
            y2="-2"
            stroke={chipColor}
            strokeWidth="1.5"
            opacity="0.28"
          />
          <circle cx={x} cy="-4" r="2.5" fill={chipColor} opacity="0.28" />
        </g>
      ))}
      {/* Bottom pins — 7 */}
      {[105, 120, 135, 155, 175, 190, 205].map((x) => (
        <g key={`b${x}`}>
          <line
            x1={x}
            y1="165"
            x2={x}
            y2="182"
            stroke={chipColor}
            strokeWidth="1.5"
            opacity="0.28"
          />
          <circle cx={x} cy="184" r="2.5" fill={chipColor} opacity="0.28" />
        </g>
      ))}
      {/* Left pins — 4 */}
      {[40, 65, 95, 120].map((y) => (
        <g key={`l${y}`}>
          <line
            x1="80"
            y1={y}
            x2="60"
            y2={y}
            stroke={chipColor}
            strokeWidth="1.5"
            opacity="0.26"
          />
          <circle cx="57" cy={y} r="2.5" fill={chipColor} opacity="0.26" />
        </g>
      ))}
      {/* Right pins — 4 */}
      {[40, 65, 95, 120].map((y) => (
        <g key={`r${y}`}>
          <line
            x1="240"
            y1={y}
            x2="260"
            y2={y}
            stroke={chipColor}
            strokeWidth="1.5"
            opacity="0.26"
          />
          <circle cx="263" cy={y} r="2.5" fill={chipColor} opacity="0.26" />
        </g>
      ))}

      {/* Circuit traces — right side */}
      <polyline
        points="263,40 290,40 290,20"
        fill="none"
        stroke={chipColor}
        strokeWidth="1.2"
        opacity="0.20"
      />
      <polyline
        points="263,65 295,65 295,95"
        fill="none"
        stroke={chipColor}
        strokeWidth="1.2"
        opacity="0.18"
      />
      <polyline
        points="263,95 285,95 285,120"
        fill="none"
        stroke={chipColor}
        strokeWidth="1.0"
        opacity="0.16"
      />
      {/* Circuit traces — left side */}
      <polyline
        points="57,40 30,40 30,18"
        fill="none"
        stroke={chipColor}
        strokeWidth="1.2"
        opacity="0.20"
      />
      <polyline
        points="57,65 25,65 25,95"
        fill="none"
        stroke={chipColor}
        strokeWidth="1.2"
        opacity="0.18"
      />

      {/* Grid pattern inside die — subtle */}
      {[0, 1, 2, 3].map((i) => (
        <line
          key={`gh${i}`}
          x1="105"
          y1={50 + i * 25}
          x2="215"
          y2={50 + i * 25}
          stroke={chipColor}
          strokeWidth="0.5"
          opacity="0.10"
        />
      ))}
      {[0, 1, 2, 3, 4].map((i) => (
        <line
          key={`gv${i}`}
          x1={115 + i * 25}
          y1="40"
          x2={115 + i * 25}
          y2="140"
          stroke={chipColor}
          strokeWidth="0.5"
          opacity="0.10"
        />
      ))}
    </svg>
  );
}
