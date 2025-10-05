import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, BarChart2, Zap, Globe, TrendingUp, Activity, Monitor, AlertTriangle, Bell, Settings, User, Moon, Sun, Mail, LogOut, Users, CreditCard, Shield, Eye, BellRing, Trash, PaintBucket, Languages, KeyRound, HelpCircle, Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/ui/navbar";
import RealTimeChart from "@/components/ui/real-time-chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";

const demoWebsites = [
  { name: "TechCrunch", url: "https://techcrunch.com", status: "Up", responseTime: 128, lastCheck: "1 min ago", uptime: 99.98, region: "US-East" },
  { name: "The Verge", url: "https://www.theverge.com", status: "Up", responseTime: 234, lastCheck: "2 mins ago", uptime: 99.95, region: "EU-West" },
  { name: "Hacker News", url: "https://news.ycombinator.com", status: "Down", responseTime: 0, lastCheck: "5 mins ago", uptime: 98.50, region: "US-West" },
  { name: "GitHub", url: "https://github.com", status: "Up", responseTime: 98, lastCheck: "30 secs ago", uptime: 99.99, region: "US-East" },
  { name: "Product Hunt", url: "https://www.producthunt.com", status: "Up", responseTime: 312, lastCheck: "1 min ago", uptime: 99.90, region: "EU-Central" },
  { name: "Indie Hackers", url: "https://www.indiehackers.com", status: "Up", responseTime: 180, lastCheck: "45 secs ago", uptime: 99.96, region: "US-West" },
  { name: "Reddit", url: "https://www.reddit.com", status: "Down", responseTime: 0, lastCheck: "10 mins ago", uptime: 97.20, region: "Asia-Pacific" },
];

const uptimeData = Array.from({ length: 24 }, (_, i) => ({
  time: `${i}:00`,
  uptime: Math.random() > 0.1 ? 100 : Math.random() * 50 + 50,
  responseTime: Math.random() * 200 + 100,
}));

const regionData = [
  { name: 'US East', value: 35, color: 'hsl(var(--chart-1))' },
  { name: 'US West', value: 25, color: 'hsl(var(--chart-2))' },
  { name: 'Europe', value: 20, color: 'hsl(var(--chart-3))' },
  { name: 'Asia', value: 20, color: 'hsl(var(--chart-4))' },
];

const recentAlerts = [
  { id: 1, message: "High response time detected", service: "API Server", time: "5 mins ago", severity: "warning" },
  { id: 2, message: "Service back online", service: "CDN", time: "15 mins ago", severity: "success" },
  { id: 3, message: "SSL certificate expires in 7 days", service: "Main Website", time: "2 hours ago", severity: "info" },
];

const DemoDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAddMonitor = () => {
    navigate('/signup');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar isAuthenticated={true} isDemo={true} />

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

        {/* Real-time Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Real-time Response Time (ms)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <RealTimeChart />
            </div>
          </CardContent>
        </Card>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Monitor className="w-5 h-5 mr-2" />
                Monitor Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Response Time</TableHead>
                    <TableHead>Uptime (24h)</TableHead>
                    <TableHead>Last Check</TableHead>
                    <TableHead>Region</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {demoWebsites.map((site) => (
                    <TableRow key={site.name}>
                      <TableCell className="font-medium">{site.name}</TableCell>
                      <TableCell>
                        <Badge variant={site.status === "Up" ? "success" : "destructive"}>
                          {site.status === "Up" ? (
                            <CheckCircle className="w-4 h-4 mr-2" />
                          ) : (
                            <XCircle className="w-4 h-4 mr-2" />
                          )}
                          {site.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {site.responseTime > 0 ? `${site.responseTime}ms` : "N/A"}
                      </TableCell>
                      <TableCell>{site.uptime}%</TableCell>
                      <TableCell>{site.lastCheck}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Globe className="w-4 h-4 mr-2 text-muted-foreground" />
                          {site.region}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="space-y-6">
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
                    <div key={index} className="flex items-center justify-between text-sm">
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
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        alert.severity === 'warning' ? 'bg-warning' :
                        alert.severity === 'success' ? 'bg-success' : 'bg-primary'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{alert.message}</p>
                        <p className="text-xs text-muted-foreground">{alert.service} • {alert.time}</p>
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

export default DemoDashboard;
