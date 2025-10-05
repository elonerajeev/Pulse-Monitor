import React, { useMemo } from 'react';
import { Card, CardContent } from './card';
import { Globe } from 'lucide-react';

const GlobalMap = () => {
  const locations = useMemo(() => {
    const locs = [];
    const gridSize = 7; // Create a 7x7 grid for a denser map
    for (let i = 1; i <= gridSize; i++) {
      for (let j = 1; j <= gridSize; j++) {
        locs.push({
          x: i * (100 / (gridSize + 1)) + (Math.random() - 0.5) * 10,
          y: j * (100 / (gridSize + 1)) + (Math.random() - 0.5) * 10,
          status: ['success', 'warning', 'error'][Math.floor(Math.random() * 3)],
        });
      }
    }
    return locs;
  }, []);

  const connections = useMemo(() => {
    const conns = [];
    for (let i = 0; i < locations.length; i++) {
      for (let j = i + 1; j < locations.length; j++) {
        const dist = Math.sqrt(Math.pow(locations[i].x - locations[j].x, 2) + Math.pow(locations[i].y - locations[j].y, 2));
        if (dist < 25 && Math.random() > 0.2) { // Connect nodes that are close to each other
          conns.push({ from: locations[i], to: locations[j] });
        }
      }
    }
    return conns;
  }, [locations]);

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
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
              </linearGradient>
            </defs>

            {/* Connection Lines */}
            {connections.map((conn, index) => (
              <g key={`conn-${index}`}>
                <path
                  d={`M ${conn.from.x} ${conn.from.y} L ${conn.to.x} ${conn.to.y}`}
                  stroke="url(#line-gradient)"
                  strokeWidth="0.5"
                  strokeOpacity="0.6"
                />
              </g>
            ))}

            {/* Animated Particles */}
            {connections.map((conn, index) => (
              <circle key={`particle-${index}`} r="0.5" fill="hsl(var(--primary))">
                <animateMotion
                  dur={`${3 + Math.random() * 3}s`}
                  repeatCount="indefinite"
                  path={`M ${conn.from.x} ${conn.from.y} L ${conn.to.x} ${conn.to.y}`}
                />
              </circle>
            ))}

            {/* Location Indicators */}
            {locations.map((loc, index) => (
              <circle
                key={`loc-${index}`}
                cx={loc.x}
                cy={loc.y}
                r="1.5"
                className={`fill-current ${loc.status === 'success' ? 'text-success' : loc.status === 'warning' ? 'text-warning' : 'text-destructive'}`}>
                <animate
                  attributeName="r"
                  values="1.5;3;1.5"
                  dur="2s"
                  begin={`${Math.random() * 2}s`}
                  repeatCount="indefinite"
                />
              </circle>
            ))}
          </svg>
        </div>
      </CardContent>
    </Card>
  );
};

export default GlobalMap;