import React from 'react';
import { Card, CardContent } from './card';
import {
  Activity,
  Server,
  Globe,
  Clock,
  Signal,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import { Badge } from './badge';

const MetricsGrid = () => {
  const metrics = [
    {
      title: 'Global Uptime',
      value: '99.99%',
      trend: '+0.1%',
      status: 'success',
      icon: Globe,
      description: 'Last 30 days',
    },
    {
      title: 'Active Monitors',
      value: '156',
      trend: '+12',
      status: 'success',
      icon: Activity,
      description: 'Across 23 regions',
    },
    {
      title: 'Response Time',
      value: '187ms',
      trend: '-23ms',
      status: 'success',
      icon: Clock,
      description: 'Global average',
    },
    {
      title: 'Total Checks',
      value: '1.2M',
      trend: '+2.3K',
      status: 'default',
      icon: Signal,
      description: 'Last 24 hours',
    },
    {
      title: 'Healthy Services',
      value: '143',
      trend: '92%',
      status: 'success',
      icon: CheckCircle2,
      description: 'All endpoints',
    },
    {
      title: 'Degraded',
      value: '8',
      trend: '+2',
      status: 'warning',
      icon: AlertTriangle,
      description: 'Performance issues',
    },
    {
      title: 'Down',
      value: '5',
      trend: '-1',
      status: 'destructive',
      icon: XCircle,
      description: 'Critical alerts',
    },
    {
      title: 'Total Services',
      value: '156',
      trend: '+3',
      status: 'default',
      icon: Server,
      description: 'Monitored endpoints',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <Card key={index} className="bg-card/30 backdrop-blur-sm hover:bg-card/50 transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <metric.icon className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">{metric.title}</span>
              </div>
              <Badge variant={metric.status as any} className="text-xs">
                {metric.trend}
              </Badge>
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-bold tracking-tight">{metric.value}</h3>
              <p className="text-xs text-muted-foreground">{metric.description}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MetricsGrid;
