import { AgentState, IntelligenceEvent, SentinelDimension } from "@/types/agent";

// ─── 10 Agent mock states ──────────────────────────────────────────

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
      outputSummary: "沪深行情数据已同步，3984 只标的更新完成",
      recentLogs: [
        "[09:30:01] 数据同步启动 → eastmoney 源",
        "[09:30:02] 沪深行情数据已同步，3984 只标的更新完成",
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
      message: "沪深行情数据已同步，3984 只标的更新完成",
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
