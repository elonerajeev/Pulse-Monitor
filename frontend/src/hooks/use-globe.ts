import { useState, useEffect, useRef } from 'react';

interface GlobeConfig {
  width: number;
  height: number;
  markerColor: string;
  graticuleColor: string;
  backgroundColor: string;
}

export const useGlobe = (config: GlobeConfig) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [projection, setProjection] = useState({ rotate: [0, -30, 0], scale: 250 });

  useEffect(() => {
    // Globe rendering logic will go here
  }, [config]);

  const addMarker = (lat: number, lon: number, size: number) => {
    // Logic to add a marker to the globe
  };

  return { canvasRef, addMarker };
};
