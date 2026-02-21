import type { NextConfig } from "next";

const swissephStub = "@/server/providers/ephemeris/swissephStub";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    turbopackUseSystemTlsCerts: true,
  },
  turbopack: {
    root: process.cwd(),
    resolveAlias: {
      swisseph: swissephStub,
    },
  },
  webpack: (config) => {
    config.resolve = config.resolve ?? {};
    config.resolve.alias = config.resolve.alias ?? {};
    if (!config.resolve.alias.swisseph) {
      config.resolve.alias.swisseph = swissephStub;
    }
    return config;
  },
};

export default nextConfig;
