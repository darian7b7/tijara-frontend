import apiClient from "./apiClient";
import { jwtDecode } from "jwt-decode";
import type { 
  UserProfile, 
  UserSettings, 
  User, 
  AuthTokens, 
  AuthResponse, 
  AuthError, 
  SignupRequest, 
  LoginRequest 
} from "@/types/auth";

// Define types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  profilePicture?: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    tokens: AuthTokens;
  } | null;
  error?: string | AuthError;
}

export interface AuthError {
  code: string;
  message: string;
}

export interface APIResponse<T> {
  success: boolean;
  data: T | null;
  error?: string | AuthError;
  status: number;
}

export class TokenManager {
  private static readonly TOKEN_STORAGE_KEY = "auth_tokens";
  private static readonly TOKEN_REFRESH_THRESHOLD = 5 * 60; // 5 minutes in seconds

  static getStoredTokens(): AuthTokens | null {
    try {
      const tokens = localStorage.getItem(this.TOKEN_STORAGE_KEY);
      return tokens ? JSON.parse(tokens) : null;
    } catch (error) {
      console.error("Failed to parse stored tokens:", error);
      this.clearTokens();
      return null;
    }
  }

  static setTokens(tokens: AuthTokens): void {
    localStorage.setItem(this.TOKEN_STORAGE_KEY, JSON.stringify(tokens));
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${tokens.accessToken}`;
  }

  static clearTokens(): void {
    localStorage.removeItem(this.TOKEN_STORAGE_KEY);
    delete apiClient.defaults.headers.common["Authorization"];
    window.dispatchEvent(new CustomEvent("auth-logout"));
  }

  static isTokenExpired(token: string): boolean {
    try {
      const decoded = jwtDecode(token) as { exp: number };
      return Date.now() >= decoded.exp * 1000;
    } catch {
      return true;
    }
  }

  static shouldRefreshToken(token: string): boolean {
    try {
      const decoded = jwtDecode(token) as { exp: number };
      const expiresIn = decoded.exp * 1000 - Date.now();
      return expiresIn <= this.TOKEN_REFRESH_THRESHOLD * 1000;
    } catch {
      return true;
    }
  }

  static async initialize(): Promise<void> {
    const tokens = this.getStoredTokens();
    if (!tokens) {
      this.clearTokens();
      return;
    }

    if (this.isTokenExpired(tokens.refreshToken)) {
      this.clearTokens();
      window.dispatchEvent(
        new CustomEvent("auth-error", {
          detail: { message: "Session expired" },
        }),
      );
      return;
    }

    if (this.shouldRefreshToken(tokens.accessToken)) {
      try {
        const response = await AuthAPI.refreshToken();
        if (response.data?.tokens) {
          this.setTokens(response.data.tokens);
        } else {
          this.clearTokens();
          window.dispatchEvent(
            new CustomEvent("auth-error", {
              detail: { message: "Failed to refresh session" },
            }),
          );
        }
      } catch (error) {
        this.clearTokens();
        window.dispatchEvent(
          new CustomEvent("auth-error", {
            detail: { message: "Session refresh failed" },
          }),
        );
      }
    } else {
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${tokens.accessToken}`;
    }
  }
}

export class AuthAPI {
  static async signup(data: SignupRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>("/auth/register", data);
      
      if (response.data.success && response.data.data?.tokens) {
        TokenManager.setTokens(response.data.data.tokens);
      }
      
      return response.data;
    } catch (error: any) {
      console.error("Signup Error:", {
        status: error.status,
        message: error.message,
        errors: error.errors,
      });

      // Rethrow the error with proper structure
      throw {
        success: false,
        error: {
          code: error.code || "REGISTRATION_FAILED",
          message: error.message || "Registration failed",
          errors: error.errors || [],
        },
        status: error.status || 400,
      };
    }
  }

  static async login(data: LoginRequest): Promise<APIResponse<AuthResponse>> {
    try {
      const response = await apiClient.post<APIResponse<AuthResponse>>("/auth/login", data);
      
      if (response.data.success && response.data.data?.tokens) {
        TokenManager.setTokens(response.data.data.tokens);
      }
      
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  static async logout(): Promise<APIResponse<void>> {
    try {
      await apiClient.post("/auth/logout");
      TokenManager.clearTokens();
      return {
        success: true,
        status: 200,
        data: null
      };
    } catch (error: any) {
      console.error("Logout error:", error);
      // Always clear tokens on logout, even if the API call fails
      TokenManager.clearTokens();
      throw error;
    }
  }

  static async getCurrentUser(): Promise<APIResponse<AuthResponse>> {
    try {
      const response = await apiClient.get<APIResponse<AuthResponse>>("/auth/me");
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  static async refreshToken(): Promise<APIResponse<AuthResponse>> {
    try {
      const response = await apiClient.post<APIResponse<AuthResponse>>("/auth/refresh");
      
      if (response.data.success && response.data.data?.tokens) {
        TokenManager.setTokens(response.data.data.tokens);
      }
      
      return response.data;
    } catch (error: any) {
      TokenManager.clearTokens();
      throw error;
    }
  }
}

export class UserAPI {
  static async getSettings(): Promise<APIResponse<UserSettings>> {
    try {
      const response = await apiClient.get<APIResponse<UserSettings>>('/user/settings');
      return response.data;
    } catch (error: any) {
      console.error("Get settings Error:", {
        status: error?.response?.status,
        data: error?.response?.data,
        message: error?.message
      });
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch settings',
        status: error.response?.status || 500,
        data: null
      };
    }
  }

  static async updateSettings(settings: UserSettings): Promise<APIResponse<UserProfile>> {
    try {
      const response = await apiClient.post<APIResponse<UserProfile>>('/user/settings', settings);
      return response.data;
    } catch (error: any) {
      console.error("Update settings Error:", {
        status: error?.response?.status,
        data: error?.response?.data,
        message: error?.message
      });
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update settings',
        status: error.response?.status || 500,
        data: null
      };
    }
  }

  static async updateProfile(data: FormData): Promise<APIResponse<UserProfile>> {
    try {
      const response = await apiClient.put<APIResponse<UserProfile>>('/user/profile', data);
      return response.data;
    } catch (error: any) {
      console.error("Update profile Error:", {
        status: error?.response?.status,
        data: error?.response?.data,
        message: error?.message
      });
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update profile',
        status: error.response?.status || 500,
        data: null
      };
    }
  }

  static async getProfile(userId: string): Promise<APIResponse<UserProfile>> {
    try {
      const response = await apiClient.get<APIResponse<UserProfile>>(`/user/profile/${userId}`);
      return response.data;
    } catch (error: any) {
      console.error("Get profile Error:", {
        status: error?.response?.status,
        data: error?.response?.data,
        message: error?.message
      });
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch profile',
        status: error.response?.status || 500,
        data: null
      };
    }
  }
}
