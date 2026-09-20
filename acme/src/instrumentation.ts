import { type Instrumentation } from "next";
import pino from "pino";

const IS_PRODUCTION = process.env.NODE_ENV === "production";

const logger = pino(
  IS_PRODUCTION ? {} : { transport: { target: "pino-pretty" } },
);

export const onRequestError: Instrumentation.onRequestError = async (
  err,
  request,
  context,
) => {
  const digest =
    typeof err === "object" && err !== null && "digest" in err
      ? String(err.digest)
      : undefined;

  logger.error({
    err,
    digest,
    request: { path: request.path, method: request.method },
    context,
  });
};
