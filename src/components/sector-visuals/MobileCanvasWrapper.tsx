"use client";

/**
 * MobileCanvasWrapper — Lightweight Canvas wrapper for mobile pages.
 *
 * Uses getSectorCanvas() to resolve the right Canvas 2D component for a
 * given visualType, then renders it at reduced dimensions for mobile
 * performance. Respects the isCanvasVisualsEnabled feature flag.
 *
 * Usage:
 *   <MobileCanvasWrapper visualType="optical" width={160} height={120} />
 */

import { getSectorCanvas } from "./getSectorCanvas";
import { isCanvasVisualsEnabled } from "@/lib/feature-flags";

interface MobileCanvasWrapperProps {
  visualType: string;
  width: number;
  height: number;
  className?: string;
}

export default function MobileCanvasWrapper({
  visualType,
  width,
  height,
  className,
}: MobileCanvasWrapperProps) {
  if (!isCanvasVisualsEnabled()) return null;

  const CanvasComponent = getSectorCanvas(visualType);
  if (!CanvasComponent) return null;

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className ?? ""}`}
    >
      <CanvasComponent
        width={width}
        height={height}
        animationsEnabled={true}
        hovered={false}
      />
    </div>
  );
}
