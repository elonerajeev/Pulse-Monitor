import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import api from '@/utils/api';
import Navbar from '@/components/ui/navbar';
import useNotifications from '@/hooks/use-notifications';

const AddMonitoringService = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [type, setType] = useState('website');
  const [interval, setInterval] = useState<number | ''>(5);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { addNotification } = useNotifications();

  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated') === 'true';
    setIsAuthenticated(authStatus);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (interval === '' || interval <= 0) {
      toast.error('Please enter a valid interval.');
      return;
    }

    try {
      const response = await api.post('/monitoring', {
        name,
        target,
        serviceType: type,
        interval,
      });

      if (response.status === 201) {
        addNotification({
          message: `Service '${name}' added successfully.`,
          service: 'Monitoring',
          severity: 'success',
        });
        toast.success('Monitoring service added successfully.', {
          duration: 60000,
          action: {
            label: 'OK',
            onClick: () => {},
          },
        });
        navigate('/dashboard');
      } else {
        toast.error(response.data.message || 'Failed to add monitoring service.');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'An error occurred while adding the monitoring service.');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      <Navbar isAuthenticated={isAuthenticated} />
      <main className="flex-grow flex items-center justify-center">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
          <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-200">Add Monitoring Service</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name">Service Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="target">Target URL</Label>
              <Input
                id="target"
                type="text"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="type">Service Type</Label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 text-gray-700 bg-gray-200 rounded-md dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="website">Website</option>
                <option value="server">Server</option>
              </select>
            </div>
            <div>
              <Label htmlFor="interval">Check Interval (minutes)</Label>
              <Input
                id="interval"
                type="number"
                value={interval}
                onChange={(e) => {
                  const val = e.target.value;
                  setInterval(val === '' ? '' : parseInt(val, 10));
                }}
                min="1"
                required
              />
            </div>
            <Button type="submit" className="w-full">Add Service</Button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AddMonitoringService;