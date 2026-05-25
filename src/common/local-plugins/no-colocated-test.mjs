/**
 * orchestration layer (services / queries / entries) での co-located test を禁止する:
 *
 * - これらは Supabase 等への配線で、unit 化すると mock の echo になる
 * - 検証は e2e に委ね、純粋ロジックは utils へ抽出してそちらを unit する
 */
export const noColocatedTestRule = {
  meta: {
    type: "problem",
    messages: {
      forbidden:
        "orchestration layer (services/queries/entries) に test を置かない。" +
        "mock の echo になる:\n" +
        "- 配線の検証は e2e に委ねる\n" +
        "- 純粋ロジックは utils へ抽出し、そちらを unit する",
    },
    schema: [],
  },
  create(context) {
    return {
      Program(node) {
        context.report({ node, messageId: "forbidden" });
      },
    };
  },
};
