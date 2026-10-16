"use client";

/**
 * SectorVisualBackground — P1H-cardfix-2: Large recognizable industry watermark graphics
 *
 * Each sector has a DOMINANT industry silhouette (45-70% of card area) that is
 * recognizable without reading any text. Scale 1.4-2.2x, stroke 1.5-2.5px.
 *
 * Three-layer structure per card:
 *   Layer 1: Large industry watermark SVG (full card, low opacity)
 *   Layer 2: Ambient glow (very faint)
 *   Layer 3: Left-side dark overlay (handled by parent HotSectorGrid)
 */

import { rgba } from "./svg-color";
import { OpticalSVG } from "./watermark/OpticalSVG";
import { ComputeSVG } from "./watermark/ComputeSVG";
import { SemiconductorSVG } from "./watermark/SemiconductorSVG";
import { MiningSVG } from "./watermark/MiningSVG";
import { NewEnergySVG } from "./watermark/NewEnergySVG";
import { RoboticsSVG } from "./watermark/RoboticsSVG";
import { LowAltitudeSVG } from "./watermark/LowAltitudeSVG";
import { DefenseSVG } from "./watermark/DefenseSVG";
import { MedicineSVG } from "./watermark/MedicineSVG";
import { BaijiuSVG } from "./watermark/BaijiuSVG";

export type SectorVisualType =
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

interface SectorVisualBackgroundProps {
  visualType: SectorVisualType;
  accentColor: string;
  intensity?: "subtle" | "medium" | "strong";
  className?: string;
}

// ---- helpers ----

/**
 * P1H-cardfix-2 intensity mapping:
 *   subtle  → card grid watermark opacity 0.26-0.30
 *   medium  → detail hero watermark opacity 0.30-0.34
 *   strong  → hero hover/featured 0.34-0.40
 */
function watermarkOpacity(intensity: "subtle" | "medium" | "strong"): number {
  switch (intensity) {
    case "strong":
      return 0.36;
    case "medium":
      return 0.30;
    case "subtle":
    default:
      return 0.28;
  }
}

function ambientOpacity(intensity: "subtle" | "medium" | "strong"): number {
  switch (intensity) {
    case "strong":
      return 0.14;
    case "medium":
      return 0.12;
    case "subtle":
    default:
      return 0.10;
  }
}

// ---- Per-sector SVG Watermarks (FULL CARD coverage, large recognizable silhouettes) ----

function getWatermarkSVG(
  visualType: SectorVisualType,
  color: string,
  opacity: number
) {
  switch (visualType) {
    case "optical":
      return <OpticalSVG color={color} opacity={opacity} />;
    case "compute":
      return <ComputeSVG color={color} opacity={opacity} />;
    case "semiconductor":
      return <SemiconductorSVG color={color} opacity={opacity} />;
    case "mining":
      return <MiningSVG color={color} opacity={opacity} />;
    case "new-energy":
      return <NewEnergySVG color={color} opacity={opacity} />;
    case "robotics":
      return <RoboticsSVG color={color} opacity={opacity} />;
    case "low-altitude":
      return <LowAltitudeSVG color={color} opacity={opacity} />;
    case "defense":
      return <DefenseSVG color={color} opacity={opacity} />;
    case "medicine":
      return <MedicineSVG color={color} opacity={opacity} />;
    case "baijiu":
      return <BaijiuSVG color={color} opacity={opacity} />;
    default:
      return null;
  }
}

// ---- main component ----

export default function SectorVisualBackground({
  visualType,
  accentColor,
  intensity = "subtle",
  className = "",
}: SectorVisualBackgroundProps) {
  const wmOpacity = watermarkOpacity(intensity);
  const ambOp = ambientOpacity(intensity);

  return (
    <>
      {/* Layer 1: Full-card industry watermark SVG */}
      {getWatermarkSVG(visualType, accentColor, wmOpacity)}

      {/* Layer 2: Subtle ambient glow from accent color */}
      <div
        className={`absolute inset-0 pointer-events-none ${className}`}
        style={{
          background: `radial-gradient(ellipse at 70% 50%, ${rgba(accentColor, ambOp)}, transparent 65%)`,
        }}
      />
    </>
  );
}
