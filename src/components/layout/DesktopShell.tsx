"use client";

import { useMouseGlow } from "@/hooks/use-mouse-position";
import { useCursorGlow } from "@/hooks/useCursorGlow";
import { CursorOverlay } from "@/components/interaction/CursorOverlay";
import {
  BookOpenCheck,
  Briefcase,
  ClipboardList,
  Eye,
  FlaskConical,
  LayoutDashboard,
  Radar,
  ScrollText,
  Settings,
  ShieldAlert,
  TrendingUp,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import ThemeSwitcher from "@/components/common/ThemeSwitcher";
import { DemoButton } from "@/components/demo/DemoMode";
import { motion } from "framer-motion";

const navItems = [
  { icon: ScrollText, label: "交付总览", href: "/submission" },
  { icon: Zap, label: "指挥舱", href: "/command-center" },
  { icon: Radar, label: "AI看盘", href: "/market-radar" },
  { icon: Eye, label: "AI盯盘", href: "/watch-tower" },
  { icon: FlaskConical, label: "AI解盘", href: "/causality-lab" },
  { icon: LayoutDashboard, label: "市场", href: "/" },
  { icon: TrendingUp, label: "板块", href: "/#sectors" },
  { icon: Briefcase, label: "持仓", href: "/portfolio" },
  { icon: ClipboardList, label: "订单", href: "/orders" },
  { icon: Settings, label: "设置", href: "/settings" },
  { icon: ShieldAlert, label: "风险护盾", href: "/risk-shield" },
  { icon: BookOpenCheck, label: "盘后复盘", href: "/trading-journal" },
];

function isNavActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/command-center") return pathname === "/command-center";
  if (href.includes("#")) return false;
  return pathname.startsWith(href);
}

export default function DesktopShell({
  children,
}: {
  children: React.ReactNode;
}) {
  useMouseGlow();
  useCursorGlow();
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex">
      <div className="global-bg" />

      <motion.aside
        initial={{ x: -64, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="fixed left-0 top-0 bottom-0 z-30 hidden md:flex w-16 flex-col items-center border-r border-[var(--border-subtle)] bg-[var(--surface-1)] py-4"
      >
        <Link
          href="/"
          aria-label="返回市场首页"
          className="mb-6 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent)] opacity-80 transition hover:opacity-100"
        >
          <span className="text-sm font-bold text-[var(--bg-primary)]">N</span>
        </Link>

        <nav className="flex flex-1 flex-col items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = isNavActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                className={cn(
                  "relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200",
                  isActive
                    ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                    : "text-[var(--text-muted)] hover:bg-[var(--glass-bg)] hover:text-[var(--text-secondary)]"
                )}
              >
                <Icon size={18} />
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute left-0 top-1/2 h-5 w-[3px] -translate-x-[1px] -translate-y-1/2 rounded-r-full bg-[var(--accent)]"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex flex-col items-center gap-2">
          <DemoButton />
          <ThemeSwitcher />
        </div>
      </motion.aside>

      <main className="min-h-screen min-w-0 flex-1 overflow-hidden md:ml-16">
        <CursorOverlay />
        {children}
      </main>

      <nav
        className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-[rgba(212,165,116,0.12)] bg-[#0d0d14]/95 py-2.5 backdrop-blur-xl md:hidden"
        style={{ boxShadow: "0 -4px 20px rgba(0,0,0,0.4)" }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = isNavActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-lg px-3 py-1 transition-colors",
                isActive ? "text-[var(--accent)]" : "text-[var(--text-muted)]"
              )}
            >
              <Icon size={18} />
              <span className="text-[10px]">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
