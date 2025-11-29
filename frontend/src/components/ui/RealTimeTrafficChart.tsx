
import React from 'react';
import { WifiOff } from 'lucide-react';

const RealTimeTrafficChart: React.FC = () => {
  return (
    <div className="h-full w-full flex items-center justify-center bg-transparent rounded-md">
        <div className="flex flex-col items-center text-center text-muted-foreground">
            <WifiOff className="w-12 h-12 mb-4" />
            <h3 className="text-lg font-semibold text-card-foreground mb-2">Feature Coming Soon</h3>
            <p className="text-sm">
                We're working on bringing you real-time traffic analytics.
            </p>
        </div>
    </div>
  );
};

export default RealTimeTrafficChart;
