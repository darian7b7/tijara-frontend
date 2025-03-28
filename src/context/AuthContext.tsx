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

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>(initialState);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await TokenManager.initialize();
        const response = await AuthAPI.getCurrentUser();
        if (response.success && response.data?.user) {
          setState({
            user: response.data.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } else {
          setState({
            ...initialState,
            isLoading: false,
          });
        }
      } catch (error) {
        setState({
          ...initialState,
          isLoading: false,
        });
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<AuthResponse> => {
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
        code: "NETWORK_ERROR",
        message: error.message || "Network error occurred during login",
      };
      setState(prev => ({
        ...prev,
        error: authError,
      }));
      toast.error(authError.message);
      throw error;
    }
  };

  const signup = async (email: string, password: string, username: string): Promise<AuthResponse> => {
    try {
      const response = await AuthAPI.signup({ email, password, username });
      
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
        code: "NETWORK_ERROR",
        message: error.message || "Network error occurred during signup",
      };
      setState(prev => ({
        ...prev,
        error: authError,
      }));
      toast.error(authError.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AuthAPI.logout();
    } finally {
      TokenManager.clearTokens();
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      navigate("/login", { replace: true });
    }
  };

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  const value: AuthContextType = {
    ...state,
    login,
    signup,
    logout,
    clearError,
  };

  if (state.isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
