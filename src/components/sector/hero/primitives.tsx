"use client";

// 板块 Hero 美术共用的 SVG 基元：发光线、发光节点、氛围网格、噪点、景深分组和共享滤镜。




// =====================================================================
//  HELPERS
// =====================================================================

export interface GlowLineProps {
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

export function GlowLine({
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

export interface GlowNodeProps {
  cx: number;
  cy: number;
  r: number;
  color: string;
  intensity: number; // 0-1, controls opacity layers
  coreColor?: string; // optional brighter center color
}

export function GlowNode({ cx, cy, r, color, intensity, coreColor }: GlowNodeProps) {
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

export interface AmbientMeshProps {
  id: string;
  cx: string;
  cy: string;
  r: string;
  colors: { offset: string; color: string; opacity: number }[];
  type?: "radial" | "linear";
  linearDirection?: { x1: string; y1: string; x2: string; y2: string };
}

export function AmbientMesh({
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

export function NoiseOverlay({ opacity = 0.025 }: { opacity?: number }) {
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

export type DepthLayer = "background" | "midground" | "foreground";

export interface DepthGroupProps {
  layer: DepthLayer;
  children: React.ReactNode;
}

export const DEPTH_CONFIG: Record<
  DepthLayer,
  { opacity: number; blur: number; strokeWidthMul: number }
> = {
  background: { opacity: 0.08, blur: 0, strokeWidthMul: 0.6 },
  midground: { opacity: 0.24, blur: 0, strokeWidthMul: 1.0 },
  foreground: { opacity: 0.5, blur: 0, strokeWidthMul: 1.0 },
};

export function DepthGroup({ layer, children }: DepthGroupProps) {
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

export function SharedFilterDefs() {
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

export function LegacySvgDefs({ id }: { color: string; id: string }) {
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
