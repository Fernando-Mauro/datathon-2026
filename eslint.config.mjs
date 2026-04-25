import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Design-system reference kits + planning artifacts. JSX prototypes under
    // .planning/design/ are read-only inspo (not imported, not built); .claude/
    // contains agent worktree mirrors. Lint pre-existed Phase 03.1; ignoring
    // here keeps the gauntlet honest about app/ code only.
    ".planning/**",
    ".claude/**",
  ]),
]);

export default eslintConfig;
