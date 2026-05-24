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
              "entry point は `import * as` 禁止。named import で依存を明示する。",
          },
        ],
      },
    },
  ];
}
