import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ActivitySquare, CheckCircle2, XCircle, Zap } from 'lucide-react';

export default function WebhooksPage() {
  const webhooks = [
    { url: 'https://webhook.company.com/alerts', events: 5, status: 'active', deliveries: 1234 },
    { url: 'https://slack.com/api/...', events: 3, status: 'active', deliveries: 567 },
    { url: 'https://incident.tracker.com', events: 2, status: 'error', deliveries: 89 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Webhooks</h1>
          <p className="text-gray-500 mt-2">Event-driven integrations and notifications</p>
        </div>
        <Button>+ Add Webhook</Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Webhooks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Deliveries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,890</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">99.5%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Event Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">13</div>
          </CardContent>
        </Card>
      </div>

      {/* Webhooks List */}
      <Card>
        <CardHeader>
          <CardTitle>Configured Webhooks</CardTitle>
          <CardDescription>Your webhook endpoints</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {webhooks.map((webhook, idx) => (
              <div key={idx} className="p-3 border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-2">
                    <Zap className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium break-all text-sm">{webhook.url}</p>
                      <p className="text-xs text-gray-500 mt-1">{webhook.deliveries} deliveries</p>
                    </div>
                  </div>
                  {webhook.status === 'active' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  )}
                </div>
                <div className="flex gap-2 flex-wrap">
                  {['incident.created', 'alert.triggered', 'monitoring.changed'].map((evt) => (
                    <Badge key={evt} variant="secondary" className="text-xs">
                      {evt}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Event Types */}
      <Card>
        <CardHeader>
          <CardTitle>Available Event Types</CardTitle>
          <CardDescription>Events you can subscribe to</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {[
              'monitoring.check_completed',
              'monitoring.status_changed',
              'alert.triggered',
              'alert.resolved',
              'incident.created',
              'incident.updated',
              'incident.resolved',
              'sla.breached',
              'sla.recovered',
              'maintenance.scheduled',
              'maintenance.started',
              'maintenance.completed',
              'anomaly.detected',
            ].map((event) => (
              <Badge key={event} variant="outline" className="text-xs">
                {event}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
