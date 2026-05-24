import { existsSync } from "node:fs";
import { dirname, join, sep } from "node:path";

import betterTailwindcss from "eslint-plugin-better-tailwindcss";

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
                "margin を避け、padding/gap で間隔を制御する (例外: mx-auto, -mt-*)",
            },
            {
              pattern: "^space-[xy]-[^-\\s]+$",
              message:
                "space-x/space-y は避ける (内部で margin を使う)。flex/grid + gap を使う",
            },
          ],
        },
      ],
      "better-tailwindcss/no-unnecessary-whitespace": "error",
    },
  },
];
