"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface FpsMeterProps {
  className?: string;
}

export default function FpsMeter({ className = "" }: FpsMeterProps) {
  const [fps, setFps] = useState(0);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const rafRef = useRef<number>(0);

  const tick = useCallback(() => {
    frameCountRef.current += 1;
    const now = performance.now();
    const elapsed = now - lastTimeRef.current;

    if (elapsed >= 500) {
      const currentFps = Math.round((frameCountRef.current * 1000) / elapsed);
      setFps(currentFps);
      frameCountRef.current = 0;
      lastTimeRef.current = now;
    }

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [tick]);

  const color =
    fps >= 55
      ? "text-emerald-400"
      : fps >= 45
        ? "text-yellow-400"
        : "text-red-400";

  const bgOpacity =
    fps >= 55
      ? "bg-emerald-400/10"
      : fps >= 45
        ? "bg-yellow-400/10"
        : "bg-red-400/10";

  return (
    <div
      className={`fixed top-3 right-3 z-[9999] flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-[11px] backdrop-blur-sm ${bgOpacity} ${className}`}
      style={{
        background:
          fps >= 55
            ? "rgba(52,211,153,0.1)"
            : fps >= 45
              ? "rgba(250,204,21,0.1)"
              : "rgba(248,113,113,0.1)",
        border:
          fps >= 55
            ? "1px solid rgba(52,211,153,0.2)"
            : fps >= 45
              ? "1px solid rgba(250,204,21,0.2)"
              : "1px solid rgba(248,113,113,0.2)",
      }}
    >
      <span className={color}>FPS</span>
      <span className={`font-semibold tabular-nums ${color}`}>{fps}</span>
    </div>
  );
}
