export function createBanAliasConfigs({ featureRoot }) {
  return [
    {
      name: "imports/ban-alias",
      files: [`${featureRoot}/**/*.ts`],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            patterns: [
              {
                group: ["@/*", "@/**"],
                message:
                  "Alias imports (@/) are not available in this environment. Use relative paths.",
              },
            ],
          },
        ],
      },
    },
  ];
}
