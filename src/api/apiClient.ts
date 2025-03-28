import axios from "axios";
import { toast } from "react-toastify";
import type { AuthError } from "@/types/auth";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const apiClient = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

apiClient.interceptors.request.use(
  (config) => {
    const tokens = JSON.parse(localStorage.getItem("auth_tokens") || "null");
    if (tokens?.accessToken) {
      config.headers.Authorization = `Bearer ${tokens.accessToken}`;
    }
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Response error:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    // Handle network errors
    if (!error.response) {
      const networkError: AuthError = {
        code: "NETWORK_ERROR",
        message: "Network error occurred. Please check your connection.",
      };
      return Promise.reject(networkError);
    }

    // Handle specific error statuses
    switch (error.response.status) {
      case 401:
        // Token expired or invalid
        localStorage.removeItem("auth_tokens");
        window.location.href = "/login";
        break;
      case 403:
        toast.error("You don't have permission to perform this action");
        break;
      case 422:
        // Validation errors
        toast.error("Please check your input and try again");
        break;
      case 500:
        toast.error("An unexpected error occurred. Please try again later");
        break;
    }

    // Return a standardized error object
    return Promise.reject({
      code: error.response.data?.code || "UNKNOWN",
      message: error.response.data?.message || "An unexpected error occurred",
      errors: error.response.data?.errors,
      status: error.response.status,
    });
  }
);

export default apiClient;
