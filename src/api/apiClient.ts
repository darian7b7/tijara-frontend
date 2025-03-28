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

// Define routes WITHOUT /api prefix since it's in the baseURL
const ROUTES = {
  auth: "/auth",
  listings: "/listings",
  users: "/users",
  messages: "/messages",
  uploads: "/uploads",
  notifications: "/notifications",
};

// Simplified request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Log the request details
    console.log('🚀 Original Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
    });

    // Handle auth routes
    if (config.url === "/login") {
      config.url = "/auth/login";
    } else if (config.url === "/register") {
      config.url = "/auth/register";
    }

    // Log the final URL
    console.log('🔗 Final URL:', `${config.baseURL}${config.url}`);

    // Add token to request
    const tokens = JSON.parse(localStorage.getItem("auth_tokens") || "null");
    if (tokens?.accessToken) {
      config.headers.Authorization = `Bearer ${tokens.accessToken}`;
    } else {
      delete config.headers.Authorization;
    }
    
    return config;
  },
  (error) => {
    console.error("❌ Request error:", error);
    return Promise.reject(error);
  }
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
