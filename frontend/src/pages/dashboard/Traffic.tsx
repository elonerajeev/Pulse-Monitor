
import { useEffect, useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import api from '@/utils/api';
import TrafficCard from '@/components/ui/TrafficCard';

interface MonitoringService {
  _id: string;
  name: string;
  target: string;
}

interface TrafficData {
    name: string;
    traffic: any;
}

const Traffic = () => {
  const { toast } = useToast();
  const [trafficData, setTrafficData] = useState<TrafficData[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTrafficData = useCallback(async (services: MonitoringService[]) => {
    setLoading(true);
    try {
      const trafficPromises = services.map(service =>
        api.get(`/traffic?site_id=${service.target}`).then(response => ({ name: service.name, traffic: response.data.data }))
      );
      const results = await Promise.all(trafficPromises);
      setTrafficData(results);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch traffic data.', variant: 'destructive' });
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    const fetchServicesAndTraffic = async () => {
      try {
        const response = await api.get('/monitoring');
        if (response.status === 200) {
          fetchTrafficData(response.data.data);
        }
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to fetch monitoring services.', variant: 'destructive' });
      }
    };
    fetchServicesAndTraffic();
  }, [fetchTrafficData, toast]);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Traffic</h1>
      {loading ? (
        <p>Loading traffic data...</p>
      ) : trafficData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trafficData.map((data, index) => (
            <TrafficCard key={index} serviceName={data.name} trafficData={data.traffic} />
          ))}
        </div>
      ) : (
        <p>No traffic data to display. Add a service to begin monitoring traffic.</p>
      )}
    </div>
  );
};

export default Traffic;
