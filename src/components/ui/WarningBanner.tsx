"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Info, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "info" | "warning" | "error" | "success";

interface WarningBannerProps {
  message: string;
  variant?: Variant;
}

const VARIANT_STYLES: Record<
  Variant,
  { icon: typeof AlertTriangle; color: string; bg: string; border: string }
> = {
  info: {
    icon: Info,
    color: "#60A5FA",
    bg: "rgba(96,165,250,0.06)",
    border: "rgba(96,165,250,0.18)",
  },
  warning: {
    icon: AlertTriangle,
    color: "#FBBF24",
    bg: "rgba(251,191,36,0.06)",
    border: "rgba(251,191,36,0.18)",
  },
  error: {
    icon: XCircle,
    color: "#F87171",
    bg: "rgba(248,113,113,0.06)",
    border: "rgba(248,113,113,0.18)",
  },
  success: {
    icon: CheckCircle,
    color: "#34D399",
    bg: "rgba(52,211,153,0.06)",
    border: "rgba(52,211,153,0.18)",
  },
};

export default function WarningBanner({
  message,
  variant = "warning",
}: WarningBannerProps) {
  const v = VARIANT_STYLES[variant];
  const Icon = v.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex items-start gap-2.5 p-3.5 rounded-xl")}
      style={{
        background: v.bg,
        border: `1px solid ${v.border}`,
      }}
    >
      <Icon size={14} className="mt-0.5 shrink-0" style={{ color: v.color }} />
      <span
        className="text-xs leading-relaxed"
        style={{ color: `${v.color}cc` }}
      >
        {message}
      </span>
    </motion.div>
  );
}
