import { jwtDecode } from 'jwt-decode';

export interface User {
    id: string;
    email: string;
    name: string | null;
    role: 'ADMIN' | 'STUDENT';
    exp?: number;
}

export const TOKEN_KEY = 'ec_token';

export function getStoredUser(): User | null {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;
    try {
        const decoded = jwtDecode<User>(token);
        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
            localStorage.removeItem(TOKEN_KEY);
            return null;
        }
        return decoded;
    } catch {
        localStorage.removeItem(TOKEN_KEY);
        return null;
    }
}

export function setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
}

export function logout(): void {
    // Clear local token and redirect immediately — don't wait for server
    clearToken();
    window.location.href = '/login';
    // Fire server-side token revocation in background (best-effort — the user is already logged out locally)
    try {
        fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {});
    } catch {}
}

// ─── Cached user profile (persisted separately from JWT) ──────────────────────
// The JWT carries the base user but won't reflect name changes until re-login.
// We cache the latest profile from PATCH /users/me here.
const USER_CACHE_KEY = 'ec_user_profile';

export function setStoredUser(user: User): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
}

// Override getStoredUser to merge JWT claims with cached profile
export function getCachedUser(): User | null {
    if (typeof window === 'undefined') return null;
    const cached = localStorage.getItem(USER_CACHE_KEY);
    if (cached) {
        try { return JSON.parse(cached) as User; } catch { /* ignore */ }
    }
    return getStoredUser();
}
