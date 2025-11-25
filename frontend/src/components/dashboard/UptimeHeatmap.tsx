import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface UptimeHeatmapProps {
  data: { date: string; uptime: number }[];
}

const UptimeHeatmap: React.FC<UptimeHeatmapProps> = ({ data }) => {
  const getCellColor = (uptime: number) => {
    if (uptime >= 99.9) return 'bg-green-500';
    if (uptime >= 99) return 'bg-yellow-400';
    if (uptime > 0) return 'bg-red-500';
    return 'bg-gray-200 dark:bg-gray-700';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Uptime (Last 90 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="flex flex-wrap gap-1">
            {data.map(({ date, uptime }) => (
              <Tooltip key={date}>
                <TooltipTrigger asChild>
                  <div
                    className={`w-4 h-4 rounded-sm ${getCellColor(uptime)}`}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{date}</p>
                  <p>Uptime: {uptime.toFixed(2)}%</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
};

export default UptimeHeatmap;
