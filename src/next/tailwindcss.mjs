import { existsSync } from "node:fs";
import { dirname, join, sep } from "node:path";

import betterTailwindcss from "eslint-plugin-better-tailwindcss";

// `eslint-plugin-better-tailwindcss` resolves a relative `entryPoint` against
// the linter's `cwd`, which under LSP servers (vscode-eslint, Zed) is often
// the edited file's directory rather than the consumer's project root and
// breaks resolution. Mirror the `findProjectRoot` pattern from
// `common/rules.mjs` and `common/constants.mjs`: walk up from this module
// outside of `node_modules` and locate `src/app/globals.css`, then pass the
// absolute path so resolution is cwd-independent. Falls back to the relative
// path when not found, preserving the previous CLI-only behavior.
const findEntryPoint = (start) => {
  let dir = start;
  while (dir !== dirname(dir)) {
    if (!dir.split(sep).includes("node_modules")) {
      const candidate = join(dir, "src/app/globals.css");
      if (existsSync(candidate)) {
        return candidate;
      }
    }
    dir = dirname(dir);
  }
  return "src/app/globals.css";
};

const entryPoint = findEntryPoint(import.meta.dirname);

/**
 * Tailwind CSS v4 lint rules:
 *
 * - margin is forbidden; spacing is controlled by padding/gap on the parent
 * - `space-x-*` / `space-y-*` are also banned because they apply margin to
 *   children under the hood. Use `flex/grid + gap` instead. Negative variants
 *   (`-space-x-2`) remain allowed for intentional overlap
 * - class order, deprecated classes, conflicts, duplicates, and whitespace
 *   are enforced via `eslint-plugin-better-tailwindcss`
 * - `entryPoint` is auto-resolved to the consuming project's
 *   `src/app/globals.css` via walk-up from this module. Override in the
 *   project's eslint.config.mjs if the file lives elsewhere.
 */
export const tailwindcssConfigs = [
  {
    name: "tailwindcss/rules",
    files: ["src/**/*.{ts,tsx}"],
    plugins: { "better-tailwindcss": betterTailwindcss },
    settings: {
      "better-tailwindcss": {
        entryPoint,
      },
    },
    rules: {
      "better-tailwindcss/enforce-consistent-class-order": "error",
      "better-tailwindcss/enforce-consistent-important-position": "error",
      "better-tailwindcss/no-conflicting-classes": "error",
      "better-tailwindcss/no-deprecated-classes": "error",
      "better-tailwindcss/no-duplicate-classes": "error",
      "better-tailwindcss/no-restricted-classes": [
        "error",
        {
          restrict: [
            {
              pattern: "^(?!mx-auto$)m[trblxy]?-(?!auto$)[^-\\s]+$",
              message:
                "Avoid margin; control spacing with padding/gap (exceptions: mx-auto, -mt-*)",
            },
            {
              pattern: "^space-[xy]-[^-\\s]+$",
              message:
                "Avoid space-x/space-y (uses margin internally); use flex/grid + gap",
            },
          ],
        },
      ],
      "better-tailwindcss/no-unnecessary-whitespace": "error",
    },
  },
];
