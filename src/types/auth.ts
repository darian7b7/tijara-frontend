import type { User } from "./user";

export type { User };

export interface TokenPayload {
  id: string;
  exp: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  username: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthError {
  code: string;
  message: string;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    user: User;
    tokens: AuthTokens;
  };
  error?: AuthError;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: AuthError | null;
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<AuthResponse>;
  signup: (
    email: string,
    password: string,
    username: string,
  ) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export interface UserSettings {
  notifications: {
    email: boolean;
    push: boolean;
    messages: boolean;
    listings: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
    lastPasswordChange: string;
  };
  preferences: {
    language: string;
    theme: "light" | "dark" | "system";
    timezone: string;
  };
}

export interface UserUpdateInput {
  username?: string;
  email?: string;
  bio?: string;
  profilePicture?: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface UserActivity {
  lastActive: string;
  ip?: string;
  device?: string;
  location?: string;
}

export interface APIResponse<T> {
  success: boolean;
  data: T | null;
  error?: AuthError;
  status: number;
}

export interface UserProfile extends User {
  bio?: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
}
