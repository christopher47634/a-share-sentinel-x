import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { describe, expect, it } from "vitest";

// 依赖方向见 docs/ARCHITECTURE.md：app → components → hooks → lib / mock → types
const SRC = join(__dirname, "..", "..");

type Layer = "app" | "api" | "components" | "hooks" | "lib" | "mock" | "types" | "styles";

/** 每层不允许依赖的层 */
const FORBIDDEN: Record<Layer, Layer[]> = {
  types: ["app", "api", "components", "hooks", "lib", "mock"],
  lib: ["app", "api", "components", "hooks"],
  mock: ["app", "api", "components", "hooks"],
  hooks: ["app", "api", "components"],
  components: ["app", "api"],
  api: ["components", "hooks"],
  app: ["api"],
  styles: [],
};

function layerOf(file: string): Layer | null {
  const parts = relative(SRC, file).split(sep);
  if (parts[0] === "app") return parts[1] === "api" ? "api" : "app";
  return (["components", "hooks", "lib", "mock", "types", "styles"] as const).find((l) => l === parts[0]) ?? null;
}

function layerOfImport(spec: string, fromFile: string): Layer | null {
  if (spec.startsWith("@/")) return layerOf(join(SRC, spec.slice(2)));
  if (spec.startsWith(".")) return layerOf(join(fromFile, "..", spec));
  return null;
}

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return name === "__tests__" ? [] : sourceFiles(full);
    return /\.(ts|tsx)$/.test(name) ? [full] : [];
  });
}

const IMPORT_RE = /(?:import|export)\s[^'"]*?from\s*['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)/g;

describe("架构边界", () => {
  const files = sourceFiles(SRC);

  it("所有源码都归属某一层", () => {
    expect(files.filter((f) => layerOf(f) === null).map((f) => relative(SRC, f))).toEqual([]);
  });

  it("没有反向依赖", () => {
    const violations: string[] = [];
    for (const file of files) {
      const from = layerOf(file) as Layer;
      for (const m of readFileSync(file, "utf8").matchAll(IMPORT_RE)) {
        const spec = m[1] ?? m[2];
        const to = layerOfImport(spec, file);
        if (to && FORBIDDEN[from].includes(to)) violations.push(`${relative(SRC, file)} (${from}) → ${spec} (${to})`);
      }
    }
    expect(violations).toEqual([]);
  });

  it("types 层只放类型，不引入运行时代码", () => {
    for (const file of files.filter((f) => layerOf(f) === "types")) {
      const code = readFileSync(file, "utf8");
      expect(code, relative(SRC, file)).not.toMatch(/^\s*export\s+(const|let|function|class)\s/m);
    }
  });

  it("lib 层不依赖 React，保持纯函数可测", () => {
    const offenders = files
      .filter((f) => layerOf(f) === "lib")
      .filter((f) => /from\s+['"]react['"]/.test(readFileSync(f, "utf8")))
      .map((f) => relative(SRC, f));
    expect(offenders).toEqual([]);
  });
});
