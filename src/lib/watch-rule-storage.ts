// src/lib/watch-rule-storage.ts
// localStorage 规则持久化

export interface WatchRule {
  id: string;
  symbol: string;        // 股票代码 如 "688256"
  name: string;          // 股票名称 如 "寒武纪"
  rules: {
    priceChangePct?: number;    // 涨跌幅阈值，如 3 表示 3%
    volumeRatio?: number;       // 量比阈值，如 2
    drawdownPct?: number;       // 较昨收跌幅阈值（不是相对高点的回撤）
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

/** 存储满或不可用时返回 false，而不是让异常冒到界面上 */
export function saveRules(rules: WatchRule[]): boolean {
  if (typeof localStorage === "undefined") return false;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rules));
    return true;
  } catch {
    return false;
  }
}

/** 输入框里的阈值：空、非数字（Number("abc") = NaN）、非正数一律视为未设置 */
export function parseThreshold(raw: string | number | undefined): number | undefined {
  if (raw === undefined || raw === "") return undefined;
  const value = typeof raw === "number" ? raw : Number(raw);
  return Number.isFinite(value) && value > 0 ? value : undefined;
}

function sanitizeRules(rules: WatchRule["rules"]): WatchRule["rules"] {
  return {
    priceChangePct: parseThreshold(rules.priceChangePct),
    volumeRatio: parseThreshold(rules.volumeRatio),
    drawdownPct: parseThreshold(rules.drawdownPct),
    sectorChangePct: parseThreshold(rules.sectorChangePct),
  };
}

export function addRule(rule: Omit<WatchRule, "id" | "createdAt">): WatchRule {
  const rules = loadRules();
  const newRule: WatchRule = {
    ...rule,
    rules: sanitizeRules(rule.rules),
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
