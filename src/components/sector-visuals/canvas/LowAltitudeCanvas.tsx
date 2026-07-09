"use client";

import { useRef, useEffect, useCallback } from "react";

interface LowAltitudeCanvasProps {
  width: number;
  height: number;
  animationsEnabled?: boolean;
  hovered?: boolean;
  hoverIntensity?: number;
}

/**
 * Canvas 2D visual for 低空经济 (Low-Altitude Economy)
 * - Arc flight routes: 2-3 curved lines across the card
 * - Altitude contour lines: 2-3 faint horizontal wavy lines
 * - Radar arcs: 1-2 concentric partial arcs from bottom-left
 * - Track dots: 3-4 small dots moving along flight routes (12-18s)
 * - Radar sweep: very slow rotating line (14-20s period)
 * - Hover: flight route lines brighten, track dots glow
 * - Colors: teal #14b8a6 + sky #0ea5e9
 * - Feel: air traffic control, precision airspace
 */
export default function LowAltitudeCanvas({
  width,
  height,
  animationsEnabled = true,
  hovered = false,
  hoverIntensity = 0,
}: LowAltitudeCanvasProps) {
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

        const teal = "#14b8a6";
        const sky = "#0ea5e9";
        const glowMul = isHover ? 1.15 : 1;

        // --- Altitude contour lines (faint horizontal wavy) ---
        const contourYs = [h * 0.25, h * 0.45, h * 0.65];
        contourYs.forEach((baseY, i) => {
          const opacity = 0.06 + i * 0.01;
          ctx.globalAlpha = opacity * glowMul;
          ctx.strokeStyle = sky;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          for (let x = 0; x <= w; x += 2) {
            const wave = Math.sin((x / w) * Math.PI * 3 + i * 1.2) * (h * 0.02);
            const y = baseY + wave;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        });

        // --- Radar arcs from bottom-left ---
        const radarX = w * 0.12;
        const radarY = h * 0.88;
        const radarRadii = [w * 0.35, w * 0.55];
        radarRadii.forEach((r, i) => {
          ctx.globalAlpha = (0.08 - i * 0.02) * glowMul;
          ctx.strokeStyle = teal;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.arc(radarX, radarY, r, -Math.PI * 0.55, -Math.PI * 0.05);
          ctx.stroke();
        });

        // --- Radar sweep ---
        if (animOn) {
          const sweepAngle = -Math.PI * 0.3 + ((t * (2 * Math.PI)) / 18) % (Math.PI * 0.5);
          const sweepLen = w * 0.5;
          ctx.globalAlpha = (0.10 + hoverIntensityRef.current * 0.04) * glowMul;
          ctx.strokeStyle = teal;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(radarX, radarY);
          ctx.lineTo(
            radarX + Math.cos(sweepAngle) * sweepLen,
            radarY + Math.sin(sweepAngle) * sweepLen
          );
          ctx.stroke();
        }

        // --- Arc flight routes ---
        const routes = [
          {
            sx: w * 0.05, sy: h * 0.75,
            cx: w * 0.45, cy: h * 0.10,
            ex: w * 0.95, ey: h * 0.35,
            color: teal, opacity: 0.16, lw: 0.8,
          },
          {
            sx: w * 0.15, sy: h * 0.90,
            cx: w * 0.55, cy: h * 0.25,
            ex: w * 0.90, ey: h * 0.15,
            color: sky, opacity: 0.12, lw: 0.8,
          },
          {
            sx: w * 0.00, sy: h * 0.50,
            cx: w * 0.40, cy: h * 0.05,
            ex: w * 0.85, ey: h * 0.55,
            color: teal, opacity: 0.08, lw: 0.5,
          },
        ];

        routes.forEach((route) => {
          ctx.globalAlpha = route.opacity * glowMul;
          ctx.strokeStyle = route.color;
          ctx.lineWidth = route.lw;
          ctx.beginPath();
          ctx.moveTo(route.sx, route.sy);
          ctx.quadraticCurveTo(route.cx, route.cy, route.ex, route.ey);
          ctx.stroke();
        });

        // --- Track dots moving along routes ---
        const trackDots = [
          { routeIdx: 0, delay: 0.0, period: 14, r: 2, color: teal },
          { routeIdx: 0, delay: 0.5, period: 16, r: 1.5, color: teal },
          { routeIdx: 1, delay: 0.25, period: 15, r: 1.8, color: sky },
          { routeIdx: 2, delay: 0.6, period: 18, r: 1.5, color: sky },
        ];

        const speedMul = isHover ? 1.12 : 1;

        trackDots.forEach((dot) => {
          const route = routes[dot.routeIdx];
          const speed = (1 / dot.period) * speedMul;
          const rawProgress = (t * speed + dot.delay) % 1;
          const progress = rawProgress <= 0.5
            ? rawProgress * 2
            : 2 - rawProgress * 2;

          // Quadratic bezier point
          const mt = 1 - progress;
          const px = mt * mt * route.sx + 2 * mt * progress * route.cx + progress * progress * route.ex;
          const py = mt * mt * route.sy + 2 * mt * progress * route.cy + progress * progress * route.ey;

          ctx.beginPath();
          ctx.arc(px, py, dot.r, 0, Math.PI * 2);
          ctx.fillStyle = dot.color;
          ctx.globalAlpha = isHover ? 0.26 : 0.18;
          ctx.fill();

          if (isHover) {
            ctx.beginPath();
            ctx.arc(px, py, dot.r * 3, 0, Math.PI * 2);
            const gGrad = ctx.createRadialGradient(px, py, dot.r * 0.3, px, py, dot.r * 3);
            gGrad.addColorStop(0, dot.color);
            gGrad.addColorStop(1, "transparent");
            ctx.fillStyle = gGrad;
            ctx.globalAlpha = 0.08;
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
