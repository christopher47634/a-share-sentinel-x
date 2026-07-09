"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { cn, formatCurrency } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string | number;
  change?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
  delay?: number;
  animate?: boolean;
}

function useCountUp(end: number, duration: number = 1200) {
  const [value, setValue] = useState(0);
  const ref = useRef<number>(0);

  useEffect(() => {
    const startTime = performance.now();
    const startValue = ref.current;

    function update(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (end - startValue) * eased;
      setValue(current);

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
    ref.current = end;
  }, [end, duration]);

  return value;
}

export default function MetricCard({
  label,
  value,
  change,
  suffix = "",
  prefix = "",
  className,
  delay = 0,
  animate = true,
}: MetricCardProps) {
  const numericValue = typeof value === "number" ? value : parseFloat(value);
  const isNumeric = !isNaN(numericValue);
  const animatedRaw = useCountUp(numericValue, 1200);

  const displayValue = isNumeric && animate
    ? formatCurrency(animatedRaw)
    : typeof value === "number"
      ? formatCurrency(value)
      : value;

  const changeColor =
    change !== undefined
      ? change > 0
        ? "text-up"
        : change < 0
        ? "text-down"
        : "text-[var(--text-secondary)]"
      : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: delay * 0.08,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={cn(
        "glass p-4 flex flex-col gap-1.5 group relative overflow-hidden",
        className
      )}
      style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)" }}
    >
      {/* Subtle hover texture */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(212,165,116,0.04), transparent 60%)",
        }}
      />
      {/* Faint micro trendline */}
      <svg className="absolute bottom-1 right-1 w-20 h-6 pointer-events-none opacity-[0.08]" viewBox="0 0 80 24">
        <polyline
          points="0,18 8,16 16,14 24,17 32,12 40,10 48,13 56,8 64,6 72,9 80,4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={change !== undefined ? (change >= 0 ? "text-up" : "text-down") : "text-[var(--text-muted)]"}
        />
      </svg>
      <span className="relative z-10 text-xs text-[var(--text-muted)] uppercase tracking-wider font-medium">
        {label}
      </span>
      <div className="relative z-10 flex items-baseline gap-1.5">
        {prefix && (
          <span className="text-sm text-[var(--text-secondary)]">{prefix}</span>
        )}
        <span className="text-xl font-semibold text-[var(--text-primary)] font-mono-nums tracking-tight">
          {displayValue}
        </span>
        {suffix && (
          <span className="text-xs text-[var(--text-secondary)]">{suffix}</span>
        )}
      </div>
      {change !== undefined && (
        <span className={cn("relative z-10 text-xs font-medium font-mono-nums", changeColor)}>
          {change > 0 ? "+" : ""}
          {change.toFixed(2)}%
        </span>
      )}
    </motion.div>
  );
}
