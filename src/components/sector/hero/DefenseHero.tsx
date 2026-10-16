"use client";

import { GlowLine, GlowNode, AmbientMesh, NoiseOverlay, DepthGroup, SharedFilterDefs } from "./primitives";

export function DefenseHero({ color }: { color: string }) {
  const coldGray = "#6B7280";
  const darkRed = "#8B2020";
  const dimRed = "#5C1818";

  // Hexagon vertices helper — centered at (660, 160)
  const hexPoints = (cx: number, cy: number, r: number) => {
    const pts: string[] = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 2;
      pts.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
    }
    return pts.join(" ");
  };

  const hCenter = { x: 660, y: 160 };
  const hexR = [130, 95, 55]; // outer → inner

  // Armor panel subdivision paths
  const armorPanels = [
    // Vertical center seam
    `M ${hCenter.x} ${hCenter.y - hexR[0]} L ${hCenter.x} ${hCenter.y + hexR[0]}`,
    // Diagonal seams
    `M ${hCenter.x - hexR[0] * 0.87} ${hCenter.y - hexR[0] * 0.5} L ${hCenter.x + hexR[0] * 0.87} ${hCenter.y + hexR[0] * 0.5}`,
    `M ${hCenter.x + hexR[0] * 0.87} ${hCenter.y - hexR[0] * 0.5} L ${hCenter.x - hexR[0] * 0.87} ${hCenter.y + hexR[0] * 0.5}`,
  ];

  // Armor panel fill polygons (between hexagon layers)
  const panelFillAreas = [
    // Top-left panel
    `M ${hCenter.x} ${hCenter.y - hexR[0]} L ${hCenter.x - hexR[0] * 0.87} ${hCenter.y - hexR[0] * 0.5} L ${hCenter.x - hexR[1] * 0.87} ${hCenter.y - hexR[1] * 0.5} L ${hCenter.x} ${hCenter.y - hexR[1]} Z`,
    // Top-right panel
    `M ${hCenter.x} ${hCenter.y - hexR[0]} L ${hCenter.x + hexR[0] * 0.87} ${hCenter.y - hexR[0] * 0.5} L ${hCenter.x + hexR[1] * 0.87} ${hCenter.y - hexR[1] * 0.5} L ${hCenter.x} ${hCenter.y - hexR[1]} Z`,
    // Bottom panels
    `M ${hCenter.x} ${hCenter.y + hexR[0]} L ${hCenter.x - hexR[0] * 0.87} ${hCenter.y + hexR[0] * 0.5} L ${hCenter.x - hexR[1] * 0.87} ${hCenter.y + hexR[1] * 0.5} L ${hCenter.x} ${hCenter.y + hexR[1]} Z`,
    `M ${hCenter.x} ${hCenter.y + hexR[0]} L ${hCenter.x + hexR[0] * 0.87} ${hCenter.y + hexR[0] * 0.5} L ${hCenter.x + hexR[1] * 0.87} ${hCenter.y + hexR[1] * 0.5} L ${hCenter.x} ${hCenter.y + hexR[1]} Z`,
  ];

  // Radar concentric arcs
  const radarRings = [30, 55, 85, 115];

  // Radar tick marks
  const tickAngles = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];

  // Scan sweep arc
  const scanArc = `M ${hCenter.x + 85 * Math.cos(-0.4)} ${hCenter.y + 85 * Math.sin(-0.4)} A 85 85 0 0 1 ${hCenter.x + 85 * Math.cos(0.8)} ${hCenter.y + 85 * Math.sin(0.8)}`;

  let gradIdx = 0;
  const nextGradId = () => `def-g${++gradIdx}`;

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 900 400"
      preserveAspectRatio="xMidYMid slice"
    >
      <SharedFilterDefs />

      {/* Layer 1: Ambient mesh — cold gray fog + dim red accent */}
      <AmbientMesh
        id="def-fog-gray"
        cx="70%"
        cy="40%"
        r="30%"
        colors={[
          { offset: "0%", color: coldGray, opacity: 0.09 },
          { offset: "50%", color: coldGray, opacity: 0.04 },
          { offset: "100%", color: coldGray, opacity: 0 },
        ]}
      />
      <AmbientMesh
        id="def-fog-red"
        cx="74%"
        cy="40%"
        r="12%"
        colors={[
          { offset: "0%", color: darkRed, opacity: 0.06 },
          { offset: "100%", color: darkRed, opacity: 0 },
        ]}
      />

      {/* Layer 2: Background structure — faint radar rings */}
      <DepthGroup layer="background">
        {radarRings.map((r, i) => (
          <circle
            key={`def-ring-${i}`}
            cx={hCenter.x}
            cy={hCenter.y}
            r={r}
            fill="none"
            stroke={coldGray}
            strokeWidth={0.5 - i * 0.05}
            opacity={1}
            strokeDasharray={i > 1 ? "2 4" : undefined}
          />
        ))}
        {/* Faint cross-grid lines through center */}
        <line
          x1={hCenter.x}
          y1={hCenter.y - hexR[0]}
          x2={hCenter.x}
          y2={hCenter.y + hexR[0]}
          stroke={coldGray}
          strokeWidth={0.4}
          opacity={0.5}
        />
        <line
          x1={hCenter.x - hexR[0]}
          y1={hCenter.y}
          x2={hCenter.x + hexR[0]}
          y2={hCenter.y}
          stroke={coldGray}
          strokeWidth={0.4}
          opacity={0.5}
        />
      </DepthGroup>

      {/* Layer 3: Main structure — hexagons with gradient stroke */}
      {/* Outer hexagon */}
      <GlowLine
        d={`M ${hexPoints(hCenter.x, hCenter.y, hexR[0]).split(" ").join(" L ")} Z`}
        gradientId={nextGradId()}
        colorStops={[
          { offset: "0%", color: coldGray, opacity: 0.7 },
          { offset: "30%", color: dimRed, opacity: 0.5 },
          { offset: "60%", color: darkRed, opacity: 0.8 },
          { offset: "100%", color: coldGray, opacity: 0.6 },
        ]}
        strokeWidth={1.0}
        opacity={0.55}
        glowLevel="small"
        glowOpacity={0.06}
      />
      {/* Semi-transparent armor panel fills */}
      {panelFillAreas.map((d, i) => (
        <path
          key={`def-pf-${i}`}
          d={d}
          fill={coldGray}
          opacity={0.035 + i * 0.01}
        />
      ))}

      {/* Middle hexagon */}
      <GlowLine
        d={`M ${hexPoints(hCenter.x, hCenter.y, hexR[1]).split(" ").join(" L ")} Z`}
        gradientId={nextGradId()}
        colorStops={[
          { offset: "0%", color: coldGray, opacity: 0.6 },
          { offset: "40%", color: darkRed, opacity: 0.9 },
          { offset: "100%", color: coldGray, opacity: 0.5 },
        ]}
        strokeWidth={0.9}
        opacity={0.6}
        glowLevel="small"
        glowOpacity={0.07}
      />

      {/* Armor seam lines */}
      {armorPanels.map((d, i) => (
        <path
          key={`def-seam-${i}`}
          d={d}
          fill="none"
          stroke={coldGray}
          strokeWidth={0.45}
          opacity={0.35}
        />
      ))}

      {/* Inner hexagon — core */}
      <GlowLine
        d={`M ${hexPoints(hCenter.x, hCenter.y, hexR[2]).split(" ").join(" L ")} Z`}
        gradientId={nextGradId()}
        colorStops={[
          { offset: "0%", color: darkRed, opacity: 0.8 },
          { offset: "50%", color: color, opacity: 1 },
          { offset: "100%", color: darkRed, opacity: 0.7 },
        ]}
        strokeWidth={0.8}
        opacity={0.65}
        glowLevel="medium"
        glowOpacity={0.1}
        glowStrokeWidth={3}
      />

      {/* Layer 4: Highlight — radar scan sweep, aiming cross-hair */}
      <DepthGroup layer="foreground">
        {/* Scan sweep arc */}
        <GlowLine
          d={scanArc}
          gradientId={nextGradId()}
          colorStops={[
            { offset: "0%", color: color, opacity: 0.4 },
            { offset: "100%", color: color, opacity: 0.15 },
          ]}
          strokeWidth={0.8}
          opacity={0.7}
          glowLevel="small"
          glowOpacity={0.08}
        />
        {/* Scan trail fade */}
        <path
          d={`M ${hCenter.x + 85 * Math.cos(0.8)} ${hCenter.y + 85 * Math.sin(0.8)} A 85 85 0 0 1 ${hCenter.x + 85 * Math.cos(1.8)} ${hCenter.y + 85 * Math.sin(1.8)}`}
          fill="none"
          stroke={color}
          strokeWidth={0.5}
          opacity={0.25}
          strokeDasharray="2 4"
        />
        {/* Aiming cross-hair */}
        <line
          x1={hCenter.x - 12}
          y1={hCenter.y}
          x2={hCenter.x + 12}
          y2={hCenter.y}
          stroke={color}
          strokeWidth={0.6}
          opacity={0.6}
        />
        <line
          x1={hCenter.x}
          y1={hCenter.y - 12}
          x2={hCenter.x}
          y2={hCenter.y + 12}
          stroke={color}
          strokeWidth={0.6}
          opacity={0.6}
        />
        {/* Corner target brackets */}
        {[
          { x: hCenter.x - hexR[0] + 5, y: hCenter.y - hexR[0] * 0.5 + 5, dx: -1, dy: -1 },
          { x: hCenter.x + hexR[0] - 5, y: hCenter.y - hexR[0] * 0.5 + 5, dx: 1, dy: -1 },
          { x: hCenter.x - hexR[0] + 5, y: hCenter.y + hexR[0] * 0.5 - 5, dx: -1, dy: 1 },
          { x: hCenter.x + hexR[0] - 5, y: hCenter.y + hexR[0] * 0.5 - 5, dx: 1, dy: 1 },
        ].map((b, i) => (
          <g key={`def-brk-${i}`}>
            <line
              x1={b.x}
              y1={b.y}
              x2={b.x + b.dx * 10}
              y2={b.y}
              stroke={color}
              strokeWidth={0.5}
              opacity={0.4}
            />
            <line
              x1={b.x}
              y1={b.y}
              x2={b.x}
              y2={b.y + b.dy * 10}
              stroke={color}
              strokeWidth={0.5}
              opacity={0.4}
            />
          </g>
        ))}
      </DepthGroup>

      {/* Radar tick marks */}
      {tickAngles.map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const x1 = hCenter.x + Math.cos(rad) * 88;
        const y1 = hCenter.y + Math.sin(rad) * 88;
        const x2 = hCenter.x + Math.cos(rad) * 96;
        const y2 = hCenter.y + Math.sin(rad) * 96;
        return (
          <line
            key={`def-tick-${angle}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={color}
            strokeWidth={0.5}
            opacity={0.3}
          />
        );
      })}

      {/* Layer 5: Center node glow */}
      <GlowNode
        cx={hCenter.x}
        cy={hCenter.y}
        r={5}
        color={color}
        intensity={0.9}
        coreColor="#fff"
      />

      {/* Secondary glow nodes at hexagon vertices */}
      {[0, 2, 4].map((i) => {
        const angle = (Math.PI / 3) * i - Math.PI / 2;
        return (
          <GlowNode
            key={`def-vn-${i}`}
            cx={hCenter.x + hexR[0] * Math.cos(angle)}
            cy={hCenter.y + hexR[0] * Math.sin(angle)}
            r={2.5}
            color={darkRed}
            intensity={0.5}
          />
        );
      })}

      {/* Layer 6: Noise overlay */}
      <NoiseOverlay opacity={0.02} />
    </svg>
  );
}

// =====================================================================
//  MEDICINE HERO — P1-H: DNA helix + molecular + ECG
// =====================================================================
