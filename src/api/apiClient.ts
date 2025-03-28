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

// Remove /api from route prefixes since it's already in the URL
const ROUTES = {
  auth: "/auth",          // Remove /api prefix
  listings: "/listings",
  users: "/users",
  messages: "/messages",
  uploads: "/uploads",
  notifications: "/notifications",
};

// Update request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Log the request details before URL modification
    console.log('🚀 Original Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
    });

    // Add /api prefix to all routes if not already present
    if (!config.url?.startsWith('/api')) {
      config.url = `/api${config.url}`;
    }

    // Now handle the specific route prefixes
    if (config.url?.includes("/auth")) {
      config.url = config.url.replace("/auth", ROUTES.auth);
    } else if (config.url?.includes("/listings")) {
      config.url = config.url.replace("/listings", ROUTES.listings);
    } else if (config.url?.includes("/users")) {
      config.url = config.url.replace("/users", ROUTES.users);
    } else if (config.url?.includes("/messages")) {
      config.url = config.url.replace("/messages", ROUTES.messages);
    } else if (config.url?.includes("/uploads")) {
      config.url = config.url.replace("/uploads", ROUTES.uploads);
    } else if (config.url?.includes("/notifications")) {
      config.url = config.url.replace("/notifications", ROUTES.notifications);
    }

    // Log the final URL
    console.log('🔗 Final URL:', `${config.baseURL}${config.url}`);

    // Add token to request
    const tokens = JSON.parse(localStorage.getItem("auth_tokens") || "null");
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
