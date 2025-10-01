import React, { useEffect, useState } from 'react';
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type DataPoint = {
  time: string;
  value: number;
};

const RealTimeChart = () => {
  const [data, setData] = useState<DataPoint[]>([]);

  useEffect(() => {
    // Initialize with some data points
    const initialData: DataPoint[] = Array.from({ length: 20 }, (_, i) => ({
      time: new Date(Date.now() - (19 - i) * 1000).toLocaleTimeString(),
      value: Math.floor(Math.random() * 20) + 80, // Random value between 80-100
    }));
    setData(initialData);

    // Update data every second
    const interval = setInterval(() => {
      setData(currentData => {
        const newPoint = {
          time: new Date().toLocaleTimeString(),
          value: Math.floor(Math.random() * 20) + 80,
        };
        return [...currentData.slice(1), newPoint];
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full min-h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="time"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
            tickLine={false}
            axisLine={false}
            minTickGap={30}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-[0.70rem] text-muted-foreground">Value</div>
                      <div className="text-[0.70rem] font-bold text-right">
                        {typeof payload[0].value === 'number'
                          ? payload[0].value.toFixed(2)
                          : Number(payload[0].value).toFixed(2)
                        }%
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            fill="url(#colorValue)"
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RealTimeChart;
