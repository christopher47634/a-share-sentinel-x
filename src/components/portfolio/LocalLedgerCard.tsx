"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  Database,
  Download,
  FileClock,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import type { LocalLedgerSyncResult } from "@/types/account";
import { cn } from "@/lib/utils";

interface LocalLedgerCardProps {
  status: LocalLedgerSyncResult | null;
  syncing?: boolean;
  onSync: () => void;
  onExport: () => void;
  delay?: number;
}

export default function LocalLedgerCard({
  status,
  syncing = false,
  onSync,
  onExport,
  delay = 0,
}: LocalLedgerCardProps) {
  const ready = Boolean(status?.ok && status?.exists);
  const browserFallback = status?.mode === "browser" || Boolean(status?.error);
  const title = ready
    ? "本地文件账本已同步"
    : browserFallback
    ? "浏览器账本运行中"
    : "本地账本待同步";
  const description = ready
    ? "账户、持仓、流水和资产曲线已写入本机项目目录。"
    : browserFallback
    ? "当前仍可交易和复盘，但文件账本暂未写入成功。"
    : "点击同步后，会在本机生成一份可长期保存的 JSON 账本。";

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, delay: delay * 0.08 }}
      className="glass relative overflow-hidden rounded-2xl p-4 md:p-5"
      style={{
        background:
          "radial-gradient(circle at 90% 10%, rgba(212,165,116,0.13), transparent 34%), linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.018))",
        border: "1px solid rgba(255,255,255,0.09)",
      }}
    >
      <div className="relative z-10">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <div className="mb-1.5 flex items-center gap-2">
              <Database size={15} className="text-[var(--accent)]" />
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                本地账本
              </h2>
            </div>
            <p className="text-xs leading-5 text-[var(--text-muted)]">
              {description}
            </p>
          </div>
          <span
            className={cn(
              "shrink-0 rounded-full border px-2 py-1 text-[10px] font-medium",
              ready
                ? "border-[rgba(52,211,153,0.35)] bg-[rgba(52,211,153,0.12)] text-up"
                : "border-[rgba(212,165,116,0.28)] bg-[var(--accent-soft)] text-[var(--accent)]"
            )}
          >
            {ready ? "FILE" : "LOCAL"}
          </span>
        </div>

        <div className="mb-4 rounded-xl border border-white/10 bg-black/10 p-3">
          <div className="mb-2 flex items-center gap-2">
            {ready ? (
              <CheckCircle2 size={14} className="text-up" />
            ) : (
              <FileClock size={14} className="text-[var(--accent)]" />
            )}
            <span className="text-xs font-semibold text-[var(--text-primary)]">
              {title}
            </span>
          </div>
          <div className="space-y-1 text-[11px] leading-5 text-[var(--text-muted)]">
            <div className="flex items-center justify-between gap-3">
              <span>快照时间</span>
              <span className="font-mono-nums text-[var(--text-secondary)]">
                {status?.updatedAt
                  ? new Date(status.updatedAt).toLocaleString("zh-CN", {
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "待生成"}
              </span>
            </div>
            <div className="flex items-start justify-between gap-3">
              <span>保存位置</span>
              <span className="max-w-[210px] truncate text-right font-mono text-[var(--text-secondary)]">
                {status?.path ?? ".nexus-local-ledger/account-ledger.json"}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={onSync}
            disabled={syncing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--accent)]/30 bg-[var(--accent-soft)] px-3 py-2.5 text-xs font-medium text-[var(--accent)] transition disabled:opacity-60"
          >
            <RefreshCw size={13} className={syncing ? "animate-spin" : ""} />
            {syncing ? "同步中" : "同步账本"}
          </motion.button>
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={onExport}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2.5 text-xs font-medium text-[var(--text-secondary)] transition hover:border-[var(--accent)]/30 hover:text-[var(--accent)]"
          >
            <Download size={13} />
            导出备份
          </motion.button>
        </div>

        <div className="mt-3 flex items-start gap-2 rounded-xl bg-white/[0.025] p-3 text-[11px] leading-5 text-[var(--text-muted)]">
          <ShieldCheck size={14} className="mt-0.5 shrink-0 text-[var(--accent)]" />
          不发出去的情况下，这个文件账本就是本机长期练习的“黑匣子”。
        </div>
      </div>
    </motion.section>
  );
}
