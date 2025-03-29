import apiClient from "./apiClient";
import type { 
  APIResponse, 
  AuthError 
} from "@/types/auth";
import type { 
  UserSettings, 
  User 
} from "@/types/user";

export class UserAPI {
  private static handleError(error: any): never {
    console.error("API Error:", error);
    const authError: AuthError = {
      code: error?.response?.data?.error?.code || "UNKNOWN_ERROR",
      message: error?.response?.data?.error?.message || "An unexpected error occurred"
    };
    throw authError;
  }

  static async getSettings(): Promise<APIResponse<UserSettings>> {
    try {
      const response = await apiClient.get<APIResponse<UserSettings>>("/users/settings");
      return response.data;
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  static async updateSettings(settings: UserSettings): Promise<APIResponse<User>> {
    try {
      const response = await apiClient.put<APIResponse<User>>("/users/settings", settings);
      return response.data;
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  static async updateProfile(data: FormData): Promise<APIResponse<User>> {
    try {
      const response = await apiClient.put<APIResponse<User>>("/users/profile", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  static async changePassword(currentPassword: string, newPassword: string): Promise<APIResponse<void>> {
    try {
      const response = await apiClient.put<APIResponse<void>>("/users/password", {
        currentPassword,
        newPassword
      });
      return response.data;
    } catch (error: any) {
      return this.handleError(error);
    }
  }
}
