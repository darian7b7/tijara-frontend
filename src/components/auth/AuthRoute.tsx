import type { PropsWithChildren } from "react";
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface AuthRouteProps {
  roles?: string[];
  redirectTo?: string;
  publicRoute?: boolean;
}

const AuthRoute: React.FC<PropsWithChildren<AuthRouteProps>> = ({
  roles = [],
  redirectTo = "/login",
  publicRoute = false,
  children,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Allow access to public routes regardless of auth status
  if (publicRoute) {
    return <>{children}</>;
  }

  // Show nothing while checking auth status
  if (isLoading) {
    return null;
  }

  // Redirect to login for protected routes when not authenticated
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check role-based access
  if (roles.length > 0 && (!user?.role || !roles.includes(user.role))) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default AuthRoute;
