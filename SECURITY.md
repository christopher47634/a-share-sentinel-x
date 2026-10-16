# 安全说明

## 报告漏洞

请通过 GitHub 的 [Private vulnerability reporting](https://github.com/christopher47634/a-share-sentinel-x/security/advisories/new) 私下报告，不要开公开 issue。

## 范围与已知边界

本项目是 A 股投资助理的产品原型，不连接真实券商，不处理真实资金。

- **模拟账户**保存在浏览器 localStorage，只属于当前浏览器，没有账号体系。
- **服务端文件账本**（`/api/account/ledger`）默认关闭。开启需要同时设置 `ENABLE_SERVER_LEDGER=1` 和 `LEDGER_TOKEN`，请求头带 `x-ledger-token`。它让所有访客共用一个文件，只适合本机单人使用，线上不要开。
- **AI 问答**（`/api/ai/chat`）按 IP 限流（每分钟 10 次），问题长度上限 2000 字，输出经过合规过滤。`OPENAI_API_KEY` 只在服务端读取，不要设置成 `NEXT_PUBLIC_` 变量。
- **行情代理**（`/api/market/*`）对股票代码做严格校验后才拼接到上游地址，防止注入。
- `NEXT_PUBLIC_LEDGER_TOKEN` 会打包进前端代码，任何访客都能看到，所以服务端账本只能在本机用。

## 密钥

`.env.example` 列出全部环境变量。不要提交 `.env*`（`.env.example` 除外）。CI 不需要任何密钥。

## 投资合规

所有输出都是信息整理和风险提示，不构成投资建议；`complianceEngine` 会改写确定性的买卖指令。
