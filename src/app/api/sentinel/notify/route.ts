import { NextResponse } from "next/server";
import { dispatchWebhookNotification, type NotifyChannel } from "@/lib/notifier";
import { clientIp, createRateLimiter } from "@/lib/rate-limit";
import type { AlertLevel } from "@/lib/sentinel/types";

const checkLimit = createRateLimiter({ limit: 15, windowMs: 60_000 });
const VALID_CHANNELS = new Set<NotifyChannel>(["feishu", "dingtalk", "bark", "generic"]);
const VALID_LEVELS = new Set<AlertLevel>(["High", "Medium", "Low", "Risk"]);

export async function POST(request: Request) {
  const ip = clientIp(request.headers);
  const rate = checkLimit(ip);
  if (!rate.ok) {
    return NextResponse.json(
      { error: "推送过于频繁，请稍后再试" },
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } },
    );
  }

  const raw: unknown = await request.json().catch(() => null);
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return NextResponse.json({ error: "请求体必须是 JSON 对象" }, { status: 400 });
  }

  const body = raw as {
    channel?: unknown;
    webhookUrl?: unknown;
    title?: unknown;
    alerts?: unknown;
    dryRun?: unknown;
  };

  if (typeof body.channel !== "string" || !VALID_CHANNELS.has(body.channel as NotifyChannel)) {
    return NextResponse.json({ error: "channel 仅支持 feishu / dingtalk / bark / generic" }, { status: 400 });
  }
  if (typeof body.webhookUrl !== "string" || !body.webhookUrl.trim()) {
    return NextResponse.json({ error: "缺少 webhookUrl" }, { status: 400 });
  }
  if (!Array.isArray(body.alerts) || body.alerts.length === 0 || body.alerts.length > 50) {
    return NextResponse.json({ error: "alerts 必须包含 1 至 50 条提醒" }, { status: 400 });
  }

  const alerts = body.alerts
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
    .map((item) => ({
      code: String(item.code ?? ""),
      name: String(item.name ?? ""),
      level: (VALID_LEVELS.has(item.level as AlertLevel) ? item.level : "Low") as AlertLevel,
      title: String(item.title ?? ""),
      summary: String(item.summary ?? ""),
      createdAt: typeof item.createdAt === "string" ? item.createdAt : new Date().toISOString(),
    }));

  const result = await dispatchWebhookNotification({
    channel: body.channel as NotifyChannel,
    webhookUrl: body.webhookUrl,
    title: typeof body.title === "string" ? body.title : undefined,
    alerts,
    dryRun: Boolean(body.dryRun),
  });

  if (!result.ok) {
    const status = result.error?.includes("Webhook URL") || result.error?.includes("HTTPS") || result.error?.includes("内网")
      ? 400
      : 502;
    return NextResponse.json(result, { status });
  }
  return NextResponse.json(result);
}
