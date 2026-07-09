import { NextResponse } from "next/server";
import { mkdir, readFile, rename, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import type { LocalLedgerSnapshot } from "@/types/account";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LEDGER_DIR = path.join(process.cwd(), ".nexus-local-ledger");
const LEDGER_PATH = path.join(LEDGER_DIR, "account-ledger.json");
const JOURNAL_PATH = path.join(LEDGER_DIR, "ledger-journal.ndjson");

function isLedgerSnapshot(value: unknown): value is LocalLedgerSnapshot {
  if (!value || typeof value !== "object") return false;
  const snapshot = value as Partial<LocalLedgerSnapshot>;
  return (
    snapshot.version === 1 &&
    typeof snapshot.exportedAt === "string" &&
    typeof snapshot.reason === "string" &&
    Boolean(snapshot.account) &&
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

export async function GET() {
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
    path: LEDGER_PATH,
    updatedAt: snapshot?.exportedAt ?? null,
    snapshot,
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as unknown;
    const snapshot = (body &&
      typeof body === "object" &&
      "snapshot" in body
      ? (body as { snapshot?: unknown }).snapshot
      : body) as unknown;

    if (!isLedgerSnapshot(snapshot)) {
      return NextResponse.json(
        {
          ok: false,
          mode: "file",
          path: LEDGER_PATH,
          error: "Invalid ledger snapshot",
        },
        { status: 400 }
      );
    }

    await writeSnapshot(snapshot);

    return NextResponse.json({
      ok: true,
      mode: "file",
      exists: true,
      path: LEDGER_PATH,
      updatedAt: snapshot.exportedAt,
      snapshot,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        mode: "file",
        path: LEDGER_PATH,
        error: error instanceof Error ? error.message : "Failed to write ledger",
      },
      { status: 500 }
    );
  }
}
