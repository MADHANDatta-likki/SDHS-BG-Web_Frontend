import type { CSSProperties } from "react";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const dashboardImageUrl = apiBaseUrl
  ? new URL("/images/bg_admin.png", apiBaseUrl).toString()
  : "/images/bg_admin.png";

export const dashboardBackgroundStyle = {
  "--dashboard-background-image": `url("${dashboardImageUrl}")`,
} as CSSProperties;
