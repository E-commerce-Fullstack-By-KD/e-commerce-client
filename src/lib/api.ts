import axios, {
  AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";
import { config } from "@/config";
import { STORAGE_KEYS } from "@/lib/constants";
import { removeCookie } from "@/lib/cookie";

// ──── Axios Instance ────
const api = axios.create({
  baseURL: config.apiUrl,
  timeout: 15000,
  withCredentials: true,
});

// ──── Request Interceptor ────
api.interceptors.request.use(
  (reqConfig: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      if (token) {
        reqConfig.headers.Authorization = `Bearer ${token}`;
      }
    }
    return reqConfig;
  },
  (error: AxiosError) => Promise.reject(error),
);

// ──── Response Interceptor ────
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        removeCookie(STORAGE_KEYS.TOKEN);
        removeCookie("user_role");
        window.location.replace("/login");
      }
    }
    return Promise.reject(error);
  },
);

// ──── Generic Request Helpers ────
export async function get<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await api.get<T>(url, config);
  return response.data;
}

export async function post<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const isFormData = data instanceof FormData;

  const response = await api.post<T>(url, data, {
    ...config,
    headers: {
      ...(config?.headers || {}),
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
    },
  });

  return response.data;
}

export async function put<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await api.put<T>(url, data, config);
  return response.data;
}

export async function patch<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await api.patch<T>(url, data, config);
  return response.data;
}

export async function del<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await api.delete<T>(url, config);
  return response.data;
}

export default api;
