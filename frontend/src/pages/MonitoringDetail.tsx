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

  useEffect(() => {
    const fetchService = async () => {
      try {
        const response = await api.get(`/monitoring/${id}`);
        setService(response.data.data);
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
            <button><Bell className="w-5 h-5" /></button>
            <button><Pause className="w-5 h-5" /></button>
            <button><Edit className="w-5 h-5" /></button>
            <button><MoreVertical className="w-5 h-5" /></button>
          </div>
        </div>

        {/* ... Other cards ... */}

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
    </div>
  );
};

export default MonitoringDetail;