import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function PerformanceMetrics() {
  const { serviceId } = useParams();
  const [timeRange, setTimeRange] = useState('24h');

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['performanceMetrics', serviceId],
    queryFn: () => api.getPerformanceMetrics(serviceId!),
    enabled: !!serviceId,
  });

  const { data: trends } = useQuery({
    queryKey: ['performanceTrends', serviceId, timeRange],
    queryFn: () => api.getPerformanceTrends(serviceId!, timeRange),
    enabled: !!serviceId,
  });

  const { data: anomalies } = useQuery({
    queryKey: ['performanceAnomalies', serviceId],
    queryFn: () => api.getPerformanceAnomalies(serviceId!),
    enabled: !!serviceId,
  });

  if (metricsLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const metricsData = metrics?.data || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Performance Metrics</h1>
        <p className="text-gray-500 mt-2">Real-time performance analytics and Core Web Vitals</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricsData.avgResponseTime || 'N/A'}ms</div>
            <p className="text-xs text-gray-500 mt-1">P95: {metricsData.p95ResponseTime}ms</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">FCP</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricsData.firstContentfulPaint || 'N/A'}ms</div>
            <p className="text-xs text-gray-500 mt-1">First Contentful Paint</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">LCP</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricsData.largestContentfulPaint || 'N/A'}ms</div>
            <p className="text-xs text-gray-500 mt-1">Largest Contentful Paint</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">CLS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricsData.cumulativeLayoutShift || 'N/A'}</div>
            <p className="text-xs text-gray-500 mt-1">Cumulative Layout Shift</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="trends" className="w-full">
        <TabsList>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Response Time Trend</CardTitle>
              <div className="flex gap-2 mt-2">
                {['1h', '24h', '7d', '30d'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1 rounded text-sm ${timeRange === range ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              {trends?.data && (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trends.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="avgResponseTime" stroke="#8884d8" />
                    <Line type="monotone" dataKey="p95ResponseTime" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="anomalies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detected Anomalies</CardTitle>
              <CardDescription>Automatic anomaly detection based on historical baselines</CardDescription>
            </CardHeader>
            <CardContent>
              {anomalies?.data && anomalies.data.length > 0 ? (
                <div className="space-y-3">
                  {anomalies.data.map((anomaly: any, idx: number) => (
                    <div key={idx} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{anomaly.type}</p>
                          <p className="text-sm text-gray-500">{new Date(anomaly.timestamp).toLocaleString()}</p>
                        </div>
                        <Badge variant={anomaly.severity === 'critical' ? 'destructive' : 'default'}>
                          {anomaly.severity}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No anomalies detected</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">SSL Certificate Status</p>
                  <p className="text-lg font-semibold">{metricsData.sslStatus || 'Valid'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Resource Count</p>
                  <p className="text-lg font-semibold">{metricsData.resourceCount || '0'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Bytes</p>
                  <p className="text-lg font-semibold">{Math.round((metricsData.totalBytes || 0) / 1024)} KB</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">JS Execution Time</p>
                  <p className="text-lg font-semibold">{metricsData.jsExecutionTime || 'N/A'}ms</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
