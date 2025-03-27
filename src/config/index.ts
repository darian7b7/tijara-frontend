// 📁 src/config/index.ts

const isBrowser = typeof window !== "undefined";
const isLocalhost =
  isBrowser &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

export const API_BASE_URL = isLocalhost
  ? "http://localhost:5001/api"
  : import.meta.env.VITE_API_URL || "https://tijara-backend-production.up.railway.app/api";

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
