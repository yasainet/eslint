import type { Instrumentation } from "next";

import { logger } from "@/utils/logger";

export const onRequestError: Instrumentation.onRequestError = (
  err,
  request,
  context,
) => {
  logger.error(
    {
      err,
      path: request.path,
      method: request.method,
      routePath: context.routePath,
      routeType: context.routeType,
    },
    "Unexpected error",
  );
};
