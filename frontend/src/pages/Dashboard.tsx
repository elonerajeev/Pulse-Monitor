import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Monitor,
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle,
  Plus,
  TrendingUp,
  Globe,
  Bell,
  Settings,
  User,
  Moon,
  Sun,
  Mail,
  LogOut,
  Users,
  CreditCard,
  Shield,
  Eye,
  BellRing,
  Trash,
  PaintBucket,
  Languages,
  KeyRound,
  HelpCircle,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Link, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState({ name: '', email: '' });

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (isAuthenticated !== 'true') {
      navigate("/login");
    } else {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
  }, [navigate]);

  const handleAddMonitor = () => {
    // Check if user is authenticated or in demo mode
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    const isDemoMode = localStorage.getItem("isDemoMode");

    if (!isAuthenticated || isDemoMode === "true") {
      navigate("/login");
    }
    // If authenticated and not in demo mode, we can add monitor functionality here
  };

  // Mock data for charts
  const uptimeData = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    uptime: Math.random() > 0.1 ? 100 : Math.random() * 50 + 50,
    responseTime: Math.random() * 200 + 100,
  }));

  const regionData = [
    { name: "US East", value: 35, color: "hsl(var(--chart-1))" },
    { name: "US West", value: 25, color: "hsl(var(--chart-2))" },
    { name: "Europe", value: 20, color: "hsl(var(--chart-3))" },
    { name: "Asia", value: 20, color: "hsl(var(--chart-4))" },
  ];

  const monitors = [
    {
      id: 1,
      url: "https://api.example.com",
      status: "online",
      responseTime: 245,
      lastCheck: "2 mins ago",
    },
    {
      id: 2,
      url: "https://app.example.com",
      status: "online",
      responseTime: 180,
      lastCheck: "1 min ago",
    },
    {
      id: 3,
      url: "https://cdn.example.com",
      status: "warning",
      responseTime: 450,
      lastCheck: "3 mins ago",
    },
    {
      id: 4,
      url: "https://blog.example.com",
      status: "online",
      responseTime: 320,
      lastCheck: "1 min ago",
    },
  ];

  const recentAlerts = [
    {
      id: 1,
      message: "High response time detected",
      service: "API Server",
      time: "5 mins ago",
      severity: "warning",
    },
    {
      id: 2,
      message: "Service back online",
      service: "CDN",
      time: "15 mins ago",
      severity: "success",
    },
    {
      id: 3,
      message: "SSL certificate expires in 7 days",
      service: "Main Website",
      time: "2 hours ago",
      severity: "info",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold text-gradient">PulseMonitor</span>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notifications Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="w-4 h-4" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full"></div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="flex items-center justify-between px-2 py-2">
                  <span className="font-semibold">Notifications</span>
                  <Badge variant="secondary" className="ml-auto">
                    5 New
                  </Badge>
                </div>
                <DropdownMenuSeparator />
                {recentAlerts.map((alert) => (
                  <DropdownMenuItem key={alert.id} className="cursor-pointer">
                    <div className="flex items-start space-x-3 py-1">
                      <div
                        className={`w-2 h-2 rounded-full mt-2 ${
                          alert.severity === "warning"
                            ? "bg-warning"
                            : alert.severity === "success"
                            ? "bg-success"
                            : "bg-primary"
                        }`}
                      />
                      <div>
                        <p className="font-medium">{alert.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {alert.service} • {alert.time}
                        </p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => toast({ description: "Notification preferences updated" })}
                >
                  <BellRing className="w-4 h-4 mr-2" />
                  Notification Settings
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => toast({ description: "All notifications cleared" })}
                >
                  <Trash className="w-4 h-4 mr-2" />
                  Clear All
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <ThemeToggle />

            {/* Settings Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Settings className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-2">
                  <p className="text-sm font-medium">Theme</p>
                </div>
                <DropdownMenuItem
                  onClick={() => toast({ description: "Light mode activated" })}
                >
                  <Sun className="w-4 h-4 mr-2" />
                  Light Mode
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => toast({ description: "Dark mode activated" })}
                >
                  <Moon className="w-4 h-4 mr-2" />
                  Dark Mode
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => toast({ description: "Color scheme updated" })}
                >
                  <PaintBucket className="w-4 h-4 mr-2" />
                  Color Scheme
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <div className="px-2 py-2">
                  <p className="text-sm font-medium">Preferences</p>
                </div>
                <DropdownMenuItem
                  onClick={() =>
                    toast({ description: "Language settings opened" })
                  }
                >
                  <Languages className="w-4 h-4 mr-2" />
                  Language
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => toast({ description: "Timezone updated" })}
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Timezone
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    toast({ description: "Security settings opened" })
                  }
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Security Settings
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <User className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="rounded-full w-10 h-10 bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => toast({ description: "Profile settings opened" })}
                >
                  <User className="w-4 h-4 mr-2" />
                  Edit Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => toast({ description: "Team settings opened" })}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Team Settings
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => toast({ description: "Billing settings opened" })}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Billing
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => toast({ description: "API settings opened" })}
                >
                  <KeyRound className="w-4 h-4 mr-2" />
                  API Keys
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    localStorage.removeItem("isAuthenticated");
                    localStorage.removeItem("isDemoMode");
                    navigate("/login");
                    toast({ description: "Logged out successfully" });
                  }}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">
              Monitor your services and track performance
            </p>
          </div>
          <Button
            variant="hero"
            className="mt-4 lg:mt-0"
            onClick={handleAddMonitor}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Monitor
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Overall Uptime
              </CardTitle>
              <CheckCircle className="w-4 h-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">99.9%</div>
              <p className="text-xs text-muted-foreground">
                +0.1% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Avg Response Time
              </CardTitle>
              <Clock className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">245ms</div>
              <p className="text-xs text-muted-foreground">
                -12ms from last hour
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Monitors</CardTitle>
              <Monitor className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className_="text-xs text-muted-foreground">4 monitors online</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Incidents</CardTitle>
              <AlertTriangle className="w-4 h-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Response Time Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Response Time (24h)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={uptimeData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey="time"
                    className="text-xs"
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis
                    className="text-xs"
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="responseTime"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary) / 0.2)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Uptime Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Uptime Percentage (24h)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={uptimeData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey="time"
                    className="text-xs"
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis
                    domain={[95, 100]}
                    className="text-xs"
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="uptime"
                    stroke="hsl(var(--success))"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Monitor Status */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Monitor className="w-5 h-5 mr-2" />
                Monitor Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monitors.map((monitor) => (
                  <div
                    key={monitor.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          monitor.status === "online"
                            ? "bg-success"
                            : monitor.status === "warning"
                            ? "bg-warning"
                            : "bg-destructive"
                        }`}
                      />
                      <div>
                        <p className="font-medium">{monitor.url}</p>
                        <p className="text-sm text-muted-foreground">
                          {monitor.lastCheck}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{monitor.responseTime}ms</p>
                      <Badge
                        variant={
                          monitor.status === "online" ? "default" : "secondary"
                        }
                      >
                        {monitor.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Regional Performance & Recent Alerts */}
          <div className="space-y-6">
            {/* Regional Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="w-5 h-5 mr-2" />
                  Regional Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={regionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {regionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {regionData.map((region, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: region.color }}
                        />
                        <span>{region.name}</span>
                      </div>
                      <span>{region.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="w-5 h-5 mr-2" />
                  Recent Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentAlerts.map((alert) => (
                    <div key={alert.id} className="flex items-start space-x-3">
                      <div
                        className={`w-2 h-2 rounded-full mt-2 ${
                          alert.severity === "warning"
                            ? "bg-warning"
                            : alert.severity === "success"
                            ? "bg-success"
                            : "bg-primary"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{alert.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {alert.service} • {alert.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
