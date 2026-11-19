import { describe, expect, it } from "vitest";
import { classifyAnnouncementSentiment, parseAnnouncementItems } from "@/lib/news-provider";
import {
  buildLocalResearchAnswer,
  resolveAiProvider,
  sanitizeHistory,
  sanitizePortfolioContext,
} from "@/lib/ai-provider";
import { buildLiveAgentStates } from "@/lib/agent-orchestrator";
import { runSentinelCore } from "@/lib/sentinel-core";
import type { MarketStockDetail } from "@/types/market";

describe("公开公告解析与保守情绪标注", () => {
  it("按时间窗口过滤旧公告、按 art_code 去重并标注保守情绪", () => {
    const nowMs = new Date("2026-11-19T08:00:00+08:00").getTime();
    const events = parseAnnouncementItems(
      [
        {
          art_code: "A1",
          title_ch: "贵州茅台:关于回购股份方案的公告",
          notice_date: "2026-11-15 00:00:00",
          codes: [{ stock_code: "600519" }],
          columns: [{ column_name: "回购" }],
        },
        {
          art_code: "A1",
          title_ch: "贵州茅台:关于回购股份方案的公告",
          notice_date: "2026-11-15 00:00:00",
          codes: [{ stock_code: "600519" }],
        },
        {
          art_code: "A2",
          title_ch: "某某股份:收到监管问询函及风险提示公告",
          display_time: "2026-11-18 17:30:00:000",
          codes: [{ stock_code: "300750" }],
          columns: [{ column_name: "监管" }],
        },
        {
          art_code: "OLD",
          title_ch: "半年前旧公告应被过滤",
          notice_date: "2026-01-05 00:00:00",
          codes: [{ stock_code: "600519" }],
        },
      ],
      {
        nowMs,
        maxAgeDays: 30,
        sectorOf: (code) => (code === "600519" ? "消费白酒" : "新能源"),
      }
    );

    expect(events).toHaveLength(2);
    expect(events[0]).toMatchObject({
      relatedCodes: ["600519"],
      relatedSectors: ["消费白酒"],
      sentiment: "positive",
      source: "交易所公告·回购",
      time: "2026-11-15",
    });
    expect(events[1]).toMatchObject({
      relatedCodes: ["300750"],
      sentiment: "negative",
      time: "2026-11-18 17:30",
    });
    expect(classifyAnnouncementSentiment("关于召开股东大会的常规通知")).toBe("neutral");
  });
});

describe("AI 研究副驾：多模型路由与持仓/公告上下文融合", () => {
  it("优先 OpenAI-Compatible（默认 DeepSeek），其次 OpenAI Responses，最后本地引擎", () => {
    expect(resolveAiProvider({ AI_API_KEY: "sk-ds" })).toMatchObject({
      kind: "openai-compatible",
      baseUrl: "https://api.deepseek.com/v1",
      model: "deepseek-chat",
    });
    expect(
      resolveAiProvider({
        AI_API_KEY: "sk-custom",
        AI_BASE_URL: "https://gateway.example.com/v1/",
        AI_MODEL: "qwen-max",
      })
    ).toMatchObject({
      kind: "openai-compatible",
      baseUrl: "https://gateway.example.com/v1",
      model: "qwen-max",
    });
    expect(resolveAiProvider({ OPENAI_API_KEY: "sk-oai" })).toMatchObject({
      kind: "openai-responses",
      model: "gpt-5.5",
    });
    expect(resolveAiProvider({})).toMatchObject({
      kind: "local",
      model: "local-research-engine",
    });
  });

  it("清洗多轮历史与持仓上下文，截断超长与非法输入", () => {
    const history = sanitizeHistory([
      { role: "system", content: "ignored" },
      ...Array.from({ length: 10 }, (_, i) => ({
        role: i % 2 === 0 ? "user" : "assistant",
        content: `msg-${i}`,
      })),
    ]);
    expect(history).toHaveLength(6);
    expect(history[0].content).toBe("msg-4");

    const ctx = sanitizePortfolioContext({
      position: { stockCode: "600519", quantity: 200, avgCost: 1400, plan: "不追高，回踩均线观察" },
      activeAlerts: [{ level: "Risk", title: "放量下跌" }],
    });
    expect(ctx?.position?.stockCode).toBe("600519");
    expect(ctx?.activeAlerts).toHaveLength(1);
  });

  it("本地研究引擎融合持仓、止损线、原交易计划与近期公告，且不改写用户原计划", () => {
    const detail: MarketStockDetail = {
      quote: {
        code: "600519",
        name: "贵州茅台",
        price: 1380,
        changePercent: -2.1,
        changeAmount: -29.6,
        volume: "4.2M lots",
        turnover: "58.0 CNY 100M",
        turnoverRate: 0.4,
        volumeRatio: 1.8,
        speed: -0.25,
        marketCap: "17300.0 CNY 100M",
        pe: 21,
        high: 1410,
        low: 1375,
        open: 1405,
        prevClose: 1409.6,
        source: "eastmoney",
        sourceLabel: "Eastmoney live",
        updatedAt: "2026-11-19T06:00:00.000Z",
        tradeStatus: "trading",
      },
      candles: [],
      analysis: {
        ma5: 1400,
        ma10: 1410,
        ma20: 1390,
        ma60: 1370,
        rsi14: 46,
        macd: -1.2,
        signal: -0.8,
        histogram: -0.4,
        atr14: 22,
        drawdownPercent: 4.5,
        volumeRatio: 1.8,
        trendScore: 48,
        riskScore: 52,
        trendLabel: "震荡整理",
        riskLabel: "中等风险",
        summary: "短线回踩 20 日均线",
        bullets: ["价格低于 5 日与 10 日均线"],
      },
      timeframe: "day",
      fallbackUsed: false,
    };

    const answer = buildLocalResearchAnswer({
      question: "现在能买吗？按我的持仓怎么看",
      detail,
      portfolioContext: {
        position: {
          stockCode: "600519",
          stockName: "贵州茅台",
          quantity: 300,
          availableQuantity: 200,
          avgCost: 1450,
          positionRatio: 0.42,
          stopLossPrice: 1390,
          targetPrice: 1600,
          plan: "不建议卖出底仓，跌破1390只记录复盘",
        },
        activeAlerts: [{ level: "Risk", title: "接近或跌破止损观察线" }],
      },
      announcements: [
        {
          title: "贵州茅台:关于召开业绩说明会的公告",
          relatedCodes: ["600519"],
          sentiment: "neutral",
          source: "交易所公告",
          time: "2026-11-15",
        },
      ],
    });

    expect(answer).toContain("已触及或低于你设定的止损观察线 ¥1390.00");
    expect(answer).toContain("100 股受 T+1 锁定");
    expect(answer).toContain("不建议卖出底仓，跌破1390只记录复盘");
    expect(answer).toContain("关于召开业绩说明会的公告");
    expect(answer).toContain("不构成投资建议");
  });
});

describe("Command Center 真实 Agent 遥测状态", () => {
  it("10 个 Agent 状态全部由真实 Sentinel 运行结果派生，不含硬编码演示残留", () => {
    const core = runSentinelCore({
      stocks: [
        { code: "600519", name: "贵州茅台", price: 1460, changePct: 1.2, sector: "白酒", volumeRatio: 1.2 },
      ],
      sectors: [
        { name: "白酒", changePct: 1.2, upCount: 1, downCount: 0, leadingStock: "贵州茅台", leadingStockChangePct: 1.2 },
      ],
      account: {
        totalAssets: 1_050_000,
        cash: 550_000,
        marketValue: 500_000,
        todayPnl: 6_200,
        totalPnl: 50_000,
        totalReturnPct: 5.0,
        positions: [
          {
            code: "600519",
            name: "贵州茅台",
            quantity: 300,
            costPrice: 1400,
            currentPrice: 1460,
            marketValue: 438_000,
            positionRatio: 0.417,
            unrealizedPnl: 18_000,
            unrealizedPnlPct: 4.29,
            sector: "白酒",
            riskLevel: "Low",
          },
        ],
        trades: [],
      },
      newsEvents: [],
    });

    const states = buildLiveAgentStates({
      mode: "live",
      sourceLabel: "Eastmoney live",
      liveCount: 30,
      sampleSize: 30,
      updatedAt: "2026-11-19T06:00:00.000Z",
      account: {
        totalAssets: 1_050_000,
        cash: 550_000,
        marketValue: 500_000,
        todayPnl: 6_200,
        totalPnl: 50_000,
        totalReturnPct: 5.0,
        positions: [
          {
            code: "600519",
            name: "贵州茅台",
            quantity: 300,
            costPrice: 1400,
            currentPrice: 1460,
            marketValue: 438_000,
            positionRatio: 0.417,
            unrealizedPnl: 18_000,
            unrealizedPnlPct: 4.29,
            sector: "白酒",
            riskLevel: "Low",
          },
        ],
        trades: [],
      },
      marketRadar: core.marketRadar,
      signals: core.signals,
      alerts: core.alerts,
      risk: core.risk,
      causalityReports: core.causalityReports,
      journal: core.journal,
      newsEventsCount: 4,
    });

    expect(states).toHaveLength(10);
    const serialized = JSON.stringify(states);
    expect(serialized).not.toContain("寒武纪");
    expect(serialized).not.toContain("682,340");
    expect(serialized).toContain("4 条公开公告");
    expect(serialized).toContain("Eastmoney live");
  });
});
