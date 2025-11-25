import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface SparklineChartProps {
  data: { time: string; value: number }[];
  color: string;
}

const SparklineChart: React.FC<SparklineChartProps> = ({ data, color }) => {
  return (
    <div style={{ width: '100%', height: '60px' }}>
      <ResponsiveContainer>
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SparklineChart;
