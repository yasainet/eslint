import ts from "typescript";

/**
 * Exported function の return type が any を含んでいる場合に error:
 *
 * - typescript-eslint の type checker を使って inferred type まで見る
 * - repositories / services の API 境界を any 汚染から守ることで、domain shape が型で保証される
 * - Promise<any>, Promise<{ data: any }>, Array<any> など nested も展開して検査する
 */
export const noAnyReturnRule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow exported functions whose inferred return type contains `any`.",
    },
    messages: {
      anyInReturn:
        "Exported function's inferred return type contains `any`: {{ typeText }}. Annotate with a known type or narrow from the source — public layer APIs must have known shapes.",
    },
    schema: [],
  },
  create(context) {
    const services = context.sourceCode.parserServices;
    if (!services?.program || !services.esTreeNodeToTSNodeMap) return {};
    const checker = services.program.getTypeChecker();

    const isExported = (node) => {
      const parent = node.parent;
      if (!parent) return false;
      if (parent.type === "ExportNamedDeclaration") return true;
      if (parent.type === "ExportDefaultDeclaration") return true;
      return false;
    };

    const getReturnType = (node) => {
      const tsNode = services.esTreeNodeToTSNodeMap.get(node);
      if (!tsNode) return null;
      const signature = checker.getSignatureFromDeclaration(tsNode);
      if (!signature) return null;
      return checker.getReturnTypeOfSignature(signature);
    };

    // `any` を type tree 全体で検出する (Promise<any>, { a: any }, any[] 等を展開)
    const containsAny = (type, seen = new Set()) => {
      if (!type) return false;
      if (seen.has(type)) return false;
      seen.add(type);

      if (type.flags & ts.TypeFlags.Any) return true;

      if (type.isUnion?.() || type.isIntersection?.()) {
        return type.types.some((t) => containsAny(t, seen));
      }

      const typeArgs =
        checker.getTypeArguments?.(type) ??
        type.typeArguments ??
        type.aliasTypeArguments ??
        [];
      for (const arg of typeArgs) {
        if (containsAny(arg, seen)) return true;
      }

      const props = type.getProperties?.() ?? [];
      for (const prop of props) {
        const decl = prop.valueDeclaration ?? prop.declarations?.[0];
        if (!decl) continue;
        const propType = checker.getTypeOfSymbolAtLocation(prop, decl);
        if (containsAny(propType, seen)) return true;
      }

      return false;
    };

    const check = (node) => {
      if (!isExported(node)) return;
      const returnType = getReturnType(node);
      if (!returnType) return;
      if (!containsAny(returnType)) return;

      const typeText = checker.typeToString(
        returnType,
        undefined,
        ts.TypeFormatFlags.NoTruncation,
      );
      context.report({
        node: node.id ?? node,
        messageId: "anyInReturn",
        data: { typeText },
      });
    };

    return {
      FunctionDeclaration: check,
      FunctionExpression: check,
      ArrowFunctionExpression: check,
    };
  },
};
