import { NextResponse } from "next/server";
import { DateTime } from "luxon";
import { getProvider, ProviderUnavailableError, type ProviderKey } from "@/providers";
import { ensureProvidersBootstrapped } from "@/providers/bootstrap";
import type {
  ChineseCalendarProvider,
  FSProvider,
  GKProvider,
  HDProvider,
  QMDJProvider,
  ZWDSProvider,
} from "@/calculators";
import { getRuntimeConfig } from "@/server/config/runtime";
import { captureException } from "@/server/observability/errorTracking";
import { logInfo } from "@/server/observability/logger";
import {
  createRequestId,
  getClientIp,
  isOriginAllowed,
  parseJsonBodyWithLimit,
} from "@/server/security/http";
import { applyRateLimit } from "@/server/security/rateLimit";

type ProviderParams = {
  params: { provider: string } | Promise<{ provider: string }>;
};

const isProviderKey = (key: string): key is ProviderKey => {
  return ["ephemeris", "chineseCalendar", "zwds", "qmdj", "fs", "hd", "gk"].includes(key);
};

export async function POST(request: Request, context: ProviderParams) {
  const runtimeConfig = getRuntimeConfig();
  const requestId = createRequestId(request);
  const clientIp = getClientIp(request);
  const startedAt = Date.now();
  let statusCode = 200;
  const params = await context.params;

  const rateLimitResult = applyRateLimit({
    key: `providers:invoke:${clientIp}`,
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

  logInfo("api.providers.invoke.request", {
    requestId,
    method: request.method,
    provider: params.provider,
    clientIp,
  });

  if (!isProviderKey(params.provider)) {
    return jsonResponse(
      { error: `Unknown provider "${params.provider}"`, requestId },
      { status: 404 },
    );
  }

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
        error: "Rate limit exceeded for provider endpoint.",
        requestId,
      },
      { status: 429 },
    );
    response.headers.set("Retry-After", String(rateLimitResult.retryAfterSeconds));
    return response;
  }

  try {
    await ensureProvidersBootstrapped();

    try {
      // Ensure provider exists before accepting the payload.
      getProvider(params.provider);
    } catch (error) {
      if (error instanceof ProviderUnavailableError) {
        return jsonResponse(
          {
            error: error.message,
            hint: "Register a provider via registerProvider before invoking this endpoint.",
            requestId,
          },
          { status: 503 },
        );
      }
      throw error;
    }

    const payloadResult = await parseJsonBodyWithLimit<Record<string, unknown>>(
      request,
      runtimeConfig.apiMaxBodyBytes,
    );

    if (!payloadResult.ok) {
      return jsonResponse(
        {
          error: payloadResult.error,
          requestId,
        },
        { status: payloadResult.status },
      );
    }

    if (payloadResult.payload != null && typeof payloadResult.payload !== "object") {
      return jsonResponse(
        {
          error: "Payload must be a JSON object.",
          requestId,
        },
        { status: 400 },
      );
    }

    const bodyPayload = payloadResult.payload ?? {};

    if (params.provider === "ephemeris") {
      const payload = bodyPayload as {
        birthIso?: string;
        timezone?: string;
        coordinates?: { latitude?: number; longitude?: number };
        options?: { zodiac?: "tropical" | "sidereal"; ayanamsa?: string; houseSystem?: string };
      };

      if (!payload.birthIso) {
        return jsonResponse(
          { error: "Missing birthIso in request payload.", requestId },
          { status: 400 },
        );
      }

      const birth = DateTime.fromISO(payload.birthIso, {
        zone: payload.timezone ?? "UTC",
      });

      if (!birth.isValid) {
        return jsonResponse(
          { error: "Invalid ISO timestamp provided.", requestId },
          { status: 400 },
        );
      }

      const latitude = payload.coordinates?.latitude ?? 0;
      const longitude = payload.coordinates?.longitude ?? 0;
      const provider = getProvider("ephemeris");
      const ephemeris = await provider.getPositions(
        birth,
        { latitude, longitude },
        {
          zodiac: payload.options?.zodiac ?? "tropical",
          ayanamsa: payload.options?.ayanamsa,
          houseSystem: payload.options?.houseSystem,
        },
      );

      return jsonResponse({
        ephemeris,
      });
    }

    if (params.provider === "chineseCalendar") {
      const payload = bodyPayload as {
        birthIso?: string;
        timezone?: string;
        gender?: "yin" | "yang";
        variant?: string;
      };

      if (!payload.birthIso) {
        return jsonResponse({ error: "Missing birthIso in request payload.", requestId }, { status: 400 });
      }

      const zone = payload.timezone ?? "UTC";
      const birth = DateTime.fromISO(payload.birthIso, { zone });
      if (!birth.isValid) {
        return jsonResponse({ error: "Invalid ISO timestamp provided.", requestId }, { status: 400 });
      }

      const provider = getProvider("chineseCalendar") as ChineseCalendarProvider;
      const [pillars, luckPillars] = await Promise.all([
        provider.baziPillars({
          dateTime: birth,
          zone,
          gender: payload.gender,
          variant: payload.variant,
        }),
        provider.luckPillars({
          dateTime: birth,
          zone,
          gender: payload.gender,
          variant: payload.variant,
        }),
      ]);

      return jsonResponse({
        pillars,
        luckPillars,
      });
    }

    if (params.provider === "zwds") {
      const payload = bodyPayload as {
        birthIso?: string;
        timezone?: string;
        variant?: string;
      };

      if (!payload.birthIso) {
        return jsonResponse({ error: "Missing birthIso in request payload.", requestId }, { status: 400 });
      }

      const zone = payload.timezone ?? "UTC";
      const birth = DateTime.fromISO(payload.birthIso, { zone });
      if (!birth.isValid) {
        return jsonResponse({ error: "Invalid ISO timestamp provided.", requestId }, { status: 400 });
      }

      const provider = getProvider("zwds") as ZWDSProvider;
      const chart = await provider.computeChart({
        dateTime: birth,
        zone,
        variant: payload.variant,
      });

      return jsonResponse({ chart });
    }

    if (params.provider === "qmdj") {
      const payload = bodyPayload as {
        birthIso?: string;
        timezone?: string;
        arrangement?: "yang" | "yin";
        school?: string;
      };

      if (!payload.birthIso) {
        return jsonResponse({ error: "Missing birthIso in request payload.", requestId }, { status: 400 });
      }

      const zone = payload.timezone ?? "UTC";
      const birth = DateTime.fromISO(payload.birthIso, { zone });
      if (!birth.isValid) {
        return jsonResponse({ error: "Invalid ISO timestamp provided.", requestId }, { status: 400 });
      }

      const provider = getProvider("qmdj") as QMDJProvider;
      const board = await provider.generateBoard({
        dateTime: birth,
        zone,
        arrangement: payload.arrangement ?? "yang",
        school: (payload.school as "Zhi Run" | "Chai Bu") ?? "Zhi Run",
      });

      return jsonResponse({ board });
    }

    if (params.provider === "fs") {
      const payload = bodyPayload as {
        sittingDegrees?: number;
        facingDegrees?: number;
        period?: number;
        birthYear?: number;
        gender?: "female" | "male" | "unspecified";
      };

      if (
        typeof payload.sittingDegrees !== "number" ||
        typeof payload.facingDegrees !== "number" ||
        typeof payload.period !== "number" ||
        typeof payload.birthYear !== "number" ||
        (payload.gender && !["female", "male", "unspecified"].includes(payload.gender))
      ) {
        return jsonResponse(
          { error: "Missing or invalid Feng Shui payload.", requestId },
          { status: 400 },
        );
      }

      const provider = getProvider("fs") as FSProvider;
      const [flyingStars, eightMansions] = await Promise.all([
        provider.computeFlyingStars({
          sittingDegrees: payload.sittingDegrees,
          facingDegrees: payload.facingDegrees,
          period: payload.period,
        }),
        provider.computeEightMansions({
          birthYear: payload.birthYear,
          gender: payload.gender ?? "unspecified",
        }),
      ]);

      return jsonResponse({ flyingStars, eightMansions });
    }

    if (params.provider === "hd") {
      const payload = bodyPayload as {
        birthIso?: string;
        timezone?: string;
      };

      if (!payload.birthIso || !payload.timezone) {
        return jsonResponse(
          { error: "Missing birthIso or timezone for Human Design request.", requestId },
          { status: 400 },
        );
      }

      const provider = getProvider("hd") as HDProvider;
      const bodyGraph = await provider.computeBodyGraph({
        birthDateTime: payload.birthIso,
        timezone: payload.timezone,
      });

      return jsonResponse(bodyGraph);
    }

    if (params.provider === "gk") {
      const payload = bodyPayload as {
        birthIso?: string;
        timezone?: string;
      };

      if (!payload.birthIso || !payload.timezone) {
        return jsonResponse(
          { error: "Missing birthIso or timezone for Gene Keys request.", requestId },
          { status: 400 },
        );
      }

      const provider = getProvider("gk") as GKProvider;
      const profile = await provider.computeProfile({
        birthDateTime: payload.birthIso,
        timezone: payload.timezone,
      });

      return jsonResponse(profile);
    }

    return jsonResponse(
      {
        status: "not_implemented",
        provider: params.provider,
        request: bodyPayload,
      },
      { status: 501 },
    );
  } catch (error) {
    await captureException(error, {
      route: `/api/providers/${params.provider}`,
      provider: params.provider,
      requestId,
      clientIp,
    });
    return jsonResponse(
      {
        error: "Provider request failed.",
        requestId,
      },
      { status: 500 },
    );
  } finally {
    logInfo("api.providers.invoke.response", {
      requestId,
      provider: params.provider,
      statusCode,
      durationMs: Date.now() - startedAt,
      clientIp,
    });
  }
}
