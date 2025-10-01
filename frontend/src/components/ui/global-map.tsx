import React from 'react';
import { Card, CardContent } from './card';
import { Globe } from 'lucide-react';

const GlobalMap = () => {
  // Simplified world map data points representing monitoring locations
  const locations = [
    { x: 20, y: 30, status: 'success' },
    { x: 35, y: 45, status: 'success' },
    { x: 50, y: 25, status: 'warning' },
    { x: 75, y: 60, status: 'success' },
    { x: 85, y: 35, status: 'error' },
    { x: 15, y: 65, status: 'success' },
    { x: 60, y: 70, status: 'success' },
    { x: 40, y: 80, status: 'success' },
    // Add more locations as needed
  ];

  return (
    <Card className="bg-card/30 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Globe className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm font-medium">Global Monitoring Status</span>
          </div>
        </div>
        <div className="relative w-full h-[300px] bg-muted/10 rounded-lg overflow-hidden">
          {/* World Map Background Pattern */}
          <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMjIiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNODAgMGwtODAgODBtODAgMGwtODAtODBtODAgODBsLTgwLTgwbTgwIDBsLTgwIDgwIi8+PC9nPjwvZz48L3N2Zz4=')]" />

          {/* Monitoring Location Indicators */}
          {locations.map((loc, index) => (
            <div
              key={index}
              className={`absolute w-2 h-2 rounded-full animate-pulse
                ${loc.status === 'success' ? 'bg-success' :
                  loc.status === 'warning' ? 'bg-warning' : 'bg-destructive'}`}
              style={{
                left: `${loc.x}%`,
                top: `${loc.y}%`,
                boxShadow: `0 0 12px ${loc.status === 'success' ? 'hsl(var(--success))' :
                  loc.status === 'warning' ? 'hsl(var(--warning))' : 'hsl(var(--destructive))'}`
              }}
            />
          ))}

          {/* Connection Lines */}
          <svg className="absolute inset-0 w-full h-full">
            {locations.map((loc, index) => (
              <path
                key={`path-${index}`}
                d={`M ${loc.x} ${loc.y} Q ${loc.x + 20} ${loc.y - 20} ${loc.x + 40} ${loc.y}`}
                className="stroke-primary/20"
                fill="none"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
            ))}
          </svg>
        </div>
      </CardContent>
    </Card>
  );
};

export default GlobalMap;
