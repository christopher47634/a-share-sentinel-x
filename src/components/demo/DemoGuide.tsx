"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useDemo, demoSteps } from "./DemoMode";
import { ensureDemoTradeSeeded } from "@/lib/account-storage";

/* ─────────────────── Step Configuration ─────────────────────── */

interface StepConfig {
  /** CSS selector for the element to highlight */
  selector: string;
  /** Badge label text */
  badge: string;
  /** Route pattern this step applies to (startsWith match) */
  route: string;
  /** Optional: after which step to auto-advance (for click-driven steps) */
  advanceOn?: "click" | "delay";
  /** For delay-based advance, milliseconds to wait */
  delayMs?: number;
  /** Navigation target when advancing from this step */
  navigateTo?: string;
}

const stepConfigs: StepConfig[] = [
  // Step 0: Homepage — highlight 光通信 card
  {
    selector: '[data-demo-highlight="optical-communication"]',
    badge: "市场总览",
    route: "/",
    advanceOn: "click",
    navigateTo: "/sectors/optical-communication",
  },
  // Step 1: Sector page — highlight first stock row
  {
    selector: '[data-demo-highlight="first-stock"]',
    badge: "板块分析",
    route: "/sectors/",
    advanceOn: "click",
    navigateTo: "/stocks/300308",
  },
  // Step 2: Stock page — highlight chart type switcher
  {
    selector: '[data-demo-highlight="chart-type-switcher"]',
    badge: "技术视图",
    route: "/stocks/",
    advanceOn: "click",
  },
  // Step 3: Stock page — highlight buy button
  {
    selector: '[data-demo-highlight="buy-button"]',
    badge: "交易入口",
    route: "/stocks/",
    advanceOn: "click",
  },
  // Step 4: TradePanel — highlight price/quantity inputs
  {
    selector: '[data-demo-highlight="trade-inputs"]',
    badge: "模拟交易",
    route: "/stocks/",
    advanceOn: "delay",
    delayMs: 2500,
  },
  // Step 5: TradePanel — highlight confirm buy button
  {
    selector: '[data-demo-highlight="confirm-buy"]',
    badge: "确认委托",
    route: "/stocks/",
    advanceOn: "click",
  },
  // Step 6: TradePanel — highlight view orders button
  {
    selector: '[data-demo-highlight="view-orders"]',
    badge: "订单回执",
    route: "/stocks/",
    advanceOn: "click",
    navigateTo: "/orders",
  },
  // Step 7: Orders page — highlight order table
  {
    selector: '[data-demo-highlight="order-table"]',
    badge: "订单归档",
    route: "/orders",
    advanceOn: "click",
    navigateTo: "/portfolio",
  },
  // Step 8: Portfolio page — highlight position table
  {
    selector: '[data-demo-highlight="portfolio-table"]',
    badge: "持仓变化",
    route: "/portfolio",
    advanceOn: "delay",
    delayMs: 3000,
  },
  // Step 9: Portfolio page — highlight transaction list
  {
    selector: '[data-demo-highlight="transaction-list"]',
    badge: "闭环完成",
    route: "/portfolio",
    advanceOn: "delay",
    delayMs: 3000,
  },
];

/* ─────────────────── CSS injection (once) ───────────────────── */

let styleInjected = false;
function injectDemoStyles() {
  if (styleInjected || typeof document === "undefined") return;
  styleInjected = true;
  const style = document.createElement("style");
  style.textContent = `
    @keyframes demoPulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }
    @keyframes demoBadgeBounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-2px); }
    }
    [data-demo-active="true"] {
      position: relative;
      z-index: 85;
    }
  `;
  document.head.appendChild(style);
}

/* ─────────────────── DemoGuide Component ────────────────────── */

export default function DemoGuide() {
  const { demoMode, currentStep, nextStep, stopDemo } = useDemo();
  const pathname = usePathname();
  const router = useRouter();
  const cleanupRef = useRef<(() => void) | null>(null);
  const delayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const observerRef = useRef<MutationObserver | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile viewport
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Inject CSS once
  useEffect(() => {
    injectDemoStyles();
  }, []);

  /** Determine if current route matches the step's expected route */
  const routeMatches = useCallback(
    (stepRoute: string) => {
      if (stepRoute === "/") return pathname === "/";
      return pathname.startsWith(stepRoute);
    },
    [pathname]
  );

  /** Core highlight + interaction logic */
  const applyHighlight = useCallback(() => {
    // Clean up previous highlight
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }
    if (delayTimerRef.current) {
      clearTimeout(delayTimerRef.current);
      delayTimerRef.current = null;
    }

    if (!demoMode) return;

    const config = stepConfigs[currentStep];
    if (!config) return;

    // If not on the right route, don't highlight (DemoGuide just shows the step indicator)
    if (!routeMatches(config.route)) return;

    const el = document.querySelector(config.selector) as HTMLElement | null;
    if (!el) return;

    // Save original styles
    const origBoxShadow = el.style.boxShadow;
    const origBorder = el.style.border;
    const origPosition = el.style.position;
    const origZIndex = el.style.zIndex;

    // Apply refined gold highlight — thinner, softer
    el.style.boxShadow =
      "0 0 0 1px rgba(212,184,150,0.4), 0 0 20px rgba(212,184,150,0.15)";
    el.style.border = "1px dashed rgba(212,184,150,0.5)";
    el.style.borderRadius = "12px";
    el.style.transition = "box-shadow 0.3s ease, border-color 0.3s ease";
    el.style.position = origPosition || "relative";
    el.style.zIndex = "85";
    el.setAttribute("data-demo-active", "true");

    // Create refined badge
    const badge = document.createElement("div");
    badge.id = "demo-guide-badge";
    badge.style.cssText =
      "position:absolute;top:-10px;right:-10px;z-index:90;pointer-events:none;";
    badge.innerHTML = `<div style="
      background: rgba(180, 150, 80, 0.15);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      color: #d4b896;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 500;
      height: 24px;
      display: flex;
      align-items: center;
      white-space: nowrap;
      border: 1px solid rgba(180, 150, 80, 0.3);
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      animation: demoBadgeBounce 1.5s ease-in-out infinite;
    ">${config.badge}</div>`;
    el.appendChild(badge);

    // Scroll element into view
    el.scrollIntoView({ behavior: "smooth", block: "center" });

    // Cleanup function
    const cleanup = () => {
      el.style.boxShadow = origBoxShadow;
      el.style.border = origBorder;
      el.style.borderRadius = "";
      el.style.position = origPosition;
      el.style.zIndex = origZIndex;
      el.removeAttribute("data-demo-active");
      const b = document.getElementById("demo-guide-badge");
      if (b) b.remove();
      el.removeEventListener("click", handleClick);
    };

    // Click handler
    const handleClick = () => {
      // Seed demo trade data when leaving confirm-buy step (step 5)
      if (currentStep === 5) {
        ensureDemoTradeSeeded();
      }

      cleanup();
      cleanupRef.current = null;

      // Navigate if needed
      if (config.navigateTo) {
        router.push(config.navigateTo);
        // Advance step after a brief delay to let navigation start
        setTimeout(() => nextStep(), 100);
      } else {
        nextStep();
      }
    };

    if (config.advanceOn === "click") {
      el.addEventListener("click", handleClick);
    } else if (config.advanceOn === "delay") {
      delayTimerRef.current = setTimeout(() => {
        cleanup();
        cleanupRef.current = null;
        if (config.navigateTo) {
          router.push(config.navigateTo);
          setTimeout(() => nextStep(), 100);
        } else {
          nextStep();
        }
      }, config.delayMs || 2000);
    }

    cleanupRef.current = cleanup;
  }, [demoMode, currentStep, routeMatches, nextStep, router]); // eslint-disable-line react-hooks/exhaustive-deps

  // Run highlight on step change and route change
  useEffect(() => {
    // Small delay to let the page render
    const timer = setTimeout(applyHighlight, 300);
    return () => clearTimeout(timer);
  }, [applyHighlight, pathname]);

  // MutationObserver to re-apply highlight when DOM changes (e.g., element appears after mount)
  useEffect(() => {
    if (!demoMode) return;

    const config = stepConfigs[currentStep];
    if (!config || !routeMatches(config.route)) return;

    // Disconnect previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    let retryCount = 0;
    const maxRetries = 50; // ~5 seconds at 100ms intervals

    const tryHighlight = () => {
      const el = document.querySelector(config.selector);
      if (el) {
        applyHighlight();
      } else if (retryCount < maxRetries) {
        retryCount++;
        setTimeout(tryHighlight, 100);
      }
    };

    // Initial attempt
    tryHighlight();

    // Watch for DOM mutations
    const observer = new MutationObserver(() => {
      const el = document.querySelector(config.selector);
      if (el && !cleanupRef.current) {
        applyHighlight();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    observerRef.current = observer;

    return () => {
      observer.disconnect();
      observerRef.current = null;
    };
  }, [demoMode, currentStep, pathname, routeMatches, applyHighlight]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
      if (delayTimerRef.current) {
        clearTimeout(delayTimerRef.current);
        delayTimerRef.current = null;
      }
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, []);

  // Clean up highlight when demo is turned off
  useEffect(() => {
    if (!demoMode) {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
      if (delayTimerRef.current) {
        clearTimeout(delayTimerRef.current);
        delayTimerRef.current = null;
      }
    }
  }, [demoMode]);

  // ── Progress indicator bar ──
  return (
    <AnimatePresence>
      {demoMode && (
        isMobile ? (
          /* ── Mobile: bottom card style ── */
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-20 left-3 right-3 z-[10000] pointer-events-auto"
          >
            <div
              className="flex items-center gap-3 rounded-xl"
              style={{
                background: "rgba(20, 20, 30, 0.92)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid rgba(212,184,150,0.2)",
                padding: "10px 14px",
                boxShadow: "0 -4px 24px rgba(0,0,0,0.5)",
              }}
            >
              <span
                className="text-[11px] font-mono-nums flex-shrink-0"
                style={{ color: "#d4b896" }}
              >
                {currentStep + 1}/{demoSteps.length}
              </span>
              <span
                className="text-[12px] flex-1 truncate"
                style={{ color: "rgba(255,255,255,0.8)" }}
              >
                {demoSteps[currentStep]}
              </span>
              <button
                onClick={stopDemo}
                className="flex items-center justify-center w-6 h-6 rounded-full flex-shrink-0"
                style={{
                  color: "rgba(255,255,255,0.5)",
                  background: "rgba(255,255,255,0.08)",
                }}
                title="退出演示"
              >
                <span className="text-[14px] leading-none">×</span>
              </button>
            </div>
          </motion.div>
        ) : (
          /* ── Desktop: top progress bar ── */
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed top-3 left-1/2 -translate-x-1/2 z-[10000] pointer-events-auto"
          >
            <div
              className="flex flex-col items-center gap-1.5"
              style={{
                background: "rgba(20, 20, 30, 0.85)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "8px",
                padding: "8px 16px",
                maxWidth: "360px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              }}
            >
              {/* Top row: Demo label + step counter + title + close */}
              <div className="flex items-center gap-2 w-full">
                <span
                  className="text-[12px] font-medium"
                  style={{ color: "rgba(255,255,255,0.7)" }}
                >
                  Demo
                </span>
                <span
                  className="text-[11px] font-mono-nums"
                  style={{ color: "#d4b896" }}
                >
                  {currentStep + 1}/{demoSteps.length}
                </span>
                <span
                  className="text-[11px] flex-1 text-center"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  {stepConfigs[currentStep]?.badge || demoSteps[currentStep]}
                </span>
                <button
                  onClick={stopDemo}
                  className="flex items-center justify-center w-5 h-5 rounded hover:bg-white/10 transition-colors"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                  title="退出演示"
                >
                  <span className="text-[13px] leading-none">×</span>
                </button>
              </div>

              {/* Progress dots — compact for 10 steps */}
              <div className="flex items-center gap-0">
                {demoSteps.map((_, i) => {
                  const isCompleted = i < currentStep;
                  const isCurrent = i === currentStep;
                  return (
                    <div key={i} className="flex items-center">
                      <div
                        className="rounded-full"
                        style={{
                          width: isCurrent ? "8px" : "5px",
                          height: isCurrent ? "8px" : "5px",
                          background: isCurrent
                            ? "#d4b896"
                            : isCompleted
                            ? "rgba(212,184,150,0.5)"
                            : "rgba(255,255,255,0.2)",
                          boxShadow: isCurrent
                            ? "0 0 6px rgba(212,184,150,0.4)"
                            : "none",
                          transition: "all 0.3s ease",
                        }}
                      />
                      {i < demoSteps.length - 1 && (
                        <div
                          style={{
                            width: "18px",
                            height: "1px",
                            background: isCompleted
                              ? "rgba(212,184,150,0.3)"
                              : "rgba(255,255,255,0.1)",
                            transition: "background 0.3s ease",
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )
      )}
    </AnimatePresence>
  );
}
