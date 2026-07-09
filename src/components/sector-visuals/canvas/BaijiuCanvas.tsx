"use client";

import { useRef, useEffect, useCallback } from "react";

interface BaijiuCanvasProps {
  width: number;
  height: number;
  animationsEnabled?: boolean;
  hovered?: boolean;
  hoverIntensity?: number;
}

/**
 * Canvas 2D visual for 白酒 (Baijiu)
 * - Bottle silhouette: clear outline on right side, stroke opacity 0.22-0.28
 * - Liquid wave lines: 4 horizontal wavy lines with 2x amplitude
 * - Gold seal texture: faint rectangular pattern on left (opacity 0.08-0.14)
 * - Wave animation: visible oscillation (12-18s period)
 * - Seal breathing: subtle opacity pulse (8-12s)
 * - Hover: bottle edge brightens to 0.30-0.40, waves get 1.3x amplitude boost
 * - Colors: amber #b45309 + gold #a16207
 * - Feel: premium aged spirit, understated luxury
 */
export default function BaijiuCanvas({
  width,
  height,
  animationsEnabled = true,
  hovered = false,
  hoverIntensity = 0,
}: BaijiuCanvasProps) {
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

        const amber = "#b45309";
        const gold = "#a16207";
        const glowMul = isHover ? 1.15 : 1;
        const waveAmpMul = isHover ? 1.3 : 1;

        // --- Gold seal texture (left side, faint rectangles) ---
        const sealBreath = animOn
          ? 0.10 + 0.03 * Math.sin(t * ((2 * Math.PI) / 10))
          : 0.10;
        const sealX = w * 0.05;
        const sealY = h * 0.20;
        const sealW = w * 0.30;
        const sealH = h * 0.60;
        const cellSize = 12;

        ctx.globalAlpha = sealBreath * glowMul;
        ctx.strokeStyle = gold;
        ctx.lineWidth = 0.5;

        const cols = Math.floor(sealW / cellSize);
        const rows = Math.floor(sealH / cellSize);
        for (let c = 0; c < cols; c++) {
          for (let r = 0; r < rows; r++) {
            const px = sealX + c * cellSize;
            const py = sealY + r * cellSize;
            ctx.strokeRect(px, py, cellSize - 1, cellSize - 1);
          }
        }

        // Seal character hint (vertical lines suggesting calligraphy)
        ctx.globalAlpha = 0.08 * glowMul;
        ctx.strokeStyle = gold;
        ctx.lineWidth = 0.8;
        for (let i = 0; i < 3; i++) {
          const lx = sealX + sealW * 0.3 + i * cellSize * 2;
          ctx.beginPath();
          ctx.moveTo(lx, sealY + sealH * 0.15);
          ctx.lineTo(lx, sealY + sealH * 0.85);
          ctx.stroke();
        }

        // --- Bottle silhouette (right side) ---
        const bottleX = w * 0.62;
        const bottleBottom = h * 0.85;
        const bottleTop = h * 0.10;
        const bottleW = w * 0.18;
        const neckW = bottleW * 0.3;
        const neckTop = bottleTop;
        const shoulderY = h * 0.28;

        // Inner glow pass (slightly smaller, higher opacity)
        ctx.save();
        ctx.translate(bottleX + bottleW / 2, (shoulderY + bottleBottom) / 2);
        ctx.scale(0.92, 0.92);
        ctx.translate(-(bottleX + bottleW / 2), -((shoulderY + bottleBottom) / 2));
        ctx.globalAlpha = 0.08 * glowMul;
        ctx.strokeStyle = isHover ? amber : gold;
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.moveTo(bottleX + bottleW / 2 - neckW / 2, neckTop);
        ctx.lineTo(bottleX + bottleW / 2 - neckW / 2, shoulderY);
        ctx.quadraticCurveTo(
          bottleX, shoulderY - h * 0.02,
          bottleX, shoulderY + h * 0.08
        );
        ctx.lineTo(bottleX, bottleBottom);
        ctx.lineTo(bottleX + bottleW, bottleBottom);
        ctx.lineTo(bottleX + bottleW, shoulderY + h * 0.08);
        ctx.quadraticCurveTo(
          bottleX + bottleW, shoulderY - h * 0.02,
          bottleX + bottleW / 2 + neckW / 2, shoulderY
        );
        ctx.lineTo(bottleX + bottleW / 2 + neckW / 2, neckTop);
        ctx.lineTo(bottleX + bottleW / 2 - neckW / 2, neckTop);
        ctx.stroke();
        ctx.restore();

        // Outer bottle stroke
        ctx.globalAlpha = (0.24 + hoverIntensityRef.current * 0.04) * glowMul;
        ctx.strokeStyle = isHover ? amber : gold;
        ctx.lineWidth = 1.5;

        ctx.beginPath();
        // Neck left
        ctx.moveTo(bottleX + bottleW / 2 - neckW / 2, neckTop);
        // Shoulder left
        ctx.lineTo(bottleX + bottleW / 2 - neckW / 2, shoulderY);
        ctx.quadraticCurveTo(
          bottleX, shoulderY - h * 0.02,
          bottleX, shoulderY + h * 0.08
        );
        // Body left
        ctx.lineTo(bottleX, bottleBottom);
        // Bottom
        ctx.lineTo(bottleX + bottleW, bottleBottom);
        // Body right
        ctx.lineTo(bottleX + bottleW, shoulderY + h * 0.08);
        ctx.quadraticCurveTo(
          bottleX + bottleW, shoulderY - h * 0.02,
          bottleX + bottleW / 2 + neckW / 2, shoulderY
        );
        // Neck right
        ctx.lineTo(bottleX + bottleW / 2 + neckW / 2, neckTop);
        // Cap
        ctx.lineTo(bottleX + bottleW / 2 - neckW / 2, neckTop);
        ctx.stroke();

        // --- Liquid wave lines (4 lines, 2x amplitude) ---
        const waveYBase = [h * 0.38, h * 0.48, h * 0.58, h * 0.68];
        const waveColors = [amber, gold, amber, gold];
        const waveOpacities = [0.28, 0.24, 0.22, 0.18];
        const wavePeriods = [14, 16, 12, 18];

        waveYBase.forEach((baseY, i) => {
          const amp = h * 0.045 * waveAmpMul; // 2x amplitude (was 0.0225)
          const freq = 2.5 + i * 0.5;
          const phase = t * ((2 * Math.PI) / wavePeriods[i]) + i * 0.8;

          ctx.globalAlpha = waveOpacities[i] * glowMul;
          ctx.strokeStyle = waveColors[i];
          ctx.lineWidth = 1.0;
          ctx.beginPath();

          for (let x = 0; x <= w; x += 2) {
            const wave = Math.sin((x / w) * Math.PI * freq + phase) * amp;
            const y = baseY + wave;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        });

        // --- Bottle highlight on hover ---
        if (isHover) {
          const bx = bottleX + bottleW / 2;
          const by = (shoulderY + bottleBottom) / 2;
          const glowR = bottleW * 0.8;
          const bGrad = ctx.createRadialGradient(bx, by, 0, bx, by, glowR);
          bGrad.addColorStop(0, amber);
          bGrad.addColorStop(1, "transparent");
          ctx.globalAlpha = 0.10;
          ctx.fillStyle = bGrad;
          ctx.beginPath();
          ctx.arc(bx, by, glowR, 0, Math.PI * 2);
          ctx.fill();

          // Hover wave boost — additional highlight lines
          ctx.globalAlpha = 0.15;
          ctx.strokeStyle = amber;
          ctx.lineWidth = 1.5;
          const boostAmp = h * 0.055;
          const boostY = h * 0.50;
          ctx.beginPath();
          for (let x = 0; x <= w; x += 2) {
            const wave = Math.sin((x / w) * Math.PI * 3 + t * 0.5) * boostAmp;
            const y = boostY + wave;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
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
