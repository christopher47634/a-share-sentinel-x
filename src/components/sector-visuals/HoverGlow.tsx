"use client";

import { useRef, useEffect, useCallback } from "react";

interface HoverGlowProps {
  enabled: boolean;
  color: string;
  className?: string;
  radius?: number;
  opacity?: number;
}

const LERP_BASE = 0.06;
const LERP_VELOCITY = 0.12;
const FADE_IN_MS = 500;
const FADE_OUT_MS = 750;
const MAX_OPACITY = 0.16;
const VELOCITY_OPACITY_BOOST = 0.04;
const DEFAULT_RADIUS_DESKTOP = 170;
const DEFAULT_RADIUS_MOBILE = 110;
const VELOCITY_NORMALIZE = 0.08;

export default function HoverGlow({
  enabled,
  color,
  className = "",
  radius,
  opacity,
}: HoverGlowProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const mouseRef = useRef({ x: -999, y: -999 });
  const glowPosRef = useRef({ x: -999, y: -999 });
  const prevGlowPosRef = useRef({ x: -999, y: -999 });
  const velocityRef = useRef(0);
  const isHoveringRef = useRef(false);
  const opacityRef = useRef(0);
  const hoverStartTimeRef = useRef(0);
  const hoverLeaveTimeRef = useRef(0);
  const isTouchDevice = useRef(false);
  const effectiveRadiusRef = useRef(radius ?? DEFAULT_RADIUS_DESKTOP);

  useEffect(() => {
    isTouchDevice.current = !window.matchMedia("(hover: hover)").matches;
    if (!radius) {
      effectiveRadiusRef.current = isTouchDevice.current
        ? DEFAULT_RADIUS_MOBILE
        : DEFAULT_RADIUS_DESKTOP;
    }
  }, [radius]);

  const maxOpacity = opacity ?? MAX_OPACITY;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    // Store previous position for velocity calculation
    prevGlowPosRef.current.x = glowPosRef.current.x;
    prevGlowPosRef.current.y = glowPosRef.current.y;

    // Lerp glow position toward mouse
    const target = isHoveringRef.current
      ? mouseRef.current
      : glowPosRef.current;
    glowPosRef.current.x += (target.x - glowPosRef.current.x) * LERP_BASE;
    glowPosRef.current.y += (target.y - glowPosRef.current.y) * LERP_BASE;

    // Calculate frame velocity (pixels per frame)
    const dx = glowPosRef.current.x - prevGlowPosRef.current.x;
    const dy = glowPosRef.current.y - prevGlowPosRef.current.y;
    const frameVel = Math.sqrt(dx * dx + dy * dy);
    const targetVel = isHoveringRef.current ? frameVel : 0;
    velocityRef.current +=
      (targetVel - velocityRef.current) * LERP_VELOCITY;

    // Normalized velocity (0-1) and opacity boost
    const normVel = Math.min(velocityRef.current * VELOCITY_NORMALIZE, 1);
    const velBoost = normVel * VELOCITY_OPACITY_BOOST;

    // Fade opacity
    const now = performance.now();
    if (isHoveringRef.current) {
      opacityRef.current =
        Math.min(
          (now - hoverStartTimeRef.current) / FADE_IN_MS,
          1
        ) * maxOpacity;
    } else if (hoverLeaveTimeRef.current > 0) {
      opacityRef.current =
        Math.max(
          1 - (now - hoverLeaveTimeRef.current) / FADE_OUT_MS,
          0
        ) * maxOpacity;
    } else {
      opacityRef.current = 0;
    }

    const currentOpacity = Math.min(
      opacityRef.current + velBoost,
      maxOpacity + VELOCITY_OPACITY_BOOST
    );

    // Update CSS variables for card integration
    const normX = width > 0 ? glowPosRef.current.x / width : 0;
    const normY = height > 0 ? glowPosRef.current.y / height : 0;
    const glowIntensity =
      currentOpacity / (maxOpacity + VELOCITY_OPACITY_BOOST);
    container.style.setProperty("--glow-x", normX.toFixed(3));
    container.style.setProperty("--glow-y", normY.toFixed(3));
    container.style.setProperty(
      "--glow-intensity",
      glowIntensity.toFixed(3)
    );

    // Skip drawing if nothing visible
    if (
      currentOpacity < 0.001 ||
      isTouchDevice.current ||
      glowPosRef.current.x < -100
    ) {
      container.style.setProperty("--glow-scale", "1");
      rafRef.current = requestAnimationFrame(draw);
      return;
    }

    // Elliptical glow when moving fast
    const hasMovement = normVel > 0.04;
    let scaleX = 1;
    let scaleY = 1;
    let moveAngle = 0;

    if (hasMovement) {
      moveAngle = Math.atan2(dy, dx);
      scaleX = Math.min(1 + normVel * 0.3, 1.4);
      scaleY = Math.min(1 + normVel * 0.1, 1.2);
    }

    container.style.setProperty("--glow-scale", scaleX.toFixed(3));

    const { x, y } = glowPosRef.current;
    const r = effectiveRadiusRef.current;

    // Draw with optional elliptical transform
    ctx.save();
    if (hasMovement) {
      ctx.translate(x, y);
      ctx.rotate(moveAngle);
      ctx.scale(scaleX, scaleY);
      ctx.translate(-x, -y);
    }

    // Multi-stop soft gradient — no bright center spot
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
    const hexAlpha = (val: number) =>
      Math.round(val * 255)
        .toString(16)
        .padStart(2, "0");
    gradient.addColorStop(0, `${color}${hexAlpha(currentOpacity * 0.7)}`);
    gradient.addColorStop(0.3, `${color}${hexAlpha(currentOpacity * 0.5)}`);
    gradient.addColorStop(0.6, `${color}${hexAlpha(currentOpacity * 0.2)}`);
    gradient.addColorStop(1, `${color}00`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.restore();

    rafRef.current = requestAnimationFrame(draw);
  }, [color, maxOpacity]);

  useEffect(() => {
    if (!enabled || isTouchDevice.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = Math.round(rect.width);
      canvas.height = Math.round(rect.height);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    };

    resizeCanvas();
    const ro = new ResizeObserver(resizeCanvas);
    ro.observe(container);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const handleMouseEnter = (e: MouseEvent) => {
      isHoveringRef.current = true;
      hoverStartTimeRef.current = performance.now();
      hoverLeaveTimeRef.current = 0;
      // Initialize glow position to current mouse
      const rect = container.getBoundingClientRect();
      glowPosRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      prevGlowPosRef.current = { ...glowPosRef.current };
    };

    const handleMouseLeave = () => {
      isHoveringRef.current = false;
      hoverLeaveTimeRef.current = performance.now();
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseenter", handleMouseEnter);
    container.addEventListener("mouseleave", handleMouseLeave);

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      ro.disconnect();
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseenter", handleMouseEnter);
      container.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(rafRef.current);
    };
  }, [enabled, draw]);

  if (!enabled) return null;

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 z-[5] pointer-events-none overflow-hidden rounded-2xl ${className}`}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ mixBlendMode: "screen" }}
      />
    </div>
  );
}
