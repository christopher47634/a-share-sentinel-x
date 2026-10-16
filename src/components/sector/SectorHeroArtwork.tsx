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

import { rgba } from "./svg-color";
import { OpticalHero } from "./hero/OpticalHero";
import { DefenseHero } from "./hero/DefenseHero";
import { MedicineHero } from "./hero/MedicineHero";
import { ComputeHero } from "./hero/ComputeHero";
import { SemiconductorHero } from "./hero/SemiconductorHero";
import { NewEnergyHero } from "./hero/NewEnergyHero";
import { RoboticsHero } from "./hero/RoboticsHero";
import { LowAltitudeHero } from "./hero/LowAltitudeHero";
import { BaijiuHero } from "./hero/BaijiuHero";
import { MiningHero } from "./hero/MiningHero";

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
