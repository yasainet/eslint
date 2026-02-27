/**
 * @fileoverview Main ESLint configuration aggregator.
 *
 * Combines all configuration modules:
 * - base: Next.js presets and shared rules
 * - naming: File naming conventions
 * - layers: Layer architecture constraints (syntax only)
 * - directives: "use server" / "use client" requirements
 * - imports: Consolidated import restrictions (layer, cross-feature, cardinality, prefix-lib, lib-boundary)
 * - jsdoc: JSDoc description requirements for exported functions
 */

import { baseConfigs, ignoresConfig, sharedRulesConfig } from "./base.mjs";
import { directivesConfigs } from "./directives.mjs";
import { importsConfigs } from "./imports.mjs";
import { jsdocConfigs } from "./jsdoc.mjs";
import { layersConfigs } from "./layers.mjs";
import { namingConfigs } from "./naming.mjs";

/**
 * Complete ESLint configuration array.
 * @type {import("eslint").Linter.Config[]}
 */
export const eslintConfig = [
  ...baseConfigs,
  ignoresConfig,
  sharedRulesConfig,
  ...namingConfigs,
  ...layersConfigs,
  ...directivesConfigs,
  ...importsConfigs,
  ...jsdocConfigs,
];
