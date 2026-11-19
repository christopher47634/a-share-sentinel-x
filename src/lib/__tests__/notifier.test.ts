import { describe, expect, it, vi } from "vitest";
import {
  buildWebhookPayload,
  dispatchWebhookNotification,
  validateWebhookUrl,
} from "@/lib/notifier";

const sampleAlerts = [
  {
    code: "600519",
    name: "贵州茅台",
    level: "Risk" as const,
    title: "放量下跌",
    summary: "建议卖出，跌破止损观察线",
    createdAt: "2026-11-19T06:00:00.000Z",
  },
];

describe("notifier Webhook 推送与 SSRF 防护", () => {
  it("仅允许公网 HTTPS，拦截 http / localhost / RFC1918 / 元数据地址", () => {
    expect(validateWebhookUrl("https://open.feishu.cn/open-apis/bot/v2/hook/abc").ok).toBe(true);
    expect(validateWebhookUrl("http://open.feishu.cn/hook").ok).toBe(false);
    expect(validateWebhookUrl("https://localhost:8443/hook").ok).toBe(false);
    expect(validateWebhookUrl("https://127.0.0.1/hook").ok).toBe(false);
    expect(validateWebhookUrl("https://169.254.169.254/latest/meta-data").ok).toBe(false);
    expect(validateWebhookUrl("https://192.168.1.10/hook").ok).toBe(false);
    expect(validateWebhookUrl("https://[::1]/hook").ok).toBe(false);
  });

  it("所有通道输出均经过合规过滤，改写荐股措辞并附带免责声明", () => {
    const feishu = buildWebhookPayload("feishu", "盘中提醒", sampleAlerts);
    const text = (feishu.content as { text: string }).text;
    expect(text).not.toContain("建议卖出");
    expect(text).toContain("需要关注风险变化");
    expect(text).toContain("不构成投资建议");
  });

  it("dryRun 校验 URL 且不发起网络请求；正式推送按 channel 发送 POST", async () => {
    const fetchMock = vi.fn(async () => new Response('{"code":0}', { status: 200 }));
    const dry = await dispatchWebhookNotification({
      channel: "dingtalk",
      webhookUrl: "https://oapi.dingtalk.com/robot/send?access_token=demo",
      alerts: sampleAlerts,
      dryRun: true,
      fetchImpl: fetchMock,
    });
    expect(dry.ok).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();

    const live = await dispatchWebhookNotification({
      channel: "feishu",
      webhookUrl: "https://open.feishu.cn/open-apis/bot/v2/hook/demo",
      alerts: sampleAlerts,
      fetchImpl: fetchMock,
    });
    expect(live.ok).toBe(true);
    expect(live.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
