"use client";

/**
 * /visual-test/sectors — P1H-cardfix-2 debug page
 *
 * Displays all 10 sector watermark cards in two sizes:
 *   Section 1: Enlarged 320x180 for detailed inspection
 *   Section 2: Real homepage grid size for final review
 *
 * Each card shows the full watermark without text overlay,
 * plus a version with the left-side dark overlay applied.
 */

import { sectors } from "@/mock/sectors";
import { sectorIconMap, SectorFallback } from "@/components/icons/SectorIcons";
import SectorVisualBackground from "@/components/sector/SectorVisualBackground";
import Link from "next/link";

const iconMap = sectorIconMap;

export default function SectorsDebugPage() {
  const sortedSectors = [...sectors].sort((a, b) => a.hotRank - b.hotRank);

  return (
    <div className="min-h-screen p-8" style={{ background: "#080E1A" }}>
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-white mb-2">
          P1H-cardfix-2 板块水印 Debug
        </h1>
        <p className="text-sm text-gray-400 mb-1">
          10个板块大号行业主体水印 — 不看文字也能区分行业方向。
        </p>
        <p className="text-xs text-gray-600">
          主图形scale 1.4-2.2x · 主线条1.5-2.5px · opacity 0.26-0.36 · 左侧暗色遮罩保证可读性
        </p>
      </div>

      {/* ==================== Section 1: Enlarged Cards (320x180) ==================== */}
      <section className="mb-16">
        <h2 className="text-lg font-semibold text-white mb-1">
          放大检查 — 320×180 无遮罩
        </h2>
        <p className="text-xs text-gray-500 mb-6">
          纯水印，无文字遮罩，用于检查主体图形是否清晰可辨认
        </p>

        <div className="grid grid-cols-5 gap-5">
          {sortedSectors.map((sector) => (
            <div key={`enlarged-${sector.id}`} className="space-y-2">
              {/* Label */}
              <div className="flex items-center gap-2">
                <span
                  className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                  style={{
                    background: `${sector.accentColor}20`,
                    color: sector.accentColor,
                    border: `1px solid ${sector.accentColor}33`,
                  }}
                >
                  {sector.visualType}
                </span>
                <span className="text-xs text-gray-400">{sector.name}</span>
              </div>

              {/* Enlarged card — 320x180, no text overlay */}
              <div
                className="relative overflow-hidden rounded-xl"
                style={{
                  width: 320,
                  height: 180,
                  background:
                    "linear-gradient(135deg, rgba(21,29,45,0.96) 0%, rgba(13,20,33,0.98) 55%, rgba(8,13,24,1) 100%)",
                  border: `1px solid ${sector.accentColor}30`,
                }}
              >
                <SectorVisualBackground
                  visualType={sector.visualType}
                  accentColor={sector.accentColor}
                  intensity="medium"
                />

                {/* Minimal label overlay — just to show which sector */}
                <div className="absolute bottom-2 left-3 z-10">
                  <span
                    className="text-[11px] font-mono px-2 py-0.5 rounded"
                    style={{
                      background: "rgba(0,0,0,0.6)",
                      color: sector.accentColor,
                      border: `1px solid ${sector.accentColor}22`,
                    }}
                  >
                    {sector.visualType}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== Section 2: Enlarged with Left Overlay ==================== */}
      <section className="mb-16">
        <h2 className="text-lg font-semibold text-white mb-1">
          放大检查 — 320×180 + 左侧暗色遮罩
        </h2>
        <p className="text-xs text-gray-500 mb-6">
          模拟实际卡片效果：水印 + 左侧遮罩 + 文字内容
        </p>

        <div className="grid grid-cols-5 gap-5">
          {sortedSectors.map((sector) => {
            const Icon = iconMap[sector.icon] || SectorFallback;
            const isUp = sector.changePercent >= 0;

            return (
              <div key={`overlay-${sector.id}`} className="space-y-2">
                {/* Label */}
                <div className="flex items-center gap-2">
                  <span
                    className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                    style={{
                      background: `${sector.accentColor}20`,
                      color: sector.accentColor,
                      border: `1px solid ${sector.accentColor}33`,
                    }}
                  >
                    {sector.visualType}
                  </span>
                  <span className="text-xs text-gray-400">{sector.name}</span>
                </div>

                {/* Card with overlay + content */}
                <div
                  className="relative overflow-hidden rounded-xl"
                  style={{
                    width: 320,
                    height: 180,
                    background:
                      "linear-gradient(135deg, rgba(21,29,45,0.96) 0%, rgba(13,20,33,0.98) 55%, rgba(8,13,24,1) 100%)",
                    border: `1px solid ${sector.accentColor}30`,
                  }}
                >
                  {/* Watermark */}
                  <SectorVisualBackground
                    visualType={sector.visualType}
                    accentColor={sector.accentColor}
                    intensity="medium"
                  />

                  {/* Left-side dark overlay */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(90deg, rgba(2,6,18,0.65) 0%, rgba(2,6,18,0.45) 40%, transparent 70%)",
                    }}
                  />

                  {/* Content */}
                  <div className="relative z-10 p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{
                          background: `${sector.accentColor}28`,
                          border: `1px solid ${sector.accentColor}40`,
                        }}
                      >
                        <Icon size={20} style={{ color: sector.accentColor }} />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-white">
                          {sector.name}
                        </h3>
                        <p className="text-[10px] text-gray-500">
                          {sector.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className="text-xl font-bold font-mono"
                        style={{
                          color: isUp ? "var(--up)" : "var(--down)",
                        }}
                      >
                        {isUp ? "+" : ""}
                        {sector.changePercent.toFixed(2)}%
                      </span>
                      <span className="text-[10px] text-gray-600 font-mono">
                        #{sector.hotRank}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 mt-3 pt-2 border-t border-white/5">
                      <div>
                        <span className="text-[9px] text-gray-600 block">
                          成交额
                        </span>
                        <span className="text-xs text-gray-400 font-mono">
                          {sector.turnover}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] text-gray-600 block">
                          资金流
                        </span>
                        <span className="text-xs text-gray-400 font-mono">
                          {sector.capitalInflow}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ==================== Section 3: Real Homepage Size ==================== */}
      <section className="mb-16">
        <h2 className="text-lg font-semibold text-white mb-1">
          实际首页尺寸 — 5列网格
        </h2>
        <p className="text-xs text-gray-500 mb-6">
          模拟首页板块卡片真实尺寸，检查缩略状态下的辨识度
        </p>

        <div className="grid grid-cols-5 gap-3">
          {sortedSectors.map((sector) => {
            const Icon = iconMap[sector.icon] || SectorFallback;
            const isUp = sector.changePercent >= 0;

            return (
              <div
                key={`real-${sector.id}`}
                className="relative overflow-hidden rounded-2xl group"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(21,29,45,0.96) 0%, rgba(13,20,33,0.98) 55%, rgba(8,13,24,1) 100%)",
                  border: `1px solid ${sector.accentColor}25`,
                }}
              >
                {/* Watermark */}
                <SectorVisualBackground
                  visualType={sector.visualType}
                  accentColor={sector.accentColor}
                  intensity="subtle"
                />

                {/* Left overlay */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(2,6,18,0.65) 0%, rgba(2,6,18,0.45) 40%, transparent 70%)",
                  }}
                />

                {/* Content */}
                <div className="relative z-10 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{
                        background: `${sector.accentColor}20`,
                        border: `1px solid ${sector.accentColor}30`,
                      }}
                    >
                      <Icon size={18} style={{ color: sector.accentColor }} />
                    </div>
                    <span className="text-[10px] text-gray-600 font-mono">
                      #{sector.hotRank}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-white mb-1">
                    {sector.name}
                  </h3>

                  <div className="flex items-center gap-1.5 mb-2">
                    <span
                      className="text-lg font-bold font-mono"
                      style={{
                        color: isUp ? "var(--up)" : "var(--down)",
                      }}
                    >
                      {isUp ? "+" : ""}
                      {sector.changePercent.toFixed(2)}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/5">
                    <div>
                      <span className="text-[9px] text-gray-600 block">
                        成交额
                      </span>
                      <span className="text-xs text-gray-400 font-mono">
                        {sector.turnover}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-gray-600 block">
                        资金流
                      </span>
                      <span className="text-xs text-gray-400 font-mono">
                        {sector.capitalInflow}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Debug hover label */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                  <span
                    className="text-[9px] font-mono px-1.5 py-0.5 rounded"
                    style={{
                      background: "rgba(0,0,0,0.7)",
                      color: sector.accentColor,
                      border: `1px solid ${sector.accentColor}33`,
                    }}
                  >
                    {sector.visualType}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ==================== Section 4: Intensity Comparison ==================== */}
      <section className="mb-16">
        <h2 className="text-lg font-semibold text-white mb-1">
          强度对比 — subtle / medium / strong
        </h2>
        <p className="text-xs text-gray-500 mb-6">
          同一板块三种强度，检查opacity梯度是否合理
        </p>

        <div className="space-y-4">
          {sortedSectors.slice(0, 3).map((sector) => (
            <div key={`intensity-${sector.id}`} className="flex items-start gap-4">
              <span
                className="text-xs font-mono px-2 py-1 rounded mt-2 shrink-0 w-20 text-center"
                style={{
                  background: `${sector.accentColor}20`,
                  color: sector.accentColor,
                  border: `1px solid ${sector.accentColor}33`,
                }}
              >
                {sector.name}
              </span>

              <div className="flex gap-3">
                {(["subtle", "medium", "strong"] as const).map((intensity) => (
                  <div key={intensity} className="space-y-1">
                    <span className="text-[9px] text-gray-600 font-mono block text-center">
                      {intensity}
                    </span>
                    <div
                      className="relative overflow-hidden rounded-lg"
                      style={{
                        width: 200,
                        height: 110,
                        background:
                          "linear-gradient(135deg, rgba(21,29,45,0.96) 0%, rgba(13,20,33,0.98) 55%, rgba(8,13,24,1) 100%)",
                        border: `1px solid ${sector.accentColor}20`,
                      }}
                    >
                      <SectorVisualBackground
                        visualType={sector.visualType}
                        accentColor={sector.accentColor}
                        intensity={intensity}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <div className="mt-8 text-center space-x-4">
        <Link
          href="/visual-test"
          className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          ← visual-test 主页
        </Link>
        <Link
          href="/"
          className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          ← 返回首页
        </Link>
      </div>
    </div>
  );
}
