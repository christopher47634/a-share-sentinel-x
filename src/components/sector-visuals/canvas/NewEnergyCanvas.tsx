"use client";

import { useRef, useEffect, useCallback } from "react";

interface NewEnergyCanvasProps {
  width: number;
  height: number;
  animationsEnabled?: boolean;
  hovered?: boolean;
  hoverIntensity?: number;
}

/**
 * Canvas 2D visual for 新能源 (New Energy) — NEW
 * - Left side: battery outline (simple rectangle with + terminal)
 * - Energy flow lines: diagonal streams from bottom-left to top-right, 2-3 lines
 * - Right side: very faint PV grid (tiny squares, opacity 0.04-0.08)
 * - Energy dots: 4-6 particles moving along flow lines, emerald #10b981
 * - Battery charge: subtle breathing glow inside battery outline
 * - Hover: energy lines brighten slightly (1.15x)
 * - Colors: emerald #10b981 + cyan #06b6d4
 * - Period: 10-14s for flow traversal
 */
export default function NewEnergyCanvas({
  width,
  height,
  animationsEnabled = true,
  hovered = false,
  hoverIntensity = 0,
}: NewEnergyCanvasProps) {
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

        const emerald = "#10b981";
        const cyan = "#06b6d4";
        const glowMul = isHover ? 1.15 : 1;

        // --- Battery outline (left side) ---
        const batX = w * 0.08;
        const batY = h * 0.28;
        const batW = w * 0.22;
        const batH = h * 0.44;
        const termW = batW * 0.12;
        const termH = batH * 0.14;

        // Battery body
        ctx.globalAlpha = 0.16 * glowMul;
        ctx.strokeStyle = emerald;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(batX, batY, batW, batH, 2);
        ctx.stroke();

        // + terminal (small rectangle on top)
        ctx.globalAlpha = 0.18 * glowMul;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(
          batX + batW / 2 - termW / 2,
          batY - termH,
          termW,
          termH,
          1
        );
        ctx.stroke();

        // Battery charge level indicator (subtle fill at bottom)
        const chargeAlpha = animOn
          ? 0.04 + 0.03 * Math.sin(t * ((2 * Math.PI) / 12))
          : 0.05;
        const chargeH = batH * 0.35;
        ctx.globalAlpha = chargeAlpha * glowMul;
        ctx.fillStyle = emerald;
        ctx.beginPath();
        ctx.roundRect(
          batX + 2,
          batY + batH - chargeH - 2,
          batW - 4,
          chargeH,
          1
        );
        ctx.fill();

        // Battery breathing glow (inside battery)
        if (animOn) {
          const glowR = batW * 0.5;
          const bx = batX + batW / 2;
          const by = batY + batH / 2;
          const bGrad = ctx.createRadialGradient(bx, by, 0, bx, by, glowR);
          bGrad.addColorStop(0, emerald);
          bGrad.addColorStop(1, "transparent");
          ctx.globalAlpha = chargeAlpha * 0.8;
          ctx.fillStyle = bGrad;
          ctx.beginPath();
          ctx.arc(bx, by, glowR, 0, Math.PI * 2);
          ctx.fill();
        }

        // --- Energy flow lines: diagonal from bottom-left to top-right ---
        const flowLines = [
          {
            x1: w * 0.18,
            y1: h * 0.85,
            x2: w * 0.88,
            y2: h * 0.12,
            color: emerald,
            opacity: 0.12,
            lw: 0.8,
          },
          {
            x1: w * 0.12,
            y1: h * 0.92,
            x2: w * 0.82,
            y2: h * 0.20,
            color: cyan,
            opacity: 0.08,
            lw: 0.5,
          },
          {
            x1: w * 0.22,
            y1: h * 0.78,
            x2: w * 0.92,
            y2: h * 0.06,
            color: emerald,
            opacity: 0.06,
            lw: 0.5,
          },
        ];

        flowLines.forEach((line) => {
          ctx.globalAlpha = line.opacity * glowMul;
          ctx.strokeStyle = line.color;
          ctx.lineWidth = line.lw;
          ctx.beginPath();
          ctx.moveTo(line.x1, line.y1);
          ctx.lineTo(line.x2, line.y2);
          ctx.stroke();
        });

        // --- PV grid (right side, very faint) ---
        const pvStartX = w * 0.62;
        const pvStartY = h * 0.15;
        const pvCellSize = 8;
        const pvCols = Math.floor((w * 0.32) / pvCellSize);
        const pvRows = Math.floor((h * 0.70) / pvCellSize);

        ctx.globalAlpha = 0.08;
        ctx.strokeStyle = cyan;
        ctx.lineWidth = 0.3;

        for (let c = 0; c < pvCols; c++) {
          for (let r = 0; r < pvRows; r++) {
            const px = pvStartX + c * pvCellSize;
            const py = pvStartY + r * pvCellSize;
            ctx.strokeRect(px, py, pvCellSize - 1, pvCellSize - 1);
          }
        }

        // Some PV cells slightly brighter (random-ish pattern)
        for (let c = 0; c < pvCols; c += 3) {
          for (let r = 0; r < pvRows; r += 4) {
            const px = pvStartX + c * pvCellSize;
            const py = pvStartY + r * pvCellSize;
            ctx.globalAlpha = 0.12;
            ctx.fillStyle = cyan;
            ctx.fillRect(px, py, pvCellSize - 1, pvCellSize - 1);
          }
        }

        // --- Energy dots: particles moving along flow lines ---
        const energyDots = [
          { lineIdx: 0, delay: 0.0, period: 12, r: 2, color: emerald },
          { lineIdx: 0, delay: 0.4, period: 14, r: 1.8, color: emerald },
          { lineIdx: 0, delay: 0.7, period: 11, r: 1.5, color: emerald },
          { lineIdx: 1, delay: 0.2, period: 13, r: 1.8, color: cyan },
          { lineIdx: 1, delay: 0.6, period: 15, r: 1.5, color: cyan },
          { lineIdx: 2, delay: 0.3, period: 12, r: 1.5, color: emerald },
        ];

        const speedMul = isHover ? 1.15 : 1;

        energyDots.forEach((dot) => {
          const line = flowLines[dot.lineIdx];
          const speed = (1 / dot.period) * speedMul;
          const rawProgress = ((t * speed + dot.delay) % 1);
          // Bounce: forward then back
          const progress = rawProgress <= 0.5
            ? rawProgress * 2
            : 2 - rawProgress * 2;

          const px = line.x1 + (line.x2 - line.x1) * progress;
          const py = line.y1 + (line.y2 - line.y1) * progress;

          ctx.beginPath();
          ctx.arc(px, py, dot.r, 0, Math.PI * 2);
          ctx.fillStyle = dot.color;
          ctx.globalAlpha = (isHover ? 0.35 : 0.22) + hoverIntensityRef.current * 0.10;
          ctx.fill();

          // Subtle glow
          if (isHover) {
            ctx.beginPath();
            ctx.arc(px, py, dot.r * 3, 0, Math.PI * 2);
            const gGrad = ctx.createRadialGradient(
              px, py, dot.r * 0.3,
              px, py, dot.r * 3
            );
            gGrad.addColorStop(0, dot.color);
            gGrad.addColorStop(1, "transparent");
            ctx.fillStyle = gGrad;
            ctx.globalAlpha = 0.08;
            ctx.fill();
          }
        });

        // --- Lightning bolt icon (very subtle, near battery) ---
        const boltX = batX + batW / 2;
        const boltY = batY + batH / 2;
        const boltSize = batW * 0.2;

        ctx.globalAlpha = 0.10 * glowMul;
        ctx.strokeStyle = emerald;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(boltX + boltSize * 0.1, boltY - boltSize);
        ctx.lineTo(boltX - boltSize * 0.3, boltY + boltSize * 0.1);
        ctx.lineTo(boltX + boltSize * 0.1, boltY + boltSize * 0.1);
        ctx.lineTo(boltX - boltSize * 0.1, boltY + boltSize);
        ctx.stroke();

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
