import { NextResponse } from "next/server";
import { listProviderStatus } from "@/providers";
import { ensureProvidersBootstrapped } from "@/providers/bootstrap";
import { getRuntimeConfig } from "@/server/config/runtime";
import { captureException } from "@/server/observability/errorTracking";
import { logInfo } from "@/server/observability/logger";
import { applyRateLimit } from "@/server/security/rateLimit";
import { createRequestId, getClientIp, isOriginAllowed } from "@/server/security/http";

export const revalidate = 0;

export async function GET(request: Request) {
  const runtimeConfig = getRuntimeConfig();
  const requestId = createRequestId(request);
  const clientIp = getClientIp(request);
  const startedAt = Date.now();
  let statusCode = 200;

  const rateLimitResult = applyRateLimit({
    key: `providers:index:${clientIp}`,
    maxRequests: runtimeConfig.providerRateLimitMaxRequests,
    windowMs: runtimeConfig.providerRateLimitWindowMs,
  });

  const jsonResponse = (body: unknown, init?: ResponseInit) => {
    const response = NextResponse.json(body, init);
    statusCode = init?.status ?? response.status;
    response.headers.set("x-request-id", requestId);
    response.headers.set("X-RateLimit-Limit", String(rateLimitResult.limit));
    response.headers.set("X-RateLimit-Remaining", String(rateLimitResult.remaining));
    response.headers.set(
      "X-RateLimit-Reset",
      String(Math.floor(rateLimitResult.resetAt / 1000)),
    );
    return response;
  };

  logInfo("api.providers.request", {
    requestId,
    method: request.method,
    clientIp,
  });

  if (!isOriginAllowed(request, runtimeConfig.allowedOrigins)) {
    return jsonResponse(
      {
        error: "Origin is not allowed.",
        requestId,
      },
      { status: 403 },
    );
  }

  if (!rateLimitResult.allowed) {
    const response = jsonResponse(
      {
        error: "Rate limit exceeded for provider metadata endpoint.",
        requestId,
      },
      { status: 429 },
    );
    response.headers.set("Retry-After", String(rateLimitResult.retryAfterSeconds));
    return response;
  }

  try {
    await ensureProvidersBootstrapped();
    const providers = listProviderStatus();
    return jsonResponse({ providers });
  } catch (error) {
    await captureException(error, {
      route: "/api/providers",
      requestId,
      clientIp,
    });
    return jsonResponse(
      {
        error: "Failed to load provider metadata.",
        requestId,
      },
      { status: 500 },
    );
  } finally {
    logInfo("api.providers.response", {
      requestId,
      statusCode,
      durationMs: Date.now() - startedAt,
      clientIp,
    });
  }
}
