import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      // If the user is authenticated and tries to access login/register, redirect to dashboard
      if (location.pathname === "/login" || location.pathname === "/register") {
        navigate("/dashboard");
      }
    } else {
      // If the user is not authenticated and tries to access a protected route, redirect to login
      if (location.pathname !== "/login" && location.pathname !== "/register") {
        navigate("/login");
      }
    }
  }, [isAuthenticated, navigate, location.pathname]);

  return <>{children}</>;
};

export default AuthGuard;
