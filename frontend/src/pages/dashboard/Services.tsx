import { useEffect, useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import api from '@/utils/api';
import ServiceCard from '@/components/ui/ServiceCard';
import { useNavigate } from 'react-router-dom';

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
  location?: string;
  latestLog?: MonitoringLog;
  logs: MonitoringLog[];
}

const Services = () => {
  const { toast } = useToast();
  const [services, setServices] = useState<MonitoringService[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/monitoring');
      if (response.status === 200) {
        setServices(response.data.data);
      } else {
        toast({ title: 'Error', description: 'Failed to fetch monitoring services.', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch monitoring services.', variant: 'destructive' });
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleEdit = (serviceId: string) => {
    // For now, we'll just log this. In a real app, you might open a modal or navigate to an edit page.
    console.log(`Edit service: ${serviceId}`);
  };

  const handleDelete = async (serviceId: string) => {
    try {
      await api.delete(`/monitoring/${serviceId}`);
      toast({
        title: "Service Deleted",
        description: "The monitoring service has been successfully deleted.",
      });
      fetchServices();
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error deleting the service. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRefresh = (serviceId: string) => {
    console.log(`Refresh service: ${serviceId}`);
    // Here you would typically trigger a check for a specific service
  };

  const handleCardClick = (serviceId: string) => {
    navigate(`/monitoring/${serviceId}`);
  };


  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Services</h1>
      <p className="text-muted-foreground mb-8">
        {services.length > 0
          ? `You are monitoring ${services.length} service(s).`
          : "No services are being monitored."}
      </p>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="bg-card border border-border rounded-lg shadow-sm p-4 h-96 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service) => (
              <ServiceCard
                key={service._id}
                _id={service._id}
                name={service.name}
                status={service.latestLog?.status || 'unknown'}
                target={service.target}
                serviceType={service.serviceType}
                logs={service.logs}
                lastChecked={service.latestLog?.createdAt}
                ssl={service.latestLog?.ssl}
                onEdit={() => handleEdit(service._id)}
                onDelete={() => handleDelete(service._id)}
                onRefresh={() => handleRefresh(service._id)}
                onClick={() => handleCardClick(service._id)}
              />
          ))}
        </div>
      )}
    </div>
  );
};

export default Services;
