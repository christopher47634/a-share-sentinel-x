"use client";

import { useRef, useEffect, useCallback } from "react";

interface PharmaCanvasProps {
  width: number;
  height: number;
  animationsEnabled?: boolean;
  hovered?: boolean;
  hoverIntensity?: number;
}

/**
 * Canvas 2D visual for 医药 (Pharma)
 * - Molecular nodes: 5-6 small circles connected by thin lines
 * - Node positions: scattered but forming a rough network
 * - DNA curve: faint double-helix curve along bottom (opacity 0.06-0.10)
 * - Heartbeat line: ECG-style line that pulses every 4-6s
 * - Molecular connections: nodes periodically connect/disconnect (8-12s cycle)
 * - Hover: nodes brighten, connections solidify
 * - Colors: rose #e11d48 + violet #7c3aed
 * - Feel: molecular biology, research precision
 */
export default function PharmaCanvas({
  width,
  height,
  animationsEnabled = true,
  hovered = false,
  hoverIntensity = 0,
}: PharmaCanvasProps) {
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

        const rose = "#e11d48";
        const violet = "#7c3aed";
        const glowMul = isHover ? 1.2 : 1;

        // --- Molecular nodes ---
        const nodes = [
          { x: w * 0.20, y: h * 0.25, r: 3, color: rose },
          { x: w * 0.45, y: h * 0.18, r: 2.5, color: violet },
          { x: w * 0.65, y: h * 0.30, r: 3, color: rose },
          { x: w * 0.35, y: h * 0.50, r: 2, color: violet },
          { x: w * 0.75, y: h * 0.48, r: 2.5, color: rose },
          { x: w * 0.55, y: h * 0.60, r: 2, color: violet },
        ];

        // Connections between nodes
        const connections: [number, number][] = [
          [0, 1], [1, 2], [0, 3], [2, 4], [3, 5], [4, 5], [1, 3],
        ];

        // Connection visibility cycle (8-12s)
        const connectCycle = animOn
          ? 0.5 + 0.5 * Math.sin(t * ((2 * Math.PI) / 10))
          : 0.5;
        const connectAlpha = isHover ? 0.22 : 0.10 + 0.10 * connectCycle;

        connections.forEach(([a, b]) => {
          const nodeA = nodes[a];
          const nodeB = nodes[b];
          ctx.globalAlpha = connectAlpha * glowMul;
          ctx.strokeStyle = violet;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(nodeA.x, nodeA.y);
          ctx.lineTo(nodeB.x, nodeB.y);
          ctx.stroke();
        });

        // Draw nodes
        nodes.forEach((node) => {
          const nodePulse = animOn
            ? 1 + 0.15 * Math.sin(t * ((2 * Math.PI) / 8) + node.x * 0.01)
            : 1;

          // Node glow on hover
          if (isHover) {
            const gGrad = ctx.createRadialGradient(
              node.x, node.y, 0,
              node.x, node.y, node.r * 4
            );
            gGrad.addColorStop(0, node.color);
            gGrad.addColorStop(1, "transparent");
            ctx.globalAlpha = 0.06;
            ctx.fillStyle = gGrad;
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.r * 4, 0, Math.PI * 2);
            ctx.fill();
          }

          // Node core
          ctx.globalAlpha = ((isHover ? 0.22 : 0.14) + hoverIntensityRef.current * 0.04) * glowMul * nodePulse;
          ctx.fillStyle = node.color;
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
          ctx.fill();

          // Node ring
          ctx.globalAlpha = 0.08 * glowMul;
          ctx.strokeStyle = node.color;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.r * 1.8, 0, Math.PI * 2);
          ctx.stroke();
        });

        // --- DNA double-helix curve (bottom) ---
        const helixY = h * 0.82;
        const helixAmp = h * 0.04;
        const helixFreq = 4;

        // Strand 1
        ctx.globalAlpha = 0.12 * glowMul;
        ctx.strokeStyle = rose;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        for (let x = 0; x <= w; x += 2) {
          const wave = Math.sin((x / w) * Math.PI * helixFreq + t * 0.3) * helixAmp;
          const y = helixY + wave;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Strand 2 (phase-shifted)
        ctx.globalAlpha = 0.10 * glowMul;
        ctx.strokeStyle = violet;
        ctx.beginPath();
        for (let x = 0; x <= w; x += 2) {
          const wave = Math.sin((x / w) * Math.PI * helixFreq + t * 0.3 + Math.PI) * helixAmp;
          const y = helixY + wave;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Helix cross-links
        ctx.globalAlpha = 0.04 * glowMul;
        ctx.strokeStyle = violet;
        ctx.lineWidth = 0.3;
        for (let x = 0; x < w; x += w / 12) {
          const wave1 = Math.sin((x / w) * Math.PI * helixFreq + t * 0.3) * helixAmp;
          const wave2 = Math.sin((x / w) * Math.PI * helixFreq + t * 0.3 + Math.PI) * helixAmp;
          ctx.beginPath();
          ctx.moveTo(x, helixY + wave1);
          ctx.lineTo(x, helixY + wave2);
          ctx.stroke();
        }

        // --- Heartbeat / ECG line ---
        const ecgY = h * 0.72;
        const ecgH = h * 0.10;
        const ecgPeriod = 5; // 5s per heartbeat
        const ecgPhase = animOn ? (t % ecgPeriod) / ecgPeriod : 0;

        ctx.globalAlpha = 0.14 * glowMul;
        ctx.strokeStyle = rose;
        ctx.lineWidth = 0.8;
        ctx.beginPath();

        for (let x = 0; x <= w; x += 1) {
          const xNorm = x / w;
          let y = 0;
          const localPhase = (xNorm + ecgPhase) % 1;

          if (localPhase < 0.3) {
            y = 0;
          } else if (localPhase < 0.35) {
            y = -0.3 * Math.sin(((localPhase - 0.3) / 0.05) * Math.PI);
          } else if (localPhase < 0.4) {
            y = 0;
          } else if (localPhase < 0.43) {
            y = -0.8 * Math.sin(((localPhase - 0.4) / 0.03) * Math.PI);
          } else if (localPhase < 0.48) {
            y = 1.0 * Math.sin(((localPhase - 0.43) / 0.05) * Math.PI);
          } else if (localPhase < 0.52) {
            y = -0.5 * Math.sin(((localPhase - 0.48) / 0.04) * Math.PI);
          } else if (localPhase < 0.6) {
            y = 0;
          } else if (localPhase < 0.68) {
            y = 0.3 * Math.sin(((localPhase - 0.6) / 0.08) * Math.PI);
          } else {
            y = 0;
          }

          const py = ecgY + y * ecgH;
          if (x === 0) ctx.moveTo(x, py);
          else ctx.lineTo(x, py);
        }
        ctx.stroke();

        // ECG glow dot at pulse point
        if (animOn) {
          const pulseX = ecgPhase * w;
          const pulseY = ecgY - ecgH * 0.8;
          ctx.globalAlpha = 0.15 * glowMul;
          ctx.fillStyle = rose;
          ctx.beginPath();
          ctx.arc(pulseX, pulseY, 2, 0, Math.PI * 2);
          ctx.fill();
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
