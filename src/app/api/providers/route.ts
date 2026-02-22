import { NextResponse } from "next/server";
import { listProviderStatus } from "@/providers";
import { ensureProvidersBootstrapped } from "@/providers/bootstrap";

export const revalidate = 0;

export async function GET() {
  await ensureProvidersBootstrapped();
  const providers = listProviderStatus();
  return NextResponse.json({ providers });
}
