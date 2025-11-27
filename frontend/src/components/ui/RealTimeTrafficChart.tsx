import React, { useState, useEffect, useMemo } from 'react';
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Brush,
} from 'recharts';

interface MonitoringService {
  _id: string;
  name: string;
  logs: { createdAt: string; requests: number }[];
}

interface TrafficData {
    time: string;
    value: number;
}

interface RealTimeTrafficChartProps {
  services?: MonitoringService[];
  data?: TrafficData[];
}

const roundToNearest5Minutes = (date: Date) => {
  const minutes = 5;
  const ms = 1000 * 60 * minutes;
  return new Date(Math.round(date.getTime() / ms) * ms);
};

const RealTimeTrafficChart: React.FC<RealTimeTrafficChartProps> = ({ services, data: trafficData }) => {
  const [data, setData] = useState<any[]>([]);

  const chartServices = useMemo(() => {
    if (services && services.length > 0) {
      return services;
    }

    if (trafficData) {
        return [];
    }

    // Generate dummy data for the landing page
    const dummyServices: MonitoringService[] = [
      {
        _id: '1',
        name: 'API',
        logs: [],
      },
      {
        _id: '2',
        name: 'Website',
        logs: [],
      },
    ];

    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 5 * 60 * 1000);
      dummyServices[0].logs.push({
        createdAt: time.toISOString(),
        requests: Math.floor(Math.random() * (i > 15 && i < 20 ? 500 : 100) + 50),
      });
      dummyServices[1].logs.push({
        createdAt: time.toISOString(),
        requests: Math.floor(Math.random() * (i > 10 && i < 15 ? 800 : 200) + 100),
      });
    }
    return dummyServices;
  }, [services, trafficData]);

  const serviceColors = useMemo(() => {
    const colors = ["#1a9e9e", "#66b2b2", "#3366cc", "#6699cc", "#99ccff", "#ff9933", "#ffcc66", "#cc6699", "#993366", "#663399"];
    return chartServices.reduce((acc, service, index) => {
      acc[service.name] = colors[index % colors.length];
      return acc;
    }, {} as Record<string, string>);
  }, [chartServices]);

  useEffect(() => {
    if (trafficData) {
        setData(trafficData);
        return;
    }

    const timeMap = new Map<number, any>();
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setDate(twentyFourHoursAgo.getDate() - 1);

    chartServices.forEach(service => {
      if (service.logs) {
        service.logs
          .filter(log => new Date(log.createdAt) > twentyFourHoursAgo)
          .forEach(log => {
            const roundedDate = roundToNearest5Minutes(new Date(log.createdAt));
            const timeKey = roundedDate.getTime();

            if (!timeMap.has(timeKey)) {
              timeMap.set(timeKey, { time: timeKey });
            }
            const entry = timeMap.get(timeKey);
            entry[service.name] = log.requests;
          });
      }
    });

    const sortedData = Array.from(timeMap.values()).sort((a, b) => a.time - b.time);

    const chartData = sortedData.map(d => ({
      ...d,
      time: new Date(d.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }));

    setData(chartData);
  }, [chartServices, trafficData]);


  if (chartServices.length === 0 && !trafficData) {
    return <div className="flex items-center justify-center h-full text-muted-foreground">No data to display</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
        <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} />
        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} unit={trafficData ? '' : 'req/min'} />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--background))",
            borderColor: "hsl(var(--border))",
          }}
          formatter={(value: any, name: string) => {
            if (typeof value === 'number') {
              return [`${value.toFixed(0)}${trafficData ? '' : ' req/min'}`, name];
            }
            return [value, name];
          }}
        />
        <Legend wrapperStyle={{ fontSize: '14px' }} />
        
        <Brush
          dataKey="time"
          height={30}
          stroke="hsl(var(--primary))"
          fill="hsl(var(--muted))"
          travellerWidth={10}
          gap={5}
        />

        {trafficData ? (
            <Bar dataKey="value" name="Traffic" fill="#1a9e9e" />
        ) : (
            chartServices.map(service => (
            <Bar
                key={service.name}
                dataKey={service.name}
                name={service.name}
                fill={serviceColors[service.name]}
            />
            ))
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default RealTimeTrafficChart;