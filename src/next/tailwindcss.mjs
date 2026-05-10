import betterTailwindcss from "eslint-plugin-better-tailwindcss";

/**
 * Tailwind CSS v4 lint rules:
 *
 * - margin is forbidden; spacing is controlled by padding/gap on the parent
 * - `space-x-*` / `space-y-*` are also banned because they apply margin to
 *   children under the hood. Use `flex/grid + gap` instead. Negative variants
 *   (`-space-x-2`) remain allowed for intentional overlap
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
