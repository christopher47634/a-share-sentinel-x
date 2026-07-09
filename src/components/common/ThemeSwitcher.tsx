"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Palette, Check } from "lucide-react";

const themes = [
  { id: "default", name: "东方暗金", color: "#D4A574" },
  { id: "cyber", name: "赛博蓝紫", color: "#6366F1" },
  { id: "institutional", name: "黑金机构", color: "#6B7280" },
  { id: "ice", name: "冰川玻璃", color: "#A78BFA" },
];

export default function ThemeSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState("default");

  const handleThemeChange = (themeId: string) => {
    setCurrentTheme(themeId);
    if (themeId === "default") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", themeId);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-9 h-9 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--glass-border-hover)] transition-all duration-200"
      >
        <Palette size={16} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-12 z-50 w-48 p-2 glass"
            >
              <p className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                主题切换
              </p>
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => handleThemeChange(theme.id)}
                  className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-bg-hover)] transition-colors"
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ background: theme.color }}
                  />
                  <span>{theme.name}</span>
                  {currentTheme === theme.id && (
                    <Check size={14} className="ml-auto text-[var(--accent)]" />
                  )}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
