// Get the current hostname to determine if we're in development or production
const isDevelopment =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";
const devPort = 5000;

// Determine the API base URL based on the environment
export const API_BASE_URL = isDevelopment
  ? `${window.location.protocol}//${window.location.hostname}:${devPort}/api`
  : "/api";

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
