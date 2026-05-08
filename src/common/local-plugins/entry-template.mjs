/**
 * Enforce the canonical entry template for `**\/entries/*.ts` exports:
 *
 * - body must be a single try/catch
 * - try first statement: `logger.info(<obj>, "Start <funcName>")`
 * - try success return preceded by: `logger.info(<obj>, "Success <funcName>")`
 * - try failed branch (when present): `logger.error(<obj>, "Failed <funcName>")`
 *   followed by a return with the proper error shape
 * - catch param: `error: unknown`
 * - catch first statement: `logger.error(<obj>, "Unexpected error in <funcName>")`
 * - catch return error.message must be the literal "An unexpected error occurred"
 * - every log object must include the `err` key first (when applicable) and
 *   propagate all function input parameters as values
 *
 * Why one rule with many messageIds: each invariant is a small rule
 * conceptually, but they share the same structural traversal and access to
 * funcName / inputArgs. Splitting would duplicate the AST walk.
 */

const CATCH_RETURN_MESSAGE = "An unexpected error occurred";

function getInputArgNames(params) {
  const names = [];
  for (const p of params) {
    if (p.type === "Identifier") {
      names.push(p.name);
    }
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
  if (arg?.type === "Literal" && typeof arg.value === "string") return arg.value;
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
    if (prop.value.type === "Identifier" && prop.value.name === identifierName) {
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
  // value must be the catch error identifier (or any Identifier — we accept both
  // `err: error` and `err: result.error` since Failed Pattern C uses MemberExpression)
  if (first.value.type === "Identifier") {
    return errorIdentifierName ? first.value.name === errorIdentifierName : true;
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
  // `return { data: ..., error: null }` (data shorthand or explicit)
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
      if (inner.key.type !== "Identifier" || inner.key.name !== "message") continue;
      if (inner.value.type === "Literal" && typeof inner.value.value === "string") {
        return inner.value.value;
      }
      return "<non-literal>";
    }
  }
  return null;
}

function checkTryBlock(context, tryBlock, funcName, inputArgNames) {
  if (tryBlock.body.length === 0) {
    context.report({ node: tryBlock, messageId: "tryEmpty", data: { funcName } });
    return;
  }

  // Start log: first statement
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

  // Walk body to find Success returns and Failed branches
  let successFound = false;
  for (let i = 0; i < tryBlock.body.length; i++) {
    const stmt = tryBlock.body[i];

    // Success log + return
    if (stmt.type === "ReturnStatement" && isReturnDataErrorNull(stmt)) {
      successFound = true;
      // The previous non-ExpressionStatement non-IfStatement statement should be
      // the Success log. Walk back to find it.
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

    // Failed branches inside if statements
    if (stmt.type === "IfStatement") {
      checkFailedBranch(context, stmt, funcName, inputArgNames);
    }
  }

  if (!successFound) {
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
      // `await revalidatePath(...)` etc — keep walking
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
  // We only validate IFs that look like Failed branches: contain a return whose
  // error.message is a string literal (not the catch's "An unexpected ..." literal).
  const consequent = ifStmt.consequent;
  if (consequent.type !== "BlockStatement") return;
  const ret = consequent.body.find((s) => s.type === "ReturnStatement");
  if (!ret) return;
  const errMsg = getReturnErrorMessageLiteral(ret);
  if (errMsg === null) return; // not a Failed-shaped return; skip

  // Must have logger.error("Failed <funcName>") preceding the return
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

  const isPatternC = errMsg === "<non-literal>"; // .message access
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
    context.report({ node: block, messageId: "catchEmpty", data: { funcName } });
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

  // Last statement must be a return whose error.message is the catch literal
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
      data: { funcName, expected: CATCH_RETURN_MESSAGE, actual: msg ?? "<missing>" },
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
        "entry '{{ funcName }}' must have a single try/catch as its body.",
      tryEmpty: "entry '{{ funcName }}' try block is empty.",
      tryMissingStartLog:
        "entry '{{ funcName }}' try block must start with `logger.info(<obj>, \"Start {{ funcName }}\")`.",
      trySuccessLogMissing:
        "entry '{{ funcName }}' success return must be preceded by `logger.info(<obj>, \"Success {{ funcName }}\")`.",
      trySuccessReturnMissing:
        "entry '{{ funcName }}' must contain a success return `return { data, error: null }`.",
      failedLogMissing:
        "entry '{{ funcName }}' Failed branch must call `logger.error(<obj>, \"Failed {{ funcName }}\")` before return.",
      catchParamWrongType:
        "entry '{{ funcName }}' catch param must be `error: unknown`.",
      catchEmpty: "entry '{{ funcName }}' catch block is empty.",
      catchMissingErrorLog:
        "entry '{{ funcName }}' catch block must start with `logger.error(<obj>, \"Unexpected error in {{ funcName }}\")`.",
      catchLastNotReturn:
        "entry '{{ funcName }}' catch block must end with a return statement.",
      catchWrongReturnMessage:
        "entry '{{ funcName }}' catch return error.message must be the literal '{{ expected }}'. Got: '{{ actual }}'.",
      logWrongCallShape:
        "{{ where }} log in '{{ funcName }}' must be `logger.{{ expectedLevel }}(<obj>, \"{{ expectedMessage }}\")`.",
      logWrongMessage:
        "{{ where }} log message must be '{{ expectedMessage }}'. Got: '{{ actual }}'.",
      logFirstArgNotObject:
        "{{ where }} log in '{{ funcName }}' first argument must be an object literal.",
      logErrKeyNotFirst:
        "{{ where }} log in '{{ funcName }}' object must start with `err:` key.",
      logMissingInputArg:
        "{{ where }} log in '{{ funcName }}' is missing input arg '{{ argName }}'. All function inputs must propagate to log objects.",
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
        if (body.length !== 1 || body[0].type !== "TryStatement") {
          context.report({
            node: decl.id,
            messageId: "bodyNotTryCatch",
            data: { funcName },
          });
          return;
        }
        const tryStmt = body[0];
        checkTryBlock(context, tryStmt.block, funcName, inputArgNames);
        if (tryStmt.handler) {
          checkCatchClause(context, tryStmt.handler, funcName, inputArgNames);
        }
      },
    };
  },
};
