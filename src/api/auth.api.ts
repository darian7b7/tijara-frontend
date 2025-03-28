import apiClient from "./apiClient";
import { TokenManager } from "@/utils/TokenManager";
import type { 
  UserSettings,
  User,
  AuthResponse,
  SignupRequest,
  LoginRequest,
  APIResponse,
  AuthError,
} from "@/types/auth";

export class AuthAPI {
  private static handleError(error: any): never {
    console.error("API Error:", error);
    const authError: AuthError = {
      code: error?.response?.data?.error?.code || "UNKNOWN_ERROR",
      message: error?.response?.data?.error?.message || "An unexpected error occurred"
    };
    throw authError;
  }

  static async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>("/auth/login", data);
      
      if (response.data.success && response.data.data?.tokens) {
        TokenManager.setTokens(response.data.data.tokens);
      }
      
      return response.data;
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  static async signup(data: SignupRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>("/auth/signup", data);
      
      if (response.data.success && response.data.data?.tokens) {
        TokenManager.setTokens(response.data.data.tokens);
      }
      
      return response.data;
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  static async logout(): Promise<APIResponse<void>> {
    try {
      const response = await apiClient.post<APIResponse<void>>("/auth/logout");
      TokenManager.clearTokens();
      return response.data;
    } catch (error: any) {
      TokenManager.clearTokens();
      return this.handleError(error);
    }
  }

  static async getCurrentUser(): Promise<AuthResponse> {
    try {
      const response = await apiClient.get<AuthResponse>("/auth/me");
      return response.data;
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  static async updateProfile(data: Partial<User>): Promise<AuthResponse> {
    try {
      const response = await apiClient.put<AuthResponse>("/auth/profile", data);
      return response.data;
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  static async updateSettings(data: Partial<UserSettings>): Promise<AuthResponse> {
    try {
      const response = await apiClient.put<AuthResponse>("/auth/settings", data);
      return response.data;
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  static async refreshToken(): Promise<AuthResponse> {
    try {
      const tokens = TokenManager.getStoredTokens();
      if (!tokens?.refreshToken) {
        return this.handleError({
          response: {
            data: {
              error: {
                code: "NO_REFRESH_TOKEN",
                message: "No refresh token available"
              }
            }
          }
        });
      }

      const response = await apiClient.post<AuthResponse>("/auth/refresh", {
        refreshToken: tokens.refreshToken
      });

      if (response.data.success && response.data.data?.tokens) {
        TokenManager.setTokens(response.data.data.tokens);
      }

      return response.data;
    } catch (error: any) {
      TokenManager.clearTokens();
      return this.handleError(error);
    }
  }
}

export { TokenManager };
