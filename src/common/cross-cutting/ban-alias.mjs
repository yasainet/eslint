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
                  "この環境では alias import (@/) は使えない。相対パスを使う。",
              },
            ],
          },
        ],
      },
    },
  ];
}
