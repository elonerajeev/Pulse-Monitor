import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/ui/navbar';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Plus, TrendingUp, Monitor, Zap, RefreshCw, AlertTriangle, Info } from "lucide-react";
import RealTimeChart from "@/components/ui/real-time-chart";
import { API_BASE_URL } from '@/utils/api';
import ServiceCard from '@/components/ui/ServiceCard';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import EditServiceModal from '@/components/ui/EditServiceModal';

interface MonitoringLog {
  _id: string;
  status: string;
  responseTime: number;
  createdAt: string;
  ssl?: { daysUntilExpiry: number; };
}

interface MonitoringService {
  _id: string;
  name: string;
  target: string;
  serviceType: string;
  interval: number;
  latestLog?: MonitoringLog;
  logs: MonitoringLog[];
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [services, setServices] = useState<MonitoringService[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [editingService, setEditingService] = useState<MonitoringService | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<MonitoringService | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchServices = async () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return;

    const user = JSON.parse(userStr);
    const token = user?.accessToken;
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/monitoring`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setServices(data.data);
      } else {
        toast({ title: 'Error', description: 'Failed to fetch monitoring services.', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'An error occurred while fetching services.', variant: 'destructive' });
    }
    setLoading(false);
  };

  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated') === 'true';
    setIsAuthenticated(authStatus);

    if (!authStatus) {
      toast({ title: 'Error', description: 'You must be logged in to view the dashboard.', variant: 'destructive' });
      navigate('/login');
      return;
    }

    fetchServices();
  }, [navigate, toast]);

  const handleAddMonitor = () => {
    navigate('/monitoring/add');
  };

  const handleRefresh = (serviceId?: string) => {
    if (serviceId) {
      const serviceToRefresh = services.find(s => s._id === serviceId);
      if (serviceToRefresh) {
        // In a real application, you would fetch updated data for the specific service
        // For now, we'll just refetch all services to simulate an update
        toast({ title: 'Refreshing...', description: `Refreshing ${serviceToRefresh.name}` });
        fetchServices();
      }
    } else {
      fetchServices();
    }
  };

  const handleEdit = (service: MonitoringService) => {
    setEditingService(service);
  };

  const handleDelete = (service: MonitoringService) => {
    setServiceToDelete(service);
  };

  const handleUpdate = async (updatedService: MonitoringService) => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return;
    const user = JSON.parse(userStr);
    const token = user?.accessToken;

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/monitoring/${updatedService._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updatedService),
      });

      if (response.ok) {
        toast({ title: 'Success', description: 'Service updated successfully.' });
        setEditingService(null);
        fetchServices();
      } else {
        const errorData = await response.json();
        toast({ title: 'Error', description: errorData.message || 'Failed to update service.', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'An error occurred while updating the service.', variant: 'destructive' });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!serviceToDelete) return;

    const userStr = localStorage.getItem('user');
    if (!userStr) return;
    const user = JSON.parse(userStr);
    const token = user?.accessToken;

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/monitoring/${serviceToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast({ title: 'Success', description: 'Service deleted successfully.' });
        setServiceToDelete(null);
        fetchServices();
      } else {
        toast({ title: 'Error', description: 'Failed to delete service.', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'An error occurred while deleting the service.', variant: 'destructive' });
    }
  };

  const onlineServices = services.filter(s => s.latestLog?.status === 'online');
  const offlineServicesCount = services.length - onlineServices.length;
  const incidents = services.reduce((acc, s) => acc + s.logs.filter(l => l.status === 'offline').length, 0);

  const avgResponseTime = onlineServices.length > 0
    ? Math.round(onlineServices.reduce((acc, s) => acc + (s.latestLog?.responseTime || 0), 0) / onlineServices.length)
    : 0;

  const uptimePercentage = services.length > 0 ? (onlineServices.length / services.length) * 100 : 100;

  const allSslOk = services.every(s => !s.target.startsWith('https://') || (s.latestLog?.ssl && s.latestLog.ssl.daysUntilExpiry > 0));


  return (
    <div className="min-h-screen bg-background">
      <Navbar isAuthenticated={isAuthenticated} />

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">
              {services.length > 0
                ? `You are monitoring ${services.length} service(s).`
                : "This is your monitoring dashboard. Add a service to begin."}
            </p>
          </div>
          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            <Button
              variant="outline"
              onClick={() => handleRefresh()}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="hero"
              onClick={handleAddMonitor}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Monitor
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Uptime</CardTitle>
              <CheckCircle className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{uptimePercentage.toFixed(2)}%</div>
              <p className="text-xs text-muted-foreground">Calculated from last check</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
              <Zap className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgResponseTime}ms</div>
              <p className="text-xs text-muted-foreground">From last check (online services)</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Monitors</CardTitle>
              <Monitor className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{services.length}</div>
              <p className="text-xs text-muted-foreground">{onlineServices.length} online, {offlineServicesCount} down</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Incidents</CardTitle>
              <AlertTriangle className="w-4 h-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{incidents}</div>
              <p className="text-xs text-muted-foreground">In the last 24 hours</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">SSL</CardTitle>
              <CheckCircle className={`w-4 h-4 ${allSslOk ? 'text-green-500' : 'text-red-500'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${allSslOk ? 'text-green-500' : 'text-red-500'}`}>{allSslOk ? 'OK' : 'Warning'}</div>
              <p className="text-xs text-muted-foreground">{allSslOk ? 'All certificates are valid' : 'Some certificates need attention'}</p>
            </CardContent>
          </Card>
        </div>

        {services.length > 0 ? (
          <>
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Real-time Response Time (ms)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <RealTimeChart services={onlineServices} />
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <ServiceCard
                  key={service._id}
                  name={service.name}
                  status={service.latestLog?.status || 'unknown'}
                  target={service.target}
                  serviceType={service.serviceType}
                  logs={service.logs}
                  lastChecked={service.latestLog?.createdAt}
                  sslDaysUntilExpiry={service.latestLog?.ssl?.daysUntilExpiry}
                  onEdit={() => handleEdit(service)}
                  onDelete={() => handleDelete(service)}
                  onRefresh={() => handleRefresh(service._id)}
                />
              ))}
            </div>
          </>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">
                <p>You are not monitoring any services yet.</p>
                <p>Click the "Add New Monitor" button to get started.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {editingService && (
        <EditServiceModal
          service={editingService}
          onUpdate={handleUpdate}
          onCancel={() => setEditingService(null)}
        />
      )}

      <AlertDialog open={!!serviceToDelete} onOpenChange={() => setServiceToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the monitoring service and all its associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dashboard;
