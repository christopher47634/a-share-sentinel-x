"use client";

import Link from "next/link";

/* ─── helpers ─── */
function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

function DoneBadge() {
  return (
    <span className="inline-flex items-center rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-0.5 text-xs font-semibold text-emerald-200">
      ✅ 已完成
    </span>
  );
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <section
      className={cn(
        "rounded-3xl border border-white/10 bg-slate-950/70 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl",
        className,
      )}
    >
      {children}
    </section>
  );
}

function SectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-5">
      {eyebrow ? (
        <div className="mb-2 text-xs font-semibold uppercase tracking-[0.26em] text-cyan-300">
          {eyebrow}
        </div>
      ) : null}
      <h2 className="text-xl font-semibold text-slate-50">{title}</h2>
      {description ? (
        <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
      ) : null}
    </div>
  );
}

/* ─── Data ─── */
const capabilityCards = [
  {
    name: "AI 自动看盘",
    route: "/market-radar",
    requirement: "实时扫描大盘、板块、个股行情，提炼市场整体面貌",
    implementation:
      "Market Radar 扫描市场温度、市场状态、市场风格、热门板块、弱势板块、强势个股、高量比个股和风险暗流",
  },
  {
    name: "AI 自动盯盘",
    route: "/watch-tower",
    requirement: "根据用户关注标的与阈值，主动监控异动并生成提醒",
    implementation:
      "Watch Tower 展示系统信号、AI alerts、用户规则、阈值触发、持仓相关提醒和计划偏离提醒",
  },
  {
    name: "AI 自动解盘",
    route: "/causality-lab",
    requirement: "对行情变化进行分层归因，生成可读市场解读和风险观察",
    implementation:
      "Causality Lab 对标的进行行情事实、板块结构、市场风格、事件证据、持仓影响、计划检查和风险提示的分层归因",
  },
];

const alignmentRows = [
  {
    requirement: "AI 自动看盘",
    approach: "Market Radar 扫描市场温度、状态、风格、板块、个股",
    module: "/market-radar",
  },
  {
    requirement: "AI 自动盯盘",
    approach: "Watch Tower 系统信号+AI alerts+用户规则+阈值触发",
    module: "/watch-tower",
  },
  {
    requirement: "AI 自动解盘",
    approach: "Causality Lab 7层归因：事实→板块→风格→事件→持仓→计划→风险",
    module: "/causality-lab",
  },
  {
    requirement: "模拟实盘数据",
    approach: "Sentinel Core 内置 demo account/demo market snapshot 全套 mock",
    module: "src/lib/sentinel-core.ts",
  },
  {
    requirement: "风险提示",
    approach: "Risk Shield 组合风险+风险分数+风险项+提醒驱动风险",
    module: "/risk-shield",
  },
  {
    requirement: "盘后复盘",
    approach: "Trading Journal 账户+市场+提醒+交易+风险+明日清单",
    module: "/trading-journal",
  },
  {
    requirement: "用户规则驱动盯盘",
    approach: "Watch Tower Pro 用户标的+阈值设置+本地保存+规则启停+触发解释",
    module: "/watch-tower",
  },
];

const pipelineSteps = [
  { label: "市场扫描", route: "/market-radar" },
  { label: "用户盯盘规则", route: "/watch-tower" },
  { label: "AI 异动提醒", route: "/watch-tower" },
  { label: "AI 归因解盘", route: "/causality-lab" },
  { label: "风险护盾", route: "/risk-shield" },
  { label: "盘后复盘", route: "/trading-journal" },
];

const reviewSteps = [
  "打开 /submission 查看项目如何对齐笔试要求",
  "进入 /command-center 查看 AI 指挥舱",
  "进入 /market-radar 查看 AI 自动看盘",
  "进入 /watch-tower 设置或查看盯盘规则与触发提醒",
  "进入 /causality-lab 查看 AI 解盘",
  "进入 /risk-shield 查看组合风险",
  "进入 /trading-journal 查看盘后复盘",
];

/* ─── Page ─── */
export default function SubmissionPage() {
  return (
    <main className="min-h-screen bg-[#070A12] px-6 py-8 text-slate-100">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* ===== Header ===== */}
        <header className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-950 via-slate-950 to-cyan-950/30 p-8 shadow-[0_24px_120px_rgba(8,47,73,0.28)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.16),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(212,165,116,0.12),transparent_28%)]" />
          <div className="relative">
            <div className="mb-3 text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300">
              AI Native Investment Assistant MVP
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-white">
              笔试交付总览
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
              面向 A 股投资者的 AI 自动看盘、AI 自动盯盘、AI 自动解盘 MVP。
              通过 Sentinel Core、多页面产品闭环和模拟实盘数据，
              展示 AI 降低市场跟踪门槛、提升投资决策效率的能力。
            </p>
          </div>
        </header>

        {/* ===== Section 1: 核心能力卡片 ===== */}
        <section>
          <SectionTitle title="核心能力" description="三大 AI 能力覆盖看盘、盯盘、解盘全流程。" />
          <div className="grid gap-4 md:grid-cols-3">
            {capabilityCards.map((card) => (
              <Card key={card.name}>
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-semibold text-slate-50">{card.name}</h3>
                  <DoneBadge />
                </div>
                <Link
                  href={card.route}
                  className="mt-3 inline-block text-sm text-cyan-300 hover:underline"
                >
                  {card.route}
                </Link>
                <div className="mt-3 space-y-2">
                  <div>
                    <span className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      题目要求
                    </span>
                    <p className="mt-1 text-sm leading-6 text-slate-400">
                      {card.requirement}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      已实现内容
                    </span>
                    <p className="mt-1 text-sm leading-6 text-slate-300">
                      {card.implementation}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* ===== Section 2: 笔试任务要求对齐表 ===== */}
        <Card>
          <SectionTitle title="笔试任务要求对齐表" />
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-[0.2em] text-slate-500">
                  <th className="pb-3 pr-4 font-semibold">笔试要求</th>
                  <th className="pb-3 pr-4 font-semibold">实现方式</th>
                  <th className="pb-3 pr-4 font-semibold">对应模块</th>
                  <th className="pb-3 font-semibold">状态</th>
                </tr>
              </thead>
              <tbody>
                {alignmentRows.map((row) => (
                  <tr
                    key={row.requirement}
                    className="border-b border-white/[0.04] transition-colors hover:bg-white/[0.02]"
                  >
                    <td className="py-3 pr-4 font-medium text-slate-200">
                      {row.requirement}
                    </td>
                    <td className="py-3 pr-4 leading-6 text-slate-400">{row.approach}</td>
                    <td className="py-3 pr-4 font-mono text-xs text-cyan-300">
                      {row.module}
                    </td>
                    <td className="py-3">
                      <DoneBadge />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* ===== Section 3: 产品闭环图 ===== */}
        <Card>
          <SectionTitle title="产品闭环" />
          <div className="flex flex-wrap items-center gap-2 py-2">
            {pipelineSteps.map((step, i) => (
              <div key={step.label} className="flex items-center gap-2">
                <div className="flex flex-col items-center">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-slate-200">
                    {step.label}
                  </div>
                  <span className="mt-1 font-mono text-[10px] text-slate-500">
                    {step.route}
                  </span>
                </div>
                {i < pipelineSteps.length - 1 && (
                  <span className="text-lg text-slate-600">→</span>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* ===== Section 4: 技术架构摘要 ===== */}
        <Card>
          <SectionTitle title="技术架构" />
          <dl className="space-y-4">
            {[
              { label: "Frontend", value: "Next.js + TypeScript + Tailwind CSS" },
              { label: "Core Engine", value: "src/lib/sentinel-core.ts" },
              {
                label: "Watch Rules",
                value: "src/lib/watch-rule-storage.ts + src/lib/watch-rule-engine.ts",
              },
              {
                label: "主要页面",
                value:
                  "/command-center /market-radar /watch-tower /causality-lab /risk-shield /trading-journal",
              },
              {
                label: "数据方式",
                value: "模拟 A 股行情 + 模拟账户 + 本地规则存储",
              },
              {
                label: "设计原则",
                value: "无外部 API Key 也能完成演示，评审打开即可查看完整交互闭环",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex flex-col gap-1 sm:flex-row sm:gap-4"
              >
                <dt className="w-32 shrink-0 text-sm font-semibold text-slate-400">
                  {item.label}
                </dt>
                <dd className="text-sm leading-6 text-slate-300">{item.value}</dd>
              </div>
            ))}
          </dl>
        </Card>

        {/* ===== Section 5: 推荐评审路径 ===== */}
        <Card>
          <SectionTitle title="推荐评审路径" />
          <ol className="space-y-3">
            {reviewSteps.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-300/10 text-xs font-semibold text-cyan-200">
                  {i + 1}
                </span>
                <span className="text-sm leading-6 text-slate-300">{step}</span>
              </li>
            ))}
          </ol>
        </Card>

        {/* ===== Footer ===== */}
        <footer className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-5 text-sm leading-6 text-amber-100">
          本项目为 AI 原生投资助理 MVP 演示，仅用于模拟实盘、市场观察和学习展示，不构成投资建议。
        </footer>
      </div>
    </main>
  );
}
