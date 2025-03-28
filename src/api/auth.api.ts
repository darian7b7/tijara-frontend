import apiClient from "./apiClient";
import type { 
  AuthResponse,
  SignupRequest,
  LoginRequest,
  APIResponse,
  AuthError,
} from "@/types/auth";
import { TokenManager } from "@/utils/TokenManager";

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
      console.log(" Attempting signup:", { email: data.email, username: data.username });
      const response = await apiClient.post<AuthResponse>("/auth/register", data);
      
      if (response.data.success && response.data.data?.tokens) {
        TokenManager.setTokens(response.data.data.tokens);
      }
      
      return response.data;
    } catch (error: any) {
      console.error(" Signup error:", error);
      return this.handleError(error);
    }
  }

  static async logout(): Promise<APIResponse<void>> {
    try {
      const response = await apiClient.post<APIResponse<void>>("/auth/logout");
      TokenManager.clearTokens();
      return response.data;
    } catch (error: any) {
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

  static async refreshToken(): Promise<AuthResponse | null> {
    try {
      const tokens = TokenManager.getStoredTokens();
      if (!tokens?.refreshToken) {
        console.error("No refresh token available");
        return null;
      }

      const response = await apiClient.post<AuthResponse>("/auth/refresh", {
        refreshToken: tokens.refreshToken
      });

      if (response.data.success && response.data.data?.tokens) {
        TokenManager.setTokens(response.data.data.tokens);
      }

      return response.data;
    } catch (error: any) {
      console.error("Token refresh failed:", error);
      TokenManager.clearTokens();
      return null;
    }
  }
}
