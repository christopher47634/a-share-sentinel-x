"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  BarChart3,
  Bell,
  Bot,
  CheckCircle2,
  ChevronRight,
  Clock,
  Database,
  Eye,
  Globe,
  Info,
  Lock,
  Monitor,
  Moon,
  Palette,
  RefreshCw,
  RotateCcw,
  Settings,
  Shield,
  Smartphone,
  Volume2,
  Wifi,
  Zap,
} from "lucide-react";
import DesktopShell from "@/components/layout/DesktopShell";
import { cn } from "@/lib/utils";
import type { MarketSnapshot } from "@/types/market";

const STORAGE_KEY = "nexus-trade-settings";

type SettingsState = {
  notifications: boolean;
  sound: boolean;
  haptic: boolean;
  darkMode: boolean;
  compactMode: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
  showVolume: boolean;
  showMA: boolean;
  riskAlert: boolean;
  confirmOrder: boolean;
  biometric: boolean;
  priceAlert: boolean;
  klineAnimation: boolean;
  reducedMotion: boolean;
};

const DEFAULT_SETTINGS: SettingsState = {
  notifications: true,
  sound: true,
  haptic: true,
  darkMode: true,
  compactMode: false,
  autoRefresh: true,
  refreshInterval: 5,
  showVolume: true,
  showMA: true,
  riskAlert: true,
  confirmOrder: true,
  biometric: false,
  priceAlert: true,
  klineAnimation: true,
  reducedMotion: false,
};

const LOCAL_READINESS_ITEMS = [
  {
    title: "模拟交易闭环",
    status: "done",
    detail: "行情、下单、成交、持仓、订单已经能跑通。",
  },
  {
    title: "真实行情深度",
    status: "done",
    detail: "已接入真实报价、近三年日/周/月线和分钟 K。",
  },
  {
    title: "AI 研究助手",
    status: "done",
    detail: "能基于行情和技术指标做研究辅助，不给绝对买卖指令。",
  },
  {
    title: "本地长期账本",
    status: "done",
    detail: "已加入本地文件账本、成交打点、收益曲线复盘和导出备份。",
  },
  {
    title: "回测与复盘",
    status: "todo",
    detail: "收益曲线复盘已补，还可以继续加策略回测和行情回放。",
  },
  {
    title: "风控规则引擎",
    status: "todo",
    detail: "还可以加仓位上限、止损提醒、单票集中度等硬规则。",
  },
] as const;

function Toggle({
  enabled,
  onToggle,
  label,
}: {
  enabled: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      aria-pressed={enabled}
      onClick={onToggle}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.94 }}
      className={cn(
        "relative h-6 w-11 shrink-0 overflow-hidden rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/35",
        enabled
          ? "bg-[var(--accent)] shadow-[0_0_12px_rgba(212,165,116,0.3)]"
          : "bg-[var(--surface-2)]"
      )}
    >
      {enabled && (
        <motion.span
          className="absolute inset-0 bg-white/20"
          initial={{ x: "-120%" }}
          animate={{ x: "120%" }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      )}
      <motion.span
        layout
        className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md"
        style={{ left: enabled ? 22 : 2 }}
        transition={{ type: "spring", stiffness: 520, damping: 32 }}
      />
    </motion.button>
  );
}

function SettingRow({
  icon: Icon,
  label,
  description,
  children,
}: {
  icon: React.ElementType;
  label: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <motion.div
      whileHover={{ x: 3, backgroundColor: "rgba(255,255,255,0.025)" }}
      transition={{ type: "spring", stiffness: 420, damping: 32 }}
      className="flex items-center justify-between gap-3 rounded-xl px-1 py-3.5"
    >
      <div className="flex min-w-0 items-center gap-3">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
          style={{
            background: "rgba(212,165,116,0.08)",
            border: "1px solid rgba(212,165,116,0.12)",
          }}
        >
          <Icon size={15} className="text-[var(--accent)]" />
        </div>
        <div className="min-w-0">
          <span className="block text-sm text-[var(--text-primary)]">{label}</span>
          {description && (
            <span className="mt-0.5 block text-[11px] leading-4 text-[var(--text-muted)]">
              {description}
            </span>
          )}
        </div>
      </div>
      {children}
    </motion.div>
  );
}

function SectionCard({
  title,
  children,
  delay = 0,
}: {
  title: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.4, delay }}
      className="glass rounded-2xl p-4 md:p-5"
      style={{
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
        border: "1px solid rgba(255,255,255,0.06)",
        backdropFilter: "blur(20px)",
      }}
    >
      <h3 className="mb-3 px-1 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
        {title}
      </h3>
      <div className="divide-y divide-[rgba(255,255,255,0.04)]">{children}</div>
    </motion.div>
  );
}

function StatusCard({
  icon: Icon,
  label,
  value,
  tone = "neutral",
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  tone?: "neutral" | "good" | "warn";
}) {
  return (
    <motion.div
      whileHover={{ y: -2, borderColor: "rgba(212,165,116,0.28)" }}
      transition={{ type: "spring", stiffness: 420, damping: 32 }}
      className="rounded-xl border border-white/10 bg-white/[0.035] p-3"
    >
      <div className="mb-1.5 flex items-center gap-1.5 text-[10px] text-[var(--text-muted)]">
        <Icon size={13} />
        {label}
      </div>
      <div
        className={cn(
          "truncate text-sm font-semibold",
          tone === "good" && "text-up",
          tone === "warn" && "text-amber-200",
          tone === "neutral" && "text-[var(--text-primary)]"
        )}
      >
        {value}
      </div>
    </motion.div>
  );
}

function LocalReadinessCard() {
  const doneCount = LOCAL_READINESS_ITEMS.filter((item) => item.status === "done").length;
  const score = Math.round((doneCount / LOCAL_READINESS_ITEMS.length) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.4, delay: 0.08 }}
      className="glass relative overflow-hidden rounded-2xl p-4 md:p-5"
      style={{
        background:
          "radial-gradient(circle at 15% 0%, rgba(212,165,116,0.14), transparent 34%), linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.015))",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent,rgba(255,255,255,0.035),transparent)]" />
      <div className="relative z-10 mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">
            本地模拟盘体检
          </h3>
          <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
            不考虑发布出去的话，核心缺口主要在“策略回测、硬风控、撮合细节”。
          </p>
        </div>
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 420, damping: 24 }}
          className="shrink-0 rounded-2xl border border-[var(--accent)]/30 bg-[var(--accent-soft)] px-3 py-2 text-center"
        >
          <div className="text-lg font-bold text-[var(--accent)]">{score}%</div>
          <div className="text-[10px] text-[var(--text-muted)]">本地完成度</div>
        </motion.div>
      </div>

      <div className="relative z-10 mb-4 h-2 overflow-hidden rounded-full bg-white/[0.05]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="h-full rounded-full bg-[var(--accent)] shadow-[0_0_18px_rgba(212,165,116,0.35)]"
        />
      </div>

      <div className="relative z-10 grid grid-cols-1 gap-2 md:grid-cols-2">
        {LOCAL_READINESS_ITEMS.map((item, index) => {
          const done = item.status === "done";
          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 + index * 0.035 }}
              className="rounded-xl border border-white/10 bg-black/10 p-3"
            >
              <div className="mb-1.5 flex items-center gap-2">
                {done ? (
                  <CheckCircle2 size={14} className="text-up" />
                ) : (
                  <AlertTriangle size={14} className="text-amber-200" />
                )}
                <span className="text-xs font-medium text-[var(--text-primary)]">
                  {item.title}
                </span>
              </div>
              <p className="text-[11px] leading-5 text-[var(--text-muted)]">{item.detail}</p>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

function formatSavedTime(iso: string | null) {
  if (!iso) return "等待保存";
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(iso));
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);
  const [hydrated, setHydrated] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [savePulse, setSavePulse] = useState(false);
  const [snapshot, setSnapshot] = useState<MarketSnapshot | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(raw) });
      }
    } catch {
      /* localStorage may be unavailable */
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      setSavedAt(new Date().toISOString());
      setSavePulse(true);
    } catch {
      setSavedAt(null);
    }
    const timer = window.setTimeout(() => setSavePulse(false), 1200);
    return () => window.clearTimeout(timer);
  }, [hydrated, settings]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/market/snapshot?codes=600519,300750,688981")
      .then((response) => response.json())
      .then((data: MarketSnapshot) => {
        if (!cancelled) setSnapshot(data);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const enabledCount = useMemo(
    () =>
      Object.entries(settings).filter(
        ([key, value]) => key !== "refreshInterval" && value === true
      ).length,
    [settings]
  );

  const toggle = (key: keyof SettingsState) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const reset = () => setSettings(DEFAULT_SETTINGS);

  const liveCount = snapshot?.quotes.filter((quote) => quote.source === "eastmoney").length ?? 0;
  const dataTone = !snapshot ? "neutral" : snapshot.fallbackUsed ? "warn" : "good";

  return (
    <DesktopShell>
      <div className="mx-auto max-w-3xl space-y-4 p-4 pb-20 md:p-6 md:pb-6 page-enter">
        <AnimatePresence>
          {savePulse && (
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.24 }}
              className="fixed right-4 top-4 z-50 inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/25 bg-[#070b16]/90 px-3 py-2 text-xs text-[var(--text-secondary)] shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl"
            >
              <CheckCircle2 size={14} className="text-up" />
              设置已自动保存
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{
                background:
                  "linear-gradient(135deg, rgba(212,165,116,0.2) 0%, rgba(212,165,116,0.05) 100%)",
                border: "1px solid rgba(212,165,116,0.2)",
              }}
            >
              <Settings size={20} className="text-[var(--accent)]" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-[var(--text-primary)]">设置</h1>
              <p className="text-xs text-[var(--text-muted)]">
                个性化你的模拟实盘体验，修改后会自动保存
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-[11px] text-[var(--text-muted)]">
              <CheckCircle2 size={13} className="text-up" />
              已保存 {formatSavedTime(savedAt)}
            </span>
            <motion.button
              type="button"
              onClick={reset}
              whileHover={{ y: -1, scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-[11px] text-[var(--text-secondary)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              <RotateCcw size={13} />
              恢复默认
            </motion.button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="glass rounded-2xl p-4 md:p-5"
          style={{
            background:
              "linear-gradient(135deg, rgba(212,165,116,0.06) 0%, rgba(212,165,116,0.02) 100%)",
            border: "1px solid rgba(212,165,116,0.1)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div className="mb-4 flex items-center gap-4">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-bold text-[var(--accent)]"
              style={{
                background:
                  "linear-gradient(135deg, rgba(212,165,116,0.2) 0%, rgba(212,165,116,0.08) 100%)",
                border: "1px solid rgba(212,165,116,0.25)",
                boxShadow: "0 4px 16px rgba(212,165,116,0.15)",
              }}
            >
              N
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-semibold text-[var(--text-primary)]">Nexus Trade</h2>
              <p className="mt-0.5 text-xs text-[var(--text-muted)]">模拟交易账户 · 专业版</p>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <span className="rounded border border-[rgba(212,165,116,0.15)] bg-[rgba(212,165,116,0.12)] px-2 py-0.5 text-[10px] font-medium text-[var(--accent)]">
                  演示模式
                </span>
                <span className="text-[10px] text-[var(--text-muted)]">ID: NX-2026-0001</span>
                <span className="text-[10px] text-[var(--text-muted)]">
                  已开启 {enabledCount} 项体验增强
                </span>
              </div>
            </div>
            <ChevronRight size={16} className="shrink-0 text-[var(--text-muted)]" />
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <StatusCard
              icon={Database}
              label="行情数据"
              value={
                snapshot
                  ? snapshot.fallbackUsed
                    ? `${liveCount}/${snapshot.quotes.length} 实时`
                    : "实时源正常"
                  : "检测中"
              }
              tone={dataTone}
            />
            <StatusCard
              icon={Bot}
              label="AI 助手"
              value="已接入行情上下文"
              tone="good"
            />
            <StatusCard
              icon={Wifi}
              label="自动刷新"
              value={settings.autoRefresh ? `${settings.refreshInterval}s` : "已关闭"}
              tone={settings.autoRefresh ? "good" : "neutral"}
            />
          </div>
        </motion.div>

        <LocalReadinessCard />

        <SectionCard title="交易偏好" delay={0.1}>
          <SettingRow icon={Bell} label="交易通知" description="委托提交、模拟成交和价格预警提醒">
            <Toggle
              label="切换交易通知"
              enabled={settings.notifications}
              onToggle={() => toggle("notifications")}
            />
          </SettingRow>
          <SettingRow icon={Volume2} label="提示音效" description="下单、成交、风险提示的声音反馈">
            <Toggle label="切换提示音效" enabled={settings.sound} onToggle={() => toggle("sound")} />
          </SettingRow>
          <SettingRow icon={Smartphone} label="触感反馈" description="手机端关键操作的震动反馈">
            <Toggle label="切换触感反馈" enabled={settings.haptic} onToggle={() => toggle("haptic")} />
          </SettingRow>
          <SettingRow icon={Shield} label="下单确认" description="提交委托前进行二次确认，避免误触">
            <Toggle
              label="切换下单确认"
              enabled={settings.confirmOrder}
              onToggle={() => toggle("confirmOrder")}
            />
          </SettingRow>
          <SettingRow icon={Zap} label="风险预警" description="持仓异动、波动扩大时及时提醒">
            <Toggle
              label="切换风险预警"
              enabled={settings.riskAlert}
              onToggle={() => toggle("riskAlert")}
            />
          </SettingRow>
        </SectionCard>

        <SectionCard title="显示设置" delay={0.15}>
          <SettingRow icon={Moon} label="深色模式" description="保持金融终端式暗色界面">
            <Toggle label="切换深色模式" enabled={settings.darkMode} onToggle={() => toggle("darkMode")} />
          </SettingRow>
          <SettingRow icon={Monitor} label="紧凑模式" description="缩小间距，让桌面端显示更多行情信息">
            <Toggle
              label="切换紧凑模式"
              enabled={settings.compactMode}
              onToggle={() => toggle("compactMode")}
            />
          </SettingRow>
          <SettingRow icon={Eye} label="K 线动效" description="周期切换和图表加载使用自然过渡">
            <Toggle
              label="切换K线动效"
              enabled={settings.klineAnimation}
              onToggle={() => toggle("klineAnimation")}
            />
          </SettingRow>
          <SettingRow icon={Palette} label="减弱动效" description="减少动效强度，适合长时间盯盘">
            <Toggle
              label="切换减弱动效"
              enabled={settings.reducedMotion}
              onToggle={() => toggle("reducedMotion")}
            />
          </SettingRow>
        </SectionCard>

        <SectionCard title="行情设置" delay={0.2}>
          <SettingRow icon={BarChart3} label="显示成交量" description="K 线和分钟图下方显示成交量柱">
            <Toggle
              label="切换成交量"
              enabled={settings.showVolume}
              onToggle={() => toggle("showVolume")}
            />
          </SettingRow>
          <SettingRow icon={BarChart3} label="均线指标" description="显示 MA5 / MA10 / MA20 辅助判断趋势">
            <Toggle label="切换均线指标" enabled={settings.showMA} onToggle={() => toggle("showMA")} />
          </SettingRow>
          <SettingRow icon={Clock} label="自动刷新" description="真实行情数据定时更新">
            <Toggle
              label="切换自动刷新"
              enabled={settings.autoRefresh}
              onToggle={() => toggle("autoRefresh")}
            />
          </SettingRow>
          {settings.autoRefresh && (
            <SettingRow icon={RefreshCw} label="刷新频率" description="选择行情刷新间隔">
              <div className="flex rounded-lg border border-white/10 bg-white/[0.035] p-0.5">
                {[3, 5, 10, 30].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setSettings((prev) => ({ ...prev, refreshInterval: value }))}
                    className={cn(
                      "rounded-md px-2 py-1 text-[11px] transition",
                      settings.refreshInterval === value
                        ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                        : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                    )}
                  >
                    {value}s
                  </button>
                ))}
              </div>
            </SettingRow>
          )}
          <SettingRow icon={Bell} label="价格预警" description="关注股票价格变动时提醒">
            <Toggle
              label="切换价格预警"
              enabled={settings.priceAlert}
              onToggle={() => toggle("priceAlert")}
            />
          </SettingRow>
        </SectionCard>

        <SectionCard title="安全设置" delay={0.25}>
          <SettingRow icon={Lock} label="生物识别" description="指纹 / 面容解锁，当前为本地演示状态">
            <Toggle
              label="切换生物识别"
              enabled={settings.biometric}
              onToggle={() => toggle("biometric")}
            />
          </SettingRow>
          <SettingRow icon={Shield} label="交易密码" description="模拟盘暂不需要真实交易密码">
            <span className="text-xs text-[var(--text-muted)]">演示账户</span>
          </SettingRow>
          <SettingRow icon={Shield} label="登录设备" description="当前浏览器会保存你的本地设置">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--text-muted)]">1 台设备</span>
              <ChevronRight size={16} className="text-[var(--text-muted)]" />
            </div>
          </SettingRow>
        </SectionCard>

        <SectionCard title="关于" delay={0.3}>
          <SettingRow icon={Info} label="版本信息" description="真实行情、AI 助手、分钟 K 线增强版">
            <span className="font-mono text-xs text-[var(--text-muted)]">v7.1.0</span>
          </SettingRow>
          <SettingRow icon={Globe} label="数据说明" description="行情来自公开数据源，失败时会明确标注兜底">
            <span className="text-xs text-[var(--text-muted)]">透明标记</span>
          </SettingRow>
          <SettingRow icon={AlertTriangle} label="投资提示" description="AI 输出仅用于研究辅助，不构成投资建议">
            <span className="text-xs text-amber-200/80">请谨慎决策</span>
          </SettingRow>
        </SectionCard>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="pb-4 pt-2 text-center"
        >
          <p className="text-[10px] text-[var(--text-muted)] opacity-60">
            Nexus Trade · 模拟交易平台 · 真实行情用于研究展示，交易为本地模拟
          </p>
        </motion.div>
      </div>
    </DesktopShell>
  );
}
