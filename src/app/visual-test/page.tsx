"use client";

/**
 * /visual-test — Development preview page
 *
 * Section 1: 10 small cards (P1-E watermarks) — unchanged
 * Section 2: 10 Hero banners (P1-F hero artwork) — each full-width
 * Section 3: 3 P1-H Hero samples (optical / defense / medicine)
 */

import { sectors } from "@/mock/sectors";
import { sectorIconMap, SectorFallback } from "@/components/icons/SectorIcons";
import SectorVisualBackground from "@/components/sector/SectorVisualBackground";
import SectorHeroArtwork from "@/components/sector/SectorHeroArtwork";
import HeroKpiCard from "@/components/sector/HeroKpiCard";
import Link from "next/link";

const iconMap = sectorIconMap;

export default function VisualTestPage() {
  const sortedSectors = [...sectors].sort((a, b) => a.hotRank - b.hotRank);

  // P1-H sample sectors (optical, defense, medicine)
  const p1hSectors = sectors.filter((s) =>
    ["optical", "defense", "medicine"].includes(s.visualType)
  );

  return (
    <div
      className="min-h-screen p-8"
      style={{ background: "#080E1A" }}
    >
      {/* ==================== Section 1: Small Cards (P1-E) ==================== */}
      <h1 className="text-2xl font-bold text-white mb-2">
        P1-E 行业符号水印版 — 小卡片
      </h1>
      <p className="text-sm text-gray-400 mb-8">
        右侧40%放行业主视觉水印，左侧60%保持干净。每张卡片只显示板块名和背景水印。
      </p>

      {/* 2 rows × 5 columns */}
      <div className="grid grid-cols-5 gap-4">
        {sortedSectors.map((sector) => {
          const Icon = iconMap[sector.icon] || SectorFallback;

          return (
            <div
              key={sector.id}
              className="relative overflow-hidden rounded-2xl group"
              style={{
                background:
                  "linear-gradient(145deg, rgba(255,255,255,0.075), rgba(255,255,255,0.025)), rgba(15,22,36,0.72)",
                backdropFilter: "blur(22px) saturate(140%)",
                WebkitBackdropFilter: "blur(22px) saturate(140%)",
                border: "1px solid rgba(255,255,255,0.12)",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.08), 0 24px 80px rgba(0,0,0,0.42)",
                minHeight: "160px",
              }}
            >
              {/* Watermark background */}
              <SectorVisualBackground
                visualType={sector.visualType}
                accentColor={sector.accentColor}
                intensity="subtle"
              />

              {/* Content — minimal */}
              <div className="relative z-10 p-5">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{
                    background: `${sector.accentColor}28`,
                    border: `1px solid ${sector.accentColor}40`,
                  }}
                >
                  <Icon size={20} style={{ color: sector.accentColor }} />
                </div>
                <h2 className="text-base font-semibold text-white mb-1">
                  {sector.name}
                </h2>
                <p className="text-[10px] text-gray-500 font-mono">
                  {sector.visualType}
                </p>
              </div>

              {/* Debug: visualType label on hover */}
              <div className="absolute bottom-2 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span
                  className="text-[9px] font-mono px-2 py-0.5 rounded"
                  style={{
                    background: "rgba(0,0,0,0.6)",
                    color: sector.accentColor,
                    border: `1px solid ${sector.accentColor}33`,
                  }}
                >
                  {sector.visualType} · {sector.accentColor}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ==================== Section 2: Hero Artwork (P1-F) ==================== */}
      <div className="mt-16 mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">
          P1-F Hero Artwork — 横向大画幅构图
        </h1>
        <p className="text-sm text-gray-400 mb-8">
          左侧35%文字安全区，右侧40%行业主视觉。每个Hero单独展示，用于检查构图是否成立。
        </p>
      </div>

      <div className="space-y-6">
        {sortedSectors.map((sector) => {
          const Icon = iconMap[sector.icon] || SectorFallback;

          return (
            <div key={`hero-${sector.id}`} className="space-y-2">
              {/* Label */}
              <div className="flex items-center gap-3 px-1">
                <span
                  className="text-xs font-mono px-2 py-0.5 rounded"
                  style={{
                    background: `${sector.accentColor}20`,
                    color: sector.accentColor,
                    border: `1px solid ${sector.accentColor}33`,
                  }}
                >
                  {sector.visualType}
                </span>
                <span className="text-sm font-semibold text-white">
                  {sector.name}
                </span>
                <span className="text-xs text-gray-500">
                  {sector.description}
                </span>
              </div>

              {/* Hero banner */}
              <div
                className="relative overflow-hidden rounded-2xl"
                style={{
                  background:
                    "linear-gradient(145deg, rgba(255,255,255,0.075), rgba(255,255,255,0.025)), rgba(15,22,36,0.72)",
                  backdropFilter: "blur(22px) saturate(140%)",
                  WebkitBackdropFilter: "blur(22px) saturate(140%)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.08), 0 24px 80px rgba(0,0,0,0.42)",
                  minHeight: "200px",
                }}
              >
                {/* P1-F Hero Artwork */}
                <SectorHeroArtwork
                  visualType={sector.visualType}
                  accentColor={sector.accentColor}
                />

                {/* Simulated left-side text content to verify text safe zone */}
                <div className="relative z-10 p-6 flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center"
                      style={{
                        background: `${sector.accentColor}28`,
                        border: `1px solid ${sector.accentColor}40`,
                      }}
                    >
                      <Icon size={28} style={{ color: sector.accentColor }} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        {sector.name}
                      </h2>
                      <p className="text-sm text-gray-400 mt-0.5">
                        {sector.description}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className="text-2xl font-bold font-mono"
                      style={{ color: sector.accentColor }}
                    >
                      +3.85%
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      热度 #{sector.hotRank}
                    </div>
                  </div>
                </div>

                {/* KPI bar — verify it's readable over artwork */}
                <div className="relative z-10 px-6 pb-5 flex items-center gap-3 pt-4">
                  <HeroKpiCard label="成交额" value={sector.turnover} tone="neutral" />
                  <HeroKpiCard label="资金流入" value={sector.capitalInflow} tone="positive" />
                  <HeroKpiCard label="成分股数" value="15" tone="neutral" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ==================== Section 3: P1-H Hero Samples ==================== */}
      <section className="mt-20 mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">
          P1-H Hero 样板 (3个)
        </h1>
        <p className="text-sm text-gray-400 mb-8">
          统一渲染系统：5个primitive (GlowLine/GlowNode/AmbientMesh/NoiseOverlay/DepthGroup)，
          6层结构，渐变描边，线条0.45-1.2px。只展示optical/defense/medicine三个样板Hero。
        </p>

        <div className="space-y-10">
          {p1hSectors.map((sector) => {
            const Icon = iconMap[sector.icon] || SectorFallback;

            return (
              <div key={`p1h-${sector.id}`} className="space-y-3">
                {/* Label */}
                <div className="flex items-center gap-3 px-1">
                  <span
                    className="text-xs font-mono px-2 py-0.5 rounded"
                    style={{
                      background: `${sector.accentColor}20`,
                      color: sector.accentColor,
                      border: `1px solid ${sector.accentColor}33`,
                    }}
                  >
                    P1-H · {sector.visualType}
                  </span>
                  <span className="text-sm font-semibold text-white">
                    {sector.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {sector.description}
                  </span>
                </div>

                {/* Hero banner — wider, no KPI bar, just the artwork */}
                <div
                  className="relative overflow-hidden rounded-2xl"
                  style={{
                    background:
                      "linear-gradient(145deg, rgba(255,255,255,0.075), rgba(255,255,255,0.025)), rgba(15,22,36,0.72)",
                    backdropFilter: "blur(22px) saturate(140%)",
                    WebkitBackdropFilter: "blur(22px) saturate(140%)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    boxShadow:
                      "inset 0 1px 0 rgba(255,255,255,0.08), 0 24px 80px rgba(0,0,0,0.42)",
                    minHeight: "240px",
                  }}
                >
                  {/* P1-H Hero Artwork */}
                  <SectorHeroArtwork
                    visualType={sector.visualType}
                    accentColor={sector.accentColor}
                  />

                  {/* Simulated left-side text content */}
                  <div className="relative z-10 p-8 flex items-center gap-5">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center"
                      style={{
                        background: `${sector.accentColor}28`,
                        border: `1px solid ${sector.accentColor}40`,
                      }}
                    >
                      <Icon size={32} style={{ color: sector.accentColor }} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        {sector.name}
                      </h2>
                      <p className="text-sm text-gray-400 mt-1">
                        {sector.description}
                      </p>
                      <p className="text-xs text-gray-600 mt-1 font-mono">
                        visualType: {sector.visualType} · accentColor: {sector.accentColor}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <div className="mt-8 text-center">
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
