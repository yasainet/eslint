/**
 * Enforce verb allow list for `queries/*.query.ts` exports.
 *
 * The queries layer is the TS-idiomatic translation of Rails 5 actions
 * (index/show -> get, create, update, destroy -> delete). Auth ceremonies
 * (signUp / signIn / signOut) are admitted as industry-standard exceptions.
 */

const QUERIES_ALLOW = /^(get|create|update|delete|signUp|signIn|signOut)([A-Z]|$)/;

function isFunctionLike(initNode) {
  if (!initNode) return false;
  const t = initNode.type;
  if (t === "ArrowFunctionExpression" || t === "FunctionExpression") return true;
  if (t === "CallExpression") {
    return initNode.arguments.some(
      (arg) =>
        arg.type === "ArrowFunctionExpression" ||
        arg.type === "FunctionExpression",
    );
  }
  return false;
}

function reportIfInvalid(context, idNode) {
  if (!QUERIES_ALLOW.test(idNode.name)) {
    context.report({
      node: idNode,
      messageId: "invalidName",
      data: { name: idNode.name },
    });
  }
}

export const queriesExportRule = {
  meta: {
    type: "problem",
    messages: {
      invalidName:
        "queries export '{{ name }}' must start with one of: get, create, update, delete, signUp, signIn, signOut. (Rails 5 actions translated to TS idiom)",
    },
    schema: [],
  },
  create(context) {
    return {
      ExportNamedDeclaration(node) {
        if (!node.declaration) return;
        const decl = node.declaration;

        if (decl.type === "FunctionDeclaration" && decl.id) {
          reportIfInvalid(context, decl.id);
          return;
        }

        if (decl.type === "VariableDeclaration") {
          for (const variator of decl.declarations) {
            if (variator.id.type !== "Identifier") continue;
            if (!isFunctionLike(variator.init)) continue;
            reportIfInvalid(context, variator.id);
          }
        }
      },
    };
  },
};
