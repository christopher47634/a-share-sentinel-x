# AGENTS.md

给在本仓库工作的 AI 编码助手的约定。

## 项目

Next.js 15（App Router）+ React 18 + TypeScript strict + Tailwind。A 股投资助理原型：实时行情（东财/腾讯，失败回退 mock）、模拟交易、AI 盯盘/解盘引擎。线上地址 https://a-share-sentinel-x.vercel.app ，由 Vercel 从默认分支 `p8-real-data-ai-mobile-polish` 自动部署。

## 常用命令

```bash
npm ci
npm run lint
npm run typecheck
npm test                     # vitest
npm run build
npm run datasources:check    # docs/DATASOURCES.md 是否与注册表同步
npm run datasources:health   # 实际探测外部数据源（需要外网，不进 CI）
```

提交前这几项都要过，CI（`.github/workflows/ci.yml`）跑的就是它们。

## 规则

- **依赖方向**：见 `docs/ARCHITECTURE.md`，由 `architecture-boundaries.test.ts` 强制。`src/lib` 不引 React、不引组件。
- **阈值**只改 `src/lib/thresholds.ts`，不要在引擎里写死数字。
- **钱用整数分**：账本计算走 `toCents`/`fromCents`，不要直接对元做浮点加减。
- **时间用上海时区**：日期一律用 `shanghaiDate()`，交易日判断用 `trading-calendar.ts`。每年年底补下一年的休市表，缺年份时日历会直接报错。
- **数据真实性**：mock 数据必须带 `source: "mock"` 或「演示数据」标注，不能冒充实时行情。新增外部数据源先登记 `datasources/registry.json`，再运行 `npm run datasources:catalog`。
- **提醒规则改动**：跑 `npm test`，`alert-eval.test.ts` 会显示哪些 `R-ALERT-*` 用例的信号或等级变了。确认新结果合理后再更新 `src/lib/__tests__/fixtures/alert-eval.json` 里的 `expect` 和 `baseline`。
- **测试命名**按业务规则（`paper-trading-t1`、`trading-calendar`），不按源文件。
- **合规**：输出不得出现确定性买卖建议，交给 `complianceEngine` 过滤。
- 不要提交 `.env*`、密钥、大体积媒体文件。
