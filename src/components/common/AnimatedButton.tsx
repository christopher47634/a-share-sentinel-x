"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedButtonProps {
  children: React.ReactNode;
  variant?: "default" | "buy" | "sell" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

const variants = {
  default:
    "bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-primary)] hover:bg-[var(--glass-bg-hover)] hover:border-[var(--glass-border-hover)]",
  buy: "bg-[var(--up-bg)] border border-[var(--up)] text-[var(--up)] hover:bg-[var(--up)] hover:text-[var(--bg-primary)]",
  sell: "bg-[var(--down-bg)] border border-[var(--down)] text-[var(--down)] hover:bg-[var(--down)] hover:text-[var(--bg-primary)]",
  ghost:
    "bg-transparent border border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-bg)]",
};

const sizes = {
  sm: "px-3 py-1.5 text-xs rounded-lg",
  md: "px-4 py-2 text-sm rounded-xl",
  lg: "px-6 py-3 text-base rounded-xl",
};

export default function AnimatedButton({
  children,
  variant = "default",
  size = "md",
  className,
  onClick,
  disabled,
}: AnimatedButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative font-medium transition-colors duration-200 cursor-pointer",
        "backdrop-blur-sm",
        variants[variant],
        sizes[size],
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {children}
    </motion.button>
  );
}
