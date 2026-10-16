"use client";



export function MedicineSVG({ color, opacity }: { color: string; opacity: number }) {
  // Large molecular structure + bond connections + bio pulse line
  // Recognizable as: medicine / biotech / molecular
  const pink = color || "#EC4899";
  const nodeColor = "#a78bfa";
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 320 180"
      preserveAspectRatio="xMidYMid slice"
      style={{ opacity }}
    >
      {/* Large molecule nodes — prominent circles */}
      {/* Node A — top left */}
      <circle cx="80" cy="50" r="16" fill={nodeColor} opacity="0.06" />
      <circle cx="80" cy="50" r="16" fill="none" stroke={nodeColor} strokeWidth="2.0" opacity="0.32" />
      <circle cx="80" cy="50" r="6" fill={nodeColor} opacity="0.20" />

      {/* Node B — top right */}
      <circle cx="220" cy="35" r="18" fill={nodeColor} opacity="0.06" />
      <circle cx="220" cy="35" r="18" fill="none" stroke={nodeColor} strokeWidth="2.0" opacity="0.32" />
      <circle cx="220" cy="35" r="7" fill={nodeColor} opacity="0.22" />

      {/* Node C — center */}
      <circle cx="150" cy="90" r="20" fill={nodeColor} opacity="0.05" />
      <circle cx="150" cy="90" r="20" fill="none" stroke={nodeColor} strokeWidth="2.2" opacity="0.34" />
      <circle cx="150" cy="90" r="8" fill={nodeColor} opacity="0.22" />

      {/* Node D — bottom left */}
      <circle cx="70" cy="140" r="14" fill={nodeColor} opacity="0.06" />
      <circle cx="70" cy="140" r="14" fill="none" stroke={nodeColor} strokeWidth="1.8" opacity="0.28" />
      <circle cx="70" cy="140" r="5" fill={nodeColor} opacity="0.18" />

      {/* Node E — bottom right */}
      <circle cx="250" cy="120" r="15" fill={nodeColor} opacity="0.06" />
      <circle cx="250" cy="120" r="15" fill="none" stroke={nodeColor} strokeWidth="1.8" opacity="0.30" />
      <circle cx="250" cy="120" r="6" fill={nodeColor} opacity="0.20" />

      {/* Chemical bonds — thick connecting lines */}
      <line x1="80" y1="50" x2="150" y2="90" stroke={pink} strokeWidth="2.0" opacity="0.26" />
      <line x1="220" y1="35" x2="150" y2="90" stroke={pink} strokeWidth="2.0" opacity="0.26" />
      <line x1="150" y1="90" x2="70" y2="140" stroke={pink} strokeWidth="1.8" opacity="0.22" />
      <line x1="150" y1="90" x2="250" y2="120" stroke={pink} strokeWidth="1.8" opacity="0.22" />
      <line x1="80" y1="50" x2="220" y2="35" stroke={pink} strokeWidth="1.2" opacity="0.16" />
      <line x1="70" y1="140" x2="250" y2="120" stroke={pink} strokeWidth="1.0" opacity="0.12" />

      {/* Bio pulse line — bold ECG across bottom */}
      <path
        d="M 10 168 L 60 168 L 80 155 L 100 180 L 120 140 L 140 172 L 155 162 L 180 168 L 320 168"
        fill="none"
        stroke={pink}
        strokeWidth="2.0"
        opacity="0.28"
      />
      {/* Pulse glow */}
      <path
        d="M 10 168 L 60 168 L 80 155 L 100 180 L 120 140 L 140 172 L 155 162 L 180 168 L 320 168"
        fill="none"
        stroke={pink}
        strokeWidth="6"
        opacity="0.08"
      />
    </svg>
  );
}
