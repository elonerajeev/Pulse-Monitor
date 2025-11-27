import { Outlet } from "react-router-dom";
import Navbar from "./ui/navbar";
import { useAuth } from "@/hooks/useAuth";

const MainLayout = () => {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar isAuthenticated={isAuthenticated} />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
