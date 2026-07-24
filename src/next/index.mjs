import { createEntryPointConfigs } from "../common/boundaries/entry-point.mjs";
import { createCommonConfigs } from "../common/index.mjs";

import { calleeBoundaryConfigs } from "./boundaries/callee-boundaries.mjs";
import { libBoundaryConfigs } from "./boundaries/lib.mjs";
import { directivesConfigs } from "./directives.mjs";
import { importPathStyleConfigs } from "./imports.mjs";
import { componentsLayerConfigs } from "./layers/components.mjs";
import { hooksLayerConfigs } from "./layers/hooks.mjs";
import { layoutsConfigs } from "./layers/layouts.mjs";
import { tailwindcssConfigs } from "./tailwindcss.mjs";

const nextEntryPointConfigs = createEntryPointConfigs(
  ["src/app/**/*.ts", "src/app/**/*.tsx"],
);

const yasainetConfig = [
  {
    name: "rules/ignore-shadcn-ui",
    ignores: ["src/components/shared/ui/*.{ts,tsx}"],
  },
  ...createCommonConfigs("src/features", {
    rulesFiles: ["src/**/*.ts", "src/**/*.tsx"],
  }),
  ...libBoundaryConfigs,
  ...calleeBoundaryConfigs,
  ...hooksLayerConfigs,
  ...componentsLayerConfigs,
  ...directivesConfigs,
  ...importPathStyleConfigs,
  ...layoutsConfigs,
  ...tailwindcssConfigs,
  ...nextEntryPointConfigs,
];

export default yasainetConfig;
