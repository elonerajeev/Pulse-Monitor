import React from 'react';
import {
  LineChart,
  BarChart,
  PieChart,
  Activity,
  Server,
  Cpu,
  Database,
  Grid,
  Network,
  Layers,
  Box,
  GitBranch,
  Gauge,
  Workflow,
  Laptop,
  MonitorDot
} from 'lucide-react';

const iconComponents = [
  LineChart,
  BarChart,
  PieChart,
  Activity,
  Server,
  Cpu,
  Database,
  Grid,
  Network,
  Layers,
  Box,
  GitBranch,
  Gauge,
  Workflow,
  Laptop,
  MonitorDot
];

const BackgroundDecorator = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      {/* Top Layer Icons */}
      <div className="absolute -left-10 top-20 transform -rotate-12 opacity-[0.03] animate-float-slow">
        <LineChart size={180} />
      </div>
      <div className="absolute right-20 top-32 transform rotate-12 opacity-[0.03] animate-float-slower">
        <PieChart size={150} />
      </div>

      {/* Middle Layer Icons */}
      <div className="absolute left-1/4 top-1/3 transform -rotate-6 opacity-[0.02] animate-float">
        <Database size={130} />
      </div>
      <div className="absolute right-1/4 top-1/2 transform rotate-12 opacity-[0.015] animate-float-slow">
        <Grid size={200} />
      </div>
      <div className="absolute left-1/3 top-2/3 transform rotate-45 opacity-[0.02] animate-float-slower">
        <Server size={160} />
      </div>

      {/* Background Network Pattern */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.02]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Connecting Lines */}
        <path
          d="M100,100 Q250,150 400,50 T700,100"
          stroke="currentColor"
          strokeWidth="1"
          fill="none"
          className="animate-draw"
        />
        <path
          d="M50,200 Q200,250 350,150 T650,200"
          stroke="currentColor"
          strokeWidth="1"
          fill="none"
          className="animate-draw-slow"
        />
      </svg>

      {/* Floating Elements */}
      {[...Array(8)].map((_, index) => {
        const IconComponent = iconComponents[index % iconComponents.length];
        const randomSize = Math.floor(Math.random() * 60) + 60; // Random size between 60-120
        const styles = {
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          transform: `rotate(${Math.random() * 360}deg)`,
          opacity: 0.02,
          animation: `float ${3 + Math.random() * 2}s infinite ease-in-out`
        };

        return (
          <div
            key={index}
            className="absolute animate-float"
            style={styles}
          >
            <IconComponent size={randomSize} />
          </div>
        );
      })}
    </div>
  );
};

export default BackgroundDecorator;
