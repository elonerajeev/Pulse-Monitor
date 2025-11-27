
import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, LineChart, Line } from 'recharts';
import api from '@/utils/api';
import { Activity, AlertTriangle, BadgePercent, Zap } from 'lucide-react';

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
          <PieChart>
            <Pie data={chartData} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name.toLowerCase() as keyof typeof STATUS_COLORS]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `${value} services`} />
            <Legend />
          </PieChart>
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
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
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
                        <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none' }} />
                        <Legend />
                        <Line type="monotone" dataKey="Response Time (ms)" stroke="#8884d8" strokeWidth={2} dot={false} />
                    </LineChart>
                ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        No response time data available for the last 24 hours.
                    </div>
                )}
            </ResponsiveContainer>
        </CardContent>
    </Card>
);

// --- IncidentsTable Component ---
interface IncidentsTableProps {
    logs: MonitoringLog[];
}
const IncidentsTable = ({ logs }: IncidentsTableProps) => (
    <Card className="col-span-1 md:col-span-2 lg:col-span-3">
        <CardHeader>
            <CardTitle>Recent Incidents</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="relative w-full overflow-auto h-48">
                <table className="w-full caption-bottom text-sm">
                    <thead className="[&_tr]:border-b">
                        <tr className="border-b transition-colors hover:bg-muted/50">
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Service</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Message</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Time</th>
                        </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                        {logs.length > 0 ? logs.slice(0, 3).map(log => (
                            <tr key={log._id} className="border-b transition-colors hover:bg-muted/50">
                                <td className="p-4 align-middle font-medium">{log.monitor.name}</td>
                                <td className="p-4 align-middle text-muted-foreground">{log.message}</td>
                                <td className="p-4 align-middle text-muted-foreground">{new Date(log.createdAt).toLocaleString()}</td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={3} className="p-4 text-center text-muted-foreground">No incidents in the last 24 hours.</td>
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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await api.get('/monitoring');
        setServices(response.data.data);
      } catch (error) {
        console.error('Failed to fetch monitoring data', error);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const monitoringData = useMemo(() => {
    if (!services) return null;

    let onlineCount = 0;
    let offlineCount = 0;
    let degradedCount = 0;
    let totalResponseTime = 0;
    let onlineServicesForAvg = 0;
    
    const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;
    const hourlyData: { [key: string]: { times: number[] } } = {};
    const incidentLogs: MonitoringLog[] = [];
    const incidentsByType: { [key: string]: number } = {};

    services.forEach(service => {
        const latestLog = service.logs[0];
        if (latestLog) {
            if(latestLog.status === 'online') {
                onlineCount++;
                totalResponseTime += latestLog.responseTime;
                onlineServicesForAvg++;
            } else if (latestLog.status === 'offline') offlineCount++;
            else if (latestLog.status === 'degraded') degradedCount++;
        }

        service.logs.forEach(log => {
            const logTime = new Date(log.createdAt).getTime();
            const fullLog = {...log, monitor: { _id: service._id, name: service.name }};
            if (logTime > twentyFourHoursAgo) {
                if(log.status !== 'online') {
                    incidentLogs.push(fullLog);
                    const type = log.message || 'Unknown';
                    incidentsByType[type] = (incidentsByType[type] || 0) + 1;
                }
                const hour = new Date(log.createdAt).toISOString().slice(0, 13);
                if (!hourlyData[hour]) hourlyData[hour] = { times: [] };
                hourlyData[hour].times.push(log.responseTime);
            }
        });
    });

    const uptimePercentage = services.length > 0 ? (onlineCount / services.length) * 100 : 100;
    const avgResponseTime = onlineServicesForAvg > 0 ? Math.round(totalResponseTime / onlineServicesForAvg) : 0;
    const responseTimeHistory = Object.entries(hourlyData).map(([hour, data]) => ({
        time: new Date(hour).toLocaleTimeString([], { hour: '2-digit'}),
        "Response Time (ms)": Math.round(data.times.reduce((a, b) => a + b, 0) / data.times.length),
    })).sort((a, b) => a.time.localeCompare(b.time));

    incidentLogs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return {
        status: { online: onlineCount, offline: offlineCount, degraded: degradedCount },
        incidentsByType,
        uptimePercentage,
        avgResponseTime,
        totalIncidents: incidentLogs.length,
        responseTimeHistory,
        incidentLogs,
    };
  }, [services]);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (!monitoringData) {
    return (
        <div className="space-y-4">
            <h1 className="text-3xl font-bold">Monitoring</h1>
            <Card>
                <CardHeader><CardTitle>Welcome!</CardTitle></CardHeader>
                <CardContent><p>No monitoring data available yet. Please add a service to begin monitoring.</p></CardContent>
            </Card>
        </div>
    );
  }

  return (
    <div className="space-y-6">
        <h1 className="text-3xl font-bold">Monitoring</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard title="Overall Uptime" value={`${monitoringData.uptimePercentage.toFixed(2)}%`} icon={<BadgePercent className="h-4 w-4 text-muted-foreground" />} description="(Last 24 hours)" />
            <StatCard title="Avg. Response Time" value={`${monitoringData.avgResponseTime}ms`} icon={<Zap className="h-4 w-4 text-muted-foreground" />} description="(Latest from online services)"/>
            <StatCard title="Total Incidents" value={`${monitoringData.totalIncidents}`} icon={<AlertTriangle className="h-4 w-4 text-muted-foreground" />} description="(Last 24 hours)"/>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <MonitorsStatus data={monitoringData.status} />
            <IncidentsByType data={monitoringData.incidentsByType} />
        </div>
        <div className="grid grid-cols-1 gap-4">
            <ResponseTimeChart data={monitoringData.responseTimeHistory} />
            <IncidentsTable logs={monitoringData.incidentLogs} />
        </div>
    </div>
  );
};

export default Monitoring;
