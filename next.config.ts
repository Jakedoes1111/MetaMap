import { resolve } from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve = config.resolve ?? {};
    config.resolve.alias = config.resolve.alias ?? {};
    if (!config.resolve.alias.swisseph) {
      config.resolve.alias.swisseph = resolve(
        __dirname,
        "src/server/providers/ephemeris/swissephStub",
      );
    }
    return config;
  },
};

export default nextConfig;
