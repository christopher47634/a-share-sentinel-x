"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeftRight,
  BarChart3,
  Briefcase,
  LayoutGrid,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  {
    icon: LayoutGrid,
    label: "市场",
    href: "/mobile",
    match: (path: string) => path === "/mobile",
  },
  {
    icon: BarChart3,
    label: "板块",
    href: "/mobile/sectors/optical-communication",
    match: (path: string) => path.startsWith("/mobile/sectors"),
  },
  {
    icon: ArrowLeftRight,
    label: "交易",
    href: "/mobile/trade/600519",
    match: (path: string) => path.startsWith("/mobile/trade"),
  },
  {
    icon: Briefcase,
    label: "持仓",
    href: "/mobile/portfolio",
    match: (path: string) => path.startsWith("/mobile/portfolio"),
  },
  {
    icon: User,
    label: "我的",
    href: "/settings",
    match: (path: string) => path.startsWith("/settings"),
  },
];

export default function MobileShell({
  children,
  activeTab: controlledTab,
  hideTabs = false,
}: {
  children: React.ReactNode;
  activeTab?: number;
  hideTabs?: boolean;
}) {
  const [internalTab, setInternalTab] = useState(0);
  const pathname = usePathname();
  const routeActiveTab = tabs.findIndex((tab) => tab.match(pathname));
  const activeTab = controlledTab ?? (routeActiveTab >= 0 ? routeActiveTab : internalTab);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)]">
      <div className="global-bg" />

      <main
        className="flex-1 overflow-y-auto"
        style={{
          paddingBottom: hideTabs
            ? "env(safe-area-inset-bottom, 0px)"
            : "calc(80px + env(safe-area-inset-bottom, 0px))",
        }}
      >
        {children}
      </main>

      {!hideTabs && (
        <motion.nav
          initial={{ y: 80 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="fixed bottom-0 left-0 right-0 z-50"
          style={{
            background: "rgba(2, 6, 18, 0.6)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            borderTop: "0.5px solid rgba(255,255,255,0.06)",
            boxShadow: "0 -24px 80px rgba(0,0,0,0.45)",
            paddingBottom: "env(safe-area-inset-bottom, 0px)",
          }}
        >
          <div className="flex h-16 max-w-lg items-center justify-around px-2 mx-auto">
            {tabs.map((tab, i) => {
              const Icon = tab.icon;
              const isActive = i === activeTab;
              return (
                <Link
                  key={tab.label}
                  href={tab.href}
                  onClick={() => setInternalTab(i)}
                  className="mobile-press relative flex flex-1 flex-col items-center gap-0.5 py-1"
                  aria-current={isActive ? "page" : undefined}
                >
                  <div className="relative">
                    <Icon
                      size={20}
                      className={cn(
                        "transition-colors duration-200",
                        isActive ? "text-[var(--accent)]" : "text-[var(--text-muted)]"
                      )}
                      style={
                        isActive
                          ? { filter: "drop-shadow(0 0 6px rgba(212,165,116,0.4))" }
                          : undefined
                      }
                    />
                    {isActive && (
                      <motion.div
                        layoutId="mobile-tab-glow"
                        className="absolute inset-0 rounded-full"
                        style={{
                          background:
                            "radial-gradient(circle, rgba(212,165,116,0.35), transparent 70%)",
                          filter: "blur(10px)",
                        }}
                      />
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-[10px] transition-colors duration-200",
                      isActive
                        ? "font-medium text-[var(--accent)]"
                        : "text-[var(--text-muted)]"
                    )}
                  >
                    {tab.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </motion.nav>
      )}
    </div>
  );
}
