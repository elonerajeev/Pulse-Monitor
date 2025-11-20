import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import api from "@/utils/api";

interface User {
  name: string;
  email: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (data: any) => Promise<void>;
  logout: () => void;
  register: (data: any) => Promise<void>;
  updateUser: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("accessToken");
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (data: any) => {
    const response = await api.post("/auth/login", data);
    const { accessToken, user } = response.data.data;
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("isAuthenticated", "true");
    setUser(user);
    setIsAuthenticated(true);
  };

  const register = async (data: any) => {
    const response = await api.post("/auth/register", data);
    const { accessToken, user } = response.data.data;
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("isAuthenticated", "true");
    setUser(user);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("isAuthenticated");
      setUser(null);
      setIsAuthenticated(false);
      window.location.href = "/login";
    }
  };

  const updateUser = async (data: any) => {
    const response = await api.patch("/users/update-profile", data);
    const updatedUser = response.data.data;
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, login, logout, register, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
