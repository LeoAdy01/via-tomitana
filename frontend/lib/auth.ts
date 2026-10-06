export type AuthUser = { email: string; name?: string; role?: string };
export function saveAuth(token: string, user: AuthUser) { localStorage.setItem("vt_token", token); localStorage.setItem("vt_user", JSON.stringify(user)); window.dispatchEvent(new Event("vt_auth")); }
export function clearAuth() { localStorage.removeItem("vt_token"); localStorage.removeItem("vt_user"); window.dispatchEvent(new Event("vt_auth")); }
export function getToken(): string | null { return typeof window === "undefined" ? null : localStorage.getItem("vt_token"); }
export function getUser(): AuthUser | null { if (typeof window === "undefined") return null; const raw = localStorage.getItem("vt_user"); if (!raw) return null; try { return JSON.parse(raw); } catch { return null; } }
