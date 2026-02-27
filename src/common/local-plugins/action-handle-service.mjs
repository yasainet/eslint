/**
 * @description In *.action.ts, `handleXxx` must call the service method `*.xxx()`.
 */
export const actionHandleServiceRule = {
  meta: {
    type: "problem",
    messages: {
      missingCall:
        "handleXxx must call the corresponding service method '*.{{ expected }}()'.",
    },
    schema: [],
  },
  create(context) {
    return {
      "ExportNamedDeclaration > FunctionDeclaration[id.name=/^handle[A-Z]/]"(
        node,
      ) {
        const name = node.id.name;
        const suffix = name.slice("handle".length);
        const expected = suffix[0].toLowerCase() + suffix.slice(1);

        let found = false;

        function walk(n) {
          if (found || !n || typeof n !== "object") return;

          if (
            n.type === "CallExpression" &&
            n.callee.type === "MemberExpression" &&
            !n.callee.computed &&
            n.callee.property.name === expected
          ) {
            found = true;
            return;
          }

          for (const key of Object.keys(n)) {
            if (key === "parent") continue;
            const child = n[key];
            if (Array.isArray(child)) {
              for (const item of child) walk(item);
            } else if (child && typeof child.type === "string") {
              walk(child);
            }
          }
        }

        walk(node.body);

        if (!found) {
          context.report({
            node: node.id,
            messageId: "missingCall",
            data: { expected },
          });
        }
      },
    };
  },
};
