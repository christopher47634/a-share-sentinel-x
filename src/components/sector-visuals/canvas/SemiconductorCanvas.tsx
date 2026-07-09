"use client";

import { useRef, useEffect, useCallback } from "react";

interface SemiconductorCanvasProps {
  width: number;
  height: number;
  animationsEnabled?: boolean;
  hovered?: boolean;
  hoverIntensity?: number;
}

/**
 * Canvas 2D visual for 半导体 (Semiconductor) — COMPLETE REDO
 * - Half-circle wafer emerging from right side (not centered)
 * - Etch grid: fine horizontal + vertical lines creating a die grid
 * - 2-3 concentric wafer arcs (partial arcs, not full circles)
 * - Scanning line: slow horizontal sweep across wafer (14s period)
 * - Die grid cells: some randomly flickering very subtly (0.08→0.15)
 * - Hover: crosshair appears at wafer center
 * - Colors: indigo #6366f1 + purple #a855f7 + gold accent #c9a84c
 * - Feel: precision manufacturing, nano-scale
 */
export default function SemiconductorCanvas({
  width,
  height,
  animationsEnabled = true,
  hovered = false,
  hoverIntensity = 0,
}: SemiconductorCanvasProps) {
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

        const indigo = "#6366f1";
        const purple = "#a855f7";
        const gold = "#c9a84c";

        // Wafer center: right side, so the half-circle emerges from the right edge
        const cx = w * 0.78;
        const cy = h * 0.5;
        const waferR = Math.min(w, h) * 0.46;

        // --- Wafer base fill (half circle, clipped) ---
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, w, h);
        ctx.clip();

        // Half-circle wafer fill (very faint)
        ctx.beginPath();
        ctx.arc(cx, cy, waferR, -Math.PI / 2, Math.PI / 2, false);
        ctx.closePath();
        ctx.fillStyle = indigo;
        ctx.globalAlpha = 0.018;
        ctx.fill();

        // --- Etch grid: fine lines inside wafer area ---
        const gridSpacing = 12;
        ctx.globalAlpha = 0.06;
        ctx.strokeStyle = purple;
        ctx.lineWidth = 0.3;

        // Vertical etch lines (only inside wafer half-circle)
        for (let gx = cx - waferR; gx <= cx; gx += gridSpacing) {
          // Calculate max y extent at this x within the circle
          const dx = gx - cx;
          const maxY = Math.sqrt(waferR * waferR - dx * dx);
          ctx.beginPath();
          ctx.moveTo(gx, cy - maxY);
          ctx.lineTo(gx, cy + maxY);
          ctx.stroke();
        }

        // Horizontal etch lines
        for (let gy = cy - waferR; gy <= cy + waferR; gy += gridSpacing) {
          ctx.beginPath();
          ctx.moveTo(cx - waferR, gy);
          ctx.lineTo(cx, gy);
          ctx.stroke();
        }

        // --- Concentric wafer arcs (partial arcs, 3 arcs) ---
        const arcRadii = [waferR * 0.35, waferR * 0.6, waferR * 0.88];
        const arcColors = [indigo, purple, indigo];
        const arcOpacities = [0.16, 0.12, 0.10];

        arcRadii.forEach((r, i) => {
          ctx.beginPath();
          ctx.arc(cx, cy, r, -Math.PI * 0.42, Math.PI * 0.42, false);
          ctx.strokeStyle = arcColors[i];
          ctx.globalAlpha = arcOpacities[i];
          ctx.lineWidth = 0.8;
          ctx.stroke();
        });

        // Wafer edge (the straight cut line at center)
        ctx.beginPath();
        ctx.moveTo(cx, cy - waferR);
        ctx.lineTo(cx, cy + waferR);
        ctx.strokeStyle = indigo;
        ctx.globalAlpha = 0.12;
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // --- Die grid cells: subtle rectangles in wafer area ---
        // Deterministic "random" flicker using seeded positions
        const dieCells: { col: number; row: number; flickerPhase: number }[] = [];
        for (let c = 0; c < 6; c++) {
          for (let r = 0; r < 5; r++) {
            // Only include cells that fall within the wafer half-circle
            const cellCx = cx - (c + 0.5) * (gridSpacing + 2);
            const cellCy = cy - waferR * 0.5 + r * (gridSpacing + 2);
            const dx = cellCx - cx;
            const dy = cellCy - cy;
            if (dx * dx + dy * dy < waferR * waferR * 0.7 && dx <= 0) {
              // Use deterministic pseudo-random phase
              const seed = (c * 7 + r * 13) % 17;
              dieCells.push({ col: c, row: r, flickerPhase: seed * 0.8 });
            }
          }
        }

        const cellW = gridSpacing * 0.7;
        const cellH = gridSpacing * 0.7;
        dieCells.forEach((cell) => {
          const cellCx = cx - (cell.col + 0.5) * (gridSpacing + 2);
          const cellCy = cy - waferR * 0.5 + cell.row * (gridSpacing + 2);

          // Subtle flicker: opacity oscillates slowly between 0.08 and 0.18
          const flicker = animOn
            ? 0.08 + 0.10 * (0.5 + 0.5 * Math.sin(t * 0.4 + cell.flickerPhase))
            : 0.10;

          ctx.globalAlpha = flicker;
          ctx.strokeStyle = (cell.col + cell.row) % 3 === 0 ? gold : purple;
          ctx.lineWidth = 0.4;
          ctx.beginPath();
          ctx.roundRect(cellCx - cellW / 2, cellCy - cellH / 2, cellW, cellH, 1);
          ctx.stroke();
        });

        // --- Scanning line: slow horizontal sweep across wafer (14s period) ---
        if (animOn) {
          const scanPeriod = 14;
          const scanPhase = (t % scanPeriod) / scanPeriod;
          // Sweep from left edge of wafer to center line
          const scanX = (cx - waferR) + scanPhase * waferR;

          const scanGrad = ctx.createLinearGradient(scanX - 2, 0, scanX + 2, 0);
          scanGrad.addColorStop(0, "transparent");
          scanGrad.addColorStop(0.5, indigo);
          scanGrad.addColorStop(1, "transparent");

          ctx.globalAlpha = 0.20 + hoverIntensityRef.current * 0.04;
          ctx.fillStyle = scanGrad;
          ctx.fillRect(scanX - 2, cy - waferR, 4, waferR * 2);
        }

        // --- Gold accent arc segment ---
        ctx.beginPath();
        ctx.arc(cx, cy, waferR * 0.6, -Math.PI * 0.25, -Math.PI * 0.08, false);
        ctx.strokeStyle = gold;
        ctx.globalAlpha = 0.18;
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // --- Flat notch at bottom of wafer ---
        const notchY = cy + waferR * 0.95;
        ctx.beginPath();
        ctx.moveTo(cx - 5, notchY - 4);
        ctx.lineTo(cx, notchY);
        ctx.lineTo(cx + 5, notchY - 4);
        ctx.strokeStyle = indigo;
        ctx.globalAlpha = 0.14;
        ctx.lineWidth = 0.8;
        ctx.stroke();

        ctx.restore();

        // --- Hover: crosshair at wafer center ---
        if (isHover) {
          const crossSize = 12;

          ctx.globalAlpha = 0.18;
          ctx.strokeStyle = gold;
          ctx.lineWidth = 0.5;

          // Horizontal crosshair
          ctx.beginPath();
          ctx.moveTo(cx - crossSize, cy);
          ctx.lineTo(cx + crossSize, cy);
          ctx.stroke();

          // Vertical crosshair
          ctx.beginPath();
          ctx.moveTo(cx, cy - crossSize);
          ctx.lineTo(cx, cy + crossSize);
          ctx.stroke();

          // Small circle at center
          ctx.beginPath();
          ctx.arc(cx, cy, 3, 0, Math.PI * 2);
          ctx.stroke();

          // Tick marks at crosshair ends
          ctx.globalAlpha = 0.12;
          const tickLen = 3;
          // Top tick
          ctx.beginPath();
          ctx.moveTo(cx - tickLen, cy - crossSize);
          ctx.lineTo(cx + tickLen, cy - crossSize);
          ctx.stroke();
          // Bottom tick
          ctx.beginPath();
          ctx.moveTo(cx - tickLen, cy + crossSize);
          ctx.lineTo(cx + tickLen, cy + crossSize);
          ctx.stroke();
          // Left tick
          ctx.beginPath();
          ctx.moveTo(cx - crossSize, cy - tickLen);
          ctx.lineTo(cx - crossSize, cy + tickLen);
          ctx.stroke();
          // Right tick
          ctx.beginPath();
          ctx.moveTo(cx + crossSize, cy - tickLen);
          ctx.lineTo(cx + crossSize, cy + tickLen);
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
