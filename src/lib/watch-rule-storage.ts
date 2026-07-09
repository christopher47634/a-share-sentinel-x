// src/lib/watch-rule-storage.ts
// localStorage 规则持久化

export interface WatchRule {
  id: string;
  symbol: string;        // 股票代码 如 "688256"
  name: string;          // 股票名称 如 "寒武纪"
  rules: {
    priceChangePct?: number;    // 涨跌幅阈值，如 3 表示 3%
    volumeRatio?: number;       // 量比阈值，如 2
    drawdownPct?: number;       // 回撤阈值
    sectorChangePct?: number;   // 板块涨跌幅阈值
  };
  enabled: boolean;
  createdAt: string;     // ISO timestamp
}

const STORAGE_KEY = "sentinel-watch-rules";

export function loadRules(): WatchRule[] {
  try {
    if (typeof localStorage === "undefined") return [];
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveRules(rules: WatchRule[]): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rules));
}

export function addRule(rule: Omit<WatchRule, "id" | "createdAt">): WatchRule {
  const rules = loadRules();
  const newRule: WatchRule = {
    ...rule,
    id: `rule-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };
  rules.push(newRule);
  saveRules(rules);
  return newRule;
}

export function removeRule(id: string): void {
  const rules = loadRules().filter(r => r.id !== id);
  saveRules(rules);
}

export function toggleRule(id: string): WatchRule[] {
  const rules = loadRules().map(r => r.id === id ? { ...r, enabled: !r.enabled } : r);
  saveRules(rules);
  return rules;
}

export function updateRule(id: string, updates: Partial<WatchRule>): WatchRule[] {
  const rules = loadRules().map(r => r.id === id ? { ...r, ...updates } : r);
  saveRules(rules);
  return rules;
}
