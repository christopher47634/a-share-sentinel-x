"use client";

import { useRef, useEffect, useCallback } from "react";

interface DefenseCanvasProps {
  width: number;
  height: number;
  animationsEnabled?: boolean;
  hovered?: boolean;
  hoverIntensity?: number;
}

/**
 * Canvas 2D visual for 军工 (Defense)
 * - Radar arcs: 2-3 concentric arcs from center
 * - Radar sweep: slow rotating line (14-20s)
 * - Crosshair: faint + and × lines through center
 * - Coordinate ticks: small marks along crosshair lines
 * - Shield outline: very faint shield/chevron shape (opacity 0.04-0.08)
 * - Hover: lock-on rectangle appears at center, radar brightens
 * - Colors: slate #475569 + steel blue #4682b4
 * - Feel: military precision, radar tracking
 */
export default function DefenseCanvas({
  width,
  height,
  animationsEnabled = true,
  hovered = false,
  hoverIntensity = 0,
}: DefenseCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const isVisibleRef = useRef(true);
  const timeRef = useRef(0);
  const hoveredRef = useRef(false);
  const animEnabledRef = useRef(animationsEnabled);
  const hoverIntensityRef = useRef(0);

  useEffect(() => {
    hoveredRef.current = hovered;
  }, [hovered]);

  useEffect(() => {
    animEnabledRef.current = animationsEnabled;
  }, [animationsEnabled]);

  useEffect(() => {
    hoverIntensityRef.current = hoverIntensity ?? 0;
  }, [hoverIntensity]);

  const draw = useCallback(
    (w: number, h: number, t: number, isHover: boolean, animOn: boolean) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      try {
        ctx.clearRect(0, 0, w, h);

        const slate = "#475569";
        const steelBlue = "#4682b4";
        const glowMul = isHover ? 1.2 : 1;
        const cx = w * 0.5;
        const cy = h * 0.5;

        // --- Crosshair lines (+ shape) ---
        ctx.globalAlpha = 0.08 * glowMul;
        ctx.strokeStyle = slate;
        ctx.lineWidth = 0.5;

        // Horizontal
        ctx.beginPath();
        ctx.moveTo(w * 0.05, cy);
        ctx.lineTo(w * 0.95, cy);
        ctx.stroke();

        // Vertical
        ctx.beginPath();
        ctx.moveTo(cx, h * 0.05);
        ctx.lineTo(cx, h * 0.95);
        ctx.stroke();

        // Diagonal cross (× shape)
        ctx.globalAlpha = 0.05 * glowMul;
        ctx.beginPath();
        ctx.moveTo(w * 0.15, h * 0.15);
        ctx.lineTo(w * 0.85, h * 0.85);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(w * 0.85, h * 0.15);
        ctx.lineTo(w * 0.15, h * 0.85);
        ctx.stroke();

        // --- Coordinate ticks along crosshair ---
        ctx.globalAlpha = 0.06 * glowMul;
        ctx.strokeStyle = slate;
        ctx.lineWidth = 0.5;
        const tickLen = 4;

        // Horizontal ticks
        for (let i = 1; i <= 8; i++) {
          const tx = w * 0.05 + (w * 0.9 * i) / 9;
          ctx.beginPath();
          ctx.moveTo(tx, cy - tickLen);
          ctx.lineTo(tx, cy + tickLen);
          ctx.stroke();
        }

        // Vertical ticks
        for (let i = 1; i <= 8; i++) {
          const ty = h * 0.05 + (h * 0.9 * i) / 9;
          ctx.beginPath();
          ctx.moveTo(cx - tickLen, ty);
          ctx.lineTo(cx + tickLen, ty);
          ctx.stroke();
        }

        // --- Radar concentric arcs ---
        const radarRadii = [Math.min(w, h) * 0.15, Math.min(w, h) * 0.28, Math.min(w, h) * 0.42];
        radarRadii.forEach((r, i) => {
          ctx.globalAlpha = (0.14 - i * 0.03) * glowMul;
          ctx.strokeStyle = steelBlue;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.stroke();
        });

        // --- Radar sweep ---
        if (animOn) {
          const sweepAngle = ((t * (2 * Math.PI)) / 17) % (Math.PI * 2);
          const sweepLen = Math.min(w, h) * 0.45;

          // Sweep line
          ctx.globalAlpha = (0.12 + hoverIntensityRef.current * 0.04) * glowMul;
          ctx.strokeStyle = steelBlue;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(
            cx + Math.cos(sweepAngle) * sweepLen,
            cy + Math.sin(sweepAngle) * sweepLen
          );
          ctx.stroke();

          // Sweep trail (faint arc behind sweep)
          ctx.globalAlpha = 0.04 * glowMul;
          ctx.strokeStyle = steelBlue;
          ctx.lineWidth = sweepLen;
          ctx.beginPath();
          ctx.arc(cx, cy, sweepLen * 0.5, sweepAngle - 0.3, sweepAngle);
          ctx.stroke();
        }

        // --- Shield outline (faint chevron) ---
        const shieldW = w * 0.25;
        const shieldH = h * 0.30;
        const shieldX = cx - shieldW / 2;
        const shieldY = cy - shieldH * 0.4;

        ctx.globalAlpha = 0.06 * glowMul;
        ctx.strokeStyle = slate;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(shieldX, shieldY);
        ctx.lineTo(shieldX + shieldW, shieldY);
        ctx.lineTo(shieldX + shieldW, shieldY + shieldH * 0.6);
        ctx.lineTo(cx, shieldY + shieldH);
        ctx.lineTo(shieldX, shieldY + shieldH * 0.6);
        ctx.closePath();
        ctx.stroke();

        // --- Lock-on rectangle on hover ---
        if (isHover) {
          const lockW = w * 0.18;
          const lockH = h * 0.14;
          const lockX = cx - lockW / 2;
          const lockY = cy - lockH / 2;
          const cornerLen = Math.min(lockW, lockH) * 0.25;

          ctx.globalAlpha = 0.18;
          ctx.strokeStyle = steelBlue;
          ctx.lineWidth = 0.8;

          // Top-left corner
          ctx.beginPath();
          ctx.moveTo(lockX, lockY + cornerLen);
          ctx.lineTo(lockX, lockY);
          ctx.lineTo(lockX + cornerLen, lockY);
          ctx.stroke();

          // Top-right corner
          ctx.beginPath();
          ctx.moveTo(lockX + lockW - cornerLen, lockY);
          ctx.lineTo(lockX + lockW, lockY);
          ctx.lineTo(lockX + lockW, lockY + cornerLen);
          ctx.stroke();

          // Bottom-right corner
          ctx.beginPath();
          ctx.moveTo(lockX + lockW, lockY + lockH - cornerLen);
          ctx.lineTo(lockX + lockW, lockY + lockH);
          ctx.lineTo(lockX + lockW - cornerLen, lockY + lockH);
          ctx.stroke();

          // Bottom-left corner
          ctx.beginPath();
          ctx.moveTo(lockX + cornerLen, lockY + lockH);
          ctx.lineTo(lockX, lockY + lockH);
          ctx.lineTo(lockX, lockY + lockH - cornerLen);
          ctx.stroke();
        }

        ctx.globalAlpha = 1;
      } catch {
        // Graceful fallback
      }
    },
    []
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || width <= 0 || height <= 0) return;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const reducedMotion = mq.matches;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");
    if (ctx) ctx.scale(dpr, dpr);

    if (reducedMotion || !animationsEnabled) {
      draw(width, height, 0, false, false);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        isVisibleRef.current = entries[0]?.isIntersecting ?? false;
      },
      { threshold: 0.01 }
    );
    observer.observe(canvas);

    let lastTimestamp = 0;
    const animate = (timestamp: number) => {
      if (!lastTimestamp) lastTimestamp = timestamp;
      const delta = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;

      if (isVisibleRef.current) {
        timeRef.current += delta;
        draw(
          width,
          height,
          timeRef.current,
          hoveredRef.current,
          animEnabledRef.current
        );
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      observer.disconnect();
    };
  }, [width, height, animationsEnabled, draw]);

  return (
    <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
  );
}
