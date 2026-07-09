"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Beaker, Eye, EyeOff } from "lucide-react";
import { sectors } from "@/mock/sectors";
import AdvancedSectorCard from "@/components/sector-visuals/AdvancedSectorCard";
import FpsMeter from "@/components/visual-lab/FpsMeter";

/**
 * Legend data: visualType → implementation label
 */
const VISUAL_LEGEND: { visualType: string; label: string; method: "canvas" | "css" | "both" }[] = [
  { visualType: "optical", label: "光通信 — 光束扫描", method: "both" },
  { visualType: "compute", label: "算力 — 网格脉冲", method: "both" },
  { visualType: "semiconductor", label: "半导体 — 晶格矩阵", method: "both" },
  { visualType: "new-energy", label: "新能源 — 能量流", method: "canvas" },
  { visualType: "robotics", label: "机器人 — 关节臂", method: "canvas" },
  { visualType: "low-altitude", label: "低空经济 — 航线弧", method: "canvas" },
  { visualType: "baijiu", label: "白酒 — 酒瓶波纹", method: "canvas" },
  { visualType: "mining", label: "矿山 — 地层矿脉", method: "canvas" },
  { visualType: "defense", label: "军工 — 雷达扫描", method: "canvas" },
  { visualType: "medicine", label: "医药 — 分子网络", method: "canvas" },
];

export default function VisualLabPage() {
  const [currentMode, setCurrentMode] = useState<"css" | "canvas">("canvas");
  const [animationsEnabled, setAnimationsEnabled] = useState(true);

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "linear-gradient(180deg, #020612 0%, #0a1628 100%)",
      }}
    >
      <FpsMeter />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Title section */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <Beaker size={22} className="text-[var(--accent)]" />
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">
              Sector Visual Identity System · 10 Sector Cards
            </h1>
          </div>
          <p className="text-sm text-[var(--text-muted)]">
            板块视觉身份系统 · 10 张卡片全览 · Canvas 2D 实验台
          </p>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-wrap items-center gap-4 mb-8"
        >
          {/* CSS / Canvas toggle */}
          <div
            className="flex items-center rounded-lg overflow-hidden"
            style={{
              border: "1px solid var(--border-subtle)",
              background: "var(--surface-1)",
            }}
          >
            <button
              onClick={() => setCurrentMode("css")}
              className="px-4 py-2 text-xs font-medium transition-all duration-200"
              style={{
                background: currentMode === "css" ? "var(--surface-3)" : "transparent",
                color: currentMode === "css" ? "var(--text-primary)" : "var(--text-muted)",
                borderRight: "1px solid var(--border-subtle)",
              }}
            >
              CSS
            </button>
            <button
              onClick={() => setCurrentMode("canvas")}
              className="px-4 py-2 text-xs font-medium transition-all duration-200"
              style={{
                background: currentMode === "canvas" ? "var(--surface-3)" : "transparent",
                color: currentMode === "canvas" ? "var(--text-primary)" : "var(--text-muted)",
              }}
            >
              Canvas
            </button>
          </div>

          {/* Animation toggle */}
          <button
            onClick={() => setAnimationsEnabled(!animationsEnabled)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200"
            style={{
              border: "1px solid var(--border-subtle)",
              background: animationsEnabled ? "var(--surface-2)" : "var(--surface-1)",
              color: animationsEnabled ? "var(--text-primary)" : "var(--text-muted)",
            }}
          >
            {animationsEnabled ? (
              <Eye size={14} className="text-[var(--accent)]" />
            ) : (
              <EyeOff size={14} />
            )}
            动画 {animationsEnabled ? "开" : "关"}
          </button>

          {/* Mode label */}
          <span className="text-[10px] text-[var(--text-muted)] font-mono ml-auto">
            mode: {currentMode} · animation: {animationsEnabled ? "on" : "off"} · sectors: {sectors.length}
          </span>
        </motion.div>

        {/* Card Grid — 2 columns on desktop, 1 on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {sectors.map((sector, i) => (
            <AdvancedSectorCard
              key={sector.id}
              sector={sector}
              mode={currentMode}
              animationsEnabled={animationsEnabled}
              index={i}
            />
          ))}
        </div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.8 }}
          className="mt-10 rounded-xl p-5"
          style={{
            background: "rgba(21,29,45,0.6)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <h2 className="text-sm font-semibold text-[var(--text-secondary)] mb-4">
            Visual Identity Legend · 视觉身份图例
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
            {VISUAL_LEGEND.map((item) => (
              <div
                key={item.visualType}
                className="flex items-center gap-2 rounded-lg px-3 py-2"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(148,163,184,0.08)",
                }}
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{
                    background:
                      item.method === "both"
                        ? "#34d399"
                        : item.method === "canvas"
                          ? "#6366f1"
                          : "#f59e0b",
                  }}
                />
                <div className="min-w-0">
                  <p className="text-[11px] text-[var(--text-primary)] truncate">
                    {item.label}
                  </p>
                  <p className="text-[9px] text-[var(--text-muted)] font-mono">
                    {item.method === "both"
                      ? "CSS + Canvas"
                      : item.method === "canvas"
                        ? "Canvas 2D"
                        : "CSS only"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 1.0 }}
          className="mt-8 text-center"
        >
          <p className="text-[11px] text-[var(--text-muted)]">
            展示全部 10 个板块的 Canvas 2D 视觉身份 · CSS 模式下仅前 3 个有独立 CSS 视觉
          </p>
          <Link
            href="/"
            className="inline-block mt-3 text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
          >
            ← 返回首页
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
