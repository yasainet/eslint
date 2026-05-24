export const flatEntryPointRule = {
  meta: {
    type: "problem",
    messages: {
      nested:
        "Edge Function の entry point は supabase/functions/ 直下に置く。ネストした directory (例 commands/{{name}}) は Supabase CLI 非対応。",
    },
    schema: [],
  },
  create(context) {
    return {
      Program(node) {
        const filename = context.filename ?? context.getFilename();
        const idx = filename.indexOf("supabase/functions/");
        if (idx === -1) return;

        const relative = filename.slice(idx + "supabase/functions/".length);
        const segments = relative.split("/").filter(Boolean);

        if (segments[0]?.startsWith("_")) return;

        if (segments.length <= 1) return;

        if (segments.length > 2) {
          context.report({
            node,
            messageId: "nested",
            data: { name: segments.slice(0, -1).join("/") },
          });
        }
      },
    };
  },
};
