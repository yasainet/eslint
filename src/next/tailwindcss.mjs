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
