import { NextResponse } from "next/server";
import { listProviderStatus } from "@/providers";
import { ensureProvidersBootstrapped } from "@/providers/bootstrap";

export const revalidate = 0;

export async function GET() {
  ensureProvidersBootstrapped();
  const providers = listProviderStatus();
  const registeredProviders = providers.filter((provider) => provider.registered).length;

  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    app: "metamap",
    version: process.env.npm_package_version ?? "0.1.0",
    providers: {
      total: providers.length,
      registered: registeredProviders,
    },
  });
}
