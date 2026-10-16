import { describe, expect, it } from "vitest";
import fixture from "./fixtures/alert-eval.json";
import { runAlertEvalCase, scoreAlertEval, type AlertEvalCase, type AlertEvalMetrics } from "@/lib/alert-eval";

const cases = fixture.cases as unknown as AlertEvalCase[];
const results = cases.map(runAlertEvalCase);

describe("信号→提醒→结果评测", () => {
  it.each(results.map((r) => [r.id, r] as const))("%s 触发的信号和提醒等级与记录一致", (_id, result) => {
    expect(result.mismatches).toEqual([]);
  });

  it("用例编号唯一", () => {
    expect(new Set(cases.map((c) => c.id)).size).toBe(cases.length);
  });

  it("评分与基准一致；没有基准时报错而不是放行", () => {
    const baseline = fixture.baseline as AlertEvalMetrics | null;
    expect(baseline, "fixtures/alert-eval.json 缺少 baseline").not.toBeNull();
    expect(scoreAlertEval(results)).toEqual(baseline);
  });

  it("漏报和误报样本都在评测集里，指标不是全 1", () => {
    const metrics = scoreAlertEval(results);
    expect(metrics.falseAlarms).toBeGreaterThan(0);
    expect(metrics.missed).toBeGreaterThan(0);
  });
});
