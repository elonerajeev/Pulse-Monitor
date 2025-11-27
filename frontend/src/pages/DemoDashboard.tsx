import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Zap, Monitor, AlertTriangle, TrendingUp, Plus, BarChart2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/ui/navbar";
import RealTimeChart from "@/components/ui/real-time-chart";
import RealTimeTrafficChart from "@/components/ui/RealTimeTrafficChart"; // Corrected import
import { useToast } from "@/components/ui/use-toast";
import ServiceCard from "@/components/ui/ServiceCard";
import { Notification } from "@/components/ui/NotificationBell";

const demoWebsites = [
  { name: "TechCrunch", url: "https://techcrunch.com", status: "online", responseTime: 128, lastCheck: "1 min ago", uptime: 99.98, region: "US-East", logs: Array.from({ length: 10 }, () => ({ responseTime: Math.random() * 200, createdAt: new Date().toISOString(), requests: Math.random() * 1000 })) },
  { name: "The Verge", url: "https://www.theverge.com", status: "online", responseTime: 234, lastCheck: "2 mins ago", uptime: 99.95, region: "EU-West", logs: Array.from({ length: 10 }, () => ({ responseTime: Math.random() * 300, createdAt: new Date().toISOString(), requests: Math.random() * 1000 })) },
  { name: "Hacker News", url: "https://news.ycombinator.com", status: "offline", responseTime: 0, lastCheck: "5 mins ago", uptime: 98.50, region: "US-West", logs: Array.from({ length: 10 }, () => ({ responseTime: 0, createdAt: new Date().toISOString(), requests: Math.random() * 1000 })) },
  { name: "GitHub", url: "https://github.com", status: "online", responseTime: 98, lastCheck: "30 secs ago", uptime: 99.99, region: "US-East", logs: Array.from({ length: 10 }, () => ({ responseTime: Math.random() * 150, createdAt: new Date().toISOString(), requests: Math.random() * 1000 })) },
];

const demoNotifications: Notification[] = [
    { id: 1, message: "Hacker News is down!", service: "Hacker News", time: "5 mins ago", severity: "error" },
    { id: 2, message: "New incident reported.", service: "TechCrunch", time: "1 hour ago", severity: "warning" },
];
  

const DemoDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAddMonitor = () => {
    navigate('/signup');
  };

  const handleRefresh = () => {
    toast({ title: "Refreshing!", description: "Data is being refreshed.", duration: 2000 });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar isAuthenticated={true} isDemo={true} notifications={demoNotifications} />

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Demo Dashboard</h1>
            <p className="text-muted-foreground">This is a demo of PulseMonitor's features. Sign up to create your own monitors.</p>
          </div>
          <Button
            variant="hero"
            className="mt-4 lg:mt-0"
            onClick={handleAddMonitor}
          >
            <Plus className="w-4 h-4 mr-2" />
            Sign Up Now
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Uptime</CardTitle>
              <CheckCircle className="w-4 h-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">99.85%</div>
              <p className="text-xs text-muted-foreground">+0.2% from last month</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
              <Zap className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">189ms</div>
              <p className="text-xs text-muted-foreground">-20ms from last hour</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Monitors</CardTitle>
              <Monitor className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">7</div>
              <p className="text-xs text-muted-foreground">5 online, 2 down</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Incidents</CardTitle>
              <AlertTriangle className="w-4 h-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
              <p className="text-xs text-muted-foreground">In the last 24 hours</p>
            </CardContent>
          </Card>
        </div>

        {/* Real-time Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Real-time Response Time (ms)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <RealTimeChart onRefresh={handleRefresh} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart2 className="w-5 h-5 mr-2" />
                Real-time Traffic
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <RealTimeTrafficChart />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {demoWebsites.map((site) => (
            <ServiceCard 
              key={site.name} 
              name={site.name} 
              status={site.status} 
              target={site.url} 
              serviceType="website" 
              logs={site.logs as any}
              lastChecked={site.lastCheck} 
              onEdit={() => {}} 
              onDelete={() => {}} 
              onRefresh={handleRefresh} 
            />
          ))}
        </div>

      </div>
    </div>
  );
};

export default DemoDashboard;