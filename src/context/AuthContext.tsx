import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthAPI, TokenManager } from "@/api/auth.api";
import type { AuthState, AuthContextType, AuthResponse, AuthError } from "@/types/auth";
import { toast } from "react-toastify";

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<AuthState>(initialState);
  const navigate = useNavigate();
  const [retryTimeout, setRetryTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await TokenManager.initialize();
        const tokens = TokenManager.getStoredTokens();
        if (!tokens) {
          return setState({ ...initialState, isLoading: false });
        }

        const response = await AuthAPI.getCurrentUser();
        if (response.success && response.data?.user) {
          setState({
            user: response.data.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } else {
          TokenManager.clearTokens();
          setState({ ...initialState, isLoading: false });
        }
      } catch (err: any) {
        console.warn("Auth init failed:", err.message);
        if (err.status === 429) {
          const retryAfter = parseInt(
            err.response?.headers?.["retry-after"] || "60",
            10,
          );
          if (retryTimeout) {
            clearTimeout(retryTimeout);
          }
          const timeout = setTimeout(() => {
            initializeAuth();
          }, retryAfter * 1000);
          setRetryTimeout(timeout);
          toast.warn("Rate limit reached. Will retry authentication later.");
        } else {
          TokenManager.clearTokens();
        }
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    initializeAuth();

    return () => {
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, []);

  const login = async (
    email: string,
    password: string,
  ): Promise<AuthResponse> => {
    try {
      const response = await AuthAPI.login({ email, password });
      if (response.success && response.data?.user) {
        setState({
          user: response.data.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        navigate("/", { replace: true });
      }
      return response;
    } catch (error: any) {
      const authError: AuthError = {
        code: "INVALID_CREDENTIALS",
        message: error?.message || "Login failed",
      };
      setState((prev) => ({ ...prev, error: authError }));
      toast.error(authError.message);
      throw error;
    }
  };

  const signup = async (
    email: string,
    password: string,
    username: string,
  ): Promise<AuthResponse> => {
    try {
      console.log("🔐 Attempting signup:", { email, username });
      const response = await AuthAPI.signup({ email, password, username });
      console.log("✅ Signup response:", response);
      
      if (response.success && response.data?.user) {
        setState({
          user: response.data.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        navigate("/", { replace: true });
      }
      return response;
    } catch (error: any) {
      console.error("❌ Signup error:", error);
      const authError: AuthError = {
        code: "UNKNOWN",
        message: error?.message || "Signup failed",
      };
      setState((prev) => ({ ...prev, error: authError }));
      toast.error(authError.message);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await AuthAPI.logout();
    } finally {
      TokenManager.clearTokens();
      setState({ ...initialState, isLoading: false });
      navigate("/login", { replace: true });
    }
  };

  const clearError = () => {
    setState((prev) => ({ ...prev, error: null }));
  };

  const value: AuthContextType = {
    ...state,
    login,
    signup,
    logout,
    clearError,
  };

  if (state.isLoading) {
    return <div className="text-center p-8 text-gray-600">Loading user...</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
