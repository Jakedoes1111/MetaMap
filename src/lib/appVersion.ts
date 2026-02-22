import packageJson from "../../package.json";
import { getRuntimeConfig } from "@/server/config/runtime";

const packageVersion =
  typeof packageJson.version === "string" && packageJson.version.trim().length > 0
    ? packageJson.version
    : "0.0.0";

export const getAppVersion = () => {
  const envVersion = getRuntimeConfig().appVersion;
  return envVersion && envVersion.length > 0 ? envVersion : packageVersion;
};
