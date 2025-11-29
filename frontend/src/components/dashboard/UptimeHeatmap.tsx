import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface UptimeHeatmapProps {
  data: { date: string; uptime: number }[];
}

const UptimeHeatmap: React.FC<UptimeHeatmapProps> = ({ data }) => {
  const getColor = (uptime: number | null) => {
    if (uptime === null || uptime < 0) return 'bg-gray-700/50'; // No data
    if (uptime === 0) return 'bg-black'; // Server down
    if (uptime < 30) return 'bg-red-500';
    if (uptime < 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const totalDays = data.length > 0 ? data.length : 90;
  const daysWithData = data.filter(d => d.uptime >= 0).length;
  
  const overallUptime = daysWithData > 0 
    ? data.reduce((acc, day) => acc + (day.uptime >= 0 ? day.uptime : 0), 0) / daysWithData 
    : 100;
  
  const incidents = data.filter(d => d.uptime < 100 && d.uptime >= 0).length;
  const majorOutages = data.filter(d => d.uptime > 0 && d.uptime < 30).length;
  const completeOutages = data.filter(d => d.uptime === 0).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Uptime (Last 90 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col">
          <div>
            <div className="grid grid-cols-[repeat(15,minmax(0,1fr))] gap-1">
              {Array.from({ length: 90 }).map((_, index) => {
                const day = data[index] || { date: '', uptime: -1 };
                return (
                  <div key={index} className="group relative aspect-square">
                    <div 
                      className={`w-full h-full rounded-sm ${getColor(day.uptime)}`} 
                    />
                    {day.date && (
                      <div className="absolute bottom-full mb-2 w-max hidden group-hover:block bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
                        {new Date(day.date).toLocaleDateString()}: {day.uptime >= 0 ? `${day.uptime.toFixed(2)}%` : 'No data'}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex justify-between items-center text-sm mb-2">
              <span className="font-semibold text-card-foreground">90-Day Uptime</span>
              <span className={`font-bold ${overallUptime < 30 ? 'text-red-500' : overallUptime < 60 ? 'text-yellow-500' : 'text-green-500'}`}>
                {overallUptime.toFixed(3)}%
              </span>
            </div>
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>Total Incidents</span>
              <span>{incidents}</span>
            </div>
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>Days with Major Outages (&lt;30%)</span>
              <span>{majorOutages}</span>
            </div>
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>Days with Complete Outages</span>
              <span>{completeOutages}</span>
            </div>
            <div className="flex justify-end space-x-3 mt-4 text-xs items-center text-muted-foreground">
                <div className="flex items-center"><div className="w-2.5 h-2.5 rounded-sm bg-green-500 mr-1.5"></div>&gt;= 60%</div>
                <div className="flex items-center"><div className="w-2.5 h-2.5 rounded-sm bg-yellow-500 mr-1.5"></div>30-60%</div>
                <div className="flex items-center"><div className="w-2.5 h-2.5 rounded-sm bg-red-500 mr-1.5"></div>&lt;30%</div>
                <div className="flex items-center"><div className="w-2.5 h-2.5 rounded-sm bg-black mr-1.5"></div>Down</div>
                <div className="flex items-center"><div className="w-2.5 h-2.5 rounded-sm bg-gray-700/50 mr-1.5"></div>No data</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UptimeHeatmap;
