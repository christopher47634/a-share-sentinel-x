// 合规过滤：只改写荐股式措辞，不反转语义、不改写事实。

/**
 * 7. 合规过滤
 */
/**
 * 只改写「荐股式」措辞，不改变句子的肯定/否定方向，也不改写事实。
 * - 否定形式（不建议卖出、不保证收益）单独处理或跳过，避免「不建议卖出」被改成「不需要关注风险变化」这类语义反转；
 * - 「清仓」「满仓」作为交易事实出现时保留，只改写「建议清仓」「建议满仓」这类建议；
 * - `preserve` 里的原文（用户交易计划、成交记录等）整体跳过。
 */
export function complianceEngine(text: string, options: { preserve?: string[] } = {}): string {
  const replacements: Array<[RegExp, string]> = [
    [/(?:不|别|勿)建议(?:买入|卖出|清仓|满仓)/g, "不作交易判断"],
    [/建议买入/g, "可以纳入观察"],
    [/建议卖出/g, "需要关注风险变化"],
    [/建议满仓/g, "不宜据此调整仓位"],
    [/建议清仓/g, "需要关注风险暴露"],
    [/(?<![不非])必涨/g, "存在上涨可能但需验证"],
    [/(?<![不非])必跌/g, "存在下行风险但需验证"],
    [/(?<![不非])稳赚/g, "收益不确定"],
    [/(?<![不无非])保证收益/g, "不保证收益"],
    [/内幕消息/g, "未经验证信息"],
    [/(?<![不非])确定上涨/g, "可能走强但需验证"],
    [/(?<![不非])确定下跌/g, "可能走弱但需验证"],
    [/目标价承诺/g, "观察价位"],
  ];

  // 先把需要原样保留的片段换成占位符，改写完再换回来
  const preserved = (options.preserve ?? []).filter((segment) => segment.length > 0);
  let output = text;
  preserved.forEach((segment, index) => {
    output = output.split(segment).join(`\u0000${index}\u0000`);
  });

  for (const [pattern, replacement] of replacements) {
    output = output.replace(pattern, replacement);
  }

  preserved.forEach((segment, index) => {
    output = output.split(`\u0000${index}\u0000`).join(segment);
  });

  const riskDisclaimer = "本内容仅用于模拟实盘、市场观察和学习演示，不构成投资建议。";

  if (!output.includes(riskDisclaimer)) {
    output += `\n\n${riskDisclaimer}`;
  }

  return output;
}
