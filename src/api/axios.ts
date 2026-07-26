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

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);

  if (token !== null) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
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
