"use client";

import { GlowLine, GlowNode, AmbientMesh, NoiseOverlay, DepthGroup, SharedFilterDefs } from "./primitives";

export function OpticalHero({ color }: { color: string }) {
  // Color palette: deep blue → gold-copper → warm white → gold-copper
  const deepBlue = "#1E3A6E";
  const warmWhite = "#F5E6D3";

  // Fiber optic curves — cubic beziers from lower-center-right toward upper-right
  // Each has slight curvature variation, not parallel
  const fibers = [
    { d: "M 490 350 C 560 300, 640 240, 700 175 C 740 135, 790 90, 850 50", bg: true },
    { d: "M 510 340 C 575 295, 650 235, 715 170 C 760 128, 810 85, 860 55", bg: true },
    { d: "M 480 355 C 545 308, 630 248, 695 180 C 735 140, 785 98, 845 60" },
    { d: "M 520 345 C 588 298, 665 238, 725 175 C 768 133, 820 88, 870 48" },
    { d: "M 495 352 C 555 305, 635 245, 705 182 C 750 140, 800 95, 858 55" },
    { d: "M 505 342 C 570 298, 648 238, 710 178 C 755 138, 808 90, 865 45" },
    { d: "M 485 358 C 540 312, 620 252, 688 188 C 730 148, 778 102, 840 62", bg: true },
    { d: "M 515 338 C 580 292, 658 232, 720 170 C 762 130, 815 82, 875 42" },
  ];

  // Glow nodes along fiber paths — endpoints and midpoints
  const keyNodes = [
    { cx: 850, cy: 50, r: 3.5, intensity: 0.85 },
    { cx: 860, cy: 55, r: 3, intensity: 0.75 },
    { cx: 870, cy: 48, r: 2.8, intensity: 0.7 },
    { cx: 845, cy: 60, r: 2.5, intensity: 0.65 },
    { cx: 865, cy: 45, r: 3.2, intensity: 0.8 },
    { cx: 700, cy: 175, r: 2.5, intensity: 0.6 },
    { cx: 715, cy: 170, r: 2, intensity: 0.5 },
    { cx: 725, cy: 175, r: 2, intensity: 0.45 },
    { cx: 705, cy: 182, r: 2.2, intensity: 0.55 },
  ];

  // Small particles along fiber paths
  const particles = [
    { cx: 560, cy: 305, r: 1.2, intensity: 0.35 },
    { cx: 590, cy: 280, r: 1, intensity: 0.3 },
    { cx: 620, cy: 260, r: 1.3, intensity: 0.38 },
    { cx: 650, cy: 235, r: 1, intensity: 0.28 },
    { cx: 680, cy: 210, r: 1.2, intensity: 0.32 },
    { cx: 750, cy: 140, r: 1.5, intensity: 0.42 },
    { cx: 775, cy: 120, r: 1, intensity: 0.28 },
    { cx: 800, cy: 100, r: 1.3, intensity: 0.35 },
    { cx: 820, cy: 80, r: 1, intensity: 0.25 },
    { cx: 835, cy: 68, r: 0.9, intensity: 0.22 },
    { cx: 545, cy: 315, r: 1, intensity: 0.25 },
    { cx: 670, cy: 225, r: 0.8, intensity: 0.2 },
    { cx: 575, cy: 292, r: 1.1, intensity: 0.32 },
    { cx: 610, cy: 268, r: 0.9, intensity: 0.26 },
    { cx: 640, cy: 248, r: 1.2, intensity: 0.34 },
    { cx: 700, cy: 195, r: 1, intensity: 0.28 },
    { cx: 720, cy: 178, r: 1.3, intensity: 0.36 },
    { cx: 740, cy: 158, r: 0.8, intensity: 0.22 },
    { cx: 760, cy: 135, r: 1.1, intensity: 0.3 },
    { cx: 790, cy: 108, r: 0.9, intensity: 0.24 },
    { cx: 810, cy: 88, r: 1.2, intensity: 0.32 },
    { cx: 830, cy: 72, r: 0.7, intensity: 0.18 },
    { cx: 555, cy: 310, r: 0.8, intensity: 0.2 },
    { cx: 695, cy: 200, r: 1.1, intensity: 0.3 },
  ];

  let gradIdx = 0;
  const nextGradId = () => `opt-g${++gradIdx}`;

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 900 400"
      preserveAspectRatio="xMidYMid slice"
    >
      <SharedFilterDefs />

      {/* Layer 1: Ambient mesh — gold-copper fog at right side */}
      <AmbientMesh
        id="opt-fog-main"
        cx="72%"
        cy="42%"
        r="28%"
        colors={[
          { offset: "0%", color: color, opacity: 0.1 },
          { offset: "60%", color: color, opacity: 0.04 },
          { offset: "100%", color: color, opacity: 0 },
        ]}
      />
      {/* Secondary blue fog for depth */}
      <AmbientMesh
        id="opt-fog-blue"
        cx="82%"
        cy="30%"
        r="18%"
        colors={[
          { offset: "0%", color: deepBlue, opacity: 0.08 },
          { offset: "100%", color: deepBlue, opacity: 0 },
        ]}
      />

      {/* Layer 2: Background structure lines (faint) */}
      <DepthGroup layer="background">
        {fibers
          .filter((f) => f.bg)
          .map((f, i) => (
            <GlowLine
              key={`opt-bg-${i}`}
              d={f.d}
              gradientId={nextGradId()}
              colorStops={[
                { offset: "0%", color: deepBlue, opacity: 0.5 },
                { offset: "40%", color: color, opacity: 0.3 },
                { offset: "100%", color: color, opacity: 0.15 },
              ]}
              strokeWidth={0.55}
              opacity={0.6}
              direction={{ x1: "0%", y1: "100%", x2: "100%", y2: "0%" }}
            />
          ))}
      </DepthGroup>

      {/* Layer 3: Main fiber structure lines */}
      <DepthGroup layer="midground">
        {fibers
          .filter((f) => !f.bg)
          .map((f, i) => (
            <GlowLine
              key={`opt-main-${i}`}
              d={f.d}
              gradientId={nextGradId()}
              colorStops={[
                { offset: "0%", color: deepBlue, opacity: 0.6 },
                { offset: "35%", color: color, opacity: 0.85 },
                { offset: "65%", color: warmWhite, opacity: 0.5 },
                { offset: "100%", color: color, opacity: 1 },
              ]}
              strokeWidth={0.9 + i * 0.05}
              opacity={0.82}
              glowLevel="small"
              glowOpacity={0.1}
              direction={{ x1: "0%", y1: "100%", x2: "100%", y2: "0%" }}
            />
          ))}
      </DepthGroup>

      {/* Layer 4: Highlight fiber lines — brightest fibers */}
      <DepthGroup layer="foreground">
        {[fibers[3], fibers[5]].map((f, i) => (
          <GlowLine
            key={`opt-hl-${i}`}
            d={f.d}
            gradientId={nextGradId()}
            colorStops={[
              { offset: "0%", color: deepBlue, opacity: 0.4 },
              { offset: "30%", color: color, opacity: 1 },
              { offset: "55%", color: warmWhite, opacity: 0.7 },
              { offset: "100%", color: warmWhite, opacity: 0.9 },
            ]}
            strokeWidth={1.1}
            opacity={0.95}
            glowLevel="medium"
            glowOpacity={0.13}
            glowStrokeWidth={5}
            direction={{ x1: "0%", y1: "100%", x2: "100%", y2: "0%" }}
          />
        ))}
      </DepthGroup>

      {/* Particles — faint dots along paths */}
      {particles.map((p, i) => (
        <circle
          key={`opt-p${i}`}
          cx={p.cx}
          cy={p.cy}
          r={p.r}
          fill={color}
          opacity={p.intensity * 0.25}
        />
      ))}

      {/* Layer 5: Key node glow */}
      {keyNodes.map((n, i) => (
        <GlowNode
          key={`opt-n${i}`}
          cx={n.cx}
          cy={n.cy}
          r={n.r}
          color={color}
          intensity={n.intensity}
          coreColor={warmWhite}
        />
      ))}

      {/* Layer 6: Noise overlay */}
      <NoiseOverlay opacity={0.022} />
    </svg>
  );
}

// =====================================================================
//  DEFENSE HERO — P1-H: Armor / radar defense system
// =====================================================================
