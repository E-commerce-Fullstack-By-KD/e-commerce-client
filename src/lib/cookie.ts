/**
 * Client-side cookie helpers.
 * These are used to keep the auth token in a cookie so that
 * Next.js middleware (server/Edge) can read it for route protection.
 */

const ONE_DAY_IN_SECONDS = 60 * 60 * 24;

export function setCookie(name: string, value: string, maxAgeSeconds = ONE_DAY_IN_SECONDS) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
}

export function removeCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0`;
}
