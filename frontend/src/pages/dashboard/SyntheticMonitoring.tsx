import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Video, Zap } from 'lucide-react';

export default function SyntheticMonitoring() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Synthetic Monitoring</h1>
          <p className="text-gray-500 mt-2">Simulate user transactions and monitor performance</p>
        </div>
        <Button>+ Create Transaction</Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">99.2%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Response</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">245ms</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Regions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
          </CardContent>
        </Card>
      </div>

      {/* Synthetic Tests */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction Scenarios</CardTitle>
          <CardDescription>Simulated user journeys across regions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: 'Login Flow', status: 'healthy', regions: 6, frequency: 'Every 5 min' },
              { name: 'Checkout Process', status: 'healthy', regions: 6, frequency: 'Every 5 min' },
              { name: 'API Integration', status: 'degraded', regions: 5, frequency: 'Every 1 min' },
            ].map((test, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 border rounded-lg">
                <Zap className="w-5 h-5 text-blue-600" />
                <div className="flex-1">
                  <p className="font-medium">{test.name}</p>
                  <p className="text-xs text-gray-500">{test.frequency} • {test.regions} regions</p>
                </div>
                <Badge variant={test.status === 'healthy' ? 'default' : 'destructive'}>
                  {test.status}
                </Badge>
                <Button variant="ghost" size="sm">
                  <Play className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Screenshots & Videos */}
      <Card>
        <CardHeader>
          <CardTitle>Capture Results</CardTitle>
          <CardDescription>Latest transaction screenshots and videos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, idx) => (
              <div key={idx} className="border rounded-lg p-4 bg-gray-50">
                <div className="bg-gray-200 rounded h-32 mb-2 flex items-center justify-center">
                  <Video className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-sm font-medium">Login Flow - us-east-1</p>
                <p className="text-xs text-gray-500">5 min ago</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
