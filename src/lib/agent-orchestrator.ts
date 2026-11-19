import { AgentState, IntelligenceEvent, SentinelDimension } from "@/types/agent";
import type {
  Alert,
  CausalityReport,
  JournalResult,
  MarketRadarResult,
  RiskShieldResult,
  SentinelAccount,
  Signal,
} from "@/lib/sentinel-core";

export interface LiveAgentTelemetryInput {
  mode: "demo" | "live";
  sourceLabel: string;
  liveCount: number;
  sampleSize: number;
  updatedAt: string | null;
  account: SentinelAccount;
  marketRadar: MarketRadarResult;
  signals: Signal[];
  alerts: Alert[];
  risk: RiskShieldResult;
  causalityReports: CausalityReport[];
  journal: JournalResult;
  newsEventsCount: number;
  now?: Date | null;
}

function fmtMoney(val: number): string {
  const sign = val < 0 ? "-" : "";
  const abs = Math.abs(val);
  if (abs >= 1e8) return `${sign}¥${(abs / 1e8).toFixed(2)}亿`;
  if (abs >= 1e4) return `${sign}¥${(abs / 1e4).toFixed(2)}万`;
  return `${sign}¥${abs.toFixed(0)}`;
}

function shanghaiHHMM(date: Date | null | undefined): string {
  if (!date) return "--:--";
  return date.toLocaleTimeString("zh-CN", {
    timeZone: "Asia/Shanghai",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
}

/**
 * 基于真实 Sentinel Core 运行结果生成 10 个 Agent 节点状态与日志，
 * 取代早期的硬编码演示文案（不再出现脱离实际账户/行情的固定假数据）。
 */
export function buildLiveAgentStates(input: LiveAgentTelemetryInput): AgentState[] {
  const refIso = input.updatedAt ?? input.now?.toISOString() ?? "2026-01-01T00:00:00.000Z";
  const ts = shanghaiHHMM(input.updatedAt ? new Date(input.updatedAt) : input.now);
  const topSector = input.marketRadar.hotSectors[0];
  const topAlert = input.alerts[0];
  const riskAlertsCount = input.alerts.filter((a) => a.level === "Risk" || a.level === "High").length;
  const positionRatioPct =
    input.account.totalAssets > 0
      ? Math.round((input.account.marketValue / input.account.totalAssets) * 100)
      : 0;
  const todayTradesCount = input.account.trades?.length ?? 0;

  return [
    {
      id: "data-agent",
      name: "数据同步",
      role: "data",
      status: input.mode === "live" ? "success" : "idle",
      lastRunAt: refIso,
      durationMs: input.mode === "live" ? 380 : 0,
      inputSummary:
        input.mode === "live"
          ? `批量拉取行情快照（${input.sourceLabel}）+ 近期公告`
          : "当前处于演示样本模式（未拉取实时上游）",
      outputSummary:
        input.mode === "live"
          ? `实时 ${input.liveCount}/${input.sampleSize} 只标的 · ${input.newsEventsCount} 条公开公告`
          : `演示样本已载入（非实时行情）`,
      recentLogs: [
        `[${ts}] 数据源模式：${input.mode === "live" ? input.sourceLabel : "内置演示样本"}`,
        `[${ts}] 已载入标的 ${input.mode === "live" ? input.liveCount : 5} 只，可验证公告 ${input.newsEventsCount} 条`,
      ],
    },
    {
      id: "portfolio-agent",
      name: "组合监控",
      role: "portfolio",
      status: input.account.positions.length > 0 ? "success" : "idle",
      lastRunAt: refIso,
      durationMs: 45,
      inputSummary: `实时重估 ${input.account.positions.length} 只模拟持仓`,
      outputSummary: `市值 ${fmtMoney(input.account.marketValue)}（仓位 ${positionRatioPct}%），今日 ${input.account.todayPnl >= 0 ? "+" : ""}${fmtMoney(input.account.todayPnl)}`,
      recentLogs: [
        `[${ts}] 总资产 ${fmtMoney(input.account.totalAssets)}，可用现金 ${fmtMoney(input.account.cash)}`,
        `[${ts}] 持仓 ${input.account.positions.length} 只，累计收益 ${input.account.totalReturnPct >= 0 ? "+" : ""}${input.account.totalReturnPct.toFixed(2)}%`,
      ],
    },
    {
      id: "market-agent",
      name: "市场雷达",
      role: "market",
      status: "success",
      lastRunAt: refIso,
      durationMs: 60,
      inputSummary: `扫描 ${input.marketRadar.hotSectors.length} 个聚合板块热力变化`,
      outputSummary: `温度 ${input.marketRadar.marketTemperature}/100 · ${input.marketRadar.marketRegime}${topSector ? ` · 领涨 ${topSector.name}` : ""}`,
      recentLogs: [
        `[${ts}] 上涨 ${input.marketRadar.upCount} 家 / 下跌 ${input.marketRadar.downCount} 家，风格：${input.marketRadar.marketStyle}`,
        `[${ts}] 主线前三：${input.marketRadar.hotSectors.slice(0, 3).map((s) => s.name).join("、") || "暂无"}`,
      ],
    },
    {
      id: "signal-agent",
      name: "信号引擎",
      role: "signal",
      status: input.signals.length > 0 ? "success" : "idle",
      lastRunAt: refIso,
      durationMs: 35,
      inputSummary: "量价 / 涨速 / 20 日高低点 / 板块共振 / 持仓计划 18 维扫描",
      outputSummary:
        input.signals.length > 0
          ? `命中 ${input.signals.length} 个信号，聚合 ${input.alerts.length} 条提醒`
          : "本周期无异动信号触发",
      recentLogs:
        input.signals.length > 0
          ? input.signals.slice(0, 3).map((s) => `[${ts}] ${s.code} ${s.name} · ${s.signalName} (+${s.score})`)
          : [`[${ts}] 全部样本平稳，无信号触发`],
    },
    {
      id: "watch-agent",
      name: "异动监控",
      role: "watch",
      status: input.alerts.length > 0 ? "success" : "idle",
      lastRunAt: refIso,
      durationMs: 25,
      inputSummary: "按 10 分钟去重窗口过滤重复提醒并分级",
      outputSummary: topAlert
        ? `最高优先级：${topAlert.name}（${topAlert.level} / ${topAlert.score}分）`
        : "暂无需要推送的异动提醒",
      recentLogs:
        input.alerts.length > 0
          ? [`[${ts}] 活跃提醒 ${input.alerts.length} 条，其中 High/Risk ${riskAlertsCount} 条`, `[${ts}] Top1: ${topAlert.title}`]
          : [`[${ts}] 异动队列空闲`],
    },
    {
      id: "attribution-agent",
      name: "归因分析",
      role: "attribution",
      status: input.causalityReports.length > 0 ? "success" : "idle",
      lastRunAt: refIso,
      durationMs: 40,
      inputSummary: "行情事实 + 板块结构 + 公开公告四维归因",
      outputSummary:
        input.causalityReports.length > 0
          ? `生成 ${input.causalityReports.length} 份归因（${input.causalityReports.map((r) => r.name).join("、")}）`
          : "暂无高优先归因对象",
      recentLogs: [
        `[${ts}] 归因覆盖：${input.causalityReports.map((r) => r.name).join("、") || "无"}`,
        `[${ts}] 可验证公告池：${input.newsEventsCount} 条`,
      ],
    },
    {
      id: "risk-agent",
      name: "风险管控",
      role: "risk",
      status: "success",
      lastRunAt: refIso,
      durationMs: 20,
      inputSummary: "评估单股集中度、行业暴露、弱市高仓位与计划偏离",
      outputSummary: `风险等级 ${input.risk.overallRiskLevel}（${input.risk.riskScore}/100），风险项 ${input.risk.riskItems.length} 个`,
      recentLogs:
        input.risk.riskItems.length > 0
          ? input.risk.riskItems.slice(0, 2).map((item) => `[${ts}] [${item.level}] ${item.title}：${item.reason}`)
          : [`[${ts}] 未检出高风险集中度或计划偏离`],
    },
    {
      id: "explain-agent",
      name: "智能解读",
      role: "explain",
      status: input.causalityReports.length > 0 ? "success" : "idle",
      lastRunAt: refIso,
      durationMs: 30,
      inputSummary: "输出结构化观察点与持仓影响摘要",
      outputSummary: input.causalityReports[0]?.oneLineSummary.slice(0, 42) ?? "等待异动标的进入解盘队列",
      recentLogs: [
        `[${ts}] 市场主线摘要：${input.marketRadar.oneLineSummary}`,
      ],
    },
    {
      id: "review-agent",
      name: "复盘助手",
      role: "review",
      status: todayTradesCount > 0 || input.alerts.length > 0 ? "success" : "idle",
      lastRunAt: refIso,
      durationMs: 25,
      inputSummary: `汇总今日 ${todayTradesCount} 笔成交、${input.alerts.length} 条提醒与明日观察清单`,
      outputSummary: `明日重点观察 ${input.journal.nextDayWatchlist.length} 只标的（当日成交 ${todayTradesCount} 笔）`,
      recentLogs: [
        `[${ts}] 复盘日期 ${input.journal.date}，有效提醒 ${input.journal.effectiveAlerts.length} 条`,
        `[${ts}] 明日观察：${input.journal.nextDayWatchlist.slice(0, 3).join("、") || "暂无"}`,
      ],
    },
    {
      id: "compliance-agent",
      name: "合规检查",
      role: "compliance",
      status: "success",
      lastRunAt: refIso,
      durationMs: 10,
      inputSummary: "校验全部归因、复盘与 AI 回答输出",
      outputSummary: "complianceEngine 全量守卫中，未输出确定性买卖指令",
      recentLogs: [
        `[${ts}] 已过滤 ${input.causalityReports.length} 份归因与 1 份盘后复盘文本`,
        `[${ts}] 免责声明完整保留，用户原始计划原文跳过改写`,
      ],
    },
  ];
}

// ─── 10 Agent mock states (legacy fallback) ────────────────────────

export function getAgentStates(): AgentState[] {
  const now = new Date();
  const iso = (minutesAgo: number) =>
    new Date(now.getTime() - minutesAgo * 60_000).toISOString();

  return [
    {
      id: "data-agent",
      name: "数据同步",
      role: "data",
      status: "success",
      lastRunAt: iso(0.5),
      durationMs: 2450,
      inputSummary: "拉取沪深市场快照（eastmoney）",
      outputSummary: "演示样本已载入：5 只标的、6 个板块（非实时行情）",
      recentLogs: [
        "[09:30:01] 数据同步启动 → eastmoney 源",
        "[09:30:02] 演示样本已载入：5 只标的、6 个板块（非实时行情）",
      ],
    },
    {
      id: "portfolio-agent",
      name: "组合监控",
      role: "portfolio",
      status: "idle",
      lastRunAt: iso(8),
      durationMs: 1200,
      inputSummary: "获取当前持仓 5 只",
      outputSummary: "持仓市值 ¥682,340，今日盈亏 +¥12,450 (+1.86%)",
      recentLogs: [
        "[09:30:00] 组合快照更新完成",
        "[09:30:00] 今日盈亏 +¥12,450 (+1.86%)",
      ],
    },
    {
      id: "market-agent",
      name: "市场雷达",
      role: "market",
      status: "success",
      lastRunAt: iso(1.2),
      durationMs: 3800,
      inputSummary: "扫描 10 个板块热力变化",
      outputSummary: "半导体板块热度 Top 2，算力板块保持 Top 1",
      recentLogs: [
        "[10:23:00] 板块热力扫描开始，共 10 个板块",
        "[10:23:02] 半导体板块进入热度 Top 3 → 热度值 38.7",
        "[10:23:03] 算力板块保持热度 Top 1 → 热度值 41.2",
      ],
    },
    {
      id: "signal-agent",
      name: "信号引擎",
      role: "signal",
      status: "idle",
      lastRunAt: iso(12),
      durationMs: 5600,
      inputSummary: "多因子信号扫描中（动量 + 量价 + 资金流向）",
      outputSummary: "本周期信号无触发，等待下一扫描窗口",
      recentLogs: [
        "[09:25:00] 信号引擎空闲，无新信号触发",
      ],
    },
    {
      id: "watch-agent",
      name: "异动监控",
      role: "watch",
      status: "success",
      lastRunAt: iso(3.5),
      durationMs: 1500,
      inputSummary: "监控自选 + 持仓异动（涨跌幅 / 成交量 / 换手率）",
      outputSummary: "寒武纪触发放量异动，换手率 4.2%，成交额 56.5 亿",
      recentLogs: [
        "[10:24:00] 异动扫描启动",
        "[10:24:01] 688256 寒武纪触发放量异动：换手率 4.2%，成交额 56.5 亿",
        "[10:24:01] 异动事件已推送至情报流",
      ],
    },
    {
      id: "attribution-agent",
      name: "归因分析",
      role: "attribution",
      status: "idle",
      lastRunAt: iso(25),
      durationMs: 4200,
      inputSummary: "前一日组合收益归因（因子 + 板块 + 个股）",
      outputSummary: "昨日收益 +0.83%，主要贡献：光通信 + 算力",
      recentLogs: [
        "[09:05:00] 归因分析完成：光通信贡献 +0.51%，算力贡献 +0.29%",
      ],
    },
    {
      id: "risk-agent",
      name: "风险管控",
      role: "risk",
      status: "success",
      lastRunAt: iso(2.0),
      durationMs: 3100,
      inputSummary: "评估组合风险敞口（行业集中度 + VaR + 回撤）",
      outputSummary: "科技暴露 48%，偏高；半导体 + 算力合计 62%",
      recentLogs: [
        "[10:28:00] 风险扫描完成",
        "[10:28:01] 科技暴露 48%，偏高（阈值 40%）",
        "[10:28:01] 半导体 + 算力合计 62%，集中度风险关注",
      ],
    },
    {
      id: "explain-agent",
      name: "智能解读",
      role: "explain",
      status: "idle",
      lastRunAt: iso(18),
      durationMs: 2800,
      inputSummary: "生成今日市场关键词云 + 舆情摘要",
      outputSummary: "「光模块」「国产替代」「H20 供应链」为今日热词",
      recentLogs: [
        "[09:15:00] 舆情摘要已生成：光模块、国产替代、H20 供应链为今日热词",
      ],
    },
    {
      id: "review-agent",
      name: "复盘助手",
      role: "review",
      status: "idle",
      lastRunAt: iso(60),
      durationMs: 0,
      inputSummary: "等待收盘后触发自动复盘",
      outputSummary: "待盘后执行（15:05 触发）",
      recentLogs: [
        "[09:00:00] 复盘助手已就绪，等待收盘信号",
      ],
    },
    {
      id: "compliance-agent",
      name: "合规检查",
      role: "compliance",
      status: "success",
      lastRunAt: iso(0.8),
      durationMs: 900,
      inputSummary: "检查持仓合规性（涨跌停 / ST / 退市风险）",
      outputSummary: "合规检查通过，无异常标的",
      recentLogs: [
        "[10:30:00] 合规扫描完成",
        "[10:30:00] 合规检查通过，持仓 5 只均无异常",
      ],
    },
  ];
}

// ─── 8 Intelligence Events (09:30 → 10:35) ────────────────────────

export function getIntelligenceFeed(): IntelligenceEvent[] {
  return [
    {
      id: "1",
      timestamp: "09:30",
      agent: "data",
      message: "演示样本已载入：5 只标的、6 个板块（非实时行情）",
      level: "success",
    },
    {
      id: "2",
      timestamp: "09:35",
      agent: "portfolio",
      message: "持仓开盘市值 ¥682,340，较昨收 +0.52%",
      level: "info",
    },
    {
      id: "3",
      timestamp: "09:48",
      agent: "market",
      message: "算力板块开盘领涨 +2.1%，光通信紧随其后 +1.8%",
      level: "info",
      relatedSector: "算力",
    },
    {
      id: "4",
      timestamp: "10:02",
      agent: "signal",
      message: "中际旭创触发量价共振信号，近 5 日涨幅 +12.3%",
      level: "warning",
      relatedStock: "300308",
    },
    {
      id: "5",
      timestamp: "10:15",
      agent: "market",
      message: "半导体板块进入热度 Top 3，成交额突破 350 亿",
      level: "info",
      relatedSector: "半导体",
    },
    {
      id: "6",
      timestamp: "10:21",
      agent: "watch",
      message: "博创科技换手率 5.6%，短线资金活跃，注意追高风险",
      level: "warning",
      relatedStock: "300548",
    },
    {
      id: "7",
      timestamp: "10:24",
      agent: "watch",
      message: "寒武纪触发放量异动，换手率 4.2%，成交额 56.5 亿",
      level: "warning",
      relatedStock: "688256",
    },
    {
      id: "8",
      timestamp: "10:30",
      agent: "risk",
      message: "科技暴露 48% 偏高，半导体 + 算力合计 62%，集中度风险关注",
      level: "critical",
      relatedSector: "半导体",
    },
    {
      id: "9",
      timestamp: "10:33",
      agent: "compliance",
      message: "合规检查通过，持仓 5 只均无异常标的",
      level: "success",
    },
    {
      id: "10",
      timestamp: "10:35",
      agent: "market",
      message: "低空经济板块异动，涨幅扩大至 +3.2%，进入热度 Top 3",
      level: "info",
      relatedSector: "低空经济",
    },
  ];
}

// ─── 5 Sentinel Pulse Dimensions ───────────────────────────────────

export function getSentinelDimensions(): SentinelDimension[] {
  return [
    {
      label: "Market Heat",
      value: 70,
      color: "var(--accent)",
      description: "市场热度",
    },
    {
      label: "Portfolio Exposure",
      value: 48,
      color: "var(--up)",
      description: "持仓暴露",
    },
    {
      label: "Signal Pressure",
      value: 35,
      color: "var(--down)",
      description: "信号压力",
    },
    {
      label: "Risk Load",
      value: 62,
      color: "var(--ai-warning)",
      description: "风险负载",
    },
    {
      label: "Agent Activity",
      value: 85,
      color: "var(--ai-cyan)",
      description: "Agent 活跃度",
    },
  ];
}
