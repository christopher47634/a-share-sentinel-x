import { describe, expect, it } from "vitest";
import {
  alertEngine,
  complianceEngine,
  generateSentinelDemoData,
  runSentinelCore,
  scoreRiskItems,
  type Alert,
  type RiskItem,
  type Signal,
} from "@/lib/sentinel-core";

function signal(code: string, signalName: string, signalType: Signal["signalType"] = "VOLUME"): Signal {
  return {
    id: `${code}-${signalName}`,
    code,
    name: "寒武纪",
    signalName,
    signalType,
    score: 20,
    evidence: [],
    relatedToPosition: false,
    relatedToPlan: false,
    triggeredAt: new Date().toISOString(),
  };
}

describe("alertEngine dedupe", () => {
  const [previous] = alertEngine({ signals: [signal("688256", "放量异动")] });

  it("still alerts when a new signal appears alongside one already alerted", () => {
    const alerts = alertEngine({
      signals: [signal("688256", "放量异动"), signal("688256", "冲高回落风险", "RISK")],
      previousAlerts: [previous as Alert],
    });
    expect(alerts).toHaveLength(1);
    expect(alerts[0].signals.map((s) => s.signalName)).toContain("冲高回落风险");
    expect(alerts[0].level).toBe("Risk");
  });

  it("drops an alert whose signals were all alerted inside the window", () => {
    const alerts = alertEngine({ signals: [signal("688256", "放量异动")], previousAlerts: [previous as Alert] });
    expect(alerts).toHaveLength(0);
  });
});

describe("complianceEngine", () => {
  it("does not invert negated advice", () => {
    const out = complianceEngine("当前不建议卖出，也不保证收益。");
    expect(out).not.toContain("不需要关注风险变化");
    expect(out).not.toContain("不不保证收益");
    expect(out).toContain("不保证收益");
  });

  it("still rewrites affirmative advice", () => {
    expect(complianceEngine("建议买入，必涨")).toContain("可以纳入观察");
    expect(complianceEngine("建议买入，必涨")).not.toContain("必涨");
  });

  it("does not rewrite trade facts", () => {
    const out = complianceEngine("今日清仓寒武纪 200 股；账户满仓运行。");
    expect(out).toContain("今日清仓寒武纪 200 股");
  });

  it("keeps preserved user text verbatim", () => {
    const plan = "跌破 585 建议卖出，建议清仓";
    const out = complianceEngine(`用户原交易计划：${plan}`, { preserve: [plan] });
    expect(out).toContain(plan);
  });
});

describe("riskEngine scoring", () => {
  it("counts one heavy position once instead of three times", () => {
    const items: RiskItem[] = [
      { id: "risk-concentration-688256", level: "High", title: "", reason: "", affectedPositions: ["寒武纪"], evidence: [], observationPoints: [] },
      { id: "risk-high-vol-688256", level: "High", title: "", reason: "", affectedPositions: ["寒武纪"], evidence: [], observationPoints: [] },
      { id: "risk-sector-半导体", level: "High", title: "", reason: "", affectedPositions: ["寒武纪"], evidence: [], observationPoints: [] },
    ];
    expect(scoreRiskItems(items)).toBe(25);
  });
});

describe("runSentinelCore", () => {
  it("ignores undefined keys in the input", () => {
    expect(() => runSentinelCore({ stocks: undefined, account: undefined })).not.toThrow();
  });

  it("builds causality reports for the highest-scoring alerts, not input order", () => {
    const demo = generateSentinelDemoData();
    const result = runSentinelCore({ stocks: [...demo.stocks].reverse() });
    const topAlertCodes = result.alerts.slice(0, 3).map((a) => a.code);
    expect(result.causalityReports.map((r) => r.code)).toEqual(topAlertCodes);
  });
});
