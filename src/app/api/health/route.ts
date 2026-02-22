import { NextResponse } from "next/server";
import { listProviderStatus } from "@/providers";
import { ensureProvidersBootstrapped } from "@/providers/bootstrap";
import { getAppVersion } from "@/lib/appVersion";

export const revalidate = 0;

export async function GET() {
  await ensureProvidersBootstrapped();
  const providers = listProviderStatus();
  const registeredProviders = providers.filter((provider) => provider.registered).length;

  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    app: "metamap",
    version: getAppVersion(),
    providers: {
      total: providers.length,
      registered: registeredProviders,
    },
  });
}
