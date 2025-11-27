
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import Landing from "./pages/Landing";
import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";
import AddMonitoringService from "./pages/AddMonitoringService";
import Documentation from "./pages/Documentation";
import NotFound from "./pages/NotFound";
import Terms from "./pages/Terms";
import DemoDashboard from "./pages/DemoDashboard";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Settings from "./pages/Settings";
import SwitchProfile from "./pages/SwitchProfile";
import ApiReference from "./pages/ApiReference";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import ComingSoon from "./pages/ComingSoon";
import ServiceDetailsPage from "./pages/ServiceDetailsPage";
import DashboardLayout from "./components/DashboardLayout";
import Home from "./pages/dashboard/Home";
import Traffic from "./pages/dashboard/Traffic";
import Services from "./pages/dashboard/Services";
import Monitoring from "./pages/Monitoring";
import DependencyMap from "./pages/DependencyMap";
import MainLayout from "./components/MainLayout";
import { ThemeProvider } from "./theme/ThemeProvider";
import ApiAndReport from "./pages/ApiAndReport";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <AuthProvider>
        <ThemeProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<MainLayout />}>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                  <Route index element={<Home />} />
                  <Route path="traffic" element={<Traffic />} />
                  <Route path="services" element={<Services />} />
                  <Route path="monitoring" element={<Monitoring />} />
                  <Route path="dependency-map" element={<DependencyMap />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="api-and-report" element={<ApiAndReport />} />
                </Route>
                <Route path="/demo-dashboard" element={<DemoDashboard />} />
                <Route path="/monitoring/add" element={<ProtectedRoute><AddMonitoringService /></ProtectedRoute>} />
                <Route path="/monitoring/:id" element={<ProtectedRoute><ServiceDetailsPage /></ProtectedRoute>} />
                <Route path="/profile/edit" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
                <Route path="/switch-profile" element={<ProtectedRoute><SwitchProfile /></ProtectedRoute>} />
                <Route path="/documentation" element={<Documentation />} />
                <Route path="/api-reference" element={<ApiReference />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/coming-soon" element={<ComingSoon />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </ThemeProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
