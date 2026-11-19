# 数据源清单

> 本文件由 `npm run datasources:catalog` 根据 `datasources/registry.json` 生成，不要手改。

| ID | 名称 | 类型 | 角色 | 真实数据 | 鉴权 | 失败时回退 | 超时 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `eastmoney-quote` | 东方财富实时行情 | 实时 | 主源 | 是 | none | tencent-quote | 3500 ms |
| `eastmoney-batch-quote` | 东方财富批量实时行情 | 实时 | 主源 | 是 | none | tencent-quote | 3500 ms |
| `eastmoney-kline` | 东方财富历史 K 线 | 实时 | 主源 | 是 | none | tencent-kline | 3500 ms |
| `tencent-quote` | 腾讯行情 | 实时 | 备用 | 是 | none | mock-market | 5000 ms |
| `tencent-kline` | 腾讯前复权历史与分钟 K 线 | 实时 | 备用 | 是 | none | mock-market | 5000 ms |
| `eastmoney-announcements` | 东方财富沪深公开公告 | 实时 | 可选 | 是 | none | — | 2500 ms |
| `mock-market` | 本地演示行情 | 演示（假数据） | 备用 | 否 | none | — | — |
| `openai-compatible-llm` | OpenAI-Compatible LLM（默认 DeepSeek） | 大模型 | 可选 | 否 | env:AI_API_KEY | local-rule-engine | 30000 ms |
| `openai-responses` | OpenAI Responses API | 大模型 | 可选 | 否 | env:OPENAI_API_KEY | local-rule-engine | 30000 ms |

## 东方财富实时行情（`eastmoney-quote`）

- 地址：`https://push2.eastmoney.com/api/qt/stock/get?secid={secid}&fields={fields}`
- 代码：`src/lib/market-provider.ts` → `fetchLiveQuote`、`getMarketStockDetail`
- 健康检查：`https://push2.eastmoney.com/api/qt/stock/get?secid=1.600519&fields=f43,f50,f57,f58`
- 说明：免费公开接口，无 SLA；单股实时报价含 f50 量比与 f22 涨速。停牌或盘前字段缺失时由 mock 补位，整条行情标为 mock。

## 东方财富批量实时行情（`eastmoney-batch-quote`）

- 地址：`https://push2.eastmoney.com/api/qt/ulist.np/get?fltt=2&secids={secids}&fields={fields}`
- 代码：`src/lib/market-provider.ts` → `fetchEastmoneyBatchQuotes`、`fetchLiveQuotesBatch`、`getMarketSnapshot`、`getMarketIndexSnapshot`
- 健康检查：`https://push2.eastmoney.com/api/qt/ulist.np/get?fltt=2&secids=1.600519,0.000001&fields=f2,f10,f11,f12,f13,f22`
- 说明：一次 HTTP 请求拉取最多 40 只标的实时行情（含 f10 量比、f11 5 分钟涨跌幅、f22 涨速），替代逐股扇出请求。

## 东方财富历史 K 线（`eastmoney-kline`）

- 地址：`https://push2his.eastmoney.com/api/qt/stock/kline/get?secid={secid}&klt={klt}&fqt=1&beg={begin}&end={end}`
- 代码：`src/lib/market-provider.ts` → `fetchLiveCandles`、`getMarketStockDetail`
- 健康检查：`https://push2his.eastmoney.com/api/qt/stock/kline/get?secid=1.600519&klt=101&fqt=1&lmt=5&end=20500101&fields1=f1,f2,f3&fields2=f51,f52,f53`
- 说明：前复权日线/周线/月线及分钟线。失败或根数不足时先回退腾讯前复权 K 线，仍失败才回退 mock。

## 腾讯行情（`tencent-quote`）

- 地址：`https://qt.gtimg.cn/q={symbol}`
- 代码：`src/lib/market-provider.ts` → `fetchLiveQuote`、`fetchTencentBatchQuotes`、`fetchLiveQuotesBatch`
- 健康检查：`https://qt.gtimg.cn/q=sh600519`
- 说明：东财单股/批量失败时的备用实时行情（支持单次多代码逗号拼接批量查询，含第 50 段量比），返回 GBK 文本。

## 腾讯前复权历史与分钟 K 线（`tencent-kline`）

- 地址：`https://proxy.finance.qq.com/ifzqgtimg/appstock/app/newfqkline/get?param={symbol},{period},,,{count},qfq`
- 代码：`src/lib/market-provider.ts` → `fetchTencentCandles`、`fetchLiveCandles`、`enrichQuotesWithDailyStats`
- 健康检查：`https://proxy.finance.qq.com/ifzqgtimg/appstock/app/newfqkline/get?param=sh600519,day,,,5,qfq`
- 说明：东财 K 线失败时的实时备源，同时用于为 Sentinel 重点标的补充近 20 日高低点与 20 日均量。

## 东方财富沪深公开公告（`eastmoney-announcements`）

- 地址：`https://np-anotice-stock.eastmoney.com/api/security/ann?sr=-1&page_size={pageSize}&page_index=1&ann_type=A&stock_list={codes}`
- 代码：`src/lib/news-provider.ts` → `fetchStockAnnouncements`
- 健康检查：`https://np-anotice-stock.eastmoney.com/api/security/ann?sr=-1&page_size=2&page_index=1&ann_type=A&stock_list=600519`
- 说明：单次 HTTP 批量获取多只 A 股近 30 日交易所公开公告，供归因解盘（Causality Lab）与 AI 研究副驾作为可验证事件证据。失败时返回空列表，不回退假新闻。

## 本地演示行情（`mock-market`）

- 地址：`src/mock/`
- 代码：`src/mock/market.ts` → `marketIndices`
- 说明：假数据：实时源全部失败时补位，界面以 Mock fallback 标注。板块、新闻事件、AI 页面（市场雷达、盯盘、解盘、风险护盾、复盘）的演示样本也来自这里或 sentinel-core 的 generateSentinelDemoData，不是真实行情。

## OpenAI-Compatible LLM（默认 DeepSeek）（`openai-compatible-llm`）

- 地址：`https://api.deepseek.com/v1/chat/completions`
- 代码：`src/lib/ai-provider.ts` → `resolveAiProvider`、`callUpstreamLlm`、`streamUpstreamCompatLlm`
- 说明：AI 研究副驾优先接入方式，可通过 AI_BASE_URL 与 AI_MODEL 切换任意 OpenAI Chat Completions 兼容模型，支持 SSE 流式输出与多轮对话；输出统一经 complianceEngine 过滤。

## OpenAI Responses API（`openai-responses`）

- 地址：`https://api.openai.com/v1/responses`
- 代码：`src/lib/ai-provider.ts` → `resolveAiProvider`、`callUpstreamLlm`
- 说明：未配置 AI_API_KEY 时的备选大模型通道；全部未配置或超时时回退到本地研究引擎，输出经 complianceEngine 过滤。

## 健康检查

`npm run datasources:health` 会实际请求每个实时源的探测地址，报告耗时和是否返回预期字段。它依赖外网，不在 CI 里跑。
