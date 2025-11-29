import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/ui/navbar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Plus, TrendingUp, Monitor, Zap, RefreshCw, AlertTriangle, Globe as GlobeIcon, BarChart2 } from "lucide-react";
import RealTimeChart from "@/components/ui/real-time-chart";
import RealTimeTrafficChart from "@/components/ui/RealTimeTrafficChart";
import ServiceCard from '@/components/ui/ServiceCard';
import Globe from '@/components/ui/globe';
import SparklineChart from '@/components/ui/SparklineChart';
import UptimeHeatmap from '@/components/dashboard/UptimeHeatmap';
import IncidentsTable from '@/components/dashboard/IncidentsTable';
import { useAuth } from '@/hooks/useAuth';

const locationCoordinates: Record<string, { lat: number; lon: number }> = {
    'us-east': { lat: 38.9072, lon: -77.0369 },
    'us-west': { lat: 34.0522, lon: -118.2437 },
    'eu-west': { lat: 51.5074, lon: -0.1278 },
    'eu-central': { lat: 52.5200, lon: 13.4050 },
    'ap-south': { lat: 19.0760, lon: 72.8777 },
    'ap-southeast': { lat: 1.3521, lon: 103.8198 },
};

const dummyServices = [
  {
    _id: '1',
    name: 'Main Website',
    target: 'https://example.com',
    serviceType: 'https',
    location: 'us-east',
    latestLog: { status: 'online', createdAt: new Date().toISOString(), responseTime: 120, ssl: { daysUntilExpiry: 30 } },
    logs: Array.from({ length: 24 }, (_, i) => ({
      status: Math.random() > 0.1 ? 'online' : 'offline',
      createdAt: new Date(Date.now() - i * 60 * 60 * 1000).toISOString(),
      responseTime: 100 + Math.random() * 50,
    })),
    interval: 300,
  },
  {
    _id: '2',
    name: 'API Server',
    target: 'https://api.example.com',
    serviceType: 'https',
    location: 'eu-west',
    latestLog: { status: 'online', createdAt: new Date().toISOString(), responseTime: 80, ssl: { daysUntilExpiry: 60 } },
    logs: Array.from({ length: 24 }, (_, i) => ({
      status: 'online',
      createdAt: new Date(Date.now() - i * 60 * 60 * 1000).toISOString(),
      responseTime: 70 + Math.random() * 30,
    })),
    interval: 300,
  },
  {
    _id: '3',
    name: 'Database Service',
    target: 'db.example.com',
    serviceType: 'tcp',
    location: 'ap-south',
    latestLog: { status: 'offline', createdAt: new Date().toISOString(), responseTime: 0 },
    logs: Array.from({ length: 24 }, (_, i) => ({
      status: i < 3 ? 'offline' : 'online',
      createdAt: new Date(Date.now() - i * 60 * 60 * 1000).toISOString(),
      responseTime: i < 3 ? 0 : 50 + Math.random() * 20,
    })),
    interval: 600,
  },
];

const dummyTrafficData = Array.from({ length: 60 }, (_, i) => ({
  time: new Date(Date.now() - (60 - i) * 1000).toLocaleTimeString(),
  requests: Math.floor(Math.random() * 100),
}));

const DemoDashboard = () => {
  const { isAuthenticated } = useAuth();
  const [services] = useState(dummyServices);
  const [trafficData] = useState(dummyTrafficData);
  const [loading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [countdown, setCountdown] = useState(180);

  const globeLocations = services
    .map(service => {
        const locationName = service.location?.toLowerCase();
        if (locationName && locationCoordinates[locationName]) {
            return {
                ...locationCoordinates[locationName],
                city: service.location || 'Unknown',
                status: service.latestLog?.status === 'online' ? 'online' : (service.latestLog?.status === 'degraded' ? 'degraded' : 'offline')
            };
        }
        return null;
    })
    .filter(Boolean) as { lat: number; lon: number; city: string; status: 'online' | 'offline' | 'degraded' }[];

  const onlineServices = services.filter(s => s.latestLog?.status === 'online');
  const offlineServicesCount = services.length - onlineServices.length;

  const incidentsInLast24h = services.flatMap(s =>
    s.logs
      .filter(l => l.status === 'offline' && new Date(l.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000))
      .map(l => ({ ...l, serviceName: s.name, serviceInterval: s.interval }))
  );

  const allLogsForTable = useMemo(() => {
    return services.flatMap(service =>
        service.logs.map(log => ({
            ...log,
            message: `Service is ${log.status}`,
            monitor: {
                _id: service._id,
                name: service.name
            }
        }))
    );
  }, [services]);

  const totalIncidents = incidentsInLast24h.length;
  const totalDowntimeInMinutes = Math.round(incidentsInLast24h.reduce((acc, incident) => acc + incident.serviceInterval, 0) / 60);
    const mostFrequentCulprit = totalIncidents > 0 ? Object.entries(incidentsInLast24h.reduce((acc, { serviceName }) => {
    acc[serviceName] = (acc[serviceName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>)).sort(([, a], [, b]) => b - a)[0][0] : 'None';

  const avgResponseTime = onlineServices.length > 0
    ? Math.round(onlineServices.reduce((acc, s) => acc + (s.latestLog?.responseTime || 0), 0) / onlineServices.length)
    : 0;

  const uptimePercentage = services.length > 0 ? (onlineServices.length / services.length) * 100 : 100;
  const allSslOk = services.every(s => !s.target.startsWith('https') || (s.latestLog?.ssl && s.latestLog.ssl.daysUntilExpiry > 0));
  const monitoredLocationsCount = new Set(services.map(s => s.location).filter(Boolean)).size;

  const historicalData = useMemo(() => {
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    const hourlyData: { [key: string]: { times: number[], uptimes: number[] } } = {};

    for (const service of services) {
        for (const log of service.logs) {
            const logDate = new Date(log.createdAt);
            if (now - logDate.getTime() > twentyFourHours) continue;

            const hour = logDate.toISOString().slice(0, 13);
            if (!hourlyData[hour]) {
                hourlyData[hour] = { times: [], uptimes: [] };
            }
            hourlyData[hour].times.push(log.responseTime);
            hourlyData[hour].uptimes.push(log.status === 'online' ? 1 : 0);
        }
    }

    const formattedResponseData = Object.entries(hourlyData).map(([hour, data]) => ({
        time: hour,
        value: data.times.reduce((a, b) => a + b, 0) / data.times.length,
    })).sort((a, b) => a.time.localeCompare(b.time));

    const formattedUptimeData = Object.entries(hourlyData).map(([hour, data]) => ({
        time: hour,
        value: (data.uptimes.reduce((a, b) => a + b, 0) / data.uptimes.length) * 100,
    })).sort((a, b) => a.time.localeCompare(b.time));

    return { responseTime: formattedResponseData, uptime: formattedUptimeData };
  }, [services]);

  const uptimeHeatmapData = useMemo(() => {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const dailyData: { [key: string]: { online: number, total: number } } = {};

    for (const service of services) {
      for (const log of service.logs) {
        const logDate = new Date(log.createdAt);
        if (logDate < ninetyDaysAgo) continue;

        const day = logDate.toISOString().slice(0, 10);
        if (!dailyData[day]) {
          dailyData[day] = { online: 0, total: 0 };
        }
        dailyData[day].total++;
        if (log.status === 'online') {
          dailyData[day].online++;
        }
      }
    }

    const heatmapData = Array.from({ length: 90 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayString = date.toISOString().slice(0, 10);
      const data = dailyData[dayString];
      const uptime = data && data.total > 0 ? (data.online / data.total) * 100 : 0;
      return { date: dayString, uptime };
    }).reverse();

    return heatmapData;
  }, [services]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar isAuthenticated={isAuthenticated} />

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Demo Dashboard</h1>
            <p className="text-muted-foreground">
              This is a demo. The data is randomly generated.
            </p>
          </div>
          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            <Button
              variant="outline"
              disabled
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              {autoRefresh ? `Auto Refresh: ${countdown}s` : 'Enable Auto Refresh'}
            </Button>
            <Button
              variant="hero"
              disabled
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Monitor
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Uptime</CardTitle>
              <CheckCircle className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{uptimePercentage.toFixed(2)}%</div>
              <SparklineChart data={historicalData.uptime} color="#22c55e" />
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
              <Zap className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgResponseTime.toFixed(0)}ms</div>
              <SparklineChart data={historicalData.responseTime} color="#8884d8" />
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Monitors</CardTitle>
              <Monitor className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{services.length}</div>
              <p className="text-xs text-muted-foreground">{onlineServices.length} online, {offlineServicesCount} down</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Incidents (24h)</CardTitle>
              <AlertTriangle className="w-4 h-4 text-red-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{totalIncidents}</div>
                {totalIncidents > 0 ? (
                    <>
                        <p className="text-xs text-muted-foreground">
                            Total downtime: {totalDowntimeInMinutes} min
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                            Main culprit: {mostFrequentCulprit}
                        </p>
                    </>
                ) : (
                    <p className="text-xs text-muted-foreground">No incidents in the last 24 hours.</p>
                )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Daily Uptime (Last 90 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <UptimeHeatmap data={uptimeHeatmapData} />
              </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <GlobeIcon className="w-5 h-5 mr-2" />
                        Global Status
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[350px]">
                        <Globe locations={globeLocations} />
                    </div>
                </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Real-time Response Time (ms)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <RealTimeChart services={onlineServices} />
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
                  <RealTimeTrafficChart data={trafficData} />
                </div>
              </CardContent>
            </Card>
        </div>

        {services.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Incidents</CardTitle>
              </CardHeader>
              <CardContent>
                <IncidentsTable logs={allLogsForTable} />
              </CardContent>
            </Card>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-8">
            {services.map((service) => (
                <ServiceCard
                key={service._id}
                _id={service._id}
                name={service.name}
                status={service.latestLog?.status || 'unknown'}
                target={service.target}
                serviceType={service.serviceType}
                logs={service.logs}
                lastChecked={service.latestLog?.createdAt}
                sslDaysUntilExpiry={service.latestLog?.ssl?.daysUntilExpiry}
                onEdit={() => {}}
                onDelete={() => {}}
                onRefresh={() => {}}
                />
            ))}
        </div>
      </div>
    </div>
  );
};

export default DemoDashboard;
