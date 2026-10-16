#!/usr/bin/env node
// 数据源注册表工具
//   node scripts/datasources.mjs catalog         由 datasources/registry.json 生成 docs/DATASOURCES.md
//   node scripts/datasources.mjs catalog --check 只检查 docs/DATASOURCES.md 是否最新（CI 用）
//   node scripts/datasources.mjs health          实际请求各实时源的探测地址（需要外网，不进 CI）
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const REGISTRY_PATH = join(ROOT, "datasources", "registry.json");
export const CATALOG_PATH = join(ROOT, "docs", "DATASOURCES.md");

const KINDS = ["live", "mock", "llm"];
const ROLES = ["primary", "fallback", "optional"];
const REQUIRED = ["id", "name", "kind", "role", "isRealData", "auth", "endpoint", "module", "usedBy", "notes"];

/** @returns {{ sources: Array<Record<string, any>> }} */
export function loadRegistry() {
  return JSON.parse(readFileSync(REGISTRY_PATH, "utf8"));
}

/** 结构校验，返回错误列表（空数组表示通过） */
export function validateRegistry(registry) {
  const errors = [];
  const ids = new Set();
  for (const [i, s] of (registry.sources ?? []).entries()) {
    const at = s.id ?? `#${i}`;
    for (const key of REQUIRED) {
      if (s[key] === undefined || s[key] === "") errors.push(`${at}: 缺少字段 ${key}`);
    }
    if (ids.has(s.id)) errors.push(`${at}: id 重复`);
    ids.add(s.id);
    if (!KINDS.includes(s.kind)) errors.push(`${at}: kind 只能是 ${KINDS.join("/")}`);
    if (!ROLES.includes(s.role)) errors.push(`${at}: role 只能是 ${ROLES.join("/")}`);
    if (s.kind === "mock" && s.isRealData) errors.push(`${at}: mock 源不能标为真实数据`);
    if (s.kind === "live" && !s.health) errors.push(`${at}: 实时源必须有 health 探测地址`);
    if (!Array.isArray(s.usedBy) || s.usedBy.length === 0) errors.push(`${at}: usedBy 不能为空`);
  }
  for (const s of registry.sources ?? []) {
    if (s.fallback && s.fallback !== "local-rule-engine" && !ids.has(s.fallback)) {
      errors.push(`${s.id}: fallback 指向不存在的数据源 ${s.fallback}`);
    }
  }
  return errors;
}

const KIND_LABEL = { live: "实时", mock: "演示（假数据）", llm: "大模型" };
const ROLE_LABEL = { primary: "主源", fallback: "备用", optional: "可选" };

export function renderCatalog(registry) {
  const lines = [
    "# 数据源清单",
    "",
    "> 本文件由 `npm run datasources:catalog` 根据 `datasources/registry.json` 生成，不要手改。",
    "",
    "| ID | 名称 | 类型 | 角色 | 真实数据 | 鉴权 | 失败时回退 | 超时 |",
    "| --- | --- | --- | --- | --- | --- | --- | --- |",
  ];
  for (const s of registry.sources) {
    lines.push(
      `| \`${s.id}\` | ${s.name} | ${KIND_LABEL[s.kind]} | ${ROLE_LABEL[s.role]} | ${s.isRealData ? "是" : "否"} | ${s.auth} | ${s.fallback ?? "—"} | ${s.timeoutMs ? `${s.timeoutMs} ms` : "—"} |`,
    );
  }
  lines.push("");
  for (const s of registry.sources) {
    lines.push(`## ${s.name}（\`${s.id}\`）`, "");
    lines.push(`- 地址：\`${s.endpoint}\``);
    lines.push(`- 代码：\`${s.module}\` → ${s.usedBy.map((f) => `\`${f}\``).join("、")}`);
    if (s.health) lines.push(`- 健康检查：\`${s.health.url}\``);
    lines.push(`- 说明：${s.notes}`, "");
  }
  lines.push(
    "## 健康检查",
    "",
    "`npm run datasources:health` 会实际请求每个实时源的探测地址，报告耗时和是否返回预期字段。它依赖外网，不在 CI 里跑。",
    "",
  );
  return lines.join("\n");
}

function pick(obj, path) {
  return path.split(".").reduce((v, key) => (v == null ? v : v[key]), obj);
}

export async function checkHealth(source, timeoutMs = 8000) {
  const started = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(source.health.url, { signal: controller.signal, headers: { "User-Agent": "Mozilla/5.0", ...(source.health.referer ? { Referer: source.health.referer } : {}) } });
    const text = await res.text();
    let ok = res.ok;
    if (ok && source.health.expectJsonPath) ok = pick(JSON.parse(text), source.health.expectJsonPath) != null;
    if (ok && source.health.expectText) ok = text.includes(source.health.expectText);
    return { id: source.id, ok, status: res.status, ms: Date.now() - started };
  } catch (error) {
    return { id: source.id, ok: false, status: 0, ms: Date.now() - started, error: String(error?.message ?? error) };
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  const [command, flag] = process.argv.slice(2);
  const registry = loadRegistry();
  const errors = validateRegistry(registry);
  if (errors.length) {
    console.error(errors.join("\n"));
    process.exit(1);
  }
  if (command === "catalog") {
    const next = renderCatalog(registry);
    if (flag === "--check") {
      let current = "";
      try {
        current = readFileSync(CATALOG_PATH, "utf8").replace(/\r\n/g, "\n");
      } catch {
        // 文件不存在按过期处理
      }
      if (current !== next) {
        console.error("docs/DATASOURCES.md 已过期，运行 npm run datasources:catalog 重新生成");
        process.exit(1);
      }
      console.log("docs/DATASOURCES.md 是最新的");
      return;
    }
    writeFileSync(CATALOG_PATH, next);
    console.log(`已写入 ${CATALOG_PATH}`);
    return;
  }
  if (command === "health") {
    const live = registry.sources.filter((s) => s.health);
    const results = await Promise.all(live.map((s) => checkHealth(s)));
    for (const r of results) {
      console.log(`${r.ok ? "OK  " : "FAIL"} ${r.id.padEnd(18)} ${String(r.status).padStart(3)} ${r.ms} ms${r.error ? ` ${r.error}` : ""}`);
    }
    // 主源全部失败才算不健康；备用源失败只提示
    const primaryDown = results.filter((r) => !r.ok && live.find((s) => s.id === r.id)?.role === "primary");
    // 用 exitCode 而不是 exit()：Windows 上带着未关闭的 socket 直接 exit 会触发 libuv 断言
    process.exitCode = primaryDown.length ? 1 : 0;
    return;
  }
  console.error("用法：node scripts/datasources.mjs catalog [--check] | health");
  process.exit(2);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  await main();
}
