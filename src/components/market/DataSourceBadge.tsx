import { Database, Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MarketDataSource } from "@/types/market";

export default function DataSourceBadge({
  source,
  label,
  updatedAt,
  fallbackUsed = false,
  className,
}: {
  source: MarketDataSource;
  label: string;
  updatedAt?: string;
  fallbackUsed?: boolean;
  className?: string;
}) {
  const live = source !== "mock" && !fallbackUsed;
  const partial = source !== "mock" && fallbackUsed;
  const time = updatedAt
    ? new Intl.DateTimeFormat("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }).format(new Date(updatedAt))
    : "N/A";
  const Icon = live ? Wifi : partial ? Database : WifiOff;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium backdrop-blur-xl",
        live
          ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
          : partial
            ? "border-sky-400/20 bg-sky-400/10 text-sky-300"
            : "border-[var(--border-default)] bg-white/5 text-[var(--text-secondary)]",
        className
      )}
    >
      <Icon size={12} />
      <span>{label}</span>
      <span className="text-[var(--text-muted)]">{time}</span>
    </div>
  );
}
