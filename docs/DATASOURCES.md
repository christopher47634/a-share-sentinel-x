# 数据源清单

> 本文件由 `npm run datasources:catalog` 根据 `datasources/registry.json` 生成，不要手改。

| ID | 名称 | 类型 | 角色 | 真实数据 | 鉴权 | 失败时回退 | 超时 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `eastmoney-quote` | 东方财富实时行情 | 实时 | 主源 | 是 | none | tencent-quote | 3500 ms |
| `eastmoney-kline` | 东方财富历史 K 线 | 实时 | 主源 | 是 | none | mock-market | 3500 ms |
| `tencent-quote` | 腾讯行情 | 实时 | 备用 | 是 | none | mock-market | 5000 ms |
| `mock-market` | 本地演示行情 | 演示（假数据） | 备用 | 否 | none | — | — |
| `openai-responses` | OpenAI Responses API | 大模型 | 可选 | 否 | env:OPENAI_API_KEY | local-rule-engine | 30000 ms |

## 东方财富实时行情（`eastmoney-quote`）

- 地址：`https://push2.eastmoney.com/api/qt/stock/get?secid={secid}&fields={fields}`
- 代码：`src/lib/market-provider.ts` → `fetchLiveQuote`、`getMarketSnapshot`、`getMarketIndexSnapshot`、`getMarketStockDetail`
- 健康检查：`https://push2.eastmoney.com/api/qt/stock/get?secid=1.600519&fields=f43,f57,f58`
- 说明：免费公开接口，无 SLA；部分网络（如 WSL）会被掐断 HTTPS。停牌或盘前字段缺失时由 mock 补位，整条行情标为 mock。

## 东方财富历史 K 线（`eastmoney-kline`）

- 地址：`https://push2his.eastmoney.com/api/qt/stock/kline/get?secid={secid}&klt={klt}&fqt=1&beg={begin}&end={end}`
- 代码：`src/lib/market-provider.ts` → `fetchLiveCandles`、`getMarketStockDetail`
- 健康检查：`https://push2his.eastmoney.com/api/qt/stock/kline/get?secid=1.600519&klt=101&fqt=1&lmt=5&end=20500101&fields1=f1,f2,f3&fields2=f51,f52,f53`
- 说明：前复权日线/周线/月线及分钟线。实时 K 线根数不足时才回退 mock。

## 腾讯行情（`tencent-quote`）

- 地址：`https://qt.gtimg.cn/q={symbol}`
- 代码：`src/lib/market-provider.ts` → `fetchLiveQuote`
- 健康检查：`https://qt.gtimg.cn/q=sh600519`
- 说明：东财失败时的备用实时行情，返回 GBK 文本。

## 本地演示行情（`mock-market`）

- 地址：`src/mock/`
- 代码：`src/mock/market.ts` → `marketIndices`
- 说明：假数据：实时源全部失败时补位，界面以 Mock fallback 标注。板块、新闻事件、AI 页面（市场雷达、盯盘、解盘、风险护盾、复盘）的演示样本也来自这里或 sentinel-core 的 generateSentinelDemoData，不是真实行情。

## OpenAI Responses API（`openai-responses`）

- 地址：`https://api.openai.com/v1/responses`
- 代码：`src/app/api/ai/chat/route.ts` → `POST`
- 说明：仅 AI 研究助手使用。未配置密钥时由本地规则引擎生成回答；输出经 complianceEngine 过滤。健康检查需要密钥，不在 CI 里跑。

## 健康检查

`npm run datasources:health` 会实际请求每个实时源的探测地址，报告耗时和是否返回预期字段。它依赖外网，不在 CI 里跑。
