import { entrySingleServiceCallRule } from "./entry-single-service-call.mjs";
import { entryTemplateRule } from "./entry-template.mjs";
import { featureNameRule } from "./feature-name.mjs";
import { formStateNamingRule } from "./form-state-naming.mjs";
import { formStateShapeRule } from "./form-state-shape.mjs";
import { importPathStyleRule } from "./import-path-style.mjs";
import { layoutMainStructuralOnlyRule } from "./layout-main-structural-only.mjs";
import { namespaceImportNameRule } from "./namespace-import-name.mjs";
import { noAnyReturnRule } from "./no-any-return.mjs";
import { queriesExportRule } from "./queries-export.mjs";
import { queriesNamespaceImportRule } from "./queries-namespace-import.mjs";
import { schemaNamingRule } from "./schema-naming.mjs";
import { supabaseColumnsSatisfiesRule } from "./supabase-columns-satisfies.mjs";
import { supabaseSelectTypedColumnsRule } from "./supabase-select-typed-columns.mjs";

export const localPlugin = {
  rules: {
    "entry-single-service-call": entrySingleServiceCallRule,
    "entry-template": entryTemplateRule,
    "feature-name": featureNameRule,
    "form-state-naming": formStateNamingRule,
    "form-state-shape": formStateShapeRule,
    "import-path-style": importPathStyleRule,
    "layout-main-structural-only": layoutMainStructuralOnlyRule,
    "namespace-import-name": namespaceImportNameRule,
    "no-any-return": noAnyReturnRule,
    "queries-export": queriesExportRule,
    "queries-namespace-import": queriesNamespaceImportRule,
    "schema-naming": schemaNamingRule,
    "supabase-columns-satisfies": supabaseColumnsSatisfiesRule,
    "supabase-select-typed-columns": supabaseSelectTypedColumnsRule,
  },
};
