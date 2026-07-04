import axios, { AxiosError } from 'axios';
import { TOKEN_KEY, setToken, clearToken } from './auth';

// With Next.js rewrites in next.config.ts, all /api/* calls proxy to the Railway backend.
// This means cookies are always same-domain (Vercel), solving SameSite cross-domain issues.
const api = axios.create({
    baseURL: '/api',
    withCredentials: true, // sendhttpOnly cookies on every request
});

// ─── Request interceptor: attach Bearer token ────────────────────────────────
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('ec_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// ─── Response interceptor: handle 401 → refresh ──────────────────────────────
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const original = error.config as any;
        if (error.response?.status === 401 && !original._retry) {
            original._retry = true;
            try {
                const { data } = await axios.post('/api/auth/refresh', {}, { withCredentials: true });
                setToken(data.accessToken);
                original.headers.Authorization = `Bearer ${data.accessToken}`;
                return api(original);
            } catch {
                clearToken();
                if (typeof window !== 'undefined') window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
