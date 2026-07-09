"use client";

/**
 * SectorHeroArtwork — P1-H: Unified SVG rendering system
 *
 * 5 reusable primitives: GlowLine, GlowNode, AmbientMesh, NoiseOverlay, DepthGroup
 * 6-layer structure: background gradient → ambient fog → background lines → main lines → highlight lines → node glow
 *
 * Line rules (desktop hero):
 *   Background lines: 0.45-0.75px
 *   Main structure:   0.8-1.2px
 *   Highlight lines:  0.6-1.0px
 *   Glow copies:      blur only, no solid >2px
 *
 * Gradient strokes on all main structure lines.
 * Left 35% text-safe zone: graphics opacity ≤ 0.04
 */

export type HeroVisualType =
  | "optical"
  | "compute"
  | "semiconductor"
  | "mining"
  | "new-energy"
  | "robotics"
  | "low-altitude"
  | "defense"
  | "medicine"
  | "baijiu";

interface SectorHeroArtworkProps {
  visualType: HeroVisualType;
  accentColor: string;
  className?: string;
}

// =====================================================================
//  HELPERS
// =====================================================================

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}

function rgba(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}

// =====================================================================
//  PRIMITIVE 1: GlowLine — gradient-stroked path with optional blur glow
// =====================================================================

interface GlowLineProps {
  d: string;
  gradientId: string;
  colorStops: { offset: string; color: string; opacity: number }[];
  strokeWidth: number;
  opacity: number;
  glowLevel?: "none" | "small" | "medium"; // small=stdDev 2, medium=stdDev 6
  glowOpacity?: number;
  glowStrokeWidth?: number;
  direction?: { x1: string; y1: string; x2: string; y2: string };
  strokeLinecap?: "butt" | "round" | "square";
}

function GlowLine({
  d,
  gradientId,
  colorStops,
  strokeWidth,
  opacity,
  glowLevel = "none",
  glowOpacity = 0.12,
  glowStrokeWidth,
  direction = { x1: "0%", y1: "0%", x2: "100%", y2: "0%" },
  strokeLinecap = "round",
}: GlowLineProps) {
  const stdDev = glowLevel === "small" ? 2 : glowLevel === "medium" ? 6 : 0;
  const glowW = glowStrokeWidth ?? strokeWidth * 3;

  return (
    <g>
      {/* Gradient definition */}
      <defs>
        <linearGradient
          id={gradientId}
          x1={direction.x1}
          y1={direction.y1}
          x2={direction.x2}
          y2={direction.y2}
        >
          {colorStops.map((s, i) => (
            <stop
              key={i}
              offset={s.offset}
              stopColor={s.color}
              stopOpacity={s.opacity}
            />
          ))}
        </linearGradient>
      </defs>

      {/* Glow copy (blur behind) */}
      {glowLevel !== "none" && (
        <path
          d={d}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={glowW}
          opacity={glowOpacity}
          strokeLinecap={strokeLinecap}
          filter={`url(#p1h-blur-${stdDev})`}
        />
      )}

      {/* Main stroke */}
      <path
        d={d}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={strokeWidth}
        opacity={opacity}
        strokeLinecap={strokeLinecap}
      />
    </g>
  );
}

// =====================================================================
//  PRIMITIVE 2: GlowNode — core bright point + outer blur halo
// =====================================================================

interface GlowNodeProps {
  cx: number;
  cy: number;
  r: number;
  color: string;
  intensity: number; // 0-1, controls opacity layers
  coreColor?: string; // optional brighter center color
}

function GlowNode({ cx, cy, r, color, intensity, coreColor }: GlowNodeProps) {
  const cc = coreColor ?? "#fff";
  return (
    <g>
      {/* Large bloom halo */}
      <circle
        cx={cx}
        cy={cy}
        r={r * 4}
        fill={color}
        opacity={intensity * 0.08}
      />
      {/* Medium glow */}
      <circle
        cx={cx}
        cy={cy}
        r={r * 2}
        fill={color}
        opacity={intensity * 0.18}
        filter="url(#p1h-blur-6)"
      />
      {/* Core bright */}
      <circle cx={cx} cy={cy} r={r} fill={color} opacity={intensity * 0.7} />
      {/* Hot center */}
      <circle
        cx={cx}
        cy={cy}
        r={r * 0.45}
        fill={cc}
        opacity={intensity * 0.4}
      />
    </g>
  );
}

// =====================================================================
//  PRIMITIVE 3: AmbientMesh — background atmospheric light fog
// =====================================================================

interface AmbientMeshProps {
  id: string;
  cx: string;
  cy: string;
  r: string;
  colors: { offset: string; color: string; opacity: number }[];
  type?: "radial" | "linear";
  linearDirection?: { x1: string; y1: string; x2: string; y2: string };
}

function AmbientMesh({
  id,
  cx,
  cy,
  r,
  colors,
  type = "radial",
  linearDirection,
}: AmbientMeshProps) {
  return (
    <g>
      <defs>
        {type === "radial" ? (
          <radialGradient id={id} cx={cx} cy={cy} r={r}>
            {colors.map((s, i) => (
              <stop
                key={i}
                offset={s.offset}
                stopColor={s.color}
                stopOpacity={s.opacity}
              />
            ))}
          </radialGradient>
        ) : (
          <linearGradient
            id={id}
            x1={linearDirection?.x1 ?? "0%"}
            y1={linearDirection?.y1 ?? "0%"}
            x2={linearDirection?.x2 ?? "100%"}
            y2={linearDirection?.y2 ?? "0%"}
          >
            {colors.map((s, i) => (
              <stop
                key={i}
                offset={s.offset}
                stopColor={s.color}
                stopOpacity={s.opacity}
              />
            ))}
          </linearGradient>
        )}
      </defs>
      <rect x="0" y="0" width="900" height="400" fill={`url(#${id})`} />
    </g>
  );
}

// =====================================================================
//  PRIMITIVE 4: NoiseOverlay — feTurbulence grain texture
// =====================================================================

function NoiseOverlay({ opacity = 0.025 }: { opacity?: number }) {
  return (
    <g>
      <defs>
        <filter id="p1h-noise" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves="3"
            stitchTiles="stitch"
            result="noise"
          />
          <feColorMatrix
            type="saturate"
            values="0"
            in="noise"
            result="grayNoise"
          />
        </filter>
      </defs>
      <rect
        x="0"
        y="0"
        width="900"
        height="400"
        filter="url(#p1h-noise)"
        opacity={opacity}
      />
    </g>
  );
}

// =====================================================================
//  PRIMITIVE 5: DepthGroup — layer-based opacity/blur control
// =====================================================================

type DepthLayer = "background" | "midground" | "foreground";

interface DepthGroupProps {
  layer: DepthLayer;
  children: React.ReactNode;
}

const DEPTH_CONFIG: Record<
  DepthLayer,
  { opacity: number; blur: number; strokeWidthMul: number }
> = {
  background: { opacity: 0.08, blur: 0, strokeWidthMul: 0.6 },
  midground: { opacity: 0.24, blur: 0, strokeWidthMul: 1.0 },
  foreground: { opacity: 0.5, blur: 0, strokeWidthMul: 1.0 },
};

function DepthGroup({ layer, children }: DepthGroupProps) {
  const cfg = DEPTH_CONFIG[layer];
  return (
    <g
      opacity={cfg.opacity}
      style={
        cfg.blur > 0
          ? { filter: `blur(${cfg.blur}px)` }
          : undefined
      }
    >
      {children}
    </g>
  );
}

// =====================================================================
//  SHARED SVG FILTER DEFS (referenced by primitives)
// =====================================================================

function SharedFilterDefs() {
  return (
    <defs>
      <filter
        id="p1h-blur-2"
        x="-80%"
        y="-80%"
        width="260%"
        height="260%"
      >
        <feGaussianBlur stdDeviation="2" />
      </filter>
      <filter
        id="p1h-blur-6"
        x="-80%"
        y="-80%"
        width="260%"
        height="260%"
      >
        <feGaussianBlur stdDeviation="6" />
      </filter>
      <filter
        id="p1h-blur-10"
        x="-100%"
        y="-100%"
        width="300%"
        height="300%"
      >
        <feGaussianBlur stdDeviation="10" />
      </filter>
      <filter
        id="p1h-blur-18"
        x="-100%"
        y="-100%"
        width="300%"
        height="300%"
      >
        <feGaussianBlur stdDeviation="18" />
      </filter>
      {/* Small glow — for nodes */}
      <filter
        id="p1h-glow-sm"
        x="-50%"
        y="-50%"
        width="200%"
        height="200%"
      >
        <feGaussianBlur stdDeviation="2" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      {/* Medium glow */}
      <filter
        id="p1h-glow-md"
        x="-80%"
        y="-80%"
        width="260%"
        height="260%"
      >
        <feGaussianBlur stdDeviation="5" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      {/* Large bloom */}
      <filter
        id="p1h-glow-lg"
        x="-100%"
        y="-100%"
        width="300%"
        height="300%"
      >
        <feGaussianBlur stdDeviation="16" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  );
}

// =====================================================================
//  OPTICAL HERO — P1-H: Fiber-optic communication bundle
// =====================================================================

function OpticalHero({ color }: { color: string }) {
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

function DefenseHero({ color }: { color: string }) {
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

function MedicineHero({ color }: { color: string }) {
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

function LegacySvgDefs({ id }: { color: string; id: string }) {
  return (
    <defs>
      <filter id={`${id}-glow`} x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter
        id={`${id}-glow-strong`}
        x="-100%"
        y="-100%"
        width="300%"
        height="300%"
      >
        <feGaussianBlur stdDeviation="6" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  );
}

/**
 * 算力 compute
 */
function ComputeHero({ color }: { color: string }) {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 900 400"
      preserveAspectRatio="xMidYMid slice"
    >
      <LegacySvgDefs color={color} id="compute" />

      <rect
        x="520"
        y="100"
        width="200"
        height="200"
        rx="8"
        fill="none"
        stroke={color}
        strokeWidth="2.0"
        opacity="0.20"
      />
      <rect
        x="550"
        y="130"
        width="140"
        height="140"
        rx="4"
        fill={color}
        opacity="0.04"
      />
      <rect
        x="550"
        y="130"
        width="140"
        height="140"
        rx="4"
        fill="none"
        stroke={color}
        strokeWidth="1.2"
        opacity="0.15"
      />
      <rect
        x="590"
        y="170"
        width="60"
        height="60"
        rx="2"
        fill={color}
        opacity="0.06"
      />
      <rect
        x="590"
        y="170"
        width="60"
        height="60"
        rx="2"
        fill="none"
        stroke={color}
        strokeWidth="0.8"
        opacity="0.20"
      />

      {[550, 580, 610, 640, 670].map((x) => (
        <g key={`t${x}`}>
          <line x1={x} y1="100" x2={x} y2="72" stroke={color} strokeWidth="1.2" opacity="0.14" />
          <circle cx={x} cy="68" r="2" fill={color} opacity="0.20" />
        </g>
      ))}
      {[550, 580, 610, 640, 670].map((x) => (
        <g key={`b${x}`}>
          <line x1={x} y1="300" x2={x} y2="328" stroke={color} strokeWidth="1.2" opacity="0.14" />
          <circle cx={x} cy="332" r="2" fill={color} opacity="0.20" />
        </g>
      ))}
      {[150, 180, 210, 240, 270].map((y) => (
        <g key={`l${y}`}>
          <line x1="520" y1={y} x2="492" y2={y} stroke={color} strokeWidth="1.2" opacity="0.14" />
          <circle cx="488" cy={y} r="2" fill={color} opacity="0.20" />
        </g>
      ))}
      {[150, 180, 210, 240, 270].map((y) => (
        <g key={`r${y}`}>
          <line x1="720" y1={y} x2="748" y2={y} stroke={color} strokeWidth="1.2" opacity="0.14" />
          <circle cx="752" cy={y} r="2" fill={color} opacity="0.20" />
        </g>
      ))}

      <polyline points="752,150 790,150 790,90 850,90" fill="none" stroke={color} strokeWidth="1.0" opacity="0.12" />
      <polyline points="752,210 800,210 800,280 860,280" fill="none" stroke={color} strokeWidth="1.0" opacity="0.12" />
      <polyline points="752,240 780,240 780,320 840,320" fill="none" stroke={color} strokeWidth="0.8" opacity="0.10" />
      <polyline points="752,180 810,180 810,140 870,140" fill="none" stroke={color} strokeWidth="0.8" opacity="0.10" />
      <polyline points="488,180 450,180 450,120 400,120" fill="none" stroke={color} strokeWidth="0.8" opacity="0.06" />

      <circle cx="850" cy="90" r="2.5" fill={color} opacity="0.25" />
      <circle cx="860" cy="280" r="2" fill={color} opacity="0.20" />
      <circle cx="870" cy="140" r="2" fill={color} opacity="0.20" />
      <circle cx="840" cy="320" r="1.5" fill={color} opacity="0.18" />

      <circle cx="620" cy="200" r="30" fill={color} opacity="0.04" />
      <circle cx="620" cy="200" r="12" fill={color} opacity="0.12" filter="url(#compute-glow)" />
    </svg>
  );
}

/**
 * 半导体 semiconductor
 */
function SemiconductorHero({ color }: { color: string }) {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 900 400"
      preserveAspectRatio="xMidYMid slice"
    >
      <LegacySvgDefs color={color} id="semi" />

      <circle cx="650" cy="200" r="170" fill="none" stroke={color} strokeWidth="1.8" opacity="0.18" />
      <path d="M 635 370 L 650 358 L 665 370" fill="none" stroke={color} strokeWidth="1.5" opacity="0.18" />

      <circle cx="650" cy="200" r="145" fill="none" stroke={color} strokeWidth="1.0" opacity="0.14" />
      <circle cx="650" cy="200" r="120" fill="none" stroke={color} strokeWidth="0.8" opacity="0.12" />
      <circle cx="650" cy="200" r="95" fill="none" stroke={color} strokeWidth="0.6" opacity="0.10" />
      <circle cx="650" cy="200" r="70" fill="none" stroke={color} strokeWidth="0.5" opacity="0.08" />
      <circle cx="650" cy="200" r="45" fill="none" stroke={color} strokeWidth="0.4" opacity="0.06" />

      {[530, 570, 610, 650, 690, 730, 770].map((x) => (
        <line key={`v${x}`} x1={x} y1="35" x2={x} y2="365" stroke={color} strokeWidth="0.3" opacity="0.06" />
      ))}
      {[80, 120, 160, 200, 240, 280, 320].map((y) => (
        <line key={`h${y}`} x1="485" y1={y} x2="815" y2={y} stroke={color} strokeWidth="0.3" opacity="0.06" />
      ))}

      <rect x="610" y="160" width="40" height="40" fill={color} opacity="0.06" />
      <rect x="650" y="200" width="40" height="40" fill={color} opacity="0.05" />
      <rect x="570" y="120" width="40" height="40" fill={color} opacity="0.04" />
      <rect x="690" y="240" width="40" height="40" fill={color} opacity="0.04" />

      <circle cx="650" cy="200" r="30" fill={color} opacity="0.08" filter="url(#semi-glow)" />
    </svg>
  );
}

/**
 * 新能源 new-energy
 */
function NewEnergyHero({ color }: { color: string }) {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 900 400"
      preserveAspectRatio="xMidYMid slice"
    >
      <LegacySvgDefs color={color} id="ne" />

      <rect x="520" y="80" width="260" height="240" rx="10" fill="none" stroke={color} strokeWidth="1.8" opacity="0.16" />

      {[0, 1, 2, 3].map((col) =>
        [0, 1, 2, 3, 4].map((row) => (
          <g key={`cell-${col}-${row}`}>
            <rect
              x={540 + col * 58}
              y={100 + row * 42}
              width="48"
              height="34"
              rx="3"
              fill={color}
              opacity="0.03"
            />
            <rect
              x={540 + col * 58}
              y={100 + row * 42}
              width="48"
              height="34"
              rx="3"
              fill="none"
              stroke={color}
              strokeWidth="0.8"
              opacity="0.12"
            />
            <rect
              x={556 + col * 58}
              y={94 + row * 42}
              width="16"
              height="6"
              rx="1.5"
              fill={color}
              opacity="0.10"
            />
          </g>
        ))
      )}

      <line x1="520" y1="200" x2="780" y2="200" stroke={color} strokeWidth="2.0" opacity="0.08" strokeDasharray="8 12" />
      <line x1="530" y1="200" x2="770" y2="200" stroke={color} strokeWidth="1.0" opacity="0.18" strokeDasharray="4 16" />

      <path d="M 740 175 L 750 190 L 744 190 L 754 210 L 738 192 L 744 192 Z" fill={color} opacity="0.25" filter="url(#ne-glow)" />

      <line x1="520" y1="110" x2="530" y2="110" stroke={color} strokeWidth="2.5" opacity="0.18" />
      <line x1="520" y1="290" x2="530" y2="290" stroke={color} strokeWidth="2.5" opacity="0.18" />
    </svg>
  );
}

/**
 * 机器人 robotics
 */
function RoboticsHero({ color }: { color: string }) {
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

/**
 * 低空经济 low-altitude
 */
function LowAltitudeHero({ color }: { color: string }) {
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

/**
 * 白酒 baijiu
 */
function BaijiuHero({ color }: { color: string }) {
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

/**
 * 矿山 mining
 */
function MiningHero({ color }: { color: string }) {
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

function getHeroSVG(visualType: HeroVisualType, color: string) {
  switch (visualType) {
    case "optical":
      return <OpticalHero color={color} />;
    case "compute":
      return <ComputeHero color={color} />;
    case "semiconductor":
      return <SemiconductorHero color={color} />;
    case "mining":
      return <MiningHero color={color} />;
    case "new-energy":
      return <NewEnergyHero color={color} />;
    case "robotics":
      return <RoboticsHero color={color} />;
    case "low-altitude":
      return <LowAltitudeHero color={color} />;
    case "defense":
      return <DefenseHero color={color} />;
    case "medicine":
      return <MedicineHero color={color} />;
    case "baijiu":
      return <BaijiuHero color={color} />;
    default:
      return null;
  }
}

// =====================================================================
//  MAIN COMPONENT
// =====================================================================

export default function SectorHeroArtwork({
  visualType,
  accentColor,
  className = "",
}: SectorHeroArtworkProps) {
  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
    >
      {/* Layer 1: Industry main visual SVG */}
      {getHeroSVG(visualType, accentColor)}

      {/* Layer 2: Left gradient overlay — ensures text area is clean */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(2,6,18,0.92) 0%, rgba(2,6,18,0.72) 35%, rgba(2,6,18,0.25) 60%, transparent 100%)",
        }}
      />

      {/* Layer 3: Subtle accent glow from left for warmth */}
      <div
        className="absolute left-0 top-0 w-[40%] h-full"
        style={{
          background: `radial-gradient(ellipse at 15% 50%, ${rgba(accentColor, 0.03)}, transparent 70%)`,
        }}
      />
    </div>
  );
}
