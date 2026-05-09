// Shared helper for honoring ?redirect=<path> across all auth flows
// (login, signup, admin login, artist signup). Falls back to a sensible
// default per role when no redirect is provided.

const SAFE_PATH_RE = /^\/[A-Za-z0-9\-_/?=&%.:]*$/;

export const getRedirectParam = (search: string = window.location.search): string | null => {
  try {
    const params = new URLSearchParams(search);
    const raw = params.get("redirect");
    if (!raw) return null;
    const decoded = decodeURIComponent(raw);
    // Only allow same-origin paths to prevent open-redirect attacks.
    if (!SAFE_PATH_RE.test(decoded)) return null;
    if (decoded.startsWith("//")) return null;
    return decoded;
  } catch {
    return null;
  }
};

export const buildLoginUrl = (currentPath: string, currentSearch = ""): string => {
  const target = encodeURIComponent(currentPath + currentSearch);
  return `/login?redirect=${target}`;
};

export const resolvePostAuthPath = (fallback: string, search?: string): string => {
  return getRedirectParam(search) ?? fallback;
};
