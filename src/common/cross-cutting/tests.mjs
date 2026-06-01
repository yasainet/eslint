/**
 * unit test (utils / schemas の兄弟 *.test.ts) から配線層への import を禁止する:
 *
 * - services / queries / entries を import すると mock の echo（写経）になる
 * - pure (utils / schemas) のみを対象にし、配線の検証は e2e に委ねる
 * - createUtilsConfigs より後に spread し、test.ts では本 rule を後勝ちにする
 */
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
