const SERVICE_BINDING_REGEX = /Service$/;

function isServiceCall(node) {
  if (node?.type !== "CallExpression") return false;
  const callee = node.callee;
  if (callee.type !== "MemberExpression") return false;
  const obj = callee.object;
  if (obj.type !== "Identifier") return false;
  if (!SERVICE_BINDING_REGEX.test(obj.name)) return false;
  if (obj.name.startsWith("shared")) return false;
  return true;
}

function collectServiceCalls(root) {
  const calls = [];
  function visit(node) {
    if (!node || typeof node !== "object") return;
    if (isServiceCall(node)) calls.push(node);
    for (const key of Object.keys(node)) {
      if (key === "parent" || key === "loc" || key === "range") continue;
      const value = node[key];
      if (Array.isArray(value)) {
        for (const item of value) visit(item);
      } else if (value && typeof value === "object" && "type" in value) {
        visit(value);
      }
    }
  }
  visit(root);
  return calls;
}

export const entrySingleServiceCallRule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Enforce entries call at most one (non-shared) feature service per exported function.",
    },
    messages: {
      multipleServiceCalls:
        "entry '{{ funcName }}' calls more than one feature service ({{ count }} total). entries must be a thin wrapper that calls a single service. Move orchestration into the service layer. `shared/services/*` (e.g. `sharedDiscordService`) is exempt.",
    },
    schema: [],
  },
  create(context) {
    return {
      ExportNamedDeclaration(node) {
        if (!node.declaration) return;
        const decl = node.declaration;
        if (decl.type !== "FunctionDeclaration") return;
        if (!decl.async) return;
        if (!decl.id) return;
        const funcName = decl.id.name;
        const calls = collectServiceCalls(decl.body);
        if (calls.length <= 1) return;
        for (let i = 1; i < calls.length; i++) {
          context.report({
            node: calls[i],
            messageId: "multipleServiceCalls",
            data: { funcName, count: String(calls.length) },
          });
        }
      },
    };
  },
};
