import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) });

const eslintConfig = [
  { ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "next-env.d.ts", ".nexus-local-ledger/**"] },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // 调试输出不进生产；error/warn 留给真实异常
      "no-console": ["error", { allow: ["error", "warn"] }],
      eqeqeq: ["error", "always", { null: "ignore" }],
      "prefer-const": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "react-hooks/exhaustive-deps": "error",
    },
  },
  {
    // 命令行脚本本来就靠 console 输出
    files: ["scripts/**"],
    rules: { "no-console": "off" },
  },
];

export default eslintConfig;
