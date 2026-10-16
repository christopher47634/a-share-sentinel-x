# 架构与依赖方向

```text
src/app/(页面)  ──►  src/components  ──►  src/hooks  ──►  src/lib  ──►  src/types
      │                                                    ▲   │
      └──► src/app/api/(路由)  ─────────────────────────────┘   └──► src/mock
```

箭头表示「可以依赖」。反方向一律禁止，由 `src/lib/__tests__/architecture-boundaries.test.ts` 守住，违反时 `npm test` 失败并列出具体的 import。

| 层 | 目录 | 职责 | 不能依赖 |
| --- | --- | --- | --- |
| 页面 | `src/app/**`（除 `api/`） | 路由、页面组合 | `app/api` |
| 接口 | `src/app/api/**` | 服务端路由：行情代理、AI 问答、文件账本 | `components`、`hooks` |
| 组件 | `src/components/**` | UI | `app` |
| Hooks | `src/hooks/**` | 客户端数据获取与状态 | `app`、`components` |
| 领域逻辑 | `src/lib/**` | 引擎、行情适配、账本、交易日历，纯 TypeScript，不引 React | `app`、`components`、`hooks` |
| 演示数据 | `src/mock/**` | 假行情、假账户 | `app`、`components`、`hooks` |
| 类型 | `src/types/**` | 只放类型，不放运行时代码 | 其他所有层 |

`lib` 和 `mock` 之间允许互相引用（行情适配器用 mock 补位，mock 账户用 lib 的工具函数）。

## 核心模块

| 模块 | 文件 | 说明 |
| --- | --- | --- |
| Sentinel 引擎 | `src/lib/sentinel-core.ts` | 市场雷达 → 信号 → 提醒 → 归因 → 风险 → 复盘 → 合规过滤 |
| 阈值 | `src/lib/thresholds.ts` | 所有引擎阈值集中在这里 |
| 盯盘规则 | `src/lib/watch-rule-engine.ts`、`watch-rule-storage.ts` | 用户规则评估与 localStorage 持久化 |
| 行情适配 | `src/lib/market-provider.ts` | 东财 → 腾讯 → mock 依次回退，每条行情带 `source` 标注 |
| 模拟交易 | `src/lib/trade-engine.ts`、`account-storage.ts` | 整数分记账、T+1、涨跌停校验 |
| 交易日历 | `src/lib/trading-calendar.ts` | 交易日、T+1 可卖日、交易时段（上海时间） |
| 提醒评测 | `src/lib/alert-eval.ts` | 信号 → 提醒 → 次日结果的命中、误报、漏报统计 |

## 数据源

外部数据源登记在 `datasources/registry.json`，清单见 [DATASOURCES.md](DATASOURCES.md)。代码里新增外部域名而不登记，测试会失败。

## 测试分类

测试按业务规则命名，放在 `src/lib/__tests__/`：

| 文件 | 守的规则 |
| --- | --- |
| `trading-calendar.test.ts` | 周末、节假日、调休、跨长假、交易时段 |
| `paper-trading-t1.test.ts` | T+1：跨周末、跨长假、加仓部分锁定 |
| `paper-trading-settlement.test.ts` | 佣金最低 5 元、印花税只收卖方、已实现盈亏 |
| `trade-engine.test.ts` | 账本不变量、价格校验、存储失败回滚 |
| `sentinel-core.test.ts` | 告警去重、合规过滤、风险计分 |
| `alert-eval.test.ts` | `R-ALERT-*` 编号的提醒回归用例与评测基准 |
| `datasource-registry.test.ts` | 代码与数据源注册表一致 |
| `architecture-boundaries.test.ts` | 本文件规定的依赖方向 |
| `market-provider.test.ts` | 代码规范化、RSI |
