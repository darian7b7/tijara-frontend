import axios from "axios";
import { toast } from "react-toastify";
import { API_BASE_URL } from "@/config";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Define route prefixes WITHOUT /api since it's already in baseURL
const ROUTES = {
  auth: "/auth",
  listings: "/listings",
  users: "/users",
  messages: "/messages",
  uploads: "/uploads",
  notifications: "/notifications",
};

// Add request logging
apiClient.interceptors.request.use(
  (config) => {
    console.log('🚀 API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      finalURL: `${config.baseURL}${config.url}`,
      data: config.data,
    });
    
    // Add route prefix based on endpoint (without /api)
    if (config.url?.startsWith("/auth")) {
      config.url = ROUTES.auth + config.url.replace("/auth", "");
    } else if (config.url?.startsWith("/listings")) {
      config.url = ROUTES.listings + config.url.replace("/listings", "");
    } else if (config.url?.startsWith("/users")) {
      config.url = ROUTES.users + config.url.replace("/users", "");
    } else if (config.url?.startsWith("/messages")) {
      config.url = ROUTES.messages + config.url.replace("/messages", "");
    } else if (config.url?.startsWith("/uploads")) {
      config.url = ROUTES.uploads + config.url.replace("/uploads", "");
    } else if (config.url?.startsWith("/notifications")) {
      config.url =
        ROUTES.notifications + config.url.replace("/notifications", "");
    }

    const tokens = JSON.parse(localStorage.getItem("auth_tokens") || "null");
    
    // Debug token presence
    console.log("🔐 Request Authorization:", {
      hasTokens: !!tokens,
      hasAuthHeader: !!config.headers.Authorization,
      url: config.url
    });

    if (tokens?.accessToken) {
      config.headers.Authorization = `Bearer ${tokens.accessToken}`;
    } else {
      // Remove header if no token (important after logout)
      delete config.headers.Authorization;
    }
    
    return config;
  },
  (error) => {
    console.error("❌ Request error:", error);
    return Promise.reject(error);
  },
);

// Add response logging
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      status: error?.response?.status,
      url: error?.config?.url,
      data: error?.response?.data,
      message: error?.message,
    });

    if (!error.response) {
      toast.error("Cannot connect to server. Please check your internet connection.");
      return Promise.reject({
        code: "NETWORK_ERROR",
        message: "Network error occurred. Please check your connection.",
      });
    }

    // Handle specific error cases
    switch (error.response.status) {
      case 401:
        localStorage.removeItem("auth_tokens");
        window.location.href = "/login";
        break;
      case 403:
        toast.error("Access denied. Please check your permissions.");
        break;
      case 429:
        toast.error("Too many requests. Please try again later.");
        break;
      case 500:
        toast.error("Server error. Please try again later.");
        break;
    }

    return Promise.reject({
      code: error.response.data?.code || String(error.response.status),
      message: error.response.data?.message || "An error occurred",
      errors: error.response.data?.errors || [],
      status: error.response.status,
    });
  }
);

export default apiClient;
