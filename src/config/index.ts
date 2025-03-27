// ✅ Support both local and production environments properly
const devPort = 5001;

// Check for VITE_API_URL from env (Vercel or local .env)
const envApiUrl = import.meta.env.VITE_API_URL;

// Detect if running locally by hostname
const isLocalhost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

// Final base URL logic
export const API_BASE_URL = envApiUrl
  ? envApiUrl
  : isLocalhost
  ? `${window.location.protocol}//${window.location.hostname}:${devPort}/api`
  : "/api";

// ✅ Default settings for user preferences
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
