// src/config/index.ts

const isBrowser = typeof window !== "undefined";

const isDevelopment = isBrowser
  ? window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  : process.env.NODE_ENV !== "production";

// Ensure consistent API URL formatting
const formatApiUrl = (url: string) => {
  // Remove trailing slash if present
  const baseUrl = url.endsWith('/') ? url.slice(0, -1) : url;
  // Add /api prefix if not present
  return baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
};

export const API_BASE_URL = formatApiUrl(
  isDevelopment
    ? "http://localhost:5001"
    : import.meta.env.VITE_API_URL || "https://tijara-backend-production.up.railway.app"
);
