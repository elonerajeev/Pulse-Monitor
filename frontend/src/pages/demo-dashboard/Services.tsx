import { useState } from 'react';
import ServiceCard from '@/components/ui/ServiceCard';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

const dummyServices = [
  {
    _id: '1',
    name: 'Main Website',
    target: 'https://example.com',
    serviceType: 'https',
    location: 'us-east',
    latestLog: { status: 'online', createdAt: new Date().toISOString(), responseTime: 120, ssl: { daysUntilExpiry: 30 } },
    logs: Array.from({ length: 24 }, (_, i) => ({
      status: Math.random() > 0.1 ? 'online' : 'offline',
      createdAt: new Date(Date.now() - i * 60 * 60 * 1000).toISOString(),
      responseTime: 100 + Math.random() * 50,
    })),
    interval: 300,
  },
  {
    _id: '2',
    name: 'API Server',
    target: 'https://api.example.com',
    serviceType: 'https',
    location: 'eu-west',
    latestLog: { status: 'online', createdAt: new Date().toISOString(), responseTime: 80, ssl: { daysUntilExpiry: 60 } },
    logs: Array.from({ length: 24 }, (_, i) => ({
      status: 'online',
      createdAt: new Date(Date.now() - i * 60 * 60 * 1000).toISOString(),
      responseTime: 70 + Math.random() * 30,
    })),
    interval: 300,
  },
  {
    _id: '3',
    name: 'Database Service',
    target: 'db.example.com',
    serviceType: 'tcp',
    location: 'ap-south',
    latestLog: { status: 'offline', createdAt: new Date().toISOString(), responseTime: 0 },
    logs: Array.from({ length: 24 }, (_, i) => ({
      status: i < 3 ? 'offline' : 'online',
      createdAt: new Date(Date.now() - i * 60 * 60 * 1000).toISOString(),
      responseTime: i < 3 ? 0 : 50 + Math.random() * 20,
    })),
    interval: 600,
  },
];

const DemoServices = () => {
  const [services] = useState(dummyServices);
  const [loading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [countdown, setCountdown] = useState(30);

  return (
    <div>
        <div className="flex justify-between items-center mb-2">
            <h1 className="text-3xl font-bold">Services</h1>
            <div className="flex items-center space-x-4">
                <Button variant="outline" disabled>
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
                <Button variant="outline" onClick={() => setAutoRefresh(!autoRefresh)}>
                    {autoRefresh ? `Auto Refresh: ${countdown}s` : 'Enable Auto Refresh'}
                </Button>
            </div>
      </div>
      <p className="text-muted-foreground mb-8">
        {services.length > 0
          ? `You are monitoring ${services.length} service(s).`
          : "No services are being monitored."}
      </p>

      {loading && services.length === 0 ? (
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
                sslDaysUntilExpiry={service.latestLog?.ssl?.daysUntilExpiry}
                onEdit={() => {}}
                onDelete={() => {}}
                onRefresh={() => {}}
                onClick={() => {}}
              />
          ))}
        </div>
      )}
    </div>
  );
};

export default DemoServices;
