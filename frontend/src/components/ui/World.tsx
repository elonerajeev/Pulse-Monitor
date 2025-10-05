import React from 'react';
import { useTheme } from 'next-themes';
import { useGlobe } from '@/hooks/use-globe';
import WorldGrid from '@/components/ui/WorldGrid';

interface WorldProps {
  globeConfig: {
    width: number;
    height: number;
    markerColor: string;
    graticuleColor: string;
    backgroundColor: string;
  };
  data: { lat: number; lon: number; size: number }[];
}

const World: React.FC<WorldProps> = ({ globeConfig, data }) => {
  const { theme } = useTheme();
  const { canvasRef, addMarker } = useGlobe({
    ...globeConfig,
    markerColor: theme === 'dark' ? '#fff' : '#000',
    graticuleColor: theme === 'dark' ? '#888' : '#ccc',
    backgroundColor: theme === 'dark' ? '#000' : '#fff',
  });

  React.useEffect(() => {
    data.forEach(item => addMarker(item.lat, item.lon, item.size));
  }, [data, addMarker]);

  return (
    <div className="relative w-full h-full">
      <WorldGrid />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
    </div>
  );
};

export default World;
