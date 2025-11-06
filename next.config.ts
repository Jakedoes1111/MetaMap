import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  webpack: (config, { isServer }) => {
    if (isServer) {
      const existing = config.externals ?? [];
      const externals = Array.isArray(existing) ? [...existing] : [existing];

      if (!externals.includes("swisseph")) {
        externals.push("swisseph");
      }

      config.externals = externals;
    }

    return config;
  },
};

export default nextConfig;
