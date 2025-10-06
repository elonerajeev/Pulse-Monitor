
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/ui/navbar';
import ServiceCard from '@/components/ui/ServiceCard';
import { useToast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/utils/api';

interface MonitoringService {
  _id: string;
  name: string;
  target: string;
  serviceType: string;
  status: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [services, setServices] = useState<MonitoringService[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated') === 'true';
    setIsAuthenticated(authStatus);

    const fetchServices = async () => {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        toast({ title: 'Error', description: 'You must be logged in to view your services.', variant: 'destructive' });
        navigate('/login');
        return;
      }

      const user = JSON.parse(userStr);
      const token = user?.accessToken;

      if (!token) {
        toast({ title: 'Error', description: 'Authentication token not found. Please log in again.', variant: 'destructive' });
        navigate('/login');
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/monitoring`,
         {
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
        toast({ title: 'Error', description: 'An error occurred while fetching the monitoring services.', variant: 'destructive' });
      }
    };

    fetchServices();
  }, [navigate, toast]);

  const handleAddServiceClick = () => {
    navigate("/monitoring/add");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      <Navbar isAuthenticated={isAuthenticated} />
      <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 shadow-md">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Dashboard</h1>
        <Button onClick={handleAddServiceClick}>Add Your Services To Monitoring</Button>
      </header>
      <main className="flex-1 p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <ServiceCard
              key={service._id}
              name={service.name}
              status={service.status || 'online'} // Default to online if status is not available
              target={service.target}
              serviceType={service.serviceType}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
