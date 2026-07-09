"use client";

import { motion } from "framer-motion";

interface LoadingStateProps {
  text?: string;
}

export default function LoadingState({ text = "加载中..." }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8 min-h-[160px]">
      <div className="relative w-8 h-8">
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-[rgba(255,255,255,0.06)]"
          style={{ borderTopColor: "var(--accent)" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
      <span className="text-xs text-[var(--text-muted)] tracking-wide">
        {text}
      </span>
    </div>
  );
}
