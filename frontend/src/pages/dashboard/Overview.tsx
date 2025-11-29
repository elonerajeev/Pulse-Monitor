
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { CheckCircle, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';
import api from '../../utils/api';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '@/components/ui/button';

const UptimeBar = ({ status, date }: { status: 'up' | 'down' | 'degraded' | 'nodata', date: string }) => {
  const colorMap = {
    up: 'bg-green-500',
    degraded: 'bg-yellow-500',
    down: 'bg-red-500',
    nodata: 'bg-gray-700',
  };
  return (
    <div className="group relative">
      <div className={`w-2.5 h-12 rounded-sm ${colorMap[status]}`} />
      <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
        {date}: {status.charAt(0).toUpperCase() + status.slice(1)}
      </div>
    </div>
  );
};

const Overview: React.FC = () => {
  const [services, setServices] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [countdown, setCountdown] = useState(60);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const servicesRes = await api.get('/monitoring');
      const userServices = servicesRes.data.data || [];
      setServices(userServices);

      const incidentsRes = await api.get('/monitoring/logs/recent?limit=100');
      const allIncidents = incidentsRes.data.data || [];

      const userServiceIds = new Set(userServices.map(s => s._id));
      const userIncidents = allIncidents.filter(incident => incident.monitor && userServiceIds.has(incident.monitor._id));
      
      setIncidents(userIncidents.slice(0, 10));

    } catch (error) {
      console.error('Error fetching overview data:', error);
    } finally {
      setLoading(false);
      setCountdown(60);
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
            return 60;
          }
          return prevCountdown - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [autoRefresh, fetchData]);

  const toggleAutoRefresh = () => {
    setAutoRefresh(prev => !prev);
  };

  const { overallStatus, uptime90Days, avgResponseTime, statusCounts } = useMemo(() => {
    if (services.length === 0) {
      return { 
        overallStatus: 'All Systems Operational', 
        uptime90Days: 100, 
        avgResponseTime: 0, 
        statusCounts: { up: 0, degraded: 0, down: 0 }
      };
    }

    const statusCounts = { up: 0, degraded: 0, down: 0 };
    let totalResponseTime = 0;
    let servicesWithResponseTime = 0;

    services.forEach(service => {
        const latestLog = service.latestLog || (service.logs && service.logs.length > 0 ? service.logs[0] : null);
        const latestStatus = latestLog?.status;

        if (latestStatus === 'online') {
            statusCounts.up++;
            if(latestLog?.responseTime) {
                totalResponseTime += latestLog.responseTime;
                servicesWithResponseTime++;
            }
        } else if (latestStatus === 'degraded') {
            statusCounts.degraded++;
        } else { // Catches 'offline', 'pending', or unknown
            statusCounts.down++;
        }
    });
    
    const overall = statusCounts.down > 0 ? 'Major Outage' : statusCounts.degraded > 0 ? 'Partial Outage' : 'All Systems Operational';
    const avgResponse = servicesWithResponseTime > 0 ? Math.round(totalResponseTime / servicesWithResponseTime) : 0;
    const uptime = services.length > 0 ? (statusCounts.up / services.length) * 100 : 100;

    return { overallStatus: overall, uptime90Days: uptime, avgResponseTime: avgResponse, statusCounts };
  }, [services]);

    const groupedIncidents = useMemo(() => {
        return incidents.reduce((acc, incident) => {
        const date = new Date(incident.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(incident);
        return acc;
        }, {} as { [key: string]: any[] });
    }, [incidents]);

  const get90DayUptimeHistory = (serviceLogs: any[]) => {
    const history: { status: 'up' | 'down' | 'degraded' | 'nodata', date: string }[] = [];
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setHours(0, 0, 0, 0);
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 89);

    const dailyStatus: Map<string, 'up' | 'down' | 'degraded'> = new Map();

    if (serviceLogs) {
        for (const log of serviceLogs) {
            const logDate = new Date(log.createdAt);
            if (logDate < ninetyDaysAgo) continue;

            const dayString = logDate.toISOString().slice(0, 10);
            const logStatus = log.status === 'online' ? 'up' : (log.status === 'offline' || log.status === 'pending') ? 'down' : 'degraded';

            const currentWorst = dailyStatus.get(dayString);
            if (logStatus === 'down' || (logStatus === 'degraded' && currentWorst !== 'down') || (logStatus === 'up' && !currentWorst)) {
                dailyStatus.set(dayString, logStatus);
            }
        }
    }

    for (let i = 0; i < 90; i++) {
        const date = new Date(ninetyDaysAgo);
        date.setDate(date.getDate() + i);
        const dayString = date.toISOString().slice(0, 10);
        history.push({ status: dailyStatus.get(dayString) || 'nodata', date: dayString });
    }
    return history;
  };
  
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'All Systems Operational': return 'bg-green-900/50 text-green-300';
      case 'Major Outage': return 'bg-red-900/50 text-red-300';
      case 'Partial Outage': return 'bg-yellow-900/50 text-yellow-300';
      default: return 'bg-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
        case 'All Systems Operational': return <CheckCircle className="w-5 h-5 mr-3 text-green-400" />;
        case 'Major Outage': return <XCircle className="w-5 h-5 mr-3 text-red-400" />;
        case 'Partial Outage': return <AlertTriangle className="w-5 h-5 mr-3 text-yellow-400" />;
        default: return null;
      }
  };

  const getServiceBadge = (service: any) => {
    const latestLog = service.latestLog || (service.logs && service.logs.length > 0 ? service.logs[0] : null);
    const status = latestLog?.status;

    if (status === 'online') {
      return <Badge className="bg-green-500">Online</Badge>;
    }
    if (status === 'degraded') {
      return <Badge className="bg-yellow-500">Degraded</Badge>;
    }
    return <Badge className="bg-red-500">Offline</Badge>;
  };

  return (
    <div className="p-4 md:p-8 bg-background text-foreground min-h-screen">
      <header className="mb-8">
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-4">
            <h1 className="text-3xl font-bold">System Status</h1>
            <div className="flex items-center space-x-2 mt-4 md:mt-0">
                <Button variant="outline" onClick={() => fetchData()} disabled={loading}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
                <Button variant={autoRefresh ? "secondary" : "outline"} onClick={toggleAutoRefresh}>
                    {autoRefresh ? `Auto Refresh: ${countdown}s` : 'Enable Auto Refresh'}
                </Button>
            </div>
        </div>
        <div className={`p-4 rounded-lg flex items-center ${getStatusClass(overallStatus)}`}>
          {getStatusIcon(overallStatus)}
          <p className="font-semibold">{overallStatus}</p>
        </div>
      </header>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card>
            <CardHeader><CardTitle>Overall Uptime (90d)</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold">{uptime90Days.toFixed(2)}%</p></CardContent>
        </Card>
        <Card>
            <CardHeader><CardTitle>Avg. Response Time</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold">{avgResponseTime}ms</p></CardContent>
        </Card>
        <Card>
            <CardHeader><CardTitle>Services Status</CardTitle></CardHeader>
            <CardContent className="flex justify-around items-center">
                <div className="text-center"><p className="text-2xl font-bold">{statusCounts.up}</p><p className="text-sm text-green-500">Online</p></div>
                <div className="text-center"><p className="text-2xl font-bold">{statusCounts.degraded}</p><p className="text-sm text-yellow-500">Degraded</p></div>
                <div className="text-center"><p className="text-2xl font-bold">{statusCounts.down}</p><p className="text-sm text-red-500">Offline</p></div>
            </CardContent>
        </Card>
    </div>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Services</h2>
        <div className="space-y-8">
        {services.map((service) => (
          <div key={service._id} className="overflow-hidden">
            <div className="flex justify-between items-center mb-3">
              <span className="font-semibold text-lg">{service.name}</span>
              {getServiceBadge(service)}
            </div>
            <div className="flex space-x-1">
              {get90DayUptimeHistory(service.logs).map((day, index) => (
                <UptimeBar key={index} status={day.status} date={day.date} />
              ))}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>90 days ago</span>
              <span>Today</span>
            </div>
          </div>
        ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6">Past Incidents</h2>
        <div className="space-y-8">
          {incidents.length > 0 ? (
            Object.entries(groupedIncidents).map(([date, incidentsOnDate]) => (
              <div key={date}>
                <h3 className="text-lg font-semibold mb-3 border-b border-border pb-2">{date}</h3>
                <div className="space-y-4 pt-4">
                  {(incidentsOnDate as any[]).map(incident => (
                    <div key={incident._id} className="pl-4">
                      <p className="font-medium">
                        {incident.monitor?.name}: <span className={incident.status === 'online' ? 'text-green-400' : 'text-red-400'}>{incident.status}</span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(incident.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-gray-700 rounded-lg">
              <p>No incidents reported in the last 24 hours.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Overview;
