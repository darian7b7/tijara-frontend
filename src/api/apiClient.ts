// src/api/apiClient.ts

import axios, { AxiosInstance } from "axios";
import { API_BASE_URL } from "@/config";

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL, // will point to correct backend URL depending on environment
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorResponse = {
      success: false,
      error: error.response?.data?.message || "An error occurred",
      data: null,
      status: error.response?.status || 500,
    };
    return Promise.reject(errorResponse);
  },
);

export default apiClient;
