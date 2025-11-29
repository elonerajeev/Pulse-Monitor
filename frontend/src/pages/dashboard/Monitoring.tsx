
import { useEffect, useMemo, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, LineChart, Line } from 'recharts';
import api from '@/utils/api';
import { Activity, AlertTriangle, BadgePercent, Zap, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

// --- Types ---
interface MonitoringLog {
    _id: string;
    status: string;
    responseTime: number;
    createdAt: string;
    message: string;
    monitor: {
      _id: string;
      name: string;
    };
  }
  
  interface MonitoringService {
    _id: string;
    name: string;
    latestLog?: Omit<MonitoringLog, 'monitor'>;
    logs: Omit<MonitoringLog, 'monitor'>[];
  }

// --- StatCard Component ---
interface StatCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    description?: string;
}
const StatCard = ({ title, value, icon, description }: StatCardProps) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {icon}
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </CardContent>
    </Card>
);


// --- MonitorsStatus Component ---
interface MonitorsStatusProps {
  data: {
    online: number;
    offline: number;
    degraded: number;
  };
}
const STATUS_COLORS = {
  online: '#22c55e',
  offline: '#ef4444',
  degraded: '#f97316',
};
const MonitorsStatus = ({ data }: MonitorsStatusProps) => {
  const chartData = [
    { name: 'Online', value: data.online },
    { name: 'Offline', value: data.offline },
    { name: 'Degraded', value: data.degraded },
  ].filter(item => item.value > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monitors Status</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
        {chartData.length > 0 ? (
          <PieChart>
            <Pie data={chartData} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name.toLowerCase() as keyof typeof STATUS_COLORS]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `${value} services`} />
            <Legend />
          </PieChart>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
                No services to display.
            </div>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// --- IncidentsByType Component ---
interface IncidentsByTypeProps {
  data: {
    [key: string]: number;
  };
}
const IncidentsByType = ({ data }: IncidentsByTypeProps) => {
  const chartData = Object.entries(data).map(([name, count]) => ({ name, count }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Incidents by Type</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
            {chartData.length > 0 ? (
              <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                    No incidents reported in the last 24 hours.
                </div>
            )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// --- ResponseTimeChart Component ---
interface ResponseTimeChartProps {
    data: { time: string; "Response Time (ms)": number }[];
}
const ResponseTimeChart = ({ data }: ResponseTimeChartProps) => (
    <Card className="col-span-1 md:col-span-2 lg:col-span-3">
        <CardHeader>
            <CardTitle>Average Response Time (Last 24h)</CardTitle>
        </CardHeader>
        <CardContent>
            <ResponsiveContainer width="100%" height={300}>
                {data.length > 0 ? (
                    <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <XAxis dataKey="time" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
                        <Legend />
                        <Line type="monotone" dataKey="Response Time (ms)" stroke="#8884d8" strokeWidth={2} dot={false} />
                    </LineChart>
                ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        No response time data available.
                    </div>
                )}
            </ResponsiveContainer>
        </CardContent>
    </Card>
);

// --- RecentLogsTable Component ---
interface RecentLogsTableProps {
    logs: MonitoringLog[];
}
const RecentLogsTable = ({ logs }: RecentLogsTableProps) => (
    <Card className="col-span-1 md:col-span-2 lg:col-span-3">
        <CardHeader>
            <CardTitle>Recent Logs</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="relative w-full overflow-auto h-64">
                <table className="w-full caption-bottom text-sm">
                    <thead className="[&_tr]:border-b">
                        <tr className="border-b transition-colors hover:bg-muted/50">
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Service</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Message</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Time</th>
                        </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                        {logs.length > 0 ? logs.map(log => (
                            <tr key={log._id} className="border-b transition-colors hover:bg-muted/50">
                                <td className="p-4 align-middle font-medium">{log.monitor.name}</td>
                                <td className={`p-4 align-middle font-semibold ${log.status === 'online' ? 'text-green-500' : 'text-red-500'}`}>{log.status}</td>
                                <td className="p-4 align-middle text-muted-foreground">{log.message}</td>
                                <td className="p-4 align-middle text-muted-foreground">{new Date(log.createdAt).toLocaleString()}</td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={4} className="p-4 text-center text-muted-foreground">No recent logs found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </CardContent>
    </Card>
);


// --- Monitoring Page ---
const Monitoring = () => {
    const [services, setServices] = useState<MonitoringService[]>([]);
    const [loading, setLoading] = useState(true);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [countdown, setCountdown] = useState(30);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/monitoring');
            setServices(response.data.data);
        } catch (error) {
            console.error('Failed to fetch monitoring data', error);
        } finally {
            setLoading(false);
            setCountdown(30);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        let intervalId: NodeJS.Timeout;
        if (autoRefresh) {
            intervalId = setInterval(() => {
                setCountdown(prevCountdown => {
                    if (prevCountdown <= 1) {
                        fetchData();
                        return 30; // Reset countdown
                    }
                    return prevCountdown - 1;
                });
            }, 1000);
        }
        return () => clearInterval(intervalId);
    }, [autoRefresh, fetchData]);

    const toggleAutoRefresh = () => {
        setAutoRefresh(prev => !prev);
        if (!autoRefresh) {
            setCountdown(30);
        }
    };

  const monitoringData = useMemo(() => {
    if (!services || services.length === 0) return null;

    let onlineCount = 0;
    let offlineCount = 0;
    let degradedCount = 0;
    let totalResponseTime = 0;
    let onlineServicesForAvg = 0;
    
    const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;
    const hourlyData: { [key: string]: { times: number[] } } = {};
    const incidentsByType: { [key: string]: number } = {};
    let allLogs: MonitoringLog[] = [];

    services.forEach(service => {
        // Use latestLog for current status
        const currentStatus = service.latestLog?.status || 'unknown';
        if (currentStatus === 'online') {
            onlineCount++;
            totalResponseTime += service.latestLog?.responseTime || 0;
            onlineServicesForAvg++;
        } else if (currentStatus === 'offline') {
            offlineCount++;
        } else if (currentStatus === 'degraded') {
            degradedCount++;
        }

        // Process all logs for historical data
        service.logs.forEach(log => {
            const fullLog: MonitoringLog = {...log, monitor: { _id: service._id, name: service.name }};
            allLogs.push(fullLog);
            
            const logTime = new Date(log.createdAt).getTime();

            if (logTime > twentyFourHoursAgo) {
                // Incident calculation
                if(log.status !== 'online' && log.status !== 'pending') {
                    const type = log.message || 'Unknown';
                    incidentsByType[type] = (incidentsByType[type] || 0) + 1;
                }
                
                // Response time history
                const hour = new Date(log.createdAt).toISOString().slice(0, 13);
                if (!hourlyData[hour]) hourlyData[hour] = { times: [] };
                hourlyData[hour].times.push(log.responseTime);
            }
        });
    });

    const uptimePercentage = services.length > 0 ? (onlineCount / services.length) * 100 : 100;
    const avgResponseTime = onlineServicesForAvg > 0 ? Math.round(totalResponseTime / onlineServicesForAvg) : 0;
    const totalIncidents = Object.values(incidentsByType).reduce((acc, count) => acc + count, 0);

    const responseTimeHistory = Object.entries(hourlyData).map(([hour, data]) => ({
        time: new Date(hour).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'}),
        "Response Time (ms)": data.times.length > 0 ? Math.round(data.times.reduce((a, b) => a + b, 0) / data.times.length) : 0,
    })).sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

    // Sort all logs and get the most recent 10 for the table
    const recentLogs = allLogs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10);

    return {
        status: { online: onlineCount, offline: offlineCount, degraded: degradedCount },
        incidentsByType,
        uptimePercentage,
        avgResponseTime,
        totalIncidents,
        responseTimeHistory,
        recentLogs,
    };
  }, [services]);

  if (loading && services.length === 0) {
    return <div className="flex justify-center items-center h-64"><p>Loading monitoring data...</p></div>;
  }

  if (!monitoringData) {
    return (
        <div className="space-y-4">
            <h1 className="text-3xl font-bold">Monitoring</h1>
            <Card>
                <CardHeader><CardTitle>Welcome!</CardTitle></CardHeader>
                <CardContent><p>No monitoring data available. Please add a service to begin monitoring.</p></CardContent>
            </Card>
        </div>
    );
  }

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Monitoring</h1>
            <div className="flex items-center space-x-4">
                <Button variant="outline" onClick={fetchData} disabled={loading}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
                <Button variant={autoRefresh ? "secondary" : "outline"} onClick={toggleAutoRefresh}>
                    {autoRefresh ? `Auto Refresh: ${countdown}s` : 'Enable Auto Refresh'}
                </Button>
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard title="Overall Uptime" value={`${monitoringData.uptimePercentage.toFixed(2)}%`} icon={<BadgePercent className="h-4 w-4 text-muted-foreground" />} description="Based on current status" />
            <StatCard title="Avg. Response Time" value={`${monitoringData.avgResponseTime}ms`} icon={<Zap className="h-4 w-4 text-muted-foreground" />} description="From online services"/>
            <StatCard title="Total Incidents" value={`${monitoringData.totalIncidents}`} icon={<AlertTriangle className="h-4 w-4 text-muted-foreground" />} description="(Last 24 hours)"/>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <MonitorsStatus data={monitoringData.status} />
            <IncidentsByType data={monitoringData.incidentsByType} />
        </div>
        <div className="grid grid-cols-1 gap-4">
            <ResponseTimeChart data={monitoringData.responseTimeHistory} />
            <RecentLogsTable logs={monitoringData.recentLogs} />
        </div>
    </div>
  );
};

export default Monitoring;
