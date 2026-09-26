import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Clock, CheckCircle2, Eye } from 'lucide-react';

export default function IncidentsManagement() {
  const { serviceId } = useParams();
  const [selectedIncident, setSelectedIncident] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);

  const { data: incidents, isLoading } = useQuery({
    queryKey: ['incidents', serviceId],
    queryFn: () => api.listIncidents({ monitoringId: serviceId }),
  });

  const { data: stats } = useQuery({
    queryKey: ['incidentStats'],
    queryFn: () => api.getIncidentStats(30),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: any) => api.updateIncidentStatus(id, status),
  });

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  const allIncidents = incidents?.data?.incidents || [];
  const statsData = stats?.data || {};

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'identified':
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case 'monitoring':
        return <Clock className="w-5 h-5 text-blue-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-red-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Incident Management</h1>
        <p className="text-gray-500 mt-2">Track, analyze, and resolve service incidents</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Incidents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsData.totalIncidents || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Open</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{statsData.openIncidents || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{statsData.resolvedIncidents || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Successfully closed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Resolution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsData.averageResolutionTime || 0}m</div>
            <p className="text-xs text-gray-500 mt-1">Mean time to recover</p>
          </CardContent>
        </Card>
      </div>

      {/* Incidents List */}
      <Card>
        <CardHeader>
          <CardTitle>Incidents</CardTitle>
          <CardDescription>Recent incidents by service</CardDescription>
        </CardHeader>
        <CardContent>
          {allIncidents.length > 0 ? (
            <div className="space-y-3">
              {allIncidents.map((incident: any) => (
                <div
                  key={incident._id}
                  className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50"
                >
                  {getStatusIcon(incident.status)}
                  <div className="flex-1">
                    <p className="font-medium">{incident.title}</p>
                    <p className="text-sm text-gray-500">{incident.description}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Created {new Date(incident.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      incident.severity === 'critical' ? 'destructive' :
                      incident.severity === 'high' ? 'default' : 'secondary'
                    }>
                      {incident.severity}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {incident.status}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedIncident(incident);
                        setShowDetails(true);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No incidents recorded</p>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedIncident?.title}</DialogTitle>
          </DialogHeader>
          {selectedIncident && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <Badge className="mt-1" variant="outline">{selectedIncident.status}</Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Severity</p>
                <Badge className="mt-1">{selectedIncident.severity}</Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Description</p>
                <p className="mt-1 text-sm">{selectedIncident.description}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Impact Metrics</p>
                <div className="mt-1 grid grid-cols-2 gap-2 text-sm">
                  <p>Affected Users: {selectedIncident.impactMetrics?.affectedUsers}</p>
                  <p>Error Rate: {selectedIncident.impactMetrics?.errorRate}%</p>
                </div>
              </div>
              {selectedIncident.rca && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Root Cause</p>
                  <p className="mt-1 text-sm">{selectedIncident.rca.rootCause}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
