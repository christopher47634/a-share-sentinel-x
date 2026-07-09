"use client";

import { useRef, useEffect, useCallback } from "react";

interface MiningCanvasProps {
  width: number;
  height: number;
  animationsEnabled?: boolean;
  hovered?: boolean;
  hoverIntensity?: number;
}

/**
 * Canvas 2D visual for Mining — Ore Vein Energy Dots + Strata Parallax
 * - 4-5 horizontal strata lines at different heights, slightly wavy (sine wave)
 * - Strata parallax: each line drifts horizontally at slightly different speeds
 * - 2-3 main ore vein lines: diagonal lines crossing through strata
 * - Ore vein energy dots: small dots moving slowly along veins with faint trail
 * - Ore vein pulse: vein lines slowly pulse in brightness
 * - Hover: veins brighten, dots get glow halo
 * - Colors: copper #a0522d, iron grey #6b7280, gold accent #b8860b
 * - Feel: geological cross-section, raw material depth
 */
export default function MiningCanvas({
  width,
  height,
  animationsEnabled = true,
  hovered = false,
  hoverIntensity = 0,
}: MiningCanvasProps) {
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

        const copper = "#a0522d";
        const ironGrey = "#6b7280";
        const gold = "#b8860b";

        // --- Background grain texture ---
        ctx.globalAlpha = 0.03;
        ctx.fillStyle = ironGrey;
        // Deterministic random dots for grain
        for (let g = 0; g < 40; g++) {
          const px = ((g * 37 + 11) % 1000) / 1000 * w;
          const py = ((g * 53 + 7) % 1000) / 1000 * h;
          ctx.beginPath();
          ctx.arc(px, py, 1, 0, Math.PI * 2);
          ctx.fill();
        }

        // --- Horizontal strata lines with parallax drift ---
        const strata = [
          { baseY: h * 0.18, opacity: 0.10, lw: 0.8, period: 18, amp: 2.0, freq: 2.0, phase: 0.0 },
          { baseY: h * 0.32, opacity: 0.14, lw: 0.8, period: 16, amp: 2.5, freq: 2.5, phase: 0.7 },
          { baseY: h * 0.48, opacity: 0.18, lw: 1.0, period: 14, amp: 3.0, freq: 1.8, phase: 1.4 },
          { baseY: h * 0.62, opacity: 0.12, lw: 0.8, period: 20, amp: 1.5, freq: 2.2, phase: 2.1 },
          { baseY: h * 0.78, opacity: 0.08, lw: 0.5, period: 17, amp: 1.0, freq: 3.0, phase: 2.8 },
        ];

        strata.forEach((layer) => {
          // Parallax drift: each layer moves at different speed
          const driftX = animOn
            ? Math.sin(t * ((2 * Math.PI) / layer.period)) * layer.amp * 0.5
            : 0;

          ctx.globalAlpha = layer.opacity;
          ctx.strokeStyle = ironGrey;
          ctx.lineWidth = layer.lw;
          ctx.beginPath();

          for (let x = 0; x <= w; x += 2) {
            const wave = Math.sin(((x + driftX) / w) * Math.PI * layer.freq + layer.phase) * layer.amp;
            const y = layer.baseY + wave;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        });

        // --- Ore vein pulse (opacity oscillates 0.12→0.22→0.12, period 10-14s) ---
        const veinPulse = animOn
          ? 0.17 + 0.05 * Math.sin(t * ((2 * Math.PI) / 12))
          : 0.17;

        // --- Ore vein lines: diagonal lines crossing through strata ---
        const oreVeins = [
          { sx: w * 0.10, sy: h * 0.15, ex: w * 0.75, ey: h * 0.85, color: copper, baseOpacity: 0.14 },
          { sx: w * 0.30, sy: h * 0.05, ex: w * 0.90, ey: h * 0.70, color: gold, baseOpacity: 0.10 },
          { sx: w * 0.50, sy: h * 0.20, ex: w * 0.95, ey: h * 0.90, color: copper, baseOpacity: 0.12 },
        ];

        oreVeins.forEach((vein) => {
          const hoverBoost = isHover ? 1.6 : 1;
          ctx.globalAlpha = Math.min(vein.baseOpacity * veinPulse * hoverBoost * 1.5 + hoverIntensityRef.current * 0.04, 0.38);
          ctx.strokeStyle = vein.color;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(vein.sx, vein.sy);
          ctx.lineTo(vein.ex, vein.ey);
          ctx.stroke();
        });

        // --- Ore vein energy dots: moving along veins with faint trail ---
        const energyDots = [
          { veinIdx: 0, period: 12, trailLen: 4, radius: 1.5 },
          { veinIdx: 1, period: 16, trailLen: 3, radius: 1.5 },
          { veinIdx: 2, period: 10, trailLen: 5, radius: 2.0 },
          { veinIdx: 0, period: 14, trailLen: 3, radius: 1.5 },
        ];

        energyDots.forEach((dot) => {
          const vein = oreVeins[dot.veinIdx];
          // Parametric position along vein: 0→1→0 (ping-pong)
          const progress = animOn
            ? (Math.sin(t * ((2 * Math.PI) / dot.period)) + 1) / 2
            : 0.5;

          const dotX = vein.sx + (vein.ex - vein.sx) * progress;
          const dotY = vein.sy + (vein.ey - vein.sy) * progress;

          // Faint trail: previous positions with decreasing opacity
          for (let tr = dot.trailLen; tr > 0; tr--) {
            const trailProgress = animOn
              ? (Math.sin((t - tr * 0.4) * ((2 * Math.PI) / dot.period)) + 1) / 2
              : 0.5;
            const tx = vein.sx + (vein.ex - vein.sx) * trailProgress;
            const ty = vein.sy + (vein.ey - vein.sy) * trailProgress;
            const trailAlpha = (0.08 / tr) * (isHover ? 1.5 : 1);
            ctx.globalAlpha = trailAlpha;
            ctx.fillStyle = gold;
            ctx.beginPath();
            ctx.arc(tx, ty, dot.radius * 0.6, 0, Math.PI * 2);
            ctx.fill();
          }

          // Main dot
          const dotAlpha = animOn
            ? 0.20 + 0.08 * Math.sin(t * ((2 * Math.PI) / (dot.period * 0.5)))
            : 0.24;
          ctx.globalAlpha = isHover ? Math.min(dotAlpha * 1.5, 0.35) : dotAlpha;
          ctx.fillStyle = gold;
          ctx.beginPath();
          ctx.arc(dotX, dotY, dot.radius, 0, Math.PI * 2);
          ctx.fill();

          // Hover: glow halo around dot
          if (isHover) {
            const grad = ctx.createRadialGradient(dotX, dotY, 0, dotX, dotY, 6);
            grad.addColorStop(0, gold);
            grad.addColorStop(1, "transparent");
            ctx.globalAlpha = 0.14;
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(dotX, dotY, 6, 0, Math.PI * 2);
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
