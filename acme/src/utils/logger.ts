import pino from "pino";

const IS_BROWSER = typeof window !== "undefined";
const IS_PRODUCTION = process.env.NODE_ENV === "production";

const SENSITIVE_KEYS = [
  "access_token",
  "refresh_token",
  "weak_password",
  "token",
  "token_hash",
  "captchaToken",
  "mail",
];
const REDACT_MAX_DEPTH = 5;
const REDACT_PATHS = Array.from({ length: REDACT_MAX_DEPTH }, (_, depth) =>
  SENSITIVE_KEYS.map((key) => `${"*.".repeat(depth)}${key}`),
).flat();

function createLogger() {
  if (IS_BROWSER) {
    return pino({ browser: { asObject: false }, level: "debug" });
  }

  if (IS_PRODUCTION) {
    return pino({
      level: "info",
      base: undefined,
      redact: { paths: REDACT_PATHS, censor: "[Redacted]" },
    });
  }

  return pino({
    level: "debug",
    base: undefined,
    redact: { paths: REDACT_PATHS, censor: "[Redacted]" },
    transport: {
      target: "pino-pretty",
      options: { colorize: !process.env.NO_COLOR },
    },
  });
}

export const logger = createLogger();
