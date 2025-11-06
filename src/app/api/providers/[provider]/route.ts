import { NextResponse } from "next/server";
import { DateTime } from "luxon";
import { getProvider, ProviderUnavailableError, type ProviderKey } from "@/providers";
import { ensureProvidersBootstrapped } from "@/providers/bootstrap";
import type { ChineseCalendarProvider, QMDJProvider, ZWDSProvider } from "@/calculators";

type ProviderParams = {
  params: { provider: string };
};

const isProviderKey = (key: string): key is ProviderKey => {
  return ["ephemeris", "chineseCalendar", "zwds", "qmdj", "fs", "hd", "gk"].includes(key);
};

export async function POST(request: Request, { params }: ProviderParams) {
  if (!isProviderKey(params.provider)) {
    return NextResponse.json(
      { error: `Unknown provider "${params.provider}"` },
      { status: 404 },
    );
  }

  ensureProvidersBootstrapped();

  try {
    // Ensure provider exists before accepting the payload.
    getProvider(params.provider);
  } catch (error) {
    if (error instanceof ProviderUnavailableError) {
      return NextResponse.json(
        {
          error: error.message,
          hint: error instanceof ProviderUnavailableError ? "Register a provider via registerProvider before invoking this endpoint." : undefined,
        },
        { status: 503 },
      );
    }
    throw error;
  }

  if (params.provider === "ephemeris") {
    const payload = await request.json().catch(() => null) as {
      birthIso?: string;
      timezone?: string;
      coordinates?: { latitude?: number; longitude?: number };
      options?: { zodiac?: "tropical" | "sidereal"; ayanamsa?: string; houseSystem?: string };
    } | null;

    if (!payload?.birthIso) {
      return NextResponse.json(
        { error: "Missing birthIso in request payload." },
        { status: 400 },
      );
    }

    const birth = DateTime.fromISO(payload.birthIso, {
      zone: payload.timezone ?? "UTC",
    });

    if (!birth.isValid) {
      return NextResponse.json(
        { error: "Invalid ISO timestamp provided." },
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

    return NextResponse.json({
      ephemeris,
    });
  }

  if (params.provider === "chineseCalendar") {
    const payload = await request.json().catch(() => null) as {
      birthIso?: string;
      timezone?: string;
      gender?: "yin" | "yang";
      variant?: string;
    } | null;

    if (!payload?.birthIso) {
      return NextResponse.json({ error: "Missing birthIso in request payload." }, { status: 400 });
    }

    const zone = payload.timezone ?? "UTC";
    const birth = DateTime.fromISO(payload.birthIso, { zone });
    if (!birth.isValid) {
      return NextResponse.json({ error: "Invalid ISO timestamp provided." }, { status: 400 });
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
        variant: payload.variant,
      }),
    ]);

    return NextResponse.json({
      pillars,
      luckPillars,
    });
  }

  if (params.provider === "zwds") {
    const payload = await request.json().catch(() => null) as {
      birthIso?: string;
      timezone?: string;
      variant?: string;
    } | null;

    if (!payload?.birthIso) {
      return NextResponse.json({ error: "Missing birthIso in request payload." }, { status: 400 });
    }

    const zone = payload.timezone ?? "UTC";
    const birth = DateTime.fromISO(payload.birthIso, { zone });
    if (!birth.isValid) {
      return NextResponse.json({ error: "Invalid ISO timestamp provided." }, { status: 400 });
    }

    const provider = getProvider("zwds") as ZWDSProvider;
    const chart = await provider.computeChart({
      dateTime: birth,
      zone,
      variant: payload.variant,
    });

    return NextResponse.json({ chart });
  }

  if (params.provider === "qmdj") {
    const payload = await request.json().catch(() => null) as {
      birthIso?: string;
      timezone?: string;
      arrangement?: "yang" | "yin";
      school?: string;
    } | null;

    if (!payload?.birthIso) {
      return NextResponse.json({ error: "Missing birthIso in request payload." }, { status: 400 });
    }

    const zone = payload.timezone ?? "UTC";
    const birth = DateTime.fromISO(payload.birthIso, { zone });
    if (!birth.isValid) {
      return NextResponse.json({ error: "Invalid ISO timestamp provided." }, { status: 400 });
    }

    const provider = getProvider("qmdj") as QMDJProvider;
    const board = await provider.generateBoard({
      dateTime: birth,
      zone,
      arrangement: payload.arrangement ?? "yang",
      school: (payload.school as "Zhi Run" | "Chai Bu") ?? "Zhi Run",
    });

    return NextResponse.json({ board });
  }

  return NextResponse.json(
    {
      status: "not_implemented",
      provider: params.provider,
      request: await request.json().catch(() => null),
    },
    { status: 501 },
  );
}
