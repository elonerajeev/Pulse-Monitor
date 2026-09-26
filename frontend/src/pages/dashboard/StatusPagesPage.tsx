import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Globe, Users, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function StatusPagesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Status Pages</h1>
          <p className="text-gray-500 mt-2">Public incident communication pages</p>
        </div>
        <Button>+ Create Status Page</Button>
      </div>

      {/* Status Pages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Production Status
            </CardTitle>
            <CardDescription>status.company.com</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium">Overall Status</p>
              <Badge className="mt-1" variant="default">Operational</Badge>
            </div>
            <div className="grid grid-cols-2 text-sm">
              <div>
                <p className="text-gray-600">Uptime (30d)</p>
                <p className="font-semibold text-lg">99.95%</p>
              </div>
              <div>
                <p className="text-gray-600">Subscribers</p>
                <p className="font-semibold text-lg">1,234</p>
              </div>
            </div>
            <Button variant="outline" className="w-full">View Public Page</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              API Status
            </CardTitle>
            <CardDescription>api-status.company.com</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium">Overall Status</p>
              <Badge className="mt-1" variant="default">Operational</Badge>
            </div>
            <div className="grid grid-cols-2 text-sm">
              <div>
                <p className="text-gray-600">Uptime (30d)</p>
                <p className="font-semibold text-lg">99.98%</p>
              </div>
              <div>
                <p className="text-gray-600">Subscribers</p>
                <p className="font-semibold text-lg">2,567</p>
              </div>
            </div>
            <Button variant="outline" className="w-full">View Public Page</Button>
          </CardContent>
        </Card>
      </div>

      {/* Components */}
      <Card>
        <CardHeader>
          <CardTitle>Components</CardTitle>
          <CardDescription>Services monitored on status pages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { name: 'API Server', status: 'operational' },
              { name: 'Database', status: 'operational' },
              { name: 'CDN', status: 'operational' },
              { name: 'Authentication', status: 'degraded' },
            ].map((component, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-2">
                  {component.status === 'operational' ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-yellow-600" />
                  )}
                  <span className="font-medium">{component.name}</span>
                </div>
                <Badge variant={component.status === 'operational' ? 'default' : 'secondary'}>
                  {component.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Incidents */}
      <Card>
        <CardHeader>
          <CardTitle>Active Incidents on Status Pages</CardTitle>
          <CardDescription>Current incidents being communicated to subscribers</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-4">No active incidents</p>
        </CardContent>
      </Card>
    </div>
  );
}
