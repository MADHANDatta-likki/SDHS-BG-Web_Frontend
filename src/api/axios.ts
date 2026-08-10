import axios from "axios";

import { API_TIMEOUT } from "../constants/AppConstants";
import {
  AUTH_STORAGE_KEYS,
  AUTH_UNAUTHORIZED_EVENT,
} from "../constants/AuthConstants";
import { ROUTES } from "../constants/RouteConstants";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

if (!apiBaseUrl) {

  throw new Error(

    "VITE_API_BASE_URL is not configured. Please check your .env.development or deployment environment."

  );

}

const axiosInstance = axios.create({
  baseURL: apiBaseUrl,
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

let accessToken: string | null = null;

function normalizeToken(token: string | null): string | null {
  if (token === null) {
    return null;
  }

  const normalizedToken = token.trim();
  return normalizedToken.length > 0 ? normalizedToken : null;
}

export function setApiAccessToken(token: string | null): void {
  accessToken = normalizeToken(token);
}

setApiAccessToken(localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN));

axiosInstance.interceptors.request.use((config) => {
  const persistedToken = localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);
  const token = accessToken ?? normalizeToken(persistedToken);

  if (token !== null) {
    accessToken = token;
    config.headers.set("Authorization", `Bearer ${token}`);
  } else {
    config.headers.delete("Authorization");
  }

  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      setApiAccessToken(null);
      localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
      localStorage.removeItem(AUTH_STORAGE_KEYS.CURRENT_USER);
      window.dispatchEvent(new Event(AUTH_UNAUTHORIZED_EVENT));

      if (window.location.pathname !== ROUTES.LOGIN) {
        window.location.replace(ROUTES.LOGIN);
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
