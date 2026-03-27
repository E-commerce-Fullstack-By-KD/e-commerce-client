/**
 * Client-side cookie helpers.
 * The auth token is stored in a cookie so Next.js middleware (server/Edge)
 * can read it for route protection — middleware has no access to localStorage.
 */

const ONE_DAY_IN_SECONDS = 60 * 60 * 24;

export function setCookie(name: string, value: string, maxAgeSeconds = ONE_DAY_IN_SECONDS) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
}

export function removeCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0`;
}
