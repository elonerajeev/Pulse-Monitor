import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, CheckCircle2, TrendingDown } from 'lucide-react';

export default function SLAManagement() {
  const { serviceId } = useParams();

  const { data: slaConfig, isLoading } = useQuery({
    queryKey: ['slaConfig', serviceId],
    queryFn: () => api.getSLAConfiguration(serviceId!),
    enabled: !!serviceId,
  });

  const { data: slaMetrics } = useQuery({
    queryKey: ['slaMetrics', serviceId],
    queryFn: () => api.getSLAMetrics(serviceId!),
    enabled: !!serviceId,
  });

  const { data: slaHistory } = useQuery({
    queryKey: ['slaHistory', serviceId],
    queryFn: () => api.getSLAHistory(serviceId!),
    enabled: !!serviceId,
  });

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  const config = slaConfig?.data || {};
  const metrics = slaMetrics?.data || {};
  const history = slaHistory?.data?.history || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">SLA Management</h1>
        <p className="text-gray-500 mt-2">Service level agreements and compliance tracking</p>
      </div>

      {/* Targets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Uptime Target</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{config.targets?.uptime}%</div>
            <p className="text-xs text-gray-500 mt-1">Current: {metrics.currentMetrics?.uptime?.toFixed(2)}%</p>
            <Badge 
              variant={metrics.breaches?.uptime ? 'destructive' : 'default'}
              className="mt-2"
            >
              {metrics.breaches?.uptime ? 'Breached' : 'On Track'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{config.targets?.responseTime}ms</div>
            <p className="text-xs text-gray-500 mt-1">Current: {metrics.currentMetrics?.avgResponseTime}ms</p>
            <Badge 
              variant={metrics.breaches?.responseTime ? 'destructive' : 'default'}
              className="mt-2"
            >
              {metrics.breaches?.responseTime ? 'Breached' : 'On Track'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{config.targets?.errorRate}%</div>
            <p className="text-xs text-gray-500 mt-1">Current: {metrics.currentMetrics?.errorRate?.toFixed(2)}%</p>
            <Badge 
              variant={metrics.breaches?.errorRate ? 'destructive' : 'default'}
              className="mt-2"
            >
              {metrics.breaches?.errorRate ? 'Breached' : 'On Track'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Credits */}
      <Card>
        <CardHeader>
          <CardTitle>Credit Management</CardTitle>
          <CardDescription>Monthly credits allocation and usage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Credits Remaining</span>
                <span className="text-sm font-semibold">{metrics.creditsRemaining}/{config.credits?.monthlyAllocation}</span>
              </div>
              <Progress 
                value={(metrics.creditsRemaining / config.credits?.monthlyAllocation) * 100 || 0}
                className="h-2"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-600">Credits Used</p>
                <p className="text-lg font-semibold">{metrics.creditsUsed}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Credits Earned</p>
                <p className="text-lg font-semibold text-red-600">{metrics.creditsEarned}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Breach History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Breaches</CardTitle>
          <CardDescription>SLA violations in the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          {history.length > 0 ? (
            <div className="space-y-3">
              {history.map((breach: any, idx: number) => (
                <div key={idx} className="flex items-start gap-3 p-3 border rounded">
                  <AlertCircle className="w-4 h-4 mt-1 text-red-600 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium capitalize">{breach.type}</p>
                    <p className="text-xs text-gray-500">{breach.details}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(breach.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant="outline">{breach.severity}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-gray-500">No SLA breaches</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
