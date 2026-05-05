import { localPlugin } from "../common/local-plugins/index.mjs";

/**
 * Enforce design rules on Next.js layout files.
 *
 * - `<main>` is a structural slot, not a styling surface. Spacing and
 *   decoration belong in page.tsx (e.g. `<Container className="py-8">`).
 */
export const layoutsConfigs = [
  {
    name: "layouts/main-structural-only",
    files: ["src/app/**/layout.tsx"],
    plugins: { local: localPlugin },
    rules: {
      "local/layout-main-structural-only": "error",
    },
  },
];
