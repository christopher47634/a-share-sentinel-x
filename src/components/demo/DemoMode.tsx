"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, X, Sparkles } from "lucide-react";
import { setDemoActive, resetDemoData } from "@/lib/account-storage";

/* ─────────────────────────── Context ─────────────────────────── */

interface DemoContextValue {
  demoMode: boolean;
  currentStep: number;
  startDemo: () => void;
  stopDemo: () => void;
  nextStep: () => void;
  setStep: (step: number) => void;
}

const DemoContext = createContext<DemoContextValue>({
  demoMode: false,
  currentStep: 0,
  startDemo: () => {},
  stopDemo: () => {},
  nextStep: () => {},
  setStep: () => {},
});

export function useDemo() {
  return useContext(DemoContext);
}

/* ──────────────────────── Demo Steps Data ────────────────────── */

export const demoSteps = [
  "市场机会扫描",
  "热点板块识别",
  "板块成分股分析",
  "个股技术视图",
  "模拟交易入口",
  "确认模拟委托",
  "订单成交回执",
  "订单记录归档",
  "持仓与账户变化",
  "交易闭环完成",
];

/* ──────────────────────── Provider ───────────────────────────── */

export function DemoProvider({ children }: { children: ReactNode }) {
  const [demoMode, setDemoMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Restore from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("demoMode");
    if (stored === "true") {
      setDemoMode(true);
      const step = parseInt(localStorage.getItem("demoModeStep") || "0", 10);
      setCurrentStep(step);
    }
  }, []);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem("demoMode", String(demoMode));
  }, [demoMode]);

  useEffect(() => {
    localStorage.setItem("demoModeStep", String(currentStep));
  }, [currentStep]);

  const startDemo = useCallback(() => {
    setDemoMode(true);
    setCurrentStep(0);
    setDemoActive(true);
  }, []);

  const stopDemo = useCallback(() => {
    setDemoMode(false);
    setCurrentStep(0);
    localStorage.removeItem("demoMode");
    localStorage.removeItem("demoModeStep");
    resetDemoData();
    setDemoActive(false);
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => {
      if (prev >= demoSteps.length - 1) {
        // Last step — exit demo
        setDemoMode(false);
        localStorage.removeItem("demoMode");
        localStorage.removeItem("demoModeStep");
        resetDemoData();
        setDemoActive(false);
        return 0;
      }
      return prev + 1;
    });
  }, []);

  const setStep = useCallback((step: number) => {
    setCurrentStep(step);
  }, []);

  return (
    <DemoContext.Provider
      value={{ demoMode, currentStep, startDemo, stopDemo, nextStep, setStep }}
    >
      {children}
    </DemoContext.Provider>
  );
}

/* ──────────────────── Sidebar Demo Button ───────────────────── */

export function DemoButton() {
  const { demoMode, stopDemo } = useDemo();
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          if (demoMode) {
            stopDemo();
          } else {
            setShowModal(true);
          }
        }}
        className="flex items-center justify-center w-9 h-9 rounded-xl border transition-all duration-200"
        style={{
          background: demoMode
            ? "rgba(212,165,116,0.18)"
            : "var(--glass-bg)",
          borderColor: demoMode
            ? "rgba(212,165,116,0.4)"
            : "var(--glass-border)",
          color: demoMode ? "#D4A574" : "var(--text-secondary)",
        }}
        title={demoMode ? "退出演示" : "演示模式"}
      >
        <Sparkles size={16} />
      </motion.button>

      <DemoModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}

/* ────────────────────── Modal Component ──────────────────────── */

function DemoModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { startDemo } = useDemo();

  const handleStart = () => {
    startDemo();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 12 }}
            transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed inset-0 z-[101] flex items-center justify-center pointer-events-none"
          >
            <div
              className="pointer-events-auto w-full max-w-[400px] mx-4 rounded-2xl overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg, rgba(21,29,45,0.97) 0%, rgba(13,20,33,0.98) 100%)",
                backdropFilter: "blur(28px) saturate(150%)",
                WebkitBackdropFilter: "blur(28px) saturate(150%)",
                border: "1px solid rgba(255,255,255,0.12)",
                boxShadow:
                  "0 0 60px rgba(212,165,116,0.08), 0 24px 48px rgba(0,0,0,0.5)",
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-5 pb-1">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{
                      background: "rgba(212,165,116,0.15)",
                      border: "1px solid rgba(212,165,116,0.3)",
                    }}
                  >
                    <Sparkles size={15} className="text-[#D4A574]" />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-semibold text-[var(--text-primary)]">
                      演示模式
                    </h2>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      引导体验完整交易流程
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-bg)] transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Steps List */}
              <div className="px-6 py-4">
                <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-3">
                  演示路径 · {demoSteps.length} 步
                </p>
                <div className="space-y-1.5">
                  {demoSteps.map((step, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 py-1.5 px-2 rounded-lg transition-colors"
                      style={{
                        background:
                          i === 0
                            ? "rgba(212,165,116,0.06)"
                            : "transparent",
                      }}
                    >
                      <span
                        className="flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold font-mono-nums"
                        style={{
                          background:
                            i === 0
                              ? "rgba(212,165,116,0.2)"
                              : "var(--glass-bg)",
                          color:
                            i === 0 ? "#D4A574" : "var(--text-muted)",
                          border: `1px solid ${i === 0 ? "rgba(212,165,116,0.3)" : "var(--glass-border)"}`,
                        }}
                      >
                        {i + 1}
                      </span>
                      <span
                        className="text-[13px]"
                        style={{
                          color:
                            i === 0
                              ? "var(--text-primary)"
                              : "var(--text-secondary)",
                        }}
                      >
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div
                className="px-6 pb-5 pt-2 flex items-center justify-between"
                style={{
                  borderTop: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <p className="text-[11px] text-[var(--text-muted)]">
                  点击后页面元素将高亮引导
                </p>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleStart}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold text-[#0a0f1a] transition-all"
                  style={{
                    background:
                      "linear-gradient(135deg, #D4A574 0%, #c4956a 100%)",
                    boxShadow:
                      "0 4px 16px rgba(212,165,116,0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
                  }}
                >
                  <Play size={13} fill="currentColor" />
                  开始演示
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
