import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

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
  services: MonitoringService[];
}

const roundToNearest5Minutes = (date: Date) => {
  const minutes = 5;
  const ms = 1000 * 60 * minutes;
  return new Date(Math.round(date.getTime() / ms) * ms);
};

const RealTimeChart: React.FC<RealTimeChartProps> = ({ services = [] }) => {
  const [data, setData] = useState<any[]>([]);

  const serviceColors = useMemo(() => {
    const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#a4de6c", "#d0ed57", "#ff7300", "#00C49F", "#FFBB28", "#FF8042"];
    return services.reduce((acc, service, index) => {
      acc[service.name] = colors[index % colors.length];
      return acc;
    }, {} as Record<string, string>);
  }, [services]);

  useEffect(() => {
    const timeMap = new Map<string, any>();

    services.forEach(service => {
      if (service.logs) {
        service.logs.forEach(log => {
          const roundedDate = roundToNearest5Minutes(new Date(log.createdAt));
          const time = roundedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          
          if (!timeMap.has(time)) {
            timeMap.set(time, { time });
          }
          timeMap.get(time)[service.name] = log.responseTime;
        });
      }
    });

    const chartData = Array.from(timeMap.values()).sort((a, b) => a.time.localeCompare(b.time));
    setData(chartData);
  }, [services]);

  if (services.length === 0) {
    return <div className="flex items-center justify-center h-full text-muted-foreground">No data to display</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
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
        {services.map(service => (
          <Line
            key={service.name}
            type="monotone"
            dataKey={service.name}
            name={service.name}
            stroke={serviceColors[service.name]}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6 }}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default RealTimeChart;
