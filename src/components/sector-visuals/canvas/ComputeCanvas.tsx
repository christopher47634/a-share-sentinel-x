"use client";

import { useRef, useEffect, useCallback } from "react";

interface ComputeCanvasProps {
  width: number;
  height: number;
  animationsEnabled?: boolean;
  hovered?: boolean;
  hoverIntensity?: number;
}

/**
 * Canvas 2D visual for Compute — Prominent Chip + Data Nodes + Data Flow
 * - Central chip: prominent outline with rounded corners, inner die, pin lines, circuit traces
 * - Circuit paths: 3-4 L-shaped/zigzag paths radiating outward from chip
 * - Data nodes: 4-5 small circles at circuit intersections, pulsing
 * - Data flow: 2-3 small dots moving along circuit paths with faint trail
 * - Background grid: very faint
 * - Hover: chip outline brightens, data flow dot gets glow, circuit paths brighten
 * - Colors: blue #3b82f6, purple #8b5cf6
 * - Feel: data center, high-performance computing
 */
export default function ComputeCanvas({
  width,
  height,
  animationsEnabled = true,
  hovered = false,
  hoverIntensity = 0,
}: ComputeCanvasProps) {
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
    (w: number, h: number, t: number, animOn: boolean, isHover: boolean) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      try {
        ctx.clearRect(0, 0, w, h);

        const blue = "#3b82f6";
        const purple = "#8b5cf6";
        const hoverMul = isHover ? 1.15 : 1;

        // --- Background grid: very faint ---
        const spacing = 36;
        const gridAlpha = animOn
          ? 0.04 + 0.02 * Math.sin(t * 0.08)
          : 0.06;

        ctx.globalAlpha = gridAlpha;
        ctx.strokeStyle = purple;
        ctx.lineWidth = 0.5;

        const driftX = animOn ? (t * 1.5) % spacing : 0;
        const driftY = animOn ? (t * 1.0) % spacing : 0;

        for (let x = driftX; x < w; x += spacing) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
          ctx.stroke();
        }
        for (let y = driftY; y < h; y += spacing) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
        }

        // --- Central chip: prominent outline ---
        const chipX = w * 0.28;
        const chipY = h * 0.22;
        const chipW = w * 0.44;
        const chipH = h * 0.56;

        // Chip breathing: opacity 0.14-0.24, period ~8s
        const breathAlpha = animOn
          ? 0.19 + 0.05 * Math.sin(t * ((2 * Math.PI) / 8))
          : 0.19;

        // Outer chip border with rounded corners
        ctx.globalAlpha = Math.min(breathAlpha * hoverMul + hoverIntensityRef.current * 0.04, 0.38);
        ctx.strokeStyle = blue;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(chipX, chipY, chipW, chipH, 4);
        ctx.stroke();

        // Inner die: smaller rectangle
        const dieInsetX = chipW * 0.15;
        const dieInsetY = chipH * 0.15;
        ctx.globalAlpha = Math.min(breathAlpha * 0.6 * hoverMul, 0.28);
        ctx.strokeStyle = purple;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.roundRect(
          chipX + dieInsetX,
          chipY + dieInsetY,
          chipW - 2 * dieInsetX,
          chipH - 2 * dieInsetY,
          2
        );
        ctx.stroke();

        // Chip label area: tiny horizontal lines inside die (circuit traces)
        const traceCount = 4;
        ctx.globalAlpha = 0.08;
        ctx.strokeStyle = blue;
        ctx.lineWidth = 0.5;
        for (let i = 0; i < traceCount; i++) {
          const ty = chipY + dieInsetY + (chipH - 2 * dieInsetY) * ((i + 1) / (traceCount + 1));
          const tx1 = chipX + dieInsetX + 6;
          const tx2 = chipX + chipW - dieInsetX - 6;
          ctx.beginPath();
          ctx.moveTo(tx1, ty);
          ctx.lineTo(tx2, ty);
          ctx.stroke();
        }

        // --- Pin lines: 3-4 short lines on each edge ---
        const pinLength = 6;
        ctx.globalAlpha = 0.14 * hoverMul;
        ctx.lineWidth = 0.8;

        // Top pins
        ctx.strokeStyle = blue;
        [0.2, 0.4, 0.6, 0.8].forEach((pct) => {
          const px = chipX + chipW * pct;
          ctx.beginPath();
          ctx.moveTo(px, chipY - pinLength);
          ctx.lineTo(px, chipY);
          ctx.stroke();
        });

        // Bottom pins
        [0.2, 0.4, 0.6, 0.8].forEach((pct) => {
          const px = chipX + chipW * pct;
          ctx.beginPath();
          ctx.moveTo(px, chipY + chipH);
          ctx.lineTo(px, chipY + chipH + pinLength);
          ctx.stroke();
        });

        // Left pins
        ctx.strokeStyle = purple;
        [0.25, 0.5, 0.75].forEach((pct) => {
          const py = chipY + chipH * pct;
          ctx.beginPath();
          ctx.moveTo(chipX - pinLength, py);
          ctx.lineTo(chipX, py);
          ctx.stroke();
        });

        // Right pins
        [0.25, 0.5, 0.75].forEach((pct) => {
          const py = chipY + chipH * pct;
          ctx.beginPath();
          ctx.moveTo(chipX + chipW, py);
          ctx.lineTo(chipX + chipW + pinLength, py);
          ctx.stroke();
        });

        // --- Circuit paths: L-shaped/zigzag paths radiating outward ---
        // Define circuit paths as arrays of [x, y] waypoints
        const circuitPaths = [
          // Right path 1: chip right → right → down → right
          [
            [chipX + chipW + pinLength, chipY + chipH * 0.30],
            [chipX + chipW + 30, chipY + chipH * 0.30],
            [chipX + chipW + 30, chipY + chipH * 0.50],
            [chipX + chipW + 55, chipY + chipH * 0.50],
          ],
          // Right path 2: chip right → right → up → right
          [
            [chipX + chipW + pinLength, chipY + chipH * 0.65],
            [chipX + chipW + 25, chipY + chipH * 0.65],
            [chipX + chipW + 25, chipY + chipH * 0.45],
            [chipX + chipW + 50, chipY + chipH * 0.45],
          ],
          // Left path 1: chip left → left → down → left
          [
            [chipX - pinLength, chipY + chipH * 0.35],
            [chipX - 28, chipY + chipH * 0.35],
            [chipX - 28, chipY + chipH * 0.55],
            [chipX - 52, chipY + chipH * 0.55],
          ],
          // Top path: chip top → up → right
          [
            [chipX + chipW * 0.5, chipY - pinLength],
            [chipX + chipW * 0.5, chipY - 22],
            [chipX + chipW * 0.65, chipY - 22],
            [chipX + chipW * 0.65, chipY - 40],
          ],
          // Bottom path: chip bottom → down → left
          [
            [chipX + chipW * 0.5, chipY + chipH + pinLength],
            [chipX + chipW * 0.5, chipY + chipH + 22],
            [chipX + chipW * 0.35, chipY + chipH + 22],
            [chipX + chipW * 0.35, chipY + chipH + 40],
          ],
        ];

        ctx.lineWidth = 0.6;
        circuitPaths.forEach((path) => {
          ctx.globalAlpha = 0.10 * hoverMul;
          ctx.strokeStyle = blue;
          ctx.beginPath();
          if (path.length > 0) {
            ctx.moveTo(path[0][0], path[0][1]);
            for (let i = 1; i < path.length; i++) {
              ctx.lineTo(path[i][0], path[i][1]);
            }
          }
          ctx.stroke();
        });

        // --- Data nodes: small circles at circuit intersections ---
        const dataNodes = [
          { x: chipX + chipW + 30, y: chipY + chipH * 0.50, radius: 3.5, phase: 0 },
          { x: chipX + chipW + 25, y: chipY + chipH * 0.45, radius: 3, phase: 1.2 },
          { x: chipX - 28, y: chipY + chipH * 0.55, radius: 4, phase: 2.4 },
          { x: chipX + chipW * 0.5, y: chipY - 22, radius: 3.5, phase: 3.6 },
          { x: chipX + chipW * 0.35, y: chipY + chipH + 22, radius: 3, phase: 4.8 },
        ];

        dataNodes.forEach((node) => {
          // Pulse: opacity oscillates 0.10→0.28→0.10, period 6-10s
          const nodePulse = animOn
            ? 0.19 + 0.09 * Math.sin(t * ((2 * Math.PI) / 8) + node.phase)
            : 0.19;

          ctx.globalAlpha = nodePulse;
          ctx.fillStyle = blue;
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
          ctx.fill();

          // Outer ring
          ctx.globalAlpha = nodePulse * 0.7;
          ctx.strokeStyle = purple;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + 2, 0, Math.PI * 2);
          ctx.stroke();
        });

        // --- Data flow: dots moving along circuit paths ---
        // Each dot moves along a circuit path, period 8-14s
        const flowDots = [
          { pathIdx: 0, period: 10, radius: 2 },
          { pathIdx: 2, period: 12, radius: 1.5 },
          { pathIdx: 3, period: 14, radius: 2 },
        ];

        flowDots.forEach((dot, di) => {
          const path = circuitPaths[dot.pathIdx];
          if (path.length < 2) return;

          // Calculate total path length
          let totalLen = 0;
          const segLens: number[] = [];
          for (let i = 1; i < path.length; i++) {
            const dx = path[i][0] - path[i - 1][0];
            const dy = path[i][1] - path[i - 1][1];
            const len = Math.sqrt(dx * dx + dy * dy);
            segLens.push(len);
            totalLen += len;
          }

          // Position along path: ping-pong
          const progress = animOn
            ? (Math.sin(t * ((2 * Math.PI) / dot.period) + di * 2) + 1) / 2
            : 0.5;

          const dist = progress * totalLen;
          let cumDist = 0;
          let dotX = path[0][0];
          let dotY = path[0][1];

          for (let i = 0; i < segLens.length; i++) {
            if (cumDist + segLens[i] >= dist) {
              const segProgress = (dist - cumDist) / segLens[i];
              dotX = path[i][0] + (path[i + 1][0] - path[i][0]) * segProgress;
              dotY = path[i][1] + (path[i + 1][1] - path[i][1]) * segProgress;
              break;
            }
            cumDist += segLens[i];
            if (i === segLens.length - 1) {
              dotX = path[path.length - 1][0];
              dotY = path[path.length - 1][1];
            }
          }

          // Faint trail: previous positions
          for (let tr = 3; tr > 0; tr--) {
            const trailProgress = animOn
              ? (Math.sin((t - tr * 0.3) * ((2 * Math.PI) / dot.period) + di * 2) + 1) / 2
              : 0.5;
            const trailDist = trailProgress * totalLen;
            let tCumDist = 0;
            let tx = path[0][0];
            let ty = path[0][1];

            for (let i = 0; i < segLens.length; i++) {
              if (tCumDist + segLens[i] >= trailDist) {
                const sp = (trailDist - tCumDist) / segLens[i];
                tx = path[i][0] + (path[i + 1][0] - path[i][0]) * sp;
                ty = path[i][1] + (path[i + 1][1] - path[i][1]) * sp;
                break;
              }
              tCumDist += segLens[i];
              if (i === segLens.length - 1) {
                tx = path[path.length - 1][0];
                ty = path[path.length - 1][1];
              }
            }

            ctx.globalAlpha = 0.06 / tr;
            ctx.fillStyle = blue;
            ctx.beginPath();
            ctx.arc(tx, ty, dot.radius * 0.5, 0, Math.PI * 2);
            ctx.fill();
          }

          // Main dot
          const dotAlpha = animOn
            ? 0.18 + 0.06 * Math.sin(t * ((2 * Math.PI) / (dot.period * 0.5)))
            : 0.22;
          ctx.globalAlpha = Math.min(dotAlpha, 0.30);
          ctx.fillStyle = blue;
          ctx.beginPath();
          ctx.arc(dotX, dotY, dot.radius, 0, Math.PI * 2);
          ctx.fill();
        });

        // --- Hover: chip outline brightens, one flow dot gets glow ---
        if (isHover) {
          // Chip outline glow
          const glowR = Math.max(chipW, chipH) * 0.5;
          const grad = ctx.createRadialGradient(
            w / 2, h / 2, 0,
            w / 2, h / 2, glowR
          );
          grad.addColorStop(0, blue);
          grad.addColorStop(1, "transparent");
          ctx.globalAlpha = 0.08;
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(w / 2, h / 2, glowR, 0, Math.PI * 2);
          ctx.fill();

          // Glow around first data flow dot
          if (flowDots.length > 0) {
            const glowPath = circuitPaths[flowDots[0].pathIdx];
            if (glowPath.length >= 2) {
              const gx = (glowPath[0][0] + glowPath[glowPath.length - 1][0]) / 2;
              const gy = (glowPath[0][1] + glowPath[glowPath.length - 1][1]) / 2;
              const gGrad = ctx.createRadialGradient(gx, gy, 0, gx, gy, 10);
              gGrad.addColorStop(0, blue);
              gGrad.addColorStop(1, "transparent");
              ctx.globalAlpha = 0.22;
              ctx.fillStyle = gGrad;
              ctx.beginPath();
              ctx.arc(gx, gy, 10, 0, Math.PI * 2);
              ctx.fill();
            }
          }
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
          animEnabledRef.current,
          hoveredRef.current
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
