export const DUMMY_NOTIFICATIONS = [
  { id: 1, message: "Service 'API Gateway' is down.", service: "API", time: "2 mins ago", severity: "error" },
  { id: 2, message: "High latency detected on 'Web App'.", service: "Frontend", time: "10 mins ago", severity: "warning" },
  { id: 3, message: "Database connection has been restored.", service: "Database", time: "1 hour ago", severity: "info" },
];

const SERVICE_NAMES = [
  { name: 'Main Website', type: 'website', target: 'https://pulse-monitor-pro.vercel.app', dependencies: ['API Gateway', 'Database'] },
  { name: 'API Gateway', type: 'api', target: 'https://api.myapp.com', dependencies: ['Auth Service', 'Database'] },
  { name: 'Database', type: 'database', target: 'db.myapp.com:5432', dependencies: [] },
  { name: 'Auth Service', type: 'api', target: 'https://auth.myapp.com', dependencies: ['Database'] },
  { name: 'Image CDN', type: 'cdn', target: 'https://cdn.myapp.com', dependencies: [] },
  { name: 'Blog Platform', type: 'website', target: 'https://blog.myapp.com', dependencies: ['Database', 'Image CDN'] },
  { name: 'Analytics Engine', type: 'service', target: 'tcp://analytics:8080', dependencies: ['Database'] },
  { name: 'Payment Gateway', type: 'api', target: 'https://payments.myapp.com', dependencies: ['API Gateway'] },
  { name: 'Real-time Messaging', type: 'service', target: 'wss://realtime.myapp.com', dependencies: ['API Gateway'] },
];

const LOCATIONS = {
  'us-east-1': { lat: 38, lon: -77, city: 'N. Virginia' },
  'us-west-2': { lat: 45, lon: -122, city: 'Oregon' },
  'eu-west-1': { lat: 53, lon: -6, city: 'Ireland' },
  'eu-central-1': { lat: 50, lon: 8, city: 'Frankfurt' },
  'ap-south-1': { lat: 19, lon: 72, city: 'Mumbai' },
  'ap-southeast-2': { lat: -33, lon: 151, city: 'Sydney' },
  'sa-east-1': { lat: -23, lon: -46, city: 'São Paulo' },
  'ca-central-1': { lat: 45, lon: -73, city: 'Montreal' },
  'af-south-1': { lat: -33, lon: 18, city: 'Cape Town' },
};

const LOCATION_KEYS = Object.keys(LOCATIONS);

const generateLog = (date, serviceName, serviceId) => {
  const isOnline = Math.random() > 0.1;
  const isDegraded = !isOnline && Math.random() > 0.5;
  let status = 'offline';
  if (isOnline) status = 'online';
  if (isDegraded) status = 'degraded';

  return {
    _id: `log_${Math.random().toString(36).substr(2, 9)}`,
    status,
    responseTime: isOnline ? Math.floor(Math.random() * 400) + 50 : 0,
    createdAt: date.toISOString(),
    message: status !== 'online' ? `Service experiencing issues: ${status}` : 'OK',
    ssl: { daysUntilExpiry: Math.floor(Math.random() * 30) },
    requests: Math.floor(Math.random() * 10000),
    monitor: { _id: serviceId, name: serviceName },
  };
};

const generateLogs = (serviceName, serviceId) => {
  const logs = [];
  const now = new Date();
  for (let i = 0; i < 200; i++) {
    const date = new Date(now.getTime() - i * 60 * 60 * 1000); // one log per hour for past 200 hours
    logs.push(generateLog(date, serviceName, serviceId));
  }
  return logs;
};

export const generateDummyData = () => {
  return SERVICE_NAMES.map((service, index) => {
    const serviceId = `service_${index}`;
    const logs = generateLogs(service.name, serviceId);
    const latestLog = logs[0];
    const locationKey = LOCATION_KEYS[index % LOCATION_KEYS.length];

    return {
      _id: serviceId,
      name: service.name,
      target: service.target,
      serviceType: service.type,
      interval: 60,
      location: locationKey,
      latestLog,
      logs,
      dependencies: service.dependencies.map(depName => {
        const depIndex = SERVICE_NAMES.findIndex(s => s.name === depName);
        return `service_${depIndex}`;
      }),
    };
  });
};

export const getGlobeLocations = (services) => {
    return services
      .map(service => {
          const locationKey = service.location;
          const locationData = LOCATIONS[locationKey];
          if (locationData) {
              return {
                  ...locationData,
                  status: service.latestLog?.status || 'unknown',
              };
          }
          return null;
      })
      .filter(Boolean);
  };
  