/**
 * Enforce 1:1 entry-to-service mapping for `**\/entries/*.ts` exports.
 *
 * Why: services are the orchestration layer (they may combine multiple queries
 * and other features' queries). entries should be a thin wrapper that calls a
 * single service function and normalizes the return shape into
 * `{ data, error }`. If an entry calls more than one service, orchestration is
 * leaking up into the entry layer.
 *
 * Detection rule:
 *
 * - For every exported async `FunctionDeclaration` in an entries file, count
 *   `CallExpression`s whose callee is a `MemberExpression` of the form
 *   `<binding>.<method>(...)` where `<binding>` matches the namespace import
 *   naming convention `*Service` (e.g. `articlesServerService`,
 *   `usersClientService`).
 * - More than one such call inside the same exported function is an error.
 *
 * Exception (C-3):
 *
 * - Bindings starting with `shared` (e.g. `sharedDiscordService`,
 *   `sharedResendService`) are EXCLUDED from the count. These represent
 *   cross-cutting side-effect abstractions (Discord / Resend / Slack
 *   notifications) that don't fit the entry-service 1:1 model and are allowed
 *   to be invoked from entries directly.
 *
 * The rule reports the 2nd and later violations (the 1st call is permitted),
 * so the fix surface is the redundant calls.
 */

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
