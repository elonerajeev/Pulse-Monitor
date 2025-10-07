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

const RealTimeChart: React.FC<RealTimeChartProps> = ({ services = [] }) => {
  const [data, setData] = useState<any[]>([]);

  const serviceColors = useMemo(() => {
    const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#a4de6c", "#d0ed57", "#ff7300"];
    return services.reduce((acc, service, index) => {
      acc[service.name] = colors[index % colors.length];
      return acc;
    }, {});
  }, [services]);

  useEffect(() => {
    const timeMap = new Map<string, any>();

    services.forEach(service => {
      if (service.logs) {
        service.logs.forEach(log => {
          const time = new Date(log.createdAt).toLocaleTimeString();
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

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
        <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} />
        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
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
            stroke={serviceColors[service.name]}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default RealTimeChart;
