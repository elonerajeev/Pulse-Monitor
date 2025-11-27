import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import api from '@/utils/api';
import Sidebar from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { ArrowLeft, CheckCircle, Bell, Pause, Edit, MoreVertical, AlertTriangle, Shield, Server, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import RCAPanel from '@/components/ui/RCAPanel';
import MaintenanceWindowDialog from '@/components/ui/MaintenanceWindowDialog'; // CORRECTED IMPORT PATH
import { Button } from '@/components/ui/button';

interface MonitoringLog {
  _id: string;
  status: string;
  statusCode?: number;
  responseTime: number;
  timings?: {
    dns: number;
    tcp: number;
    tls: number;
    firstByte: number;
    contentTransfer: number;
    total: number;
  };
  ssl?: {
    subject: any;
    issuer: any;
    valid_from: string;
    valid_to: string;
    daysUntilExpiry: number;
  };
  responseBody?: string;
  error?: {
    message: string;
    code?: string;
  };
  createdAt: string;
}

interface MonitoringService {
  _id: string;
  name: string;
  target: string;
  logs: MonitoringLog[];
  latestLog?: MonitoringLog;
}

const MonitoringDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [service, setService] = useState<MonitoringService | null>(null);
  const [rcaData, setRcaData] = useState(null);
  const [isRcaPanelOpen, setIsRcaPanelOpen] = useState(false);
  const [isMaintenanceDialogOpen, setIsMaintenanceDialogOpen] = useState(false); // New state for maintenance dialog

  useEffect(() => {
    const fetchService = async () => {
      try {
        const response = await api.get(`/monitoring/${id}`);
        const fetchedService = response.data.data; // Store the fetched service
        setService(fetchedService);

        // Automatically open RCA panel if the latest log indicates an offline status
        if (fetchedService.latestLog && fetchedService.latestLog.status !== 'online') {
          try {
            const rcaResponse = await api.get(`/monitoring/rca/${fetchedService.latestLog._id}`);
            setRcaData(rcaResponse.data.data);
            setIsRcaPanelOpen(true);
          } catch (rcaError) {
            toast({ title: 'Error', description: 'Failed to fetch RCA details automatically.', variant: 'destructive' });
          }
        }

      } catch (error) {
        toast({ title: 'Error', description: 'Failed to fetch monitoring service details.', variant: 'destructive' });
      }
    };

    const interval = setInterval(fetchService, 5000); // Refresh every 5 seconds
    fetchService();

    return () => clearInterval(interval);
  }, [id, toast]);

  const handleIncidentClick = async (logId: string) => {
    try {
      const response = await api.get(`/monitoring/rca/${logId}`);
      setRcaData(response.data.data);
      setIsRcaPanelOpen(true);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch RCA details.', variant: 'destructive' });
    }
  };

  const handleScheduleMaintenance = async (data: { startTime: string; endTime: string; reason: string }) => {
    try {
      if (!service) return; // Guard clause if service is null

      const response = await api.post('/maintenance-windows', {
        serviceId: service._id,
        startTime: data.startTime,
        endTime: data.endTime,
        reason: data.reason,
      });

      if (response.status === 201) {
        toast({
          title: 'Success',
          description: 'Maintenance window scheduled successfully.',
          variant: 'default',
        });
        // Optionally, you might want to refresh the service data or update the UI
      } else {
        // The toast for error is already handled by the api utility, but you can add specific logic here if needed
      }
    } catch (error) {
      // Error is already handled and toasted by the api utility
    } finally {
      setIsMaintenanceDialogOpen(false);
    }
  };


  const chartData = service?.logs.map(log => ({
    time: new Date(log.createdAt).toLocaleTimeString(),
    ...log.timings
  })).reverse();

  if (!service) {
    return <div className="flex items-center justify-center h-screen"><div>Loading...</div></div>; // Or a proper skeleton loader
  }

  const lastCheck = service.latestLog ? new Date(service.latestLog.createdAt).toLocaleString() : 'N/A';
  const uptime = service.logs.length > 0 ? service.logs.filter(log => log.status === 'online').length / service.logs.length * 100 : 100;
  const latestLog = service.latestLog;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 p-8">
        <Link to="/monitoring" className="flex items-center text-sm text-muted-foreground mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Monitoring
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className={`w-12 h-12 rounded-full mr-4 flex items-center justify-center ${latestLog?.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`}>
              {latestLog?.status === 'online' ? <CheckCircle className="w-8 h-8 text-white" /> : <AlertTriangle className="w-8 h-8 text-white" />}
            </div>
            <div>
              <h1 className="text-3xl font-bold">{service.name}</h1>
              <p className="text-muted-foreground">{service.target}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon"><Bell className="w-5 h-5" /></Button>
            <Button variant="ghost" size="icon"><Pause className="w-5 h-5" /></Button>
            <Button variant="ghost" size="icon"><Edit className="w-5 h-5" /></Button>
            {/* New button to open Maintenance Window Dialog */}
            <Button variant="ghost" size="icon" onClick={() => setIsMaintenanceDialogOpen(true)}><Shield className="w-5 h-5" /></Button>
            <Button variant="ghost" size="icon"><MoreVertical className="w-5 h-5" /></Button>
          </div>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="total" stroke="#8884d8" fill="#8884d8" />
              </AreaChart>
            </responsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Incidents</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Details</th>
                  <th className="text-left p-2">Started</th>
                </tr>
              </thead>
              <tbody>
                {service.logs.filter(log => log.status !== 'online').slice(0, 10).map(log => (
                  <tr key={log._id} className="border-b hover:bg-muted cursor-pointer" onClick={() => handleIncidentClick(log._id)}>
                    <td className="p-2"><Badge variant="destructive"><AlertTriangle className="w-4 h-4 mr-2" />{log.status}</Badge></td>
                    <td className="p-2">{log.error?.message || 'No details'}</td>
                    <td className="p-2">{new Date(log.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
      <RCAPanel isOpen={isRcaPanelOpen} onClose={() => setIsRcaPanelOpen(false)} rcaData={rcaData} />

      {/* Render MaintenanceWindowDialog */}
      <MaintenanceWindowDialog
        isOpen={isMaintenanceDialogOpen}
        onClose={() => setIsMaintenanceDialogOpen(false)}
        serviceName={service.name} // Pass the service name to the dialog
        onSchedule={handleScheduleMaintenance}
      />
    </div>
  );
};

export default MonitoringDetail;