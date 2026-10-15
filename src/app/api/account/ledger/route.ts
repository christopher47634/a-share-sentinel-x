import { NextResponse } from "next/server";
import { mkdir, readFile, rename, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { timingSafeEqual } from "node:crypto";
import type { LocalLedgerSnapshot } from "@/types/account";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * 服务端文件账本只给本机自用：所有访客共用同一个文件，没有用户隔离。
 * 默认关闭（线上 Vercel 文件系统也是只读的），需要同时设置
 * ENABLE_SERVER_LEDGER=1 和 LEDGER_TOKEN，并在请求头 x-ledger-token 里带上同一个值。
 * 关闭时客户端自动退回「账本只保存在本浏览器」。
 */
const LEDGER_DIR = path.join(process.cwd(), ".nexus-local-ledger");
const LEDGER_PATH = path.join(LEDGER_DIR, "account-ledger.json");
const JOURNAL_PATH = path.join(LEDGER_DIR, "ledger-journal.ndjson");
/** 对外只给相对路径，不暴露服务器绝对路径 */
const DISPLAY_PATH = ".nexus-local-ledger/account-ledger.json";
const MAX_BODY_BYTES = 2_000_000;

function ledgerEnabled(): boolean {
  return process.env.ENABLE_SERVER_LEDGER === "1" && Boolean(process.env.LEDGER_TOKEN);
}

function authorized(request: Request): boolean {
  const expected = process.env.LEDGER_TOKEN ?? "";
  const given = request.headers.get("x-ledger-token") ?? "";
  if (!expected || given.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(given), Buffer.from(expected));
}

function disabledResponse(status: number, error: string) {
  return NextResponse.json({ ok: false, mode: "browser", error }, { status });
}

function guard(request: Request) {
  if (!ledgerEnabled()) return disabledResponse(404, "服务端账本未启用，账本只保存在本浏览器");
  if (!authorized(request)) return disabledResponse(401, "缺少或错误的 x-ledger-token");
  return null;
}

function isLedgerSnapshot(value: unknown): value is LocalLedgerSnapshot {
  if (!value || typeof value !== "object") return false;
  const snapshot = value as Partial<LocalLedgerSnapshot>;
  return (
    snapshot.version === 1 &&
    typeof snapshot.exportedAt === "string" &&
    typeof snapshot.reason === "string" &&
    Boolean(snapshot.account) &&
    typeof snapshot.account?.availableCash === "number" &&
    typeof snapshot.account?.totalAssets === "number" &&
    Array.isArray(snapshot.positions) &&
    Array.isArray(snapshot.transactions) &&
    Array.isArray(snapshot.history)
  );
}

async function readSnapshot(): Promise<LocalLedgerSnapshot | null> {
  try {
    const raw = await readFile(LEDGER_PATH, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    return isLedgerSnapshot(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

async function writeSnapshot(snapshot: LocalLedgerSnapshot) {
  await mkdir(LEDGER_DIR, { recursive: true });
  const tmpPath = `${LEDGER_PATH}.${Date.now()}.tmp`;
  const payload = JSON.stringify(snapshot, null, 2);
  await writeFile(tmpPath, payload, "utf8");
  await rename(tmpPath, LEDGER_PATH);
  await writeFile(
    JOURNAL_PATH,
    `${JSON.stringify({
      at: new Date().toISOString(),
      reason: snapshot.reason,
      totalAssets: snapshot.account.totalAssets,
      marketValue: snapshot.account.marketValue,
      cash: snapshot.account.availableCash,
      transactionCount: snapshot.transactions.length,
      historyCount: snapshot.history.length,
    })}\n`,
    { encoding: "utf8", flag: "a" }
  );
}

export async function GET(request: Request) {
  const blocked = guard(request);
  if (blocked) return blocked;

  const snapshot = await readSnapshot();
  let exists = false;
  try {
    exists = Boolean(await stat(LEDGER_PATH));
  } catch {
    exists = false;
  }

  return NextResponse.json({
    ok: true,
    mode: "file",
    exists,
    path: DISPLAY_PATH,
    updatedAt: snapshot?.exportedAt ?? null,
    snapshot,
  });
}

export async function POST(request: Request) {
  const blocked = guard(request);
  if (blocked) return blocked;

  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, mode: "file", error: "Payload too large" }, { status: 413 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, mode: "file", error: "Invalid JSON" }, { status: 400 });
  }

  const snapshot = (body && typeof body === "object" && "snapshot" in body
    ? (body as { snapshot?: unknown }).snapshot
    : body) as unknown;

  if (!isLedgerSnapshot(snapshot)) {
    return NextResponse.json({ ok: false, mode: "file", error: "Invalid ledger snapshot" }, { status: 400 });
  }

  try {
    await writeSnapshot(snapshot);
  } catch {
    // 只读文件系统（例如 Vercel）上写不进去：退回浏览器模式，不报 500
    return disabledResponse(503, "服务端无法写入账本文件，账本只保存在本浏览器");
  }

  return NextResponse.json({
    ok: true,
    mode: "file",
    exists: true,
    path: DISPLAY_PATH,
    updatedAt: snapshot.exportedAt,
    snapshot,
  });
}
