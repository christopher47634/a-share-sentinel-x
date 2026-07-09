import {
  getAccount,
  getPortfolioHistory,
  getPositions,
  getTransactions,
  saveAccount,
  savePortfolioHistory,
  savePositions,
  saveTransactions,
} from "@/lib/account-storage";
import type {
  LocalLedgerSnapshot,
  LocalLedgerSyncResult,
} from "@/types/account";

function isClient() {
  return typeof window !== "undefined";
}

function sortTransactions(
  transactions: LocalLedgerSnapshot["transactions"]
): LocalLedgerSnapshot["transactions"] {
  return [...transactions].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

export function buildLocalLedgerSnapshot(reason = "manual"): LocalLedgerSnapshot {
  const account = getAccount();
  const positions = getPositions();
  const transactions = getTransactions();
  const history = getPortfolioHistory();
  const sortedTransactions = sortTransactions(transactions);

  return {
    version: 1,
    reason,
    exportedAt: new Date().toISOString(),
    account,
    positions,
    transactions,
    history,
    stats: {
      positionCount: positions.length,
      transactionCount: transactions.length,
      historyCount: history.length,
      firstTransactionAt: sortedTransactions[0]?.createdAt ?? null,
      lastTransactionAt:
        sortedTransactions[sortedTransactions.length - 1]?.createdAt ?? null,
    },
  };
}

export async function syncLocalLedgerSnapshot(
  reason = "manual"
): Promise<LocalLedgerSyncResult> {
  if (!isClient()) {
    return { ok: false, mode: "browser", error: "Client storage unavailable" };
  }

  const snapshot = buildLocalLedgerSnapshot(reason);
  try {
    const response = await fetch("/api/account/ledger", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ snapshot }),
    });
    const data = (await response.json()) as LocalLedgerSyncResult;
    return response.ok ? data : { ...data, ok: false };
  } catch (error) {
    return {
      ok: false,
      mode: "browser",
      snapshot,
      updatedAt: snapshot.exportedAt,
      error: error instanceof Error ? error.message : "Ledger sync failed",
    };
  }
}

export async function fetchLocalLedgerSnapshot(): Promise<LocalLedgerSyncResult> {
  if (!isClient()) {
    return { ok: false, mode: "browser", error: "Client storage unavailable" };
  }

  try {
    const response = await fetch("/api/account/ledger", { cache: "no-store" });
    const data = (await response.json()) as LocalLedgerSyncResult;
    return response.ok ? data : { ...data, ok: false };
  } catch (error) {
    return {
      ok: false,
      mode: "browser",
      error: error instanceof Error ? error.message : "Ledger fetch failed",
    };
  }
}

export function restoreLocalLedgerSnapshot(snapshot: LocalLedgerSnapshot) {
  saveAccount(snapshot.account);
  savePositions(snapshot.positions);
  saveTransactions(snapshot.transactions);
  savePortfolioHistory(snapshot.history);
}

export function downloadLocalLedgerBackup(reason = "export") {
  if (!isClient()) return;

  const snapshot = buildLocalLedgerSnapshot(reason);
  const blob = new Blob([JSON.stringify(snapshot, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `sentinel-ledger-${new Date()
    .toISOString()
    .slice(0, 10)}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
