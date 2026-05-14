/**
 * Enforce the canonical `{ data, error: { message } }` shape for FormState types.
 *
 * Targets `TSInterfaceDeclaration` and `TSTypeAliasDeclaration` whose name ends
 * with `FormState`. Required shape:
 *
 * ```ts
 * interface XxxFormState {
 *   data: T | null;            // T may be any type; `data: null` literal also OK
 *   error: { message: string } | null;
 * }
 * ```
 *
 * Why this shape:
 *
 * - Single uniform shape lets entry / hook / UI be templated and lint-checked.
 * - Forbids `code` / `status` / similar discriminator fields that tend to grow
 *   defensive branches (e.g. `error.code === "unauthenticated"`) which usually
 *   indicate a missing upstream guard (route gate, button conditional render),
 *   not a legitimate need for in-action discrimination.
 * - Discriminated unions (`{ data: T; error: null } | { data: null; error: ... }`)
 *   are rejected for the same reason — they leak shape complexity into hooks
 *   (`useActionState<T | null>`), components (`state?.error`), and entries.
 *
 * Future extension when Stripe / payment libraries actually need `code` / `status`:
 *
 * - a) Add a `// allow-error-code: <reason>` comment opt-out to this rule, so
 *      individual FormStates can justify their extra field on the previous line.
 * - b) Change the rule to whitelist a fixed set of allowed extra fields (enum
 *      of standard error codes shared across the codebase).
 *
 * Until that need materializes, this rule is strict (no opt-out) per YAGNI.
 */

const FORM_STATE_SUFFIX = "FormState";

function isNullLiteralType(node) {
  return node?.type === "TSNullKeyword";
}

function isStringType(node) {
  return node?.type === "TSStringKeyword";
}

function isUnionContainingNull(node) {
  if (node?.type !== "TSUnionType") return false;
  return node.types.some(isNullLiteralType);
}

function getNonNullUnionMembers(unionNode) {
  return unionNode.types.filter((t) => !isNullLiteralType(t));
}

function dataTypeAllowsNull(node) {
  if (!node) return false;
  if (isNullLiteralType(node)) return true;
  return isUnionContainingNull(node);
}

function getErrorObjectExtraFields(node) {
  if (node?.type !== "TSTypeLiteral") return [];
  return node.members
    .filter((m) => m.type === "TSPropertySignature")
    .filter((m) => m.key?.type === "Identifier" && m.key.name !== "message")
    .map((m) => m.key.name);
}

function isErrorMessageOnlyShape(node) {
  if (node?.type !== "TSTypeLiteral") return false;
  if (node.members.length !== 1) return false;
  const member = node.members[0];
  if (member.type !== "TSPropertySignature") return false;
  if (member.key?.type !== "Identifier" || member.key.name !== "message") return false;
  const typeAnn = member.typeAnnotation?.typeAnnotation;
  return isStringType(typeAnn);
}

function checkBody(context, idNode, name, members) {
  const props = new Map();
  for (const m of members) {
    if (m.type !== "TSPropertySignature") continue;
    if (m.key?.type !== "Identifier") continue;
    props.set(m.key.name, m);
  }

  const dataProp = props.get("data");
  if (!dataProp) {
    context.report({
      node: idNode,
      messageId: "dataMissing",
      data: { name },
    });
  } else {
    const dataType = dataProp.typeAnnotation?.typeAnnotation;
    if (!dataTypeAllowsNull(dataType)) {
      context.report({
        node: dataProp,
        messageId: "dataNotNullable",
        data: { name },
      });
    }
  }

  const errorProp = props.get("error");
  if (!errorProp) {
    context.report({
      node: idNode,
      messageId: "errorMissing",
      data: { name },
    });
  } else {
    const errorType = errorProp.typeAnnotation?.typeAnnotation;
    if (!isUnionContainingNull(errorType)) {
      context.report({
        node: errorProp,
        messageId: "errorNotNullable",
        data: { name },
      });
    } else {
      const nonNull = getNonNullUnionMembers(errorType);
      if (nonNull.length !== 1) {
        context.report({
          node: errorProp,
          messageId: "errorWrongShape",
          data: { name },
        });
      } else {
        const errorObj = nonNull[0];
        if (!isErrorMessageOnlyShape(errorObj)) {
          const extras = getErrorObjectExtraFields(errorObj);
          if (extras.length > 0) {
            for (const extra of extras) {
              context.report({
                node: errorProp,
                messageId: "errorExtraField",
                data: { name, field: extra },
              });
            }
          } else {
            context.report({
              node: errorProp,
              messageId: "errorWrongShape",
              data: { name },
            });
          }
        }
      }
    }
  }

  for (const [propName, propNode] of props) {
    if (propName !== "data" && propName !== "error") {
      context.report({
        node: propNode,
        messageId: "extraProperty",
        data: { name, field: propName },
      });
    }
  }
}

export const formStateShapeRule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Enforce { data, error: { message } } shape for FormState types.",
    },
    messages: {
      dataMissing:
        "FormState '{{ name }}' must have a `data` property (use `data: null` if there is no payload).",
      dataNotNullable:
        "FormState '{{ name }}' `data` must allow null (e.g. `data: T | null` or `data: null`).",
      errorMissing:
        "FormState '{{ name }}' must have an `error: { message: string } | null` property.",
      errorNotNullable:
        "FormState '{{ name }}' `error` must be nullable (`{ message: string } | null`).",
      errorWrongShape:
        "FormState '{{ name }}' `error` must be exactly `{ message: string } | null`.",
      errorExtraField:
        "FormState '{{ name }}' `error` object must contain only `message: string`. Forbidden field: '{{ field }}'. See form-state-shape rule docstring for the rationale and the future opt-out plan for Stripe-like cases.",
      extraProperty:
        "FormState '{{ name }}' must contain only `data` and `error`. Forbidden property: '{{ field }}'.",
      discriminatedUnion:
        "FormState '{{ name }}' must be a single interface or type literal, not a discriminated union.",
    },
    schema: [],
  },
  create(context) {
    return {
      TSInterfaceDeclaration(node) {
        const name = node.id?.name;
        if (!name?.endsWith(FORM_STATE_SUFFIX)) return;
        checkBody(context, node.id, name, node.body.body);
      },
      TSTypeAliasDeclaration(node) {
        const name = node.id?.name;
        if (!name?.endsWith(FORM_STATE_SUFFIX)) return;
        const ann = node.typeAnnotation;
        if (ann?.type === "TSUnionType") {
          context.report({
            node: node.id,
            messageId: "discriminatedUnion",
            data: { name },
          });
          return;
        }
        if (ann?.type !== "TSTypeLiteral") return;
        checkBody(context, node.id, name, ann.members);
      },
    };
  },
};
