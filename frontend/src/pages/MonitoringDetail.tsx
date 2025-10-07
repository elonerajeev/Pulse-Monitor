import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/utils/api';
import Sidebar from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { ArrowLeft, CheckCircle, Bell, Pause, Edit, MoreVertical, AlertTriangle, Shield, Server, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface MonitoringLog {
  _id: string;
  status: string;
  statusCode?: number;
  responseTime: number;
  timings?: {
    dns: number;
    tcp: number;
    tls: number;
    firstByte: number;
    contentTransfer: number;
    total: number;
  };
  ssl?: {
    subject: any;
    issuer: any;
    valid_from: string;
    valid_to: string;
    daysUntilExpiry: number;
  };
  responseBody?: string;
  error?: {
    message: string;
    code?: string;
  };
  createdAt: string;
}

interface MonitoringService {
  _id: string;
  name: string;
  target: string;
  logs: MonitoringLog[];
  latestLog?: MonitoringLog;
}

const MonitoringDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [service, setService] = useState<MonitoringService | null>(null);

  useEffect(() => {
    const fetchService = async () => {
      const userStr = localStorage.getItem('user');
      if (!userStr) return;

      const user = JSON.parse(userStr);
      const token = user?.accessToken;
      if (!token) return;

      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/monitoring/${id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setService(data.data);
        } else {
          toast({ title: 'Error', description: 'Failed to fetch monitoring service details.', variant: 'destructive' });
        }
      } catch (error) {
        toast({ title: 'Error', description: 'An error occurred while fetching service details.', variant: 'destructive' });
      }
    };

    const interval = setInterval(fetchService, 5000); // Refresh every 5 seconds
    fetchService();

    return () => clearInterval(interval);
  }, [id, toast]);

  const chartData = service?.logs.map(log => ({
    time: new Date(log.createdAt).toLocaleTimeString(),
    ...log.timings
  })).reverse();

  if (!service) {
    return <div className="flex items-center justify-center h-screen"><div>Loading...</div></div>; // Or a proper skeleton loader
  }

  const lastCheck = service.latestLog ? new Date(service.latestLog.createdAt).toLocaleString() : 'N/A';
  const uptime = service.logs.length > 0 ? service.logs.filter(log => log.status === 'online').length / service.logs.length * 100 : 100;
  const latestLog = service.latestLog;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 p-8">
        <Link to="/monitoring" className="flex items-center text-sm text-muted-foreground mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Monitoring
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className={`w-12 h-12 rounded-full mr-4 flex items-center justify-center ${latestLog?.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`}>
              {latestLog?.status === 'online' ? <CheckCircle className="w-8 h-8 text-white" /> : <AlertTriangle className="w-8 h-8 text-white" />}
            </div>
            <div>
              <h1 className="text-3xl font-bold">{service.name}</h1>
              <p className="text-muted-foreground">{service.target}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button><Bell className="w-5 h-5" /></button>
            <button><Pause className="w-5 h-5" /></button>
            <button><Edit className="w-5 h-5" /></button>
            <button><MoreVertical className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Status</CardTitle>
              {latestLog?.status === 'online' ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertTriangle className="w-4 h-4 text-red-500" />}
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${latestLog?.status === 'online' ? 'text-green-500' : 'text-red-500'}`}>{latestLog?.status || 'Unknown'}</p>
              <p className="text-xs text-muted-foreground">Last check: {lastCheck}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Uptime (24h)</CardTitle>
                <span className="text-muted-foreground">{uptime.toFixed(2)}%</span>
            </CardHeader>
            <CardContent>
                <p className="text-2xl font-bold">{uptime.toFixed(2)}%</p>
                <p className="text-xs text-muted-foreground">Based on checks in the last 24 hours</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Response Time</CardTitle>
              <Server className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{latestLog?.responseTime.toFixed(0) || 0} ms</p>
              <p className="text-xs text-muted-foreground">Latest measurement</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">HTTP Status</CardTitle>
              <FileText className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{latestLog?.statusCode || 'N/A'}</p>
              <p className="text-xs text-muted-foreground">Latest response code</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Response Time Breakdown (ms)</CardTitle>
            <p className="text-sm text-muted-foreground">Detailed breakdown of the last recorded response time.</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="dns" stackId="1" stroke="#8884d8" fill="#8884d8" name="DNS" />
                <Area type="monotone" dataKey="tcp" stackId="1" stroke="#82ca9d" fill="#82ca9d" name="TCP Handshake" />
                <Area type="monotone" dataKey="tls" stackId="1" stroke="#ffc658" fill="#ffc658" name="TLS Handshake" />
                <Area type="monotone" dataKey="firstByte" stackId="1" stroke="#ff8042" fill="#ff8042" name="Time to First Byte" />
                <Area type="monotone" dataKey="contentTransfer" stackId="1" stroke="#00C49F" fill="#00C49F" name="Content Transfer" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center"><Shield className="w-5 h-5 mr-2" />SSL Certificate</CardTitle>
                </CardHeader>
                <CardContent>
                    {latestLog?.ssl ? (
                        <div>
                            <p><strong>Expires in:</strong> {latestLog.ssl.daysUntilExpiry} days</p>
                            <p><strong>Issued by:</strong> {latestLog.ssl.issuer.O}</p>
                            <p><strong>Common Name:</strong> {latestLog.ssl.subject.CN}</p>
                        </div>
                    ) : <p>No SSL certificate information available.</p>}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Response Body Snippet</CardTitle>
                </CardHeader>
                <CardContent>
                    <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
                        <code>{latestLog?.responseBody || 'No response body captured.'}</code>
                    </pre>
                </CardContent>
            </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Incidents</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Details</th>
                  <th className="text-left p-2">Started</th>
                </tr>
              </thead>
              <tbody>
                {service.logs.filter(log => log.status !== 'online').slice(0, 10).map(log => (
                  <tr key={log._id} className="border-b">
                    <td className="p-2"><Badge variant="destructive"><AlertTriangle className="w-4 h-4 mr-2" />{log.status}</Badge></td>
                    <td className="p-2">{log.error?.message || 'No details'}</td>
                    <td className="p-2">{new Date(log.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MonitoringDetail;
