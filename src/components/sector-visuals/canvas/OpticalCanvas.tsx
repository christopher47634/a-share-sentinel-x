"use client";

import { useRef, useEffect, useCallback } from "react";

interface OpticalCanvasProps {
  width: number;
  height: number;
  animationsEnabled?: boolean;
  hovered?: boolean;
  hoverIntensity?: number;
}

/**
 * Canvas 2D visual for 光通信 (Optical Communication) — REFINED
 * - 2-3 main fiber lines, 1px, gold #c9a84c, opacity 0.14-0.24
 * - 1-2 secondary lines, 0.5px, cyan #22d3ee, opacity 0.06-0.12
 * - 2-3 dots per line, radius 2px, moving slowly (20-30s traversal)
 * - Hover: speed boost max 1.15x, lines glow 1.15x
 * - Overall feel: slow data stream, not busy
 */
export default function OpticalCanvas({
  width,
  height,
  animationsEnabled = true,
  hovered = false,
  hoverIntensity = 0,
}: OpticalCanvasProps) {
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
    (w: number, h: number, t: number, isHover: boolean) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      try {
        ctx.clearRect(0, 0, w, h);

        // Main fiber lines: top-right to bottom-left
        // Traversal: one full pass = 25s → speed = 1/25 = 0.04
        const mainLines = [
          {
            x1: w,
            y1: 0,
            x2: 0,
            y2: h,
            opacity: 0.20,
            lw: 1,
          },
          {
            x1: w * 0.92,
            y1: -h * 0.02,
            x2: -w * 0.08,
            y2: h * 0.98,
            opacity: 0.16,
            lw: 1,
          },
          {
            x1: w * 1.06,
            y1: h * 0.06,
            x2: w * 0.06,
            y2: h * 1.06,
            opacity: 0.14,
            lw: 1,
          },
        ];

        // Secondary lines: fainter, thinner
        const secondaryLines = [
          {
            x1: w * 0.96,
            y1: h * 0.03,
            x2: -w * 0.04,
            y2: h * 1.03,
            opacity: 0.10,
            lw: 0.5,
          },
          {
            x1: w * 1.02,
            y1: -h * 0.05,
            x2: w * 0.02,
            y2: h * 0.95,
            opacity: 0.06,
            lw: 0.5,
          },
        ];

        const glowMul = isHover ? 1.15 : 1;
        const speedMul = (isHover ? 1.15 : 1) + hoverIntensityRef.current * 0.15;

        // Draw main fiber lines (gold)
        ctx.setLineDash([]);
        mainLines.forEach((line) => {
          ctx.beginPath();
          ctx.moveTo(line.x1, line.y1);
          ctx.lineTo(line.x2, line.y2);
          ctx.strokeStyle = "#c9a84c";
          ctx.globalAlpha = Math.min(line.opacity * glowMul, 0.3);
          ctx.lineWidth = line.lw;
          ctx.stroke();
        });

        // Draw secondary lines (cyan)
        secondaryLines.forEach((line) => {
          ctx.beginPath();
          ctx.moveTo(line.x1, line.y1);
          ctx.lineTo(line.x2, line.y2);
          ctx.strokeStyle = "#22d3ee";
          ctx.globalAlpha = Math.min(line.opacity * glowMul, 0.2);
          ctx.lineWidth = line.lw;
          ctx.stroke();
        });

        // All lines for dot traversal
        const allLines = [...mainLines, ...secondaryLines];

        // Dots: 2-3 per main line, 1 per secondary = 7-8 total
        // Traversal period: 25s → speed = 1/25
        const dots = [
          // Main line 0: 3 dots
          { lineIdx: 0, delay: 0.0, color: "#c9a84c", r: 2, period: 25 },
          { lineIdx: 0, delay: 0.35, color: "#c9a84c", r: 2, period: 28 },
          { lineIdx: 0, delay: 0.7, color: "#c9a84c", r: 1.8, period: 22 },
          // Main line 1: 2 dots
          { lineIdx: 1, delay: 0.15, color: "#c9a84c", r: 2, period: 26 },
          { lineIdx: 1, delay: 0.55, color: "#c9a84c", r: 1.8, period: 24 },
          // Main line 2: 2 dots
          { lineIdx: 2, delay: 0.1, color: "#c9a84c", r: 2, period: 30 },
          { lineIdx: 2, delay: 0.6, color: "#c9a84c", r: 1.8, period: 27 },
          // Secondary: 1 dot each
          { lineIdx: 3, delay: 0.3, color: "#22d3ee", r: 1.5, period: 28 },
          { lineIdx: 4, delay: 0.5, color: "#22d3ee", r: 1.5, period: 30 },
        ];

        dots.forEach((dot) => {
          const line = allLines[dot.lineIdx];
          const speed = (1 / dot.period) * speedMul;
          const rawProgress = ((t * speed + dot.delay) % 1);
          // Bounce: forward then back
          const progress = rawProgress <= 0.5
            ? rawProgress * 2
            : 2 - rawProgress * 2;

          const px = line.x1 + (line.x2 - line.x1) * progress;
          const py = line.y1 + (line.y2 - line.y1) * progress;

          // Dot core
          ctx.beginPath();
          ctx.arc(px, py, dot.r, 0, Math.PI * 2);
          ctx.fillStyle = dot.color;
          ctx.globalAlpha = isHover ? 0.28 : 0.18;
          ctx.fill();

          // Subtle glow
          if (isHover) {
            ctx.beginPath();
            ctx.arc(px, py, dot.r * 3, 0, Math.PI * 2);
            const grad = ctx.createRadialGradient(
              px, py, dot.r * 0.3,
              px, py, dot.r * 3
            );
            grad.addColorStop(0, dot.color);
            grad.addColorStop(1, "transparent");
            ctx.fillStyle = grad;
            ctx.globalAlpha = 0.10;
            ctx.fill();
          }
        });

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
      draw(width, height, 0, false);
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
        draw(width, height, timeRef.current, hoveredRef.current);
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
