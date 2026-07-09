"use client";

import { motion } from "framer-motion";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
}

export default function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="glass flex flex-col items-center justify-center gap-4 p-8 min-h-[200px] text-center"
    >
      {icon && (
        <div className="text-[var(--accent)] opacity-60">{icon}</div>
      )}
      <p className="text-[var(--text-primary)] text-base font-medium">{title}</p>
      {description && (
        <p className="text-[var(--text-muted)] text-sm max-w-xs">{description}</p>
      )}
    </motion.div>
  );
}
