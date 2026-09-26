import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LayoutGrid, Share2, Trash2, Star } from 'lucide-react';

export default function DashboardsPage() {
  const dashboards = [
    { name: 'Production Overview', type: 'team', shared: 5, widgets: 8 },
    { name: 'Performance Analytics', type: 'personal', shared: 0, widgets: 6 },
    { name: 'SLA Compliance', type: 'team', shared: 3, widgets: 5 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Custom Dashboards</h1>
          <p className="text-gray-500 mt-2">Create personalized monitoring dashboards</p>
        </div>
        <Button>+ Create Dashboard</Button>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {dashboards.map((dashboard, idx) => (
          <Card key={idx} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-2">
                  <LayoutGrid className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <CardTitle className="text-base">{dashboard.name}</CardTitle>
                    <Badge variant="outline" className="mt-1">{dashboard.type}</Badge>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Star className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-gray-600">
                <p>{dashboard.widgets} widgets • {dashboard.shared} shared</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Share2 className="w-3 h-3 mr-1" /> Share
                </Button>
                <Button variant="ghost" size="sm">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Widget Types */}
      <Card>
        <CardHeader>
          <CardTitle>Available Widgets</CardTitle>
          <CardDescription>Drag and drop to customize your dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              'Metric Card',
              'Line Chart',
              'Bar Chart',
              'Pie Chart',
              'Status Page',
              'Alerts List',
              'Incidents List',
              'SLA Progress',
            ].map((widget, idx) => (
              <div
                key={idx}
                className="p-3 border rounded-lg hover:bg-blue-50 cursor-grab active:cursor-grabbing transition-colors"
              >
                <p className="text-sm font-medium text-center">{widget}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
