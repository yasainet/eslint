export default {
  meta: {
    type: "problem",
    messages: {
      noTryCatch:
        "features cannot use try / catch. A failure can be only returned as a value or thrown to Next.js (error.tsx and instrumentation.ts).",
    },
    schema: [],
  },
  create(context) {
    return {
      TryStatement: (node) =>
        context.report({ node, messageId: "noTryCatch" }),
    };
  },
};
