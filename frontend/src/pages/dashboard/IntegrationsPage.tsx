import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Zap, CheckCircle2, AlertCircle } from 'lucide-react';

export default function IntegrationsPage() {
  const integrations = [
    { name: 'Slack', status: 'connected', events: 'All', lastSync: '2 min ago' },
    { name: 'PagerDuty', status: 'connected', events: 'Incidents', lastSync: '1 hour ago' },
    { name: 'Datadog', status: 'error', events: 'Metrics', lastSync: 'Failed' },
    { name: 'Teams', status: 'connected', events: 'Alerts', lastSync: '5 min ago' },
  ];

  const available = [
    { name: 'Slack', category: 'Communication', icon: '#' },
    { name: 'Microsoft Teams', category: 'Communication', icon: '#' },
    { name: 'Discord', category: 'Communication', icon: '#' },
    { name: 'Telegram', category: 'Communication', icon: '#' },
    { name: 'PagerDuty', category: 'Incident Management', icon: '#' },
    { name: 'Opsgenie', category: 'Incident Management', icon: '#' },
    { name: 'Datadog', category: 'Monitoring', icon: '#' },
    { name: 'New Relic', category: 'Monitoring', icon: '#' },
    { name: 'Splunk', category: 'Analytics', icon: '#' },
    { name: 'Elastic', category: 'Analytics', icon: '#' },
    { name: 'Grafana', category: 'Visualization', icon: '#' },
    { name: 'Custom', category: 'Custom Integration', icon: '#' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
          <p className="text-gray-500 mt-2">Connect to third-party services and tools</p>
        </div>
        <Button>+ Add Integration</Button>
      </div>

      {/* Connected Integrations */}
      <Card>
        <CardHeader>
          <CardTitle>Connected Integrations</CardTitle>
          <CardDescription>Currently active integrations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {integrations.map((integration, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {integration.status === 'connected' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  )}
                  <div>
                    <p className="font-medium">{integration.name}</p>
                    <p className="text-xs text-gray-500">{integration.events} events • Last sync: {integration.lastSync}</p>
                  </div>
                </div>
                <Badge variant={integration.status === 'connected' ? 'default' : 'destructive'}>
                  {integration.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Available Integrations */}
      <Card>
        <CardHeader>
          <CardTitle>Available Integrations</CardTitle>
          <CardDescription>Connect new services to Pulse Monitor</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {available.map((service, idx) => (
              <div key={idx} className="border rounded-lg p-3 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-sm">{service.name}</p>
                    <p className="text-xs text-gray-500">{service.category}</p>
                  </div>
                  <Zap className="w-4 h-4 text-yellow-600" />
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  Connect
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Integration Features */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Features</CardTitle>
          <CardDescription>What you can do with integrations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 border rounded">
              <p className="font-medium text-sm">Event Routing</p>
              <p className="text-xs text-gray-600 mt-1">Route alerts and incidents to specific channels</p>
            </div>
            <div className="p-3 border rounded">
              <p className="font-medium text-sm">Bidirectional Sync</p>
              <p className="text-xs text-gray-600 mt-1">Sync data between Pulse Monitor and external systems</p>
            </div>
            <div className="p-3 border rounded">
              <p className="font-medium text-sm">Custom Workflows</p>
              <p className="text-xs text-gray-600 mt-1">Automate actions based on monitoring events</p>
            </div>
            <div className="p-3 border rounded">
              <p className="font-medium text-sm">Webhooks</p>
              <p className="text-xs text-gray-600 mt-1">Send events to your own systems via webhooks</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
