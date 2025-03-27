import apiClient from "./apiClient";
import { jwtDecode } from "jwt-decode";
import type { UserProfile, UserSettings } from "@/types/user";

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
  user: User;
  tokens: AuthTokens;
}

export interface TokenPayload {
  id: string;
  exp: number;
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

const TOKEN_STORAGE_KEY = "auth_tokens";
const TOKEN_REFRESH_THRESHOLD = 5 * 60; // 5 minutes in seconds

export class TokenManager {
  static getStoredTokens(): AuthTokens | null {
    try {
      const tokens = localStorage.getItem(TOKEN_STORAGE_KEY);
      return tokens ? JSON.parse(tokens) : null;
    } catch (error) {
      console.error("Failed to parse stored tokens:", error);
      this.clearTokens();
      return null;
    }
  }

  static setTokens(tokens: AuthTokens): void {
    try {
      localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens));
      apiClient.defaults.headers.common["Authorization"] =
        `Bearer ${tokens.accessToken}`;
    } catch (error) {
      console.error("Failed to store tokens:", error);
      this.clearTokens();
    }
  }

  static clearTokens(): void {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    delete apiClient.defaults.headers.common["Authorization"];
    window.dispatchEvent(new CustomEvent("auth-logout"));
  }

  static isTokenExpired(token: string): boolean {
    try {
      const decoded = jwtDecode<TokenPayload>(token);
      const currentTime = Math.floor(Date.now() / 1000);
      return (decoded.exp || 0) <= currentTime;
    } catch {
      return true;
    }
  }

  static shouldRefreshToken(token: string): boolean {
    try {
      const decoded = jwtDecode<TokenPayload>(token);
      const currentTime = Math.floor(Date.now() / 1000);
      return (decoded.exp || 0) - currentTime <= TOKEN_REFRESH_THRESHOLD;
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
      apiClient.defaults.headers.common["Authorization"] =
        `Bearer ${tokens.accessToken}`;
    }
  }
}

export class AuthAPI {
  static async login(email: string, password: string): Promise<APIResponse<AuthResponse>> {
    try {
      const response = await apiClient.post<APIResponse<AuthResponse>>('/api/auth/login', {
        email,
        password,
      });

      if (response.data.data?.tokens) {
        TokenManager.setTokens(response.data.data.tokens);
      }

      return response.data;
    } catch (error: any) {
      TokenManager.clearTokens();
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed',
        status: error.response?.status || 500,
        data: null
      };
    }
  }

  static async signup(
    email: string,
    password: string,
    name: string,
  ): Promise<APIResponse<AuthResponse>> {
    try {
      const response = await apiClient.post<APIResponse<AuthResponse>>('/api/auth/register', {
        email,
        password,
        name,
      });

      if (response.data.data?.tokens) {
        TokenManager.setTokens(response.data.data.tokens);
      }

      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed',
        status: error.response?.status || 500,
        data: null
      };
    }
  }

  static async logout(): Promise<APIResponse<void>> {
    try {
      await apiClient.post("/api/auth/logout");
      TokenManager.clearTokens();
      return {
        success: true,
        status: 200,
        data: null
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error logging out',
        status: 500,
        data: null
      };
    }
  }

  static async refreshToken(): Promise<APIResponse<AuthResponse>> {
    try {
      const tokens = TokenManager.getStoredTokens();
      if (!tokens?.refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await apiClient.post<APIResponse<AuthResponse>>(
        "/api/auth/refresh",
        { refreshToken: tokens.refreshToken },
      );

      if (response.data.success && response.data.data?.tokens) {
        TokenManager.setTokens(response.data.data.tokens);
      }

      return response.data;
    } catch (error: any) {
      const errorResponse: APIResponse<AuthResponse> = {
        success: false,
        error: error.response?.data?.error || "Failed to refresh token",
        data: null,
        status: error.response?.status || 500,
      };
      return errorResponse;
    }
  }

  static async getCurrentUser(): Promise<APIResponse<AuthResponse>> {
    try {
      const response = await apiClient.get<APIResponse<AuthResponse>>("/api/auth/me");
      return response.data;
    } catch (error: any) {
      const errorResponse: APIResponse<AuthResponse> = {
        success: false,
        error: error.response?.data?.error || "Failed to get current user",
        data: null,
        status: error.response?.status || 500,
      };
      return errorResponse;
    }
  }
}

export class UserAPI {
  static async getSettings(): Promise<APIResponse<UserSettings>> {
    try {
      const response = await apiClient.get<APIResponse<UserSettings>>('/user/settings');
      return response.data;
    } catch (error: any) {
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
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch profile',
        status: error.response?.status || 500,
        data: null
      };
    }
  }
}
