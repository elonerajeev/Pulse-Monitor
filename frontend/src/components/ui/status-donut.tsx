import React, { useEffect, useState } from 'react';
import { Card, CardContent } from './card';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Shield } from 'lucide-react';

const StatusDonut = () => {
  const [data, setData] = useState([
    { name: 'Healthy', value: 143, color: 'hsl(var(--success))' },
    { name: 'Degraded', value: 8, color: 'hsl(var(--warning))' },
    { name: 'Down', value: 5, color: 'hsl(var(--destructive))' },
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setData(currentData => {
        return currentData.map(item => ({
          ...item,
          value: item.name === 'Healthy'
            ? Math.floor(Math.random() * 10) + 140
            : item.name === 'Degraded'
              ? Math.floor(Math.random() * 5) + 5
              : Math.floor(Math.random() * 3) + 3
        }));
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="bg-card/30 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm font-medium">Service Health Status</span>
          </div>
        </div>
        <div className="h-[200px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl font-bold">
                {Math.round((data[0].value / total) * 100)}%
              </div>
              <div className="text-xs text-muted-foreground">Healthy</div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4">
          {data.map((item, index) => (
            <div key={index} className="text-center">
              <div className="text-sm font-medium">{item.name}</div>
              <div className="text-2xl font-bold" style={{ color: item.color }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusDonut;
