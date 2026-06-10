import { generatePrefixLibMapping } from "./_internal/constants.mjs";
import { createTypescriptConfigs } from "./base/typescript.mjs";
import { createBanAliasConfigs } from "./cross-cutting/ban-alias.mjs";
import { createFeatureDefaultImportsConfigs } from "./cross-cutting/feature-default-imports.mjs";
import { createFeatureNameConfigs } from "./cross-cutting/feature-name.mjs";
import { createFeaturesTsOnlyConfigs } from "./cross-cutting/features-ts-only.mjs";
import { createFormStateConfigs } from "./cross-cutting/form-state.mjs";
import { createLoggerConfigs } from "./cross-cutting/logger.mjs";
import { createNamespaceImportConfigs } from "./cross-cutting/namespace-import.mjs";
import { createNoAnyReturnConfigs } from "./cross-cutting/no-any-return.mjs";
import { createNoColocatedTestConfigs } from "./cross-cutting/no-colocated-test.mjs";
import { createSupabaseColumnsSatisfiesConfigs } from "./cross-cutting/supabase-columns-satisfies.mjs";
import { createTestsConfigs } from "./cross-cutting/tests.mjs";
import { createConstantsConfigs } from "./layers/constants.mjs";
import { createEntriesConfigs } from "./layers/entries.mjs";
import { createTopLevelLibConfigs } from "./layers/top-level/lib.mjs";
import { createQueriesConfigs } from "./layers/queries.mjs";
import { createSchemasConfigs } from "./layers/schemas.mjs";
import { createServicesConfigs } from "./layers/services.mjs";
import { createTopLevelUtilsConfigs } from "./layers/top-level/utils.mjs";
import { createTypesConfigs } from "./layers/types.mjs";
import { createUtilsConfigs } from "./layers/utils.mjs";

export function createCommonConfigs(
  featureRoot,
  { banAliasImports = false, typeAware = true, rulesFiles } = {},
) {
  const prefixLibMapping = generatePrefixLibMapping(featureRoot);
  const ctx = { featureRoot, prefixLibMapping, typeAware };
  return [
    ...createTypescriptConfigs({ typeAware, ...(rulesFiles && { files: rulesFiles }) }),
    ...createFeatureNameConfigs(ctx),
    ...createNamespaceImportConfigs(ctx),
    // logger は features/**\/*.ts 全体に no-restricted-syntax を設定するため、
    // 同 rule を持つ services/queries より前に置く (flat config は後勝ちで完全置換)。
    ...createLoggerConfigs(ctx),
    ...createServicesConfigs(ctx),
    ...createQueriesConfigs(ctx),
    ...createFormStateConfigs(ctx),
    ...createSupabaseColumnsSatisfiesConfigs(ctx),
    ...createTopLevelLibConfigs(ctx),
    ...createTopLevelUtilsConfigs(ctx),
    ...createTypesConfigs(ctx),
    ...createSchemasConfigs(ctx),
    ...createUtilsConfigs(ctx),
    ...createConstantsConfigs(ctx),
    ...createEntriesConfigs(ctx),
    ...createFeaturesTsOnlyConfigs(ctx),
    ...createNoColocatedTestConfigs(ctx),
    // createUtilsConfigs より後に置き、test.ts への配線 import 禁止を後勝ちにする。
    ...createTestsConfigs(ctx),
    ...createNoAnyReturnConfigs(ctx),
    ...createFeatureDefaultImportsConfigs(ctx),
    ...(banAliasImports ? createBanAliasConfigs(ctx) : []),
  ];
}
