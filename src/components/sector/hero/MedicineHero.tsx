"use client";

import { GlowLine, GlowNode, AmbientMesh, NoiseOverlay, DepthGroup, SharedFilterDefs } from "./primitives";

export function MedicineHero({ color }: { color: string }) {
  const purple = "#7C3AED";
  const roseRed = "#E11D7B";
  const coolBlue = "#6366F1";

  // DNA double helix — ribbon style (two parallel curves per strand)
  // Strand A (front): shifted left
  const strandA1 =
    "M 700 10 C 728 40, 728 70, 700 90 C 672 110, 672 140, 700 160 C 728 180, 728 210, 700 230 C 672 250, 672 280, 700 300 C 728 320, 728 350, 700 370 C 672 390, 672 395, 700 400";
  const strandA2 =
    "M 708 10 C 736 40, 736 70, 708 90 C 680 110, 680 140, 708 160 C 736 180, 736 210, 708 230 C 680 250, 680 280, 708 300 C 736 320, 736 350, 708 370 C 680 390, 680 395, 708 400";

  // Strand B (back): shifted right
  const strandB1 =
    "M 740 10 C 712 40, 712 70, 740 90 C 768 110, 768 140, 740 160 C 712 180, 712 210, 740 230 C 768 250, 768 280, 740 300 C 712 320, 712 350, 740 370 C 768 390, 768 395, 740 400";
  const strandB2 =
    "M 732 10 C 704 40, 704 70, 732 90 C 760 110, 760 140, 732 160 C 704 180, 704 210, 732 230 C 760 250, 760 280, 732 300 C 704 320, 704 350, 732 370 C 760 390, 760 395, 732 400";

  // Base pair cross-links at regular intervals
  const basePairYs = [40, 70, 100, 130, 160, 190, 220, 250, 280, 310, 340, 370];

  // Approximate x positions for cross-links at each y
  const crossLinkXs = basePairYs.map((y) => {
    const phase = ((y - 10) / 80) * Math.PI;
    return {
      x1: 700 + 8 * Math.sin(phase) + 4, // strand A center
      x2: 740 - 8 * Math.sin(phase) - 4, // strand B center
    };
  });

  // Molecule cluster — positioned in left-center area
  const molecules = [
    { cx: 530, cy: 120, r: 8, intensity: 0.8, color: roseRed },
    { cx: 580, cy: 95, r: 6, intensity: 0.65, color: color },
    { cx: 625, cy: 115, r: 7, intensity: 0.7, color: purple },
    { cx: 560, cy: 155, r: 5, intensity: 0.5, color: color },
    { cx: 610, cy: 165, r: 5.5, intensity: 0.55, color: roseRed },
    { cx: 580, cy: 195, r: 6, intensity: 0.6, color: color },
  ];

  // Molecular bonds
  const bonds = [
    { x1: 530, y1: 120, x2: 580, y2: 95 },
    { x1: 580, y1: 95, x2: 625, y2: 115 },
    { x1: 530, y1: 120, x2: 560, y2: 155 },
    { x1: 580, y1: 95, x2: 580, y2: 195 },
    { x1: 625, y1: 115, x2: 610, y2: 165 },
    { x1: 560, y1: 155, x2: 580, y2: 195 },
    { x1: 610, y1: 165, x2: 580, y2: 195 },
  ];

  // ECG pulse path
  const ecgPath =
    "M 460 310 L 500 310 L 515 298 L 530 325 L 545 270 L 560 320 L 575 300 L 590 310 L 660 310";

  let gradIdx = 0;
  const nextGradId = () => `med-g${++gradIdx}`;

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 900 400"
      preserveAspectRatio="xMidYMid slice"
    >
      <SharedFilterDefs />

      {/* Layer 1: Ambient mesh — dark purple + cool blue */}
      <AmbientMesh
        id="med-fog-purple"
        cx="72%"
        cy="45%"
        r="28%"
        colors={[
          { offset: "0%", color: purple, opacity: 0.1 },
          { offset: "50%", color: purple, opacity: 0.04 },
          { offset: "100%", color: purple, opacity: 0 },
        ]}
      />
      <AmbientMesh
        id="med-fog-blue"
        cx="60%"
        cy="35%"
        r="20%"
        colors={[
          { offset: "0%", color: coolBlue, opacity: 0.05 },
          { offset: "100%", color: coolBlue, opacity: 0 },
        ]}
      />

      {/* Layer 2: Background structure — faint ECG line + baseline */}
      <DepthGroup layer="background">
        {/* ECG baseline */}
        <line
          x1="450"
          y1="310"
          x2="670"
          y2="310"
          stroke={color}
          strokeWidth={0.35}
          opacity={0.5}
        />
        {/* ECG pulse — background */}
        <path
          d={ecgPath}
          fill="none"
          stroke={color}
          strokeWidth={0.55}
          opacity={0.4}
        />
        {/* Faint DNA outline — just the curves, no fill */}
        <path d={strandA1} fill="none" stroke={purple} strokeWidth={0.45} opacity={0.3} />
        <path d={strandB1} fill="none" stroke={coolBlue} strokeWidth={0.45} opacity={0.25} />
      </DepthGroup>

      {/* Layer 3: Main DNA helix ribbon */}
      {/* Strand A — front strand (rose-red tinted) */}
      <GlowLine
        d={strandA1}
        gradientId={nextGradId()}
        colorStops={[
          { offset: "0%", color: purple, opacity: 0.6 },
          { offset: "30%", color: roseRed, opacity: 0.9 },
          { offset: "60%", color: color, opacity: 0.7 },
          { offset: "100%", color: roseRed, opacity: 0.8 },
        ]}
        strokeWidth={1.0}
        opacity={0.6}
        glowLevel="small"
        glowOpacity={0.07}
        direction={{ x1: "0%", y1: "0%", x2: "0%", y2: "100%" }}
      />
      <path
        d={strandA2}
        fill="none"
        stroke={color}
        strokeWidth={0.5}
        opacity={0.3}
      />

      {/* Strand B — back strand (cool blue tinted) */}
      <GlowLine
        d={strandB1}
        gradientId={nextGradId()}
        colorStops={[
          { offset: "0%", color: coolBlue, opacity: 0.5 },
          { offset: "40%", color: purple, opacity: 0.8 },
          { offset: "70%", color: color, opacity: 0.6 },
          { offset: "100%", color: coolBlue, opacity: 0.7 },
        ]}
        strokeWidth={0.9}
        opacity={0.5}
        glowLevel="small"
        glowOpacity={0.06}
        direction={{ x1: "0%", y1: "0%", x2: "0%", y2: "100%" }}
      />
      <path
        d={strandB2}
        fill="none"
        stroke={purple}
        strokeWidth={0.45}
        opacity={0.25}
      />

      {/* Base pair cross-links */}
      {crossLinkXs.map((xl, i) => (
        <line
          key={`med-bp-${i}`}
          x1={xl.x1}
          y1={basePairYs[i]}
          x2={xl.x2}
          y2={basePairYs[i]}
          stroke={i % 2 === 0 ? color : purple}
          strokeWidth={0.5}
          opacity={0.3}
        />
      ))}

      {/* Molecular bonds — background */}
      {bonds.map((b, i) => (
        <line
          key={`med-bond-${i}`}
          x1={b.x1}
          y1={b.y1}
          x2={b.x2}
          y2={b.y2}
          stroke={color}
          strokeWidth={0.8}
          opacity={0.3}
        />
      ))}

      {/* Layer 4: Highlight — ECG with glow, molecular bonds highlight */}
      <DepthGroup layer="foreground">
        <GlowLine
          d={ecgPath}
          gradientId={nextGradId()}
          colorStops={[
            { offset: "0%", color: color, opacity: 0.5 },
            { offset: "40%", color: roseRed, opacity: 1 },
            { offset: "80%", color: color, opacity: 0.7 },
            { offset: "100%", color: color, opacity: 0.4 },
          ]}
          strokeWidth={0.9}
          opacity={0.75}
          glowLevel="medium"
          glowOpacity={0.1}
          glowStrokeWidth={4}
        />
      </DepthGroup>

      {/* Layer 5: Node glow — molecules + key DNA nodes */}
      {molecules.map((m, i) => (
        <GlowNode
          key={`med-mol-${i}`}
          cx={m.cx}
          cy={m.cy}
          r={m.r}
          color={m.color}
          intensity={m.intensity}
          coreColor="#fff"
        />
      ))}

      {/* Key nodes along DNA helix — at crossover points */}
      {[90, 160, 230, 300].map((y, i) => (
        <GlowNode
          key={`med-dnan-${i}`}
          cx={720}
          cy={y}
          r={3}
          color={i % 2 === 0 ? roseRed : purple}
          intensity={0.6 + i * 0.05}
        />
      ))}

      {/* Floating molecular fragments */}
      <circle cx="490" cy="250" r="1.5" fill={purple} opacity={0.18} />
      <circle cx="660" cy="75" r="1.2" fill={color} opacity={0.15} />
      <line
        x1="488"
        y1="250"
        x2="495"
        y2="242"
        stroke={purple}
        strokeWidth={0.4}
        opacity={0.12}
      />

      {/* Layer 6: Noise overlay */}
      <NoiseOverlay opacity={0.025} />
    </svg>
  );
}

// =====================================================================
//  LEGACY HERO COMPONENTS (7 unchanged sectors — P1-F/G level)
// =====================================================================
