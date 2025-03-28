// 📁 src/config/index.ts

const isBrowser = typeof window !== "undefined";
const isLocalhost =
  isBrowser &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

// Get base URL without /api suffix
const BASE_URL = isLocalhost
  ? "http://localhost:5001"
  : import.meta.env.VITE_API_URL || "https://tijara-backend-production.up.railway.app";

// Log the environment variables and computed values for debugging
console.log('Environment:', {
  VITE_API_URL: import.meta.env.VITE_API_URL,
  isLocalhost,
  baseUrl: BASE_URL,
  apiUrl: `${BASE_URL}/api`
});

// Export the API URL with /api suffix
export const API_BASE_URL = `${BASE_URL}/api`;

export const DEFAULT_SETTINGS = {
  theme: "system",
  language: "en",
  notifications: {
    email: true,
    push: true,
    messages: true,
    marketing: false,
    newListings: true,
    priceDrops: true,
    favorites: true,
  },
  emailNotifications: true,
  pushNotifications: true,
  timezone: "UTC",
  currency: "USD",
  dateFormat: "MM/DD/YYYY",
  timeFormat: "12h" as const,
};
