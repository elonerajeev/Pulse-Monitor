import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/utils/api';
import Sidebar from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";

interface MonitoringLog {
  _id: string;
  status: string;
  responseTime: number;
  createdAt: string;
}

interface MonitoringService {
  _id: string;
  name: string;
  target: string;
  serviceType: string;
  latestLog?: MonitoringLog;
}

const Monitoring = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [services, setServices] = useState<MonitoringService[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated') === 'true';
    setIsAuthenticated(authStatus);

    if (!authStatus) {
      navigate('/login');
      return;
    }

    const fetchServices = async () => {
      const userStr = localStorage.getItem('user');
      if (!userStr) return;

      const user = JSON.parse(userStr);
      const token = user?.accessToken;
      if (!token) return;

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
    };

    fetchServices();
  }, [navigate, toast]);

  const handleRowClick = (serviceId: string) => {
    navigate(`/monitoring/${serviceId}`);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-8">Monitoring</h1>
        <Card>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Last Check</TableHead>
                  <TableHead>Response Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((service) => (
                  <TableRow key={service._id} onClick={() => handleRowClick(service._id)} className="cursor-pointer">
                    <TableCell>
                      <Badge variant={service.latestLog?.status === 'online' ? 'success' : 'destructive'}>
                        {service.latestLog?.status === 'online' ? <CheckCircle className="w-4 h-4 mr-2" /> : <XCircle className="w-4 h-4 mr-2" />}
                        {service.latestLog?.status || 'Unknown'}
                      </Badge>
                    </TableCell>
                    <TableCell>{service.name}</TableCell>
                    <TableCell>{service.target}</TableCell>
                    <TableCell>{service.latestLog ? new Date(service.latestLog.createdAt).toLocaleString() : 'N/A'}</TableCell>
                    <TableCell>{service.latestLog ? `${service.latestLog.responseTime}ms` : 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Monitoring;
