import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CATALOG_PATH, loadRegistry, renderCatalog, validateRegistry } from "../../../scripts/datasources.mjs";

const ROOT = join(__dirname, "..", "..", "..");
const registry = loadRegistry();

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return name === "__tests__" ? [] : sourceFiles(full);
    return /\.(ts|tsx)$/.test(name) ? [full] : [];
  });
}

/** 只作为 Referer 头或页面链接出现的地址，不是数据源 */
const NON_DATA_HOSTS = new Set(["quote.eastmoney.com", "gu.qq.com", "www.w3.org"]);

describe("数据源注册表", () => {
  it("结构合法", () => {
    expect(validateRegistry(registry)).toEqual([]);
  });

  it("代码里请求的每个外部域名都已登记", () => {
    const registered = new Set(
      registry.sources.filter((s) => s.endpoint.startsWith("http")).map((s) => new URL(s.endpoint.split("?")[0]).host),
    );
    const used = new Set<string>();
    for (const file of sourceFiles(join(ROOT, "src"))) {
      for (const m of readFileSync(file, "utf8").matchAll(/https:\/\/([a-z0-9.-]+)\//gi)) {
        if (!NON_DATA_HOSTS.has(m[1]) && !m[1].endsWith("vercel.app")) used.add(m[1]);
      }
    }
    expect([...used].filter((host) => !registered.has(host))).toEqual([]);
  });

  it("行情上的 source 字段每个取值都有对应登记", () => {
    const types = readFileSync(join(ROOT, "src/types/market.ts"), "utf8");
    const union = /export type MarketDataSource = ([^;]+);/.exec(types)?.[1] ?? "";
    const values = [...union.matchAll(/"([a-z]+)"/g)].map((m) => m[1]);
    expect(values.length).toBeGreaterThan(0);
    const marketSources = new Set(registry.sources.map((s) => s.marketSource));
    expect(values.filter((v) => !marketSources.has(v))).toEqual([]);
  });

  it("usedBy 里的函数在对应文件中真实存在", () => {
    for (const s of registry.sources) {
      const code = readFileSync(join(ROOT, s.module), "utf8");
      for (const fn of s.usedBy) {
        expect(code, `${s.id} → ${fn}`).toMatch(new RegExp(`\\b(function|const|let)\\s+${fn}\\b`));
      }
    }
  });

  it("演示数据不能标成真实数据", () => {
    for (const s of registry.sources.filter((x) => x.kind === "mock")) expect(s.isRealData).toBe(false);
  });

  it("docs/DATASOURCES.md 与注册表同步", () => {
    const current = readFileSync(CATALOG_PATH, "utf8").replace(/\r\n/g, "\n");
    expect(current).toBe(renderCatalog(registry));
  });
});
