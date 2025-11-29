import DashboardSidebar from "./DashboardSidebar";
import { Outlet } from "react-router-dom";

const DemoDashboardLayout = () => {
  return (
    <div className="flex">
      <DashboardSidebar />
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default DemoDashboardLayout;
