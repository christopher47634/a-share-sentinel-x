// src/lib/watch-rule-engine.ts
// 规则评估引擎

import type { SentinelStock, SentinelSector } from "@/lib/sentinel-core";
import type { WatchRule } from "@/lib/watch-rule-storage";

export interface TriggeredSignal {
  ruleId: string;
  symbol: string;
  name: string;
  trigger: string;           // 触发描述 如 "5分钟涨幅超过用户设置阈值"
  severity: "High" | "Medium" | "Low";
  evidence: string[];        // 证据数据
  triggeredAt: string;
}

/**
 * 根据用户规则和当前行情评估触发信号
 */
/** 旧存档里可能有 NaN 阈值（Number("abc")），这种规则项直接跳过 */
function isThreshold(value: number | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function evaluateWatchRules(
  rules: WatchRule[],
  stocks: SentinelStock[],
  sectors?: SentinelSector[]
): TriggeredSignal[] {
  const results: TriggeredSignal[] = [];
  const enabledRules = rules.filter(r => r.enabled);
  const sectorMap = new Map<string, SentinelSector>();
  sectors?.forEach(s => sectorMap.set(s.name, s));

  for (const rule of enabledRules) {
    const stock = stocks.find(s => s.code === rule.symbol);
    if (!stock) continue;

    const evidence: string[] = [];
    const triggers: string[] = [];

    // 涨跌幅检查
    if (isThreshold(rule.rules.priceChangePct)) {
      const threshold = rule.rules.priceChangePct;
      if (Math.abs(stock.changePct) >= threshold) {
        const direction = stock.changePct > 0 ? "上涨" : "下跌";
        triggers.push(`${direction}幅度超过用户设置阈值 ${threshold}%`);
        evidence.push(`当前${direction} ${stock.changePct.toFixed(2)}%，阈值 ${threshold}%`);
      }
    }

    // 量比检查
    if (isThreshold(rule.rules.volumeRatio) && stock.volumeRatio !== undefined) {
      if (stock.volumeRatio >= rule.rules.volumeRatio) {
        triggers.push(`量比超过用户设置阈值 ${rule.rules.volumeRatio}`);
        evidence.push(`当前量比 ${stock.volumeRatio.toFixed(2)}，阈值 ${rule.rules.volumeRatio}`);
      }
    }

    // 较昨收跌幅（需要 prevClose）。这里只有昨收没有日内高点，算的不是「回撤」，文案如实写
    if (isThreshold(rule.rules.drawdownPct) && stock.prevClose !== undefined && stock.prevClose > 0) {
      const dropFromPrevClose = ((stock.prevClose - stock.price) / stock.prevClose) * 100;
      if (dropFromPrevClose >= rule.rules.drawdownPct) {
        triggers.push(`较昨收跌幅超过用户设置阈值 ${rule.rules.drawdownPct}%`);
        evidence.push(`较昨收下跌 ${dropFromPrevClose.toFixed(2)}%，阈值 ${rule.rules.drawdownPct}%`);
      }
    }

    // 板块涨跌幅检查
    if (isThreshold(rule.rules.sectorChangePct) && stock.sector && sectorMap.size > 0) {
      const sector = sectorMap.get(stock.sector);
      if (sector && Math.abs(sector.changePct) >= rule.rules.sectorChangePct) {
        triggers.push(`所属板块 ${stock.sector} 涨跌幅超过阈值 ${rule.rules.sectorChangePct}%`);
        evidence.push(`${stock.sector} 板块涨跌幅 ${sector.changePct.toFixed(2)}%，阈值 ${rule.rules.sectorChangePct}%`);
      }
    }

    if (triggers.length > 0) {
      // 根据触发数量判断严重程度
      const severity: "High" | "Medium" | "Low" =
        triggers.length >= 3 ? "High" : triggers.length >= 2 ? "Medium" : "Low";

      results.push({
        ruleId: rule.id,
        symbol: rule.symbol,
        name: rule.name,
        trigger: triggers.join("；"),
        severity,
        evidence,
        triggeredAt: new Date().toISOString(),
      });
    }
  }

  return results;
}

/**
 * 生成规则触发的解释文本
 */
export function explainRuleTrigger(
  rule: WatchRule,
  signal: TriggeredSignal
): string {
  const parts: string[] = [];
  parts.push(`用户设置：${rule.name}(${rule.symbol})`);

  if (rule.rules.priceChangePct !== undefined) {
    parts.push(`- 涨跌幅阈值：${rule.rules.priceChangePct}%`);
  }
  if (rule.rules.volumeRatio !== undefined) {
    parts.push(`- 量比阈值：${rule.rules.volumeRatio}`);
  }
  if (rule.rules.drawdownPct !== undefined) {
    parts.push(`- 较昨收跌幅阈值：${rule.rules.drawdownPct}%`);
  }

  parts.push(`\n系统检测：`);
  parts.push(`- ${signal.trigger}`);
  parts.push(`\n证据：`);
  signal.evidence.forEach(e => parts.push(`- ${e}`));

  parts.push(`\n结论：用户设置的盯盘条件已触发，建议进入个股页面查看详情。`);

  return parts.join("\n");
}
