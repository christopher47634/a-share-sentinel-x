"use client";

import { cn } from "@/lib/utils";

export type ChartType = "candlestick" | "area" | "line" | "bar";

const CHART_TYPES: { key: ChartType; label: string }[] = [
  { key: "candlestick", label: "蜡烛" },
  { key: "area", label: "面积" },
  { key: "line", label: "折线" },
  { key: "bar", label: "OHLC" },
];

interface ChartTypeSwitcherProps {
  value: ChartType;
  onChange: (type: ChartType) => void;
  disabled?: ChartType[]; // types to disable (e.g. ["candlestick","bar"] for intraday)
}

export default function ChartTypeSwitcher({
  value,
  onChange,
  disabled = [],
}: ChartTypeSwitcherProps) {
  return (
    <div className="flex items-center gap-0.5 bg-[rgba(255,255,255,0.03)] rounded-lg p-0.5 border border-[rgba(255,255,255,0.06)]">
      {CHART_TYPES.map(({ key, label }) => {
        const isDisabled = disabled.includes(key);
        return (
          <button
            key={key}
            onClick={() => !isDisabled && onChange(key)}
            disabled={isDisabled}
            className={cn(
              "px-2 py-1 rounded-md text-[10px] font-medium transition-all duration-200 whitespace-nowrap",
              value === key
                ? "bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]"
                : isDisabled
                ? "text-[var(--text-muted)] opacity-30 cursor-not-allowed"
                : "text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--surface-1)] cursor-pointer"
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
