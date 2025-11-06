export const createId = (): string => {
  if (typeof globalThis !== "undefined" && globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }
  return `mm-${Date.now().toString(16)}-${Math.random().toString(16).slice(2, 10)}`;
};
