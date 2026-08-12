export function createTestsConfigs({ featureRoot }) {
  return [
    {
      name: "test/unit-no-wiring-import",
      files: [`${featureRoot}/**/*.test.{ts,tsx}`],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            patterns: [
              {
                group: [
                  "**/services/*",
                  "**/services",
                  "**/queries/*",
                  "**/queries",
                  "**/entries/*",
                  "**/entries",
                ],
                message:
                  "unit test は配線層 (services / queries / entries) を import 不可。" +
                  "mock の echo になる:\n" +
                  "- pure (utils / schemas) のみ unit する\n" +
                  "- 配線の検証は e2e に委ねる",
              },
            ],
          },
        ],
      },
    },
  ];
}
