import React, { useState, useEffect, useMemo } from 'react';
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts';

interface MonitoringLog {
  _id: string;
  status: string;
  responseTime: number;
  createdAt: string;
}

interface MonitoringService {
  _id: string;
  name: string;
  target: string;
  serviceType: string;
  status: string;
  latestLog?: MonitoringLog;
  logs: MonitoringLog[];
}

interface RealTimeChartProps {
  services?: MonitoringService[];
}

const IDEAL_RESPONSE_TIME = 500; // ms

const roundToNearest5Minutes = (date: Date) => {
  const minutes = 5;
  const ms = 1000 * 60 * minutes;
  return new Date(Math.round(date.getTime() / ms) * ms);
};

const RealTimeChart: React.FC<RealTimeChartProps> = ({ services }) => {
  const [data, setData] = useState<any[]>([]);

  const chartServices = useMemo(() => {
    if (services && services.length > 0) {
      return services;
    }

    // Generate dummy data for the landing page
    const dummyServices: MonitoringService[] = [
      {
        _id: '1',
        name: 'API',
        target: 'https://api.example.com',
        serviceType: 'api',
        status: 'healthy',
        logs: [],
      },
      {
        _id: '2',
        name: 'Website',
        target: 'https://example.com',
        serviceType: 'website',
        status: 'healthy',
        logs: [],
      },
    ];

    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 5 * 60 * 1000);
      dummyServices[0].logs.push({
        _id: `log1-${i}`,
        status: 'healthy',
        responseTime: Math.floor(Math.random() * (i > 15 && i < 20 ? 700 : 200 - 50 + 1) + 50),
        createdAt: time.toISOString(),
      });
      dummyServices[1].logs.push({
        _id: `log2-${i}`,
        status: 'healthy',
        responseTime: Math.floor(Math.random() * (i > 10 && i < 15 ? 800 : 300 - 100 + 1) + 100),
        createdAt: time.toISOString(),
      });
    }
    return dummyServices;
  }, [services]);

  const serviceColors = useMemo(() => {
    const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#a4de6c", "#d0ed57", "#ff7300", "#00C49F", "#FFBB28", "#FF8042"];
    return chartServices.reduce((acc, service, index) => {
      acc[service.name] = colors[index % colors.length];
      return acc;
    }, {} as Record<string, string>);
  }, [chartServices]);

  useEffect(() => {
    const timeMap = new Map<string, any>();

    chartServices.forEach(service => {
      if (service.logs) {
        service.logs.forEach(log => {
          const roundedDate = roundToNearest5Minutes(new Date(log.createdAt));
          const time = roundedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          if (!timeMap.has(time)) {
            timeMap.set(time, { time });
          }
          const entry = timeMap.get(time);
          entry[service.name] = log.responseTime;

          if (log.responseTime > IDEAL_RESPONSE_TIME) {
            entry[`${service.name}-excess`] = log.responseTime;
          }
        });
      }
    });

    const chartData = Array.from(timeMap.values()).sort((a, b) => a.time.localeCompare(b.time));
    setData(chartData);
  }, [chartServices]);


  if (chartServices.length === 0) {
    return <div className="flex items-center justify-center h-full text-muted-foreground">No data to display</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
        <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} />
        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} unit="ms" />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--background))",
            borderColor: "hsl(var(--border))",
          }}
        />
        <Legend wrapperStyle={{ fontSize: '14px' }} />
        
        <ReferenceLine
          y={IDEAL_RESPONSE_TIME}
          label={{ value: 'Ideal', position: 'insideTopRight', fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          stroke="hsl(var(--primary))"
          strokeDasharray="4 4"
        />

        {chartServices.map(service => (
          <React.Fragment key={service.name}>
            <Line
              type="monotone"
              dataKey={service.name}
              name={service.name}
              stroke={serviceColors[service.name]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
              connectNulls
            />
            <Area
              type="monotone"
              dataKey={`${service.name}-excess`}
              fill="#ef4444" // red-500
              fillOpacity={0.3}
              stroke="none"
              baseValue={IDEAL_RESPONSE_TIME}
              connectNulls={false}
              legendType="none"
              tooltipType="none"
            />
          </React.Fragment>
        ))}
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default RealTimeChart;
