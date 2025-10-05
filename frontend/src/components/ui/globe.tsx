import React, { useEffect, useRef } from 'react';
import createPanzoom from 'panzoom';

const Globe = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const locations = [
    { lat: 34.0522, lon: -118.2437, city: 'Los Angeles' },
    { lat: 40.7128, lon: -74.0060, city: 'New York' },
    { lat: 51.5074, lon: -0.1278, city: 'London' },
    { lat: -23.5505, lon: -46.6333, city: 'Sao Paulo' },
    { lat: 35.6895, lon: 139.6917, city: 'Tokyo' },
    { lat: -33.8688, lon: 151.2093, city: 'Sydney' },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;

    window.addEventListener('resize', () => {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    });

    const projection = {
      scale: height / 2.5,
      center: [width / 2, height / 2],
      rotation: [0, 0, 0],
    };

    const panzoom = createPanzoom(canvas, {
      maxZoom: 2,
      minZoom: 0.5,
      contain: 'outside',
    });

    let autorotate: NodeJS.Timeout | null = null;

    const startAutorotate = () => {
      if (autorotate) clearInterval(autorotate);
      autorotate = setInterval(() => {
        projection.rotation[0] += 0.5;
        render();
      }, 50);
    };

    const stopAutorotate = () => {
      if (autorotate) clearInterval(autorotate);
      autorotate = null;
    };

    startAutorotate();

    canvas.addEventListener('mousedown', stopAutorotate);
    canvas.addEventListener('touchstart', stopAutorotate);
    canvas.addEventListener('wheel', stopAutorotate);
    canvas.addEventListener('mouseup', startAutorotate);
    canvas.addEventListener('touchend', startAutorotate);

    function render() {
      ctx!.clearRect(0, 0, width, height);

      ctx!.fillStyle = '#0a0a0a';
      ctx!.fillRect(0, 0, width, height);

      ctx!.strokeStyle = '#222';
      ctx!.lineWidth = 0.5;
      for (let i = -90; i <= 90; i += 30) {
        drawGraticule(i, 'lat');
      }
      for (let i = -180; i <= 180; i += 30) {
        drawGraticule(i, 'lon');
      }

      ctx!.fillStyle = '#0f0';
      locations.forEach(loc => {
        const [x, y] = project(loc.lat, loc.lon);
        if (x !== -1) {
          ctx!.beginPath();
          ctx!.arc(x, y, 3, 0, 2 * Math.PI);
          ctx!.fill();
        }
      });
    }

    function drawGraticule(value: number, type: 'lat' | 'lon') {
      const points: [number, number][] = [];
      for (let i = -180; i <= 180; i += 5) {
        const [x, y] = type === 'lat' ? project(value, i) : project(i, value);
        if (x !== -1) {
          points.push([x, y]);
        }
      }
      if (points.length > 1) {
        ctx!.beginPath();
        ctx!.moveTo(points[0][0], points[0][1]);
        for (let i = 1; i < points.length; i++) {
          ctx!.lineTo(points[i][0], points[i][1]);
        }
        ctx!.stroke();
      }
    }

    function project(lat: number, lon: number): [number, number] {
      const lambda = lon * Math.PI / 180;
      const phi = lat * Math.PI / 180;
      const [rotLambda, rotPhi] = [projection.rotation[0] * Math.PI / 180, projection.rotation[1] * Math.PI / 180];

      const cosPhi = Math.cos(phi);
      const x = cosPhi * Math.sin(lambda - rotLambda);
      const y = Math.cos(rotPhi) * Math.sin(phi) - Math.sin(rotPhi) * cosPhi * Math.cos(lambda - rotLambda);
      const z = Math.sin(rotPhi) * Math.sin(phi) + Math.cos(rotPhi) * cosPhi * Math.cos(lambda - rotLambda);

      if (z < -0.1) return [-1, -1];

      return [
        projection.center[0] + projection.scale * x,
        projection.center[1] - projection.scale * y
      ];
    }

    render();

    return () => {
      stopAutorotate();
      panzoom.dispose();
      window.removeEventListener('resize', () => {});
    };
  }, []);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />;
};

export default Globe;
