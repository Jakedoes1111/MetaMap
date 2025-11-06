import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals ?? [];
      const externals = Array.isArray(config.externals)
        ? config.externals
        : [config.externals];
      if (!externals.includes("swisseph")) {
        externals.push("swisseph");
      }
      config.externals = externals;
    }
    return config;
  },
};

export default nextConfig;
