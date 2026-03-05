/** Ban `import * as` at entry points. */
export function createEntryPointConfigs(entryPointFiles, entryPointIgnores = []) {
  return [
    {
      name: "entry-points/no-namespace-import",
      files: entryPointFiles,
      ignores: entryPointIgnores,
      rules: {
        "no-restricted-syntax": [
          "error",
          {
            selector: "ImportDeclaration:has(ImportNamespaceSpecifier)",
            message:
              "Entry points must use named imports instead of `import * as`. This makes dependencies explicit.",
          },
        ],
      },
    },
  ];
}
