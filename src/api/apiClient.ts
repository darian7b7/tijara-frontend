import axios from "axios";
import { toast } from "react-toastify";

const baseURL = import.meta.env.VITE_API_URL || "https://tijara-backend-production.up.railway.app";

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
    // Log the complete error object for debugging
    console.error("Response error:", {
      response: error.response,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    // Handle network errors
    if (!error.response) {
      return Promise.reject({
        code: "NETWORK_ERROR",
        message: "Network error occurred. Please check your connection.",
      });
    }

    // Extract error details from the response
    const errorResponse = {
      code: error.response.data?.code || String(error.response.status),
      message: error.response.data?.message || "An error occurred",
      errors: error.response.data?.errors || [],
      status: error.response.status,
    };

    // Handle specific error statuses
    switch (error.response.status) {
      case 400:
        // Don't show toast for validation errors, let the component handle it
        break;
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

    return Promise.reject(errorResponse);
  }
);

export default apiClient;
