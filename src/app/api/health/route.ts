import { NextResponse } from "next/server";
import { listProviderStatus } from "@/providers";
import { ensureProvidersBootstrapped } from "@/providers/bootstrap";
import { getAppVersion } from "@/lib/appVersion";
import { captureException } from "@/server/observability/errorTracking";
import { logInfo } from "@/server/observability/logger";
import { createRequestId } from "@/server/security/http";

export const revalidate = 0;

export async function GET(request?: Request) {
  const effectiveRequest =
    request ?? new Request("http://localhost/api/health", { method: "GET" });
  const requestId = createRequestId(effectiveRequest);
  const startTime = Date.now();
  let statusCode = 200;

  const jsonResponse = (body: unknown, init?: ResponseInit) => {
    const response = NextResponse.json(body, init);
    response.headers.set("x-request-id", requestId);
    statusCode = init?.status ?? response.status;
    return response;
  };

  logInfo("api.health.request", {
    requestId,
    method: effectiveRequest.method,
  });

  try {
    await ensureProvidersBootstrapped();
    const providers = listProviderStatus();
    const registeredProviders = providers.filter((provider) => provider.registered).length;

    return jsonResponse({
      status: "ok",
      timestamp: new Date().toISOString(),
      app: "metamap",
      version: getAppVersion(),
      providers: {
        total: providers.length,
        registered: registeredProviders,
      },
    });
  } catch (error) {
    await captureException(error, {
      route: "/api/health",
      requestId,
    });
    return jsonResponse(
      {
        error: "Health probe failed.",
        requestId,
      },
      { status: 500 },
    );
  } finally {
    logInfo("api.health.response", {
      requestId,
      statusCode,
      durationMs: Date.now() - startTime,
    });
  }
}
