const CATCH_RETURN_MESSAGE = "An unexpected error occurred";
const TERMINAL_CALLEES = new Set(["redirect", "permanentRedirect", "notFound"]);

const REDACT_PARAM_NAMES = new Set([
  "password",
  "newPassword",
  "currentPassword",
]);

const REDACT_PARAM_TYPES = new Set([
  "SignUpWithPasswordCredentials",
  "SignInWithPasswordCredentials",
]);

function isRedactedParamType(param) {
  const ann = param.typeAnnotation?.typeAnnotation;
  if (ann?.type !== "TSTypeReference") return false;
  const name = ann.typeName;
  if (name?.type !== "Identifier") return false;
  return REDACT_PARAM_TYPES.has(name.name);
}

function getInputArgNames(params) {
  const names = [];
  for (const p of params) {
    if (p.type !== "Identifier") continue;
    if (REDACT_PARAM_NAMES.has(p.name)) continue;
    if (isRedactedParamType(p)) continue;
    names.push(p.name);
  }
  return names;
}

function isLoggerCall(node, level) {
  if (node?.type !== "CallExpression") return false;
  const callee = node.callee;
  return (
    callee.type === "MemberExpression" &&
    callee.object.type === "Identifier" &&
    callee.object.name === "logger" &&
    callee.property.type === "Identifier" &&
    callee.property.name === level
  );
}

function getStringLiteralArg(callExpr, index) {
  const arg = callExpr.arguments[index];
  if (arg?.type === "Literal" && typeof arg.value === "string")
    return arg.value;
  return null;
}

function getObjectLiteralArg(callExpr, index) {
  const arg = callExpr.arguments[index];
  if (arg?.type === "ObjectExpression") return arg;
  return null;
}

function objectContainsValue(objExpr, identifierName) {
  if (!objExpr) return false;
  for (const prop of objExpr.properties) {
    if (prop.type !== "Property") continue;
    if (
      prop.shorthand &&
      prop.key.type === "Identifier" &&
      prop.key.name === identifierName
    ) {
      return true;
    }
    if (
      prop.value.type === "Identifier" &&
      prop.value.name === identifierName
    ) {
      return true;
    }
  }
  return false;
}

function firstPropertyIsErrKey(objExpr, errorIdentifierName) {
  if (!objExpr || objExpr.properties.length === 0) return false;
  const first = objExpr.properties[0];
  if (first.type !== "Property") return false;
  if (first.key.type !== "Identifier" || first.key.name !== "err") return false;
  if (first.value.type === "Identifier") {
    return errorIdentifierName
      ? first.value.name === errorIdentifierName
      : true;
  }
  if (first.value.type === "MemberExpression") return true;
  return false;
}

function isExpressionStatementWithLoggerCall(stmt, level) {
  if (stmt?.type !== "ExpressionStatement") return false;
  return isLoggerCall(stmt.expression, level);
}

function reportMissingInputArgs(context, objExpr, inputArgNames, ctx) {
  for (const name of inputArgNames) {
    if (!objectContainsValue(objExpr, name)) {
      context.report({
        node: objExpr ?? ctx.fallbackNode,
        messageId: "logMissingInputArg",
        data: { argName: name, where: ctx.where, funcName: ctx.funcName },
      });
    }
  }
}

function checkLogCall({
  context,
  callExpr,
  expectedLevel,
  expectedMessage,
  funcName,
  inputArgNames,
  requireErrFirst,
  errorIdentifierName,
  where,
}) {
  if (!isLoggerCall(callExpr, expectedLevel)) {
    context.report({
      node: callExpr,
      messageId: "logWrongCallShape",
      data: { where, expectedLevel, funcName, expectedMessage },
    });
    return;
  }
  const msg = getStringLiteralArg(callExpr, 1);
  if (msg !== expectedMessage) {
    context.report({
      node: callExpr,
      messageId: "logWrongMessage",
      data: { where, expectedMessage, actual: msg ?? "<not-a-literal>" },
    });
  }
  const obj = getObjectLiteralArg(callExpr, 0);
  if (!obj) {
    context.report({
      node: callExpr,
      messageId: "logFirstArgNotObject",
      data: { where, funcName },
    });
    return;
  }
  if (requireErrFirst && !firstPropertyIsErrKey(obj, errorIdentifierName)) {
    context.report({
      node: obj,
      messageId: "logErrKeyNotFirst",
      data: { where, funcName },
    });
  }
  reportMissingInputArgs(context, obj, inputArgNames, {
    where,
    funcName,
    fallbackNode: callExpr,
  });
}

function isReturnDataErrorNull(ret) {
  const arg = ret.argument;
  if (arg?.type !== "ObjectExpression") return false;
  let hasData = false;
  let hasErrorNull = false;
  for (const prop of arg.properties) {
    if (prop.type !== "Property") continue;
    if (prop.key.type !== "Identifier") continue;
    if (prop.key.name === "data") hasData = true;
    if (
      prop.key.name === "error" &&
      prop.value.type === "Literal" &&
      prop.value.value === null
    ) {
      hasErrorNull = true;
    }
  }
  return hasData && hasErrorNull;
}

function getReturnErrorMessageLiteral(ret) {
  const arg = ret.argument;
  if (arg?.type !== "ObjectExpression") return null;
  for (const prop of arg.properties) {
    if (prop.type !== "Property") continue;
    if (prop.key.type !== "Identifier" || prop.key.name !== "error") continue;
    if (prop.value.type !== "ObjectExpression") return null;
    for (const inner of prop.value.properties) {
      if (inner.type !== "Property") continue;
      if (inner.key.type !== "Identifier" || inner.key.name !== "message")
        continue;
      if (
        inner.value.type === "Literal" &&
        typeof inner.value.value === "string"
      ) {
        return inner.value.value;
      }
      return "<non-literal>";
    }
  }
  return null;
}

function isTerminalCallExpression(node) {
  if (node?.type !== "CallExpression") return false;
  const callee = node.callee;
  return callee.type === "Identifier" && TERMINAL_CALLEES.has(callee.name);
}

function isTerminalStatement(stmt) {
  if (!stmt) return false;
  if (
    stmt.type === "ExpressionStatement" &&
    isTerminalCallExpression(stmt.expression)
  ) {
    return true;
  }
  if (
    stmt.type === "ReturnStatement" &&
    isTerminalCallExpression(stmt.argument)
  ) {
    return true;
  }
  return false;
}

function endsWithTerminal(node) {
  if (!node) return false;
  if (isTerminalStatement(node)) return true;
  if (node.type === "BlockStatement") {
    return statementsEndWithTerminal(node.body);
  }
  if (node.type === "IfStatement") {
    if (!node.alternate) return false;
    return (
      endsWithTerminal(node.consequent) && endsWithTerminal(node.alternate)
    );
  }
  if (node.type === "SwitchStatement") {
    if (node.cases.length === 0) return false;
    return node.cases.every((c, i) => caseEndsWithTerminal(c, node.cases, i));
  }
  return false;
}

function caseEndsWithTerminal(switchCase, allCases, idx) {
  if (switchCase.consequent.length === 0) {
    const next = allCases[idx + 1];
    if (!next) return false;
    return caseEndsWithTerminal(next, allCases, idx + 1);
  }
  return statementsEndWithTerminal(switchCase.consequent);
}

function statementsEndWithTerminal(body) {
  const last = body[body.length - 1];
  return endsWithTerminal(last);
}

function classifyBody(body) {
  const tryStatements = body.filter((s) => s.type === "TryStatement");
  if (tryStatements.length !== 1) return { kind: "invalid" };
  if (body.length === 1 && body[0].type === "TryStatement") {
    return { kind: "A", tryStmt: body[0] };
  }
  if (statementsEndWithTerminal(body)) {
    return { kind: "B", tryStmt: tryStatements[0] };
  }
  return { kind: "invalid" };
}

function checkTryBlock(context, tryBlock, funcName, inputArgNames, options) {
  if (tryBlock.body.length === 0) {
    context.report({
      node: tryBlock,
      messageId: "tryEmpty",
      data: { funcName },
    });
    return;
  }

  const first = tryBlock.body[0];
  if (!isExpressionStatementWithLoggerCall(first, "info")) {
    context.report({
      node: first,
      messageId: "tryMissingStartLog",
      data: { funcName },
    });
  } else {
    checkLogCall({
      context,
      callExpr: first.expression,
      expectedLevel: "info",
      expectedMessage: `Start ${funcName}`,
      funcName,
      inputArgNames,
      requireErrFirst: false,
      errorIdentifierName: null,
      where: "Start",
    });
  }

  let successFound = false;
  for (let i = 0; i < tryBlock.body.length; i++) {
    const stmt = tryBlock.body[i];

    if (stmt.type === "ReturnStatement" && isReturnDataErrorNull(stmt)) {
      successFound = true;
      const prev = findPrecedingLoggerCall(tryBlock.body, i);
      if (
        !prev ||
        !isLoggerCall(prev, "info") ||
        getStringLiteralArg(prev, 1) !== `Success ${funcName}`
      ) {
        context.report({
          node: stmt,
          messageId: "trySuccessLogMissing",
          data: { funcName },
        });
      } else {
        checkLogCall({
          context,
          callExpr: prev,
          expectedLevel: "info",
          expectedMessage: `Success ${funcName}`,
          funcName,
          inputArgNames,
          requireErrFirst: false,
          errorIdentifierName: null,
          where: "Success",
        });
      }
    }

    if (stmt.type === "IfStatement") {
      checkFailedBranch(context, stmt, funcName, inputArgNames);
    }
  }

  if (!successFound && options?.requireSuccessReturn !== false) {
    context.report({
      node: tryBlock,
      messageId: "trySuccessReturnMissing",
      data: { funcName },
    });
  }
}

function findPrecedingLoggerCall(body, returnIndex) {
  for (let j = returnIndex - 1; j >= 0; j--) {
    const s = body[j];
    if (s.type === "IfStatement") continue;
    if (
      s.type === "ExpressionStatement" &&
      s.expression.type === "AwaitExpression"
    ) {
      continue;
    }
    if (s.type === "ExpressionStatement") {
      return s.expression;
    }
    if (s.type === "VariableDeclaration") continue;
    return null;
  }
  return null;
}

function checkFailedBranch(context, ifStmt, funcName, inputArgNames) {
  const consequent = ifStmt.consequent;
  if (consequent.type !== "BlockStatement") return;
  const ret = consequent.body.find((s) => s.type === "ReturnStatement");
  if (!ret) return;
  const errMsg = getReturnErrorMessageLiteral(ret);
  if (errMsg === null) return;

  const idx = consequent.body.indexOf(ret);
  let loggerCall = null;
  for (let j = 0; j < idx; j++) {
    const s = consequent.body[j];
    if (
      s.type === "ExpressionStatement" &&
      isLoggerCall(s.expression, "error")
    ) {
      loggerCall = s.expression;
      break;
    }
  }
  if (!loggerCall) {
    context.report({
      node: ret,
      messageId: "failedLogMissing",
      data: { funcName },
    });
    return;
  }

  const isPatternC = errMsg === "<non-literal>";
  checkLogCall({
    context,
    callExpr: loggerCall,
    expectedLevel: "error",
    expectedMessage: `Failed ${funcName}`,
    funcName,
    inputArgNames,
    requireErrFirst: isPatternC,
    errorIdentifierName: null,
    where: "Failed",
  });
}

function checkCatchClause(context, handler, funcName, inputArgNames) {
  const param = handler.param;
  if (
    !param ||
    param.type !== "Identifier" ||
    param.name !== "error" ||
    !param.typeAnnotation ||
    param.typeAnnotation.typeAnnotation?.type !== "TSUnknownKeyword"
  ) {
    context.report({
      node: param ?? handler,
      messageId: "catchParamWrongType",
      data: { funcName },
    });
  }
  const block = handler.body;
  if (block.body.length === 0) {
    context.report({
      node: block,
      messageId: "catchEmpty",
      data: { funcName },
    });
    return;
  }
  const first = block.body[0];
  if (!isExpressionStatementWithLoggerCall(first, "error")) {
    context.report({
      node: first,
      messageId: "catchMissingErrorLog",
      data: { funcName },
    });
  } else {
    checkLogCall({
      context,
      callExpr: first.expression,
      expectedLevel: "error",
      expectedMessage: `Unexpected error in ${funcName}`,
      funcName,
      inputArgNames,
      requireErrFirst: true,
      errorIdentifierName: "error",
      where: "catch",
    });
  }

  const last = block.body[block.body.length - 1];
  if (last?.type !== "ReturnStatement") {
    context.report({
      node: last ?? block,
      messageId: "catchLastNotReturn",
      data: { funcName },
    });
    return;
  }
  const msg = getReturnErrorMessageLiteral(last);
  if (msg !== CATCH_RETURN_MESSAGE) {
    context.report({
      node: last,
      messageId: "catchWrongReturnMessage",
      data: {
        funcName,
        expected: CATCH_RETURN_MESSAGE,
        actual: msg ?? "<missing>",
      },
    });
  }
}

export const entryTemplateRule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Enforce the canonical try/catch + Start/Failed/Success/Unexpected logger structure for entries.",
    },
    messages: {
      bodyNotTryCatch:
        "entry '{{ funcName }}' の body は次のいずれか:\n" +
        "- 単一の try/catch (Pattern A)\n" +
        "- try/catch + 末尾の navigation 呼び出し `redirect(...)` / `notFound(...)` (Pattern B)",
      tryEmpty: "entry '{{ funcName }}' の try block が空。",
      tryMissingStartLog:
        "entry '{{ funcName }}' の try block は `logger.info(<obj>, \"Start {{ funcName }}\")` で始める。",
      trySuccessLogMissing:
        "entry '{{ funcName }}' の success return の直前に `logger.info(<obj>, \"Success {{ funcName }}\")` が必須。",
      trySuccessReturnMissing:
        "entry '{{ funcName }}' は success return `return { data, error: null }` が必須。",
      failedLogMissing:
        "entry '{{ funcName }}' の Failed 分岐は return 前に `logger.error(<obj>, \"Failed {{ funcName }}\")` を呼ぶ。",
      catchParamWrongType:
        "entry '{{ funcName }}' の catch param は `error: unknown`。",
      catchEmpty: "entry '{{ funcName }}' の catch block が空。",
      catchMissingErrorLog:
        "entry '{{ funcName }}' の catch block は `logger.error(<obj>, \"Unexpected error in {{ funcName }}\")` で始める。",
      catchLastNotReturn:
        "entry '{{ funcName }}' の catch block は return 文で終える。",
      catchWrongReturnMessage:
        "entry '{{ funcName }}' の catch return の error.message はリテラル '{{ expected }}'。実際: '{{ actual }}'。",
      logWrongCallShape:
        "'{{ funcName }}' の {{ where }} log は `logger.{{ expectedLevel }}(<obj>, \"{{ expectedMessage }}\")`。",
      logWrongMessage:
        "{{ where }} log message は '{{ expectedMessage }}'。実際: '{{ actual }}'。",
      logFirstArgNotObject:
        "'{{ funcName }}' の {{ where }} log の第1引数は object literal にする。",
      logErrKeyNotFirst:
        "'{{ funcName }}' の {{ where }} log object は `err:` キーで始める。",
      logMissingInputArg:
        "'{{ funcName }}' の {{ where }} log に入力引数 '{{ argName }}' が無い。全ての関数入力を log object に伝播する。",
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
        const inputArgNames = getInputArgNames(decl.params);

        const body = decl.body.body;
        const classification = classifyBody(body);
        if (classification.kind === "invalid") {
          context.report({
            node: decl.id,
            messageId: "bodyNotTryCatch",
            data: { funcName },
          });
          return;
        }
        const tryStmt = classification.tryStmt;
        checkTryBlock(context, tryStmt.block, funcName, inputArgNames, {
          requireSuccessReturn: classification.kind === "A",
        });
        if (tryStmt.handler) {
          checkCatchClause(context, tryStmt.handler, funcName, inputArgNames);
        }
      },
    };
  },
};
