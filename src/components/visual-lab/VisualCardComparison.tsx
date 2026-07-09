"use client";

import { useRef, useState, useEffect } from "react";
import type { Sector } from "@/mock/sectors";
import OpticalCssVisual from "@/components/sector-visuals/css/OpticalCssVisual";
import ComputeCssVisual from "@/components/sector-visuals/css/ComputeCssVisual";
import SemiconductorCssVisual from "@/components/sector-visuals/css/SemiconductorCssVisual";
import OpticalCanvas from "@/components/sector-visuals/canvas/OpticalCanvas";
import ComputeCanvas from "@/components/sector-visuals/canvas/ComputeCanvas";
import SemiconductorCanvas from "@/components/sector-visuals/canvas/SemiconductorCanvas";
import NewEnergyCanvas from "@/components/sector-visuals/canvas/NewEnergyCanvas";
import RoboticsCanvas from "@/components/sector-visuals/canvas/RoboticsCanvas";
import LowAltitudeCanvas from "@/components/sector-visuals/canvas/LowAltitudeCanvas";
import BaijiuCanvas from "@/components/sector-visuals/canvas/BaijiuCanvas";
import MiningCanvas from "@/components/sector-visuals/canvas/MiningCanvas";
import DefenseCanvas from "@/components/sector-visuals/canvas/DefenseCanvas";
import PharmaCanvas from "@/components/sector-visuals/canvas/PharmaCanvas";

interface VisualCardComparisonProps {
  sector: Sector;
  mode: "css" | "canvas";
  animationsEnabled: boolean;
}

/**
 * Wrapper that measures its own size via ResizeObserver
 * and provides it to Canvas children.
 */
function CanvasVisualWrapper({
  children,
  onHoverChange,
}: {
  children: (width: number, height: number) => React.ReactNode;
  onHoverChange?: (hovered: boolean) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const { width, height } = entry.contentRect;
        setSize((prev) => {
          if (prev.width === Math.floor(width) && prev.height === Math.floor(height)) return prev;
          return { width: Math.floor(width), height: Math.floor(height) };
        });
      }
    });

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0"
      onMouseEnter={() => onHoverChange?.(true)}
      onMouseLeave={() => onHoverChange?.(false)}
    >
      {size.width > 0 && size.height > 0 && children(size.width, size.height)}
    </div>
  );
}

/**
 * Fallback CSS gradient for sectors that don't have a dedicated CSS visual.
 */
function FallbackGradientVisual({
  accentColor,
  animationsEnabled,
}: {
  accentColor: string;
  animationsEnabled: boolean;
}) {
  return (
    <div
      className="absolute inset-0"
      style={{
        background: `radial-gradient(ellipse at 70% 50%, ${accentColor}18 0%, ${accentColor}08 40%, transparent 70%)`,
        animation: animationsEnabled ? "pulse 6s ease-in-out infinite" : "none",
      }}
    />
  );
}

export default function VisualCardComparison({
  sector,
  mode,
  animationsEnabled,
}: VisualCardComparisonProps) {
  const [hovered, setHovered] = useState(false);

  if (mode === "canvas") {
    return (
      <CanvasVisualWrapper onHoverChange={setHovered}>
        {(width, height) => {
          const props = { width, height, animationsEnabled, hovered };
          switch (sector.visualType) {
            case "optical":
              return <OpticalCanvas {...props} />;
            case "compute":
              return <ComputeCanvas {...props} />;
            case "semiconductor":
              return <SemiconductorCanvas {...props} />;
            case "new-energy":
              return <NewEnergyCanvas {...props} />;
            case "robotics":
              return <RoboticsCanvas {...props} />;
            case "low-altitude":
              return <LowAltitudeCanvas {...props} />;
            case "baijiu":
              return <BaijiuCanvas {...props} />;
            case "mining":
              return <MiningCanvas {...props} />;
            case "defense":
              return <DefenseCanvas {...props} />;
            case "medicine":
              return <PharmaCanvas {...props} />;
            default:
              return (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-xs text-[var(--text-muted)] font-mono opacity-40">
                    Canvas — 无此视觉类型
                  </span>
                </div>
              );
          }
        }}
      </CanvasVisualWrapper>
    );
  }

  // CSS mode — 3 sectors have dedicated CSS visuals, others get a fallback gradient
  switch (sector.visualType) {
    case "optical":
      return (
        <OpticalCssVisual
          accentColor={sector.accentColor}
          animationsEnabled={animationsEnabled}
        />
      );
    case "compute":
      return (
        <ComputeCssVisual
          accentColor={sector.accentColor}
          animationsEnabled={animationsEnabled}
        />
      );
    case "semiconductor":
      return (
        <SemiconductorCssVisual
          accentColor={sector.accentColor}
          animationsEnabled={animationsEnabled}
        />
      );
    default:
      return (
        <FallbackGradientVisual
          accentColor={sector.accentColor}
          animationsEnabled={animationsEnabled}
        />
      );
  }
}
