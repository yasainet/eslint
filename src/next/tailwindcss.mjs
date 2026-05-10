import betterTailwindcss from "eslint-plugin-better-tailwindcss";

/**
 * Tailwind CSS v4 lint rules:
 *
 * - margin is forbidden; spacing is controlled by padding/gap on the parent
 * - class order, deprecated classes, conflicts, duplicates, and whitespace
 *   are enforced via `eslint-plugin-better-tailwindcss`
 * - `entryPoint` points at the consuming project's CSS-first Tailwind config
 *   (`src/app/globals.css`). Override in the project's eslint.config.mjs if
 *   the path differs.
 */
export const tailwindcssConfigs = [
  {
    name: "tailwindcss/rules",
    files: ["src/**/*.{ts,tsx}"],
    plugins: { "better-tailwindcss": betterTailwindcss },
    settings: {
      "better-tailwindcss": {
        entryPoint: "src/app/globals.css",
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
          ],
        },
      ],
      "better-tailwindcss/no-unnecessary-whitespace": "error",
    },
  },
];
