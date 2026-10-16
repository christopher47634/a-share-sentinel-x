/**
 * 成交额字符串 → 亿元。兼容 mock 的「41.2亿」「3.2万」和实时行情的「41.2 CNY 100M」。
 * 解析不了返回 0。以前 useMarketSnapshot.parseAmountYi 和 market-provider.parseTurnoverYi 各写了一份。
 */
export function parseAmountYi(value: string): number {
  const num = Number.parseFloat(String(value).replace(/,/g, ""));
  if (!Number.isFinite(num)) return 0;
  if (/万/.test(value)) return num / 10_000;
  return num;
}
