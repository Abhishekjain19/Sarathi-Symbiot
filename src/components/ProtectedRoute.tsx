
import { ReactNode, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: Array<"student" | "professor" | "ngo">;
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { profile, isLoading } = useAuth();

  if (isLoading) {
    // Add a loading spinner or placeholder here
    return (
      <div className="min-h-screen bg-sarathi-dark flex items-center justify-center">
        <div className="animate-spin rounded-full border-t-4 border-primary border-opacity-50 h-12 w-12"></div>
      </div>
    );
  }

  if (!profile) {
    return <Navigate to="/auth" />;
  }

  if (!allowedRoles.includes(profile.role)) {
    // Redirect to appropriate dashboard based on role
    if (profile.role === "student") {
      return <Navigate to="/student-dashboard" />;
    } else if (profile.role === "professor") {
      return <Navigate to="/professor-dashboard" />;
    } else if (profile.role === "ngo") {
      return <Navigate to="/ngo-dashboard" />;
    } else {
      // Fallback to auth if role is somehow invalid
      return <Navigate to="/auth" />;
    }
  }

  return <>{children}</>;
};
