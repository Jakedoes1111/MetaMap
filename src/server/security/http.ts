export const createRequestId = (request: Request) => {
  const headerValue = request.headers.get("x-request-id")?.trim();
  return headerValue && headerValue.length > 0 ? headerValue : crypto.randomUUID();
};

export const getClientIp = (request: Request) => {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0]?.trim();
    if (firstIp) {
      return firstIp;
    }
  }

  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) {
    return realIp;
  }

  return "unknown";
};

export const isOriginAllowed = (request: Request, allowedOrigins: string[]) => {
  const originHeader = request.headers.get("origin");
  if (!originHeader) {
    return true;
  }

  let origin: URL;
  try {
    origin = new URL(originHeader);
  } catch {
    return false;
  }

  if (allowedOrigins.length > 0) {
    return allowedOrigins.includes(origin.origin);
  }

  const forwardedHost = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!forwardedHost) {
    return false;
  }

  const forwardedProto = request.headers.get("x-forwarded-proto");
  if (forwardedProto) {
    return origin.host === forwardedHost && origin.protocol.replace(":", "") === forwardedProto;
  }

  return origin.host === forwardedHost;
};

export const parseJsonBodyWithLimit = async <T>(
  request: Request,
  maxBodyBytes: number,
): Promise<
  | {
      ok: true;
      payload: T | null;
    }
  | {
      ok: false;
      status: number;
      error: string;
    }
> => {
  const contentType = request.headers.get("content-type");
  if (contentType && !contentType.toLowerCase().includes("application/json")) {
    return {
      ok: false,
      status: 415,
      error: "Content-Type must be application/json.",
    };
  }

  const contentLength = request.headers.get("content-length");
  if (contentLength) {
    const parsedLength = Number.parseInt(contentLength, 10);
    if (Number.isFinite(parsedLength) && parsedLength > maxBodyBytes) {
      return {
        ok: false,
        status: 413,
        error: `Payload exceeds ${maxBodyBytes} bytes.`,
      };
    }
  }

  const raw = await request.text();
  const bodyBytes = Buffer.byteLength(raw, "utf8");
  if (bodyBytes > maxBodyBytes) {
    return {
      ok: false,
      status: 413,
      error: `Payload exceeds ${maxBodyBytes} bytes.`,
    };
  }

  if (raw.trim().length === 0) {
    return {
      ok: true,
      payload: null,
    };
  }

  try {
    return {
      ok: true,
      payload: JSON.parse(raw) as T,
    };
  } catch {
    return {
      ok: false,
      status: 400,
      error: "Invalid JSON payload.",
    };
  }
};
