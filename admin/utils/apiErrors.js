export const AUTH_SESSION_EXPIRED_EVENT = "sentinelr-admin:auth-session-expired";

export class ApiError extends Error {
  constructor(message, { status = 0, code = "", details = null } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function dispatchAuthorizationEvent(name, detail) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

export function notifySessionExpired(detail = {}) {
  dispatchAuthorizationEvent(AUTH_SESSION_EXPIRED_EVENT, detail);
}

export function createApiError(response, data, fallbackMessage = "Request failed") {
  const status = response?.status || 0;
  const message =
    (data && typeof data === "object" && data.message) ||
    (typeof data === "string" && data.length < 200 ? data : "") ||
    fallbackMessage;

  return new ApiError(message, {
    status,
    code: data && typeof data === "object" ? data.code || "" : "",
    details: data && typeof data === "object" ? data.details || null : null,
  });
}

export function handleAuthorizationResponse(response, detail = {}) {
  if (response?.status === 401) {
    notifySessionExpired({ status: 401, ...detail });
  }
}
