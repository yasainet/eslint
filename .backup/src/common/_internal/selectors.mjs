export const loggerSelector = "CallExpression[callee.object.name='logger']";

export const loggerMessage =
  "logger は entries 以外で禁止。ログ出力は entries に集約する。";

export const aliasDynamicImportSelector =
  "ImportExpression[source.type='Literal'][source.value=/^@\\//]";

export const aliasDynamicImportMessage =
  "features layers で `@/` パスの動的 import は禁止 (prefix-lib / lateral 制約を迂回する):\n" +
  "- 内部依存は queries/<prefix>.ts か services/<prefix>.ts を作る\n" +
  "- 外部 npm は cold-start 最適化の遅延 import なら可";
