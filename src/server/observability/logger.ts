type LogLevel = "info" | "warn" | "error";

export type LogFields = Record<string, unknown>;

const formatError = (value: unknown) => {
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack,
    };
  }
  return value;
};

const sanitiseFields = (fields: LogFields) => {
  const entries = Object.entries(fields).map(([key, value]) => [key, formatError(value)]);
  return Object.fromEntries(entries);
};

const emit = (level: LogLevel, event: string, fields: LogFields = {}) => {
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    event,
    service: "metamap",
    ...sanitiseFields(fields),
  };
  const line = JSON.stringify(payload);
  if (level === "error") {
    console.error(line);
    return;
  }
  if (level === "warn") {
    console.warn(line);
    return;
  }
  console.info(line);
};

export const logInfo = (event: string, fields?: LogFields) => {
  emit("info", event, fields);
};

export const logWarn = (event: string, fields?: LogFields) => {
  emit("warn", event, fields);
};

export const logError = (event: string, fields?: LogFields) => {
  emit("error", event, fields);
};
