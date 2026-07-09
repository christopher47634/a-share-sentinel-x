"use client";

import { motion } from "framer-motion";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export default function ErrorState({
  title = "加载失败",
  description = "数据获取失败，请稍后重试",
  onRetry,
}: ErrorStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="glass flex flex-col items-center justify-center gap-4 p-8 min-h-[200px] text-center border border-[rgba(248,113,113,0.2)]"
    >
      <div className="w-10 h-10 rounded-full bg-[rgba(248,113,113,0.12)] flex items-center justify-center">
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          stroke="#F87171"
          strokeWidth="1.5"
          strokeLinecap="round"
        >
          <circle cx="10" cy="10" r="8" />
          <line x1="10" y1="6" x2="10" y2="11" />
          <circle cx="10" cy="14" r="0.5" fill="#F87171" />
        </svg>
      </div>
      <p className="text-[var(--text-primary)] text-base font-medium">{title}</p>
      <p className="text-[var(--text-muted)] text-sm max-w-xs">{description}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 px-5 py-2 text-sm font-medium rounded-lg bg-[rgba(248,113,113,0.12)] text-[#F87171] border border-[rgba(248,113,113,0.25)] hover:bg-[rgba(248,113,113,0.2)] transition-colors duration-200"
        >
          重新加载
        </button>
      )}
    </motion.div>
  );
}
