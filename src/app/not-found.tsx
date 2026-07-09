"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import GlassCard from "@/components/common/GlassCard";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0a0a1a] to-[#1a1a2e] p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <GlassCard tilt={false} glow={false} className="px-12 py-10 text-center">
          <h1 className="mb-2 text-6xl font-bold text-[var(--accent)]">404</h1>
          <p className="mb-6 text-lg text-[var(--text-muted)]">页面不存在</p>
          <Link
            href="/"
            className="inline-block rounded-lg bg-[var(--accent)] px-6 py-2.5 text-sm font-medium text-[var(--bg-primary)] transition hover:brightness-110"
          >
            返回首页
          </Link>
        </GlassCard>
      </motion.div>
    </main>
  );
}
