"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";
import type { MarketCandle } from "@/types/market";

export default function MiniTrendChart({
  data,
  positive,
  className,
}: {
  data: MarketCandle[];
  positive?: boolean;
  className?: string;
}) {
  const gradientId = useId().replace(/:/g, "");
  const pointsData = data.slice(-72);
  const closes = pointsData.map((item) => item.close);
  const min = closes.length ? Math.min(...closes) : 0;
  const max = closes.length ? Math.max(...closes) : 0;
  const range = max - min || 1;
  const width = 320;
  const height = 118;
  const padX = 8;
  const padY = 14;
  const toneUp = positive ?? (closes.at(-1) ?? 0) >= (closes[0] ?? 0);
  const color = toneUp ? "#34D399" : "#F87171";

  const points = pointsData.map((item, index) => {
    const x =
      pointsData.length <= 1
        ? width / 2
        : padX + (index / (pointsData.length - 1)) * (width - padX * 2);
    const y = height - padY - ((item.close - min) / range) * (height - padY * 2);
    return x.toFixed(2) + "," + y.toFixed(2);
  });

  const linePath = points.length ? "M" + points.join(" L") : "";
  const areaPath = points.length
    ? linePath + " L" + (width - padX) + "," + (height - padY) + " L" + padX + "," + (height - padY) + " Z"
    : "";
  const lastPoint = points.at(-1)?.split(",");

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/10 bg-black/15 p-3",
        className
      )}
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
            TREND
          </p>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">走势快照</h3>
        </div>
        <div className="text-right text-[10px] leading-4 text-[var(--text-muted)]">
          <div>近 {pointsData.length || "—"} 根K线</div>
          <div className="font-mono-nums">
            H {max ? max.toFixed(2) : "—"} / L {min ? min.toFixed(2) : "—"}
          </div>
        </div>
      </div>

      <svg
        viewBox={"0 0 " + width + " " + height}
        preserveAspectRatio="none"
        className="h-[118px] w-full"
        role="img"
        aria-label="股票走势快照"
      >
        <defs>
          <linearGradient id={gradientId + "-trend"} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.28" />
            <stop offset="72%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={"M" + padX + "," + (height - padY) + " H" + (width - padX)} stroke="rgba(255,255,255,0.07)" />
        {areaPath && <path d={areaPath} fill={"url(#" + gradientId + "-trend)"} />}
        {linePath && (
          <path
            d={linePath}
            fill="none"
            stroke={color}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.4"
          />
        )}
        {lastPoint && (
          <circle
            cx={lastPoint[0]}
            cy={lastPoint[1]}
            r="3.5"
            fill={color}
            stroke="rgba(7,13,25,0.95)"
            strokeWidth="2"
          />
        )}
      </svg>
    </div>
  );
}
