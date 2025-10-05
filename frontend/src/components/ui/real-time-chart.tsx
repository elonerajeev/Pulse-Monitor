import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const RealTimeChart = () => {
  const demoWebsites = useMemo(() => [
    { name: "TechCrunch", color: "#8884d8" },
    { name: "The Verge", color: "#82ca9d" },
    { name: "Hacker News", color: "#ffc658" },
    { name: "GitHub", color: "#ff8042" },
    { name: "Product Hunt", color: "#a4de6c" },
    { name: "Indie Hackers", color: "#d0ed57" },
    { name: "Reddit", color: "#ff7300" },
  ], []);

  const [data, setData] = useState(() => {
    const initialData = [];
    const time = new Date();
    for (let i = 10; i >= 0; i--) {
      const entry = { time: new Date(time.getTime() - i * 5000).toLocaleTimeString() };
      demoWebsites.forEach(site => {
        entry[site.name] = 100 + Math.random() * 200;
      });
      initialData.push(entry);
    }
    return initialData;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prevData => {
        const newData = [...prevData];
        if (newData.length >= 12) {
          newData.shift();
        }
        const newEntry = { time: new Date().toLocaleTimeString() };
        demoWebsites.forEach(site => {
          const lastValue = newData.length > 0 ? newData[newData.length - 1][site.name] : 150;
          newEntry[site.name] = Math.max(50, lastValue + (Math.random() - 0.5) * 50);
        });
        return [...newData, newEntry];
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [demoWebsites]);

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
        {demoWebsites.map(site => (
          <Line
            key={site.name}
            type="monotone"
            dataKey={site.name}
            stroke={site.color}
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
