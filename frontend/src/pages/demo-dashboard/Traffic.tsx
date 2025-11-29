import { useState } from 'react';
import TrafficCard from '@/components/ui/TrafficCard';

const dummyTrafficData = [
  {
    name: 'Main Website',
    traffic: Array.from({ length: 12 }, (_, i) => ({
      date: `2023-01-0${i + 1}`,
      visits: 1000 + Math.floor(Math.random() * 500),
    })),
  },
  {
    name: 'API Server',
    traffic: Array.from({ length: 12 }, (_, i) => ({
      date: `2023-01-0${i + 1}`,
      visits: 2000 + Math.floor(Math.random() * 1000),
    })),
  },
  {
    name: 'Database Service',
    traffic: Array.from({ length: 12 }, (_, i) => ({
      date: `2023-01-0${i + 1}`,
      visits: 500 + Math.floor(Math.random() * 200),
    })),
  },
];

const DemoTraffic = () => {
  const [trafficData] = useState(dummyTrafficData);
  const [loading] = useState(false);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Traffic (Based On Dummy Data)</h1>
      {loading ? (
        <p>Loading traffic data...</p>
      ) : trafficData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trafficData.map((data, index) => (
            <TrafficCard key={index} serviceName={data.name} trafficData={data.traffic} />
          ))}
        </div>
      ) : (
        <p>No traffic data to display.</p>
      )}
    </div>
  );
};

export default DemoTraffic;
