import { getRuntimeConfig } from "@/server/config/runtime";
import { logError, logWarn } from "./logger";

type ErrorContext = Record<string, unknown>;

export const captureException = async (error: unknown, context: ErrorContext = {}) => {
  logError("exception.captured", {
    ...context,
    error,
  });

  const webhookUrl = getRuntimeConfig().errorWebhookUrl;
  if (!webhookUrl) {
    return;
  }

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source: "metamap",
        timestamp: new Date().toISOString(),
        context,
        error:
          error instanceof Error
            ? { name: error.name, message: error.message, stack: error.stack }
            : String(error),
      }),
    });
  } catch (webhookError) {
    logWarn("exception.webhook_failed", {
      webhookUrl,
      webhookError,
    });
  }
};
