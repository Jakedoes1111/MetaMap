import packageJson from "../../package.json";

const packageVersion =
  typeof packageJson.version === "string" && packageJson.version.trim().length > 0
    ? packageJson.version
    : "0.0.0";

export const getAppVersion = () => {
  const envVersion = process.env.APP_VERSION?.trim();
  return envVersion && envVersion.length > 0 ? envVersion : packageVersion;
};
