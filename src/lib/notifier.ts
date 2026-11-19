// Webhook 告警推送引擎（飞书 / 钉钉 / Bark / Generic JSON），带 SSRF 校验与合规过滤

import { complianceEngine } from "./sentinel/compliance";
import type { Alert } from "./sentinel/types";

export type NotifyChannel = "feishu" | "dingtalk" | "bark" | "generic";

export type NotifyAlert = Pick<Alert, "code" | "name" | "level" | "title" | "createdAt"> & {
  summary?: string;
  aiExplanation?: string;
  riskNote?: string;
};

export interface NotifyRequest {
  channel: NotifyChannel;
  webhookUrl: string;
  title?: string;
  alerts: NotifyAlert[];
  dryRun?: boolean;
  timeoutMs?: number;
  fetchImpl?: (input: string, init?: RequestInit) => Promise<Response>;
}

export interface NotifyResult {
  ok: boolean;
  dryRun: boolean;
  channel: NotifyChannel;
  status?: number;
  payload: Record<string, unknown>;
  error?: string;
}

const PRIVATE_IPV4_RE =
  /^(?:127\.|10\.|0\.|169\.254\.|192\.168\.|172\.(?:1[6-9]|2\d|3[01])\.)/;

/** 仅允许公网 HTTPS Webhook 地址，阻断 localhost / 内网段 / 元数据地址 SSRF。 */
export function validateWebhookUrl(rawUrl: string): { ok: true; url: URL } | { ok: false; reason: string } {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    return { ok: false, reason: "Webhook URL 格式不合法" };
  }
  if (parsed.protocol !== "https:") {
    return { ok: false, reason: "Webhook 必须使用 HTTPS 协议" };
  }
  const host = parsed.hostname.toLowerCase();
  if (
    !host ||
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    host.includes(":") || // 拦截 IPv6 字面量（如 [::1]、[fe80::1]）
    PRIVATE_IPV4_RE.test(host)
  ) {
    return { ok: false, reason: "禁止向本地或内网地址发送 Webhook" };
  }
  return { ok: true, url: parsed };
}

export function formatAlertDigestText(
  title: string,
  alerts: NotifyRequest["alerts"],
): string {
  const lines = [`【${title}】共 ${alerts.length} 条观察信号`];
  for (const alert of alerts.slice(0, 10)) {
    const detail = alert.summary || alert.aiExplanation || alert.riskNote || "";
    lines.push(`- [${alert.level}] ${alert.name}(${alert.code})：${alert.title}${detail ? ` — ${detail}` : ""}`);
  }
  if (alerts.length > 10) {
    lines.push(`… 其余 ${alerts.length - 10} 条请进入 Sentinel 看板查看`);
  }
  return complianceEngine(lines.join("\n"));
}

export function buildWebhookPayload(
  channel: NotifyChannel,
  title: string,
  alerts: NotifyRequest["alerts"],
): Record<string, unknown> {
  const safeText = formatAlertDigestText(title, alerts);
  switch (channel) {
    case "feishu":
      return {
        msg_type: "text",
        content: { text: safeText },
      };
    case "dingtalk":
      return {
        msgtype: "markdown",
        markdown: { title, text: safeText },
      };
    case "bark":
      return {
        title,
        body: safeText,
        group: "A-Share-Sentinel-X",
      };
    case "generic":
      return {
        title,
        text: safeText,
        alertCount: alerts.length,
        alerts,
        generatedAt: new Date().toISOString(),
      };
  }
}

export async function dispatchWebhookNotification(req: NotifyRequest): Promise<NotifyResult> {
  const title = (req.title || "A-Share Sentinel 盘中提醒").trim();
  const payload = buildWebhookPayload(req.channel, title, req.alerts);

  const check = validateWebhookUrl(req.webhookUrl);
  if (!check.ok) {
    return {
      ok: false,
      dryRun: Boolean(req.dryRun),
      channel: req.channel,
      payload,
      error: check.reason,
    };
  }

  if (req.dryRun) {
    return { ok: true, dryRun: true, channel: req.channel, payload };
  }

  const fetchImpl = req.fetchImpl ?? ((input: string, init?: RequestInit) => fetch(input, init));
  const timeoutMs = req.timeoutMs ?? 8000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetchImpl(check.url.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    return {
      ok: res.ok,
      dryRun: false,
      channel: req.channel,
      status: res.status,
      payload,
      error: res.ok ? undefined : `Webhook 返回 HTTP ${res.status}`,
    };
  } catch (err) {
    return {
      ok: false,
      dryRun: false,
      channel: req.channel,
      payload,
      error:
        controller.signal.aborted || (err as Error)?.name === "AbortError"
          ? `Webhook 请求超时（>${timeoutMs}ms）`
          : (err as Error)?.message || "Webhook 请求失败",
    };
  } finally {
    clearTimeout(timer);
  }
}
