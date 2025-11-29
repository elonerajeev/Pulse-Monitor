
import React, { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

interface Location {
  lat: number;
  lon: number;
  city: string;
  status: 'online' | 'offline' | 'degraded';
}

interface GlobeProps {
  locations: Location[];
}

const Globe: React.FC<GlobeProps> = ({ locations }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const globeGroupRef = useRef<THREE.Group | null>(null);

  const dummyLocations = useMemo(() => [
    { lat: 40.7128, lon: -74.0060, city: 'New York', status: 'online' },
    { lat: 34.0522, lon: -118.2437, city: 'Los Angeles', status: 'online' },
    { lat: 51.5074, lon: -0.1278, city: 'London', status: 'degraded' },
    { lat: 35.6895, lon: 139.6917, city: 'Tokyo', status: 'online' },
    { lat: -33.8688, lon: 151.2093, city: 'Sydney', status: 'offline' },
  ], []);

  const allLocations = useMemo(() => [...dummyLocations, ...locations], [locations, dummyLocations]);

  // Effect for one-time setup and teardown of the Three.js scene
  useEffect(() => {
    if (!mountRef.current || typeof window === 'undefined') return;
    const currentMount = mountRef.current;

    // --- Initialize Three.js components ---
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
    camera.position.z = 2.5;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    rendererRef.current = renderer;
    currentMount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;
    controlsRef.current = controls;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);
    
    globeGroupRef.current = new THREE.Group();
    scene.add(globeGroupRef.current);

    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;
      cameraRef.current.aspect = currentMount.clientWidth / currentMount.clientHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(currentMount.clientWidth, currentMount.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // --- Cleanup function ---
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      
      if (currentMount.contains(renderer.domElement)) {
          currentMount.removeChild(renderer.domElement);
      }
      
      renderer.dispose();
    };
  }, []); // Empty dependency array ensures this runs only on mount and unmount

  // Effect for updating the globe with new locations
  useEffect(() => {
    if (!globeGroupRef.current) return;

    const globeGroup = globeGroupRef.current;

    // Clear previous objects
    while (globeGroup.children.length > 0) {
      const obj = globeGroup.children[0];
      globeGroup.remove(obj);
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach(m => m.dispose());
        } else {
          obj.material.dispose();
        }
      }
    }

    // Globe
    const globeGeometry = new THREE.SphereGeometry(1.5, 64, 64);
    const globeMaterial = new THREE.MeshPhongMaterial({
        color: 0x21293d,
        transparent: true,
        opacity: 0.9,
        shininess: 50,
    });
    const globe = new THREE.Mesh(globeGeometry, globeMaterial);
    globeGroup.add(globe);

    // Wireframe
    const wireframeGeometry = new THREE.SphereGeometry(1.52, 32, 32);
    const wireframeMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x3b82f6,
        wireframe: true, 
        transparent: true,
        opacity: 0.1 
    });
    const wireframe = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
    globeGroup.add(wireframe);
    
    const createPoint = (lat: number, lon: number, status: string) => {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);
        const r = 1.5;

        const x = -r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.cos(phi);
        const z = r * Math.sin(phi) * Math.sin(theta);

        const color = status === 'online' ? 0x22c55e : status === 'degraded' ? 0xf97316 : 0xef4444;
        
        const pointGeometry = new THREE.SphereGeometry(0.025, 16, 16);
        const pointMaterial = new THREE.MeshBasicMaterial({ color });
        const point = new THREE.Mesh(pointGeometry, pointMaterial);
        point.position.set(x, y, z);
        return point;
    };

    allLocations.forEach(loc => {
        const point = createPoint(loc.lat, loc.lon, loc.status);
        globe.add(point);
    });

  }, [allLocations]);

  return <div ref={mountRef} className="w-full h-full min-h-[300px]" />;
};

export default Globe;
