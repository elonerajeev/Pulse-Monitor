import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import api from '@/utils/api';
import useNotifications from '@/hooks/use-notifications';
import { useAuth } from '@/hooks/useAuth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Lock } from 'lucide-react';

const AddMonitoringService = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [type, setType] = useState('website');
  const [regions, setRegions] = useState<string[]>(['us-east-1']);
  const [interval, setInterval] = useState<number>(5);
  const [slackEnabled, setSlackEnabled] = useState(false);
  const [slackWebhook, setSlackWebhook] = useState('');
  const { addNotification } = useNotifications();

  const isPremium = user?.plan === 'pro' || user?.plan === 'enterprise';

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
        regions,
        interval,
        alertChannels: {
            slack: {
                enabled: slackEnabled,
                webhookUrl: slackWebhook
            }
        }
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
                placeholder="e.g., My Awesome Website"
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
                placeholder="e.g., https://my-website.com"
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
              <div className="flex items-center justify-between">
                <Label htmlFor="regions">Regions</Label>
                {!isPremium && <Badge variant="secondary"><Lock className="h-3 w-3 mr-1" /> Premium</Badge>}
              </div>
              <Select
                value={regions[0]}
                onValueChange={(val) => setRegions([val])}
                disabled={!isPremium}
              >
                <SelectTrigger>
                    <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="us-east-1">US East (N. Virginia)</SelectItem>
                    <SelectItem value="us-west-2">US West (Oregon)</SelectItem>
                    <SelectItem value="eu-central-1">Europe (Frankfurt)</SelectItem>
                    <SelectItem value="ap-south-1">Asia Pacific (Mumbai)</SelectItem>
                </SelectContent>
              </Select>
              {!isPremium && <p className="text-xs text-gray-500 mt-1">Upgrade to select different regions.</p>}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="interval">Check Interval (minutes)</Label>
                {!isPremium && <Badge variant="secondary"><Lock className="h-3 w-3 mr-1" /> Premium</Badge>}
              </div>
              <Select
                value={interval.toString()}
                onValueChange={(val) => setInterval(parseFloat(val))}
                disabled={!isPremium}
              >
                <SelectTrigger>
                    <SelectValue placeholder="Interval" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="0.5" disabled={user?.plan !== 'enterprise'}>30 Seconds (Enterprise)</SelectItem>
                    <SelectItem value="1">1 Minute (Pro)</SelectItem>
                    <SelectItem value="5">5 Minutes (Free)</SelectItem>
                    <SelectItem value="10">10 Minutes</SelectItem>
                </SelectContent>
              </Select>
              {!isPremium && (
                <p className="text-xs text-gray-500 mt-1">
                   Fixed at 5 minutes for Free plan. <Link to="/pricing" className="text-blue-500 underline">Upgrade</Link>
                </p>
              )}
            </div>

            <div className="space-y-4 border-t pt-4">
               <div className="flex items-center justify-between">
                 <Label className="text-base">Alert Channels</Label>
                 {!isPremium && <Badge variant="secondary"><Lock className="h-3 w-3 mr-1" /> Premium</Badge>}
               </div>

               <div className="flex items-start space-x-2">
                 <Checkbox
                    id="slack"
                    checked={slackEnabled}
                    onCheckedChange={(checked) => setSlackEnabled(!!checked)}
                    disabled={!isPremium}
                 />
                 <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor="slack"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Slack Webhook
                    </label>
                    {slackEnabled && (
                      <Input
                        placeholder="https://hooks.slack.com/services/..."
                        value={slackWebhook}
                        onChange={(e) => setSlackWebhook(e.target.value)}
                        className="mt-2"
                      />
                    )}
                 </div>
               </div>
            </div>

            <Button type="submit" className="w-full">Add Service</Button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AddMonitoringService;
