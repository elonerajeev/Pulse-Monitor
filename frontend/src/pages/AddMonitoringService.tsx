import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/utils/api';
import Navbar from '@/components/ui/navbar';

const AddMonitoringService = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [type, setType] = useState('website');
  const [interval, setInterval] = useState<number | ''>(5);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated') === 'true';
    setIsAuthenticated(authStatus);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (interval === '' || interval <= 0) {
      toast({ title: 'Error', description: 'Please enter a valid interval.', variant: 'destructive' });
      return;
    }

    const userStr = localStorage.getItem('user');
    if (!userStr) {
      toast({ title: 'Error', description: 'You must be logged in to add a service.', variant: 'destructive' });
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
      const response = await fetch(`${API_BASE_URL}/api/v1/monitoring`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name, target, serviceType: type, interval }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({ title: 'Success', description: 'Monitoring service added successfully.' });
        navigate('/dashboard');
      } else {
        toast({ title: 'Error', description: data.message || 'Failed to add monitoring service.', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'An error occurred while adding the monitoring service.', variant: 'destructive' });
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
