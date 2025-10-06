
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/ui/navbar';
import { useToast } from '@/hooks/use-toast';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, XCircle, Zap, Globe, TrendingUp, Monitor, AlertTriangle, Bell, Plus } from "lucide-react";
import RealTimeChart from "@/components/ui/real-time-chart";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { API_BASE_URL } from '@/utils/api';

interface MonitoringService {
  _id: string;
  name: string;
  target: string;
  serviceType: string;
  status: string;
}

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

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [services, setServices] = useState<MonitoringService[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated') === 'true';
    setIsAuthenticated(authStatus);

    if (!authStatus) {
      toast({ title: 'Error', description: 'You must be logged in to view the dashboard.', variant: 'destructive' });
      navigate('/login');
      return;
    }

    const fetchServices = async () => {
      const userStr = localStorage.getItem('user');
      if (!userStr) return;

      const user = JSON.parse(userStr);
      const token = user?.accessToken;
      if (!token) return;

      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/monitoring`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setServices(data.data);
        } else {
          toast({ title: 'Error', description: 'Failed to fetch monitoring services.', variant: 'destructive' });
        }
      } catch (error) {
        toast({ title: 'Error', description: 'An error occurred while fetching services.', variant: 'destructive' });
      }
    };

    fetchServices();
  }, [navigate, toast]);

  const handleAddMonitor = () => {
    navigate('/monitoring/add');
  };

  const onlineServices = services.filter(s => s.status === 'online').length;
  const offlineServices = services.length - onlineServices;

  return (
    <div className="min-h-screen bg-background">
      <Navbar isAuthenticated={isAuthenticated} />

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">
              {services.length > 0
                ? `You are monitoring ${services.length} service(s).`
                : "This is your monitoring dashboard. Add a service to begin."}
            </p>
          </div>
          <Button
            variant="hero"
            className="mt-4 lg:mt-0"
            onClick={handleAddMonitor}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Monitor
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Uptime</CardTitle>
              <CheckCircle className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">99.85%</div>
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
              <div className="text-2xl font-bold">{services.length}</div>
              <p className="text-xs text-muted-foreground">{onlineServices} online, {offlineServices} down</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Incidents</CardTitle>
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
              <p className="text-xs text-muted-foreground">In the last 24 hours</p>
            </CardContent>
          </Card>
        </div>

        {services.length > 0 ? (
          <>
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
                        <TableHead>Target</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Type</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {services.map((service) => (
                        <TableRow key={service._id}>
                          <TableCell className="font-medium">{service.name}</TableCell>
                          <TableCell>{service.target}</TableCell>
                          <TableCell>
                            <Badge variant={service.status === "online" ? "success" : "destructive"}>
                              {service.status === "online" ? (
                                <CheckCircle className="w-4 h-4 mr-2" />
                              ) : (
                                <XCircle className="w-4 h-4 mr-2" />
                              )}
                              {service.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{service.serviceType}</TableCell>
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
                            alert.severity === 'warning' ? 'bg-yellow-500' :
                            alert.severity === 'success' ? 'bg-green-500' : 'bg-blue-500'
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
          </>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">
                <p>You are not monitoring any services yet.</p>
                <p>Click the "Add New Monitor" button to get started.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
