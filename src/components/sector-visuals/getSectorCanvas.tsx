"use client";

/**
 * Maps a visualType string (from Sector.visualType) to the corresponding
 * Canvas 2D component. All 10 sector Canvas visuals are lazy-loaded via
 * next/dynamic (ssr: false).
 *
 * Returns `null` for unknown visualType.
 */

import dynamic from "next/dynamic";

const OpticalCanvas = dynamic(
  () => import("@/components/sector-visuals/canvas/OpticalCanvas"),
  { ssr: false }
);
const ComputeCanvas = dynamic(
  () => import("@/components/sector-visuals/canvas/ComputeCanvas"),
  { ssr: false }
);
const SemiconductorCanvas = dynamic(
  () => import("@/components/sector-visuals/canvas/SemiconductorCanvas"),
  { ssr: false }
);
const NewEnergyCanvas = dynamic(
  () => import("@/components/sector-visuals/canvas/NewEnergyCanvas"),
  { ssr: false }
);
const RoboticsCanvas = dynamic(
  () => import("@/components/sector-visuals/canvas/RoboticsCanvas"),
  { ssr: false }
);
const LowAltitudeCanvas = dynamic(
  () => import("@/components/sector-visuals/canvas/LowAltitudeCanvas"),
  { ssr: false }
);
const BaijiuCanvas = dynamic(
  () => import("@/components/sector-visuals/canvas/BaijiuCanvas"),
  { ssr: false }
);
const MiningCanvas = dynamic(
  () => import("@/components/sector-visuals/canvas/MiningCanvas"),
  { ssr: false }
);
const DefenseCanvas = dynamic(
  () => import("@/components/sector-visuals/canvas/DefenseCanvas"),
  { ssr: false }
);
const PharmaCanvas = dynamic(
  () => import("@/components/sector-visuals/canvas/PharmaCanvas"),
  { ssr: false }
);

export interface CanvasComponentProps {
  width: number;
  height: number;
  animationsEnabled?: boolean;
  hovered?: boolean;
  hoverIntensity?: number;
}

/**
 * visualType → Canvas component mapping.
 * Keys match Sector.visualType values from mock/sectors.ts.
 */
const canvasMap: Record<
  string,
  React.ComponentType<CanvasComponentProps>
> = {
  optical: OpticalCanvas,
  compute: ComputeCanvas,
  semiconductor: SemiconductorCanvas,
  "new-energy": NewEnergyCanvas,
  robotics: RoboticsCanvas,
  "low-altitude": LowAltitudeCanvas,
  baijiu: BaijiuCanvas,
  mining: MiningCanvas,
  defense: DefenseCanvas,
  medicine: PharmaCanvas,
};

/**
 * Returns the Canvas component for the given visualType, or null if unknown.
 */
export function getSectorCanvas(
  visualType: string
): React.ComponentType<CanvasComponentProps> | null {
  return canvasMap[visualType] ?? null;
}
