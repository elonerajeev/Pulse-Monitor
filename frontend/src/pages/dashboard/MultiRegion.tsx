import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Zap } from 'lucide-react';

export default function MultiRegion() {
  const { serviceId } = useParams();

  const { data: regionalHealth, isLoading } = useQuery({
    queryKey: ['regionalHealth', serviceId],
    queryFn: () => api.getRegionalHealth(serviceId!),
    enabled: !!serviceId,
  });

  const { data: performance } = useQuery({
    queryKey: ['regionalPerformance', serviceId],
    queryFn: () => api.getRegionalPerformance(serviceId!),
    enabled: !!serviceId,
  });

  const { data: failoverHistory } = useQuery({
    queryKey: ['failoverHistory', serviceId],
    queryFn: () => api.getFailoverHistory(serviceId!),
    enabled: !!serviceId,
  });

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  const health = regionalHealth?.data?.overallHealth || {};
  const regions = regionalHealth?.data?.regionalStats || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Multi-Region Monitoring</h1>
        <p className="text-gray-500 mt-2">Global availability and failover management</p>
      </div>

      {/* Overall Health */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Health Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{health.healthPercentage?.toFixed(1)}%</div>
            <p className="text-xs text-gray-500">
              {health.healthyRegions}/{health.totalRegions} regions healthy
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Regions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{health.healthyRegions}</div>
            <p className="text-xs text-gray-500">{health.failedRegions} region(s) down</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Primary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{health.primaryRegion || 'N/A'}</div>
            <p className="text-xs text-gray-500">Active failover region</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Failover</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={health.failoverEnabled ? 'default' : 'secondary'}>
              {health.failoverEnabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Regional Status */}
      <Card>
        <CardHeader>
          <CardTitle>Regional Status</CardTitle>
          <CardDescription>Performance and uptime per region</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {regions.map((region: any) => (
              <div key={region.name} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span className="font-medium">{region.name}</span>
                  </div>
                  <Badge
                    variant={region.status === 'healthy' ? 'default' : 'destructive'}
                  >
                    {region.status}
                  </Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-600">Uptime: <span className="font-semibold">{region.uptime?.toFixed(2)}%</span></p>
                  <p className="text-gray-600">Response: <span className="font-semibold">{region.averageResponseTime}ms</span></p>
                  <p className="text-gray-600">Failure Rate: <span className="font-semibold">{region.failureRate?.toFixed(2)}%</span></p>
                  <p className="text-gray-600">Alerts: <span className="font-semibold text-red-600">{region.activeAlerts}</span></p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Failover History */}
      <Card>
        <CardHeader>
          <CardTitle>Failover History</CardTitle>
          <CardDescription>Recent failover events</CardDescription>
        </CardHeader>
        <CardContent>
          {failoverHistory?.data?.history && failoverHistory.data.history.length > 0 ? (
            <div className="space-y-3">
              {failoverHistory.data.history.map((event: any, idx: number) => (
                <div key={idx} className="flex items-center gap-3 p-3 border rounded">
                  <Zap className="w-4 h-4 text-yellow-600" />
                  <div className="flex-1">
                    <p className="font-medium">{event.from} → {event.to}</p>
                    <p className="text-xs text-gray-500">{event.reason}</p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(event.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No failover events recorded</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
