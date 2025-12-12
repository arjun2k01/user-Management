// src/lib/authEvents.js

export const AUTH_UNAUTHORIZED_EVENT = "auth:unauthorized";

/**
 * Call this when the backend returns 401/403
 * This triggers a global session-expired flow.
 */
export const notifyUnauthorized = (reason = "") => {
  try {
    window.dispatchEvent(
      new CustomEvent(AUTH_UNAUTHORIZED_EVENT, { detail: { reason } })
    );
  } catch {
    // fallback (older browsers)
    window.dispatchEvent(new Event(AUTH_UNAUTHORIZED_EVENT));
  }
};
