
import { useState, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Navigation from './dashboard/Navigation';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { MonitoringProvider } from '@/hooks/useMonitoring';

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col border-r transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="p-4 flex justify-between items-center">
          <h1 className={`text-2xl font-bold ${!isSidebarOpen && 'hidden'}`}>Dashboard</h1>
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
        <Navigation isSidebarOpen={isSidebarOpen} />
      </aside>

      {/* Mobile Sidebar */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="m-4">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="p-4 border-b">
              <h1 className="text-2xl font-bold">Dashboard</h1>
            </div>
            <Navigation isSidebarOpen={true} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto container mx-auto p-4 md:p-6">
          <Suspense fallback={<div>Loading page...</div>}>
            <MonitoringProvider>
              <Outlet />
            </MonitoringProvider>
          </Suspense>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
