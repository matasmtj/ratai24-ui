import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { REMOTE_API_URL } from './resolveApiBaseUrl';

let apiBaseUrl = REMOTE_API_URL.replace(/\/$/, '');

/** Call once at startup after resolveApiBaseUrl(). */
export function configureApiBaseUrl(url: string) {
  apiBaseUrl = url.replace(/\/$/, '');
  api.defaults.baseURL = apiBaseUrl;
}

export function getApiBaseUrl(): string {
  return apiBaseUrl;
}

/** Login/register/forgot/reset: no Bearer; 401 means bad input, not “refresh token”. */
const AUTH_PUBLIC_PATH = /^\/auth\/(login|register|forgot-password|reset-password)(?:\?|$)/;

function isAuthPublicEndpoint(url: string | undefined): boolean {
  if (!url) return false;
  return AUTH_PUBLIC_PATH.test(url);
}

export const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token (skip public auth routes — avoid sending stale JWT on login)
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    config.baseURL = apiBaseUrl;
    const url = config.url || '';
    if (isAuthPublicEndpoint(url)) {
      if (config.headers) {
        delete config.headers.Authorization;
      }
      return config;
    }
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthPublicEndpoint(originalRequest.url)
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post(`${getApiBaseUrl()}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('role');
        const path = `${window.location.pathname}${window.location.search}`;
        if (!path.startsWith('/login')) {
          window.location.assign(`${window.location.origin}/login`);
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
