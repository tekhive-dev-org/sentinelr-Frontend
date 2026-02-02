import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

const Globe = dynamic(() => import('react-globe.gl'), { ssr: false });

export default function TechGlobe() {
  const globeRef = useRef(null);

  // Major cities as monitoring nodes
  const places = [
    { lat: 40.7128, lng: -74.0060, city: 'New York', size: 0.8 },
    { lat: 51.5074, lng: -0.1278, city: 'London', size: 0.8 },
    { lat: 35.6762, lng: 139.6503, city: 'Tokyo', size: 0.8 },
    { lat: -33.8688, lng: 151.2093, city: 'Sydney', size: 0.8 },
    { lat: 1.3521, lng: 103.8198, city: 'Singapore', size: 0.8 },
    { lat: -23.5505, lng: -46.6333, city: 'São Paulo', size: 0.8 },
    { lat: 52.5200, lng: 13.4050, city: 'Berlin', size: 0.8 },
    { lat: 19.4326, lng: -99.1332, city: 'Mexico City', size: 0.8 },
    { lat: 37.7749, lng: -122.4194, city: 'San Francisco', size: 0.8 },
    { lat: 55.7558, lng: 37.6173, city: 'Moscow', size: 0.8 },
    { lat: 28.6139, lng: 77.2090, city: 'New Delhi', size: 0.8 },
    { lat: 31.2304, lng: 121.4737, city: 'Shanghai', size: 0.8 },
    { lat: 25.2048, lng: 55.2708, city: 'Dubai', size: 0.8 },
    { lat: 48.8566, lng: 2.3522, city: 'Paris', size: 0.8 },
    { lat: -34.6037, lng: -58.3816, city: 'Buenos Aires', size: 0.8 },
    // African cities
    { lat: -1.2921, lng: 36.8219, city: 'Nairobi', size: 0.8 },
    { lat: 6.5244, lng: 3.3792, city: 'Lagos', size: 0.8 },
    { lat: -33.9249, lng: 18.4241, city: 'Cape Town', size: 0.8 },
    { lat: 30.0444, lng: 31.2357, city: 'Cairo', size: 0.8 },
    { lat: -26.2041, lng: 28.0473, city: 'Johannesburg', size: 0.8 },
    { lat: 33.5731, lng: -7.5898, city: 'Casablanca', size: 0.8 },
    { lat: 5.6037, lng: -0.1870, city: 'Accra', size: 0.8 },
    { lat: 9.0579, lng: 7.4951, city: 'Abuja', size: 0.8 },
    { lat: -4.4419, lng: 15.2663, city: 'Kinshasa', size: 0.8 },
  ];

  // Dense network connections - more connections for a web-like appearance
  const arcs = [
    // North America connections
    { startLat: 40.7128, startLng: -74.0060, endLat: 51.5074, endLng: -0.1278 },
    { startLat: 40.7128, startLng: -74.0060, endLat: 37.7749, endLng: -122.4194 },
    { startLat: 40.7128, startLng: -74.0060, endLat: -23.5505, endLng: -46.6333 },
    { startLat: 40.7128, startLng: -74.0060, endLat: 35.6762, endLng: 139.6503 },
    { startLat: 37.7749, startLng: -122.4194, endLat: 35.6762, endLng: 139.6503 },
    { startLat: 37.7749, startLng: -122.4194, endLat: 1.3521, endLng: 103.8198 },
    { startLat: 19.4326, startLng: -99.1332, endLat: 40.7128, endLng: -74.0060 },
    // Europe connections
    { startLat: 51.5074, startLng: -0.1278, endLat: 52.5200, endLng: 13.4050 },
    { startLat: 51.5074, startLng: -0.1278, endLat: 48.8566, endLng: 2.3522 },
    { startLat: 51.5074, startLng: -0.1278, endLat: 55.7558, endLng: 37.6173 },
    { startLat: 51.5074, startLng: -0.1278, endLat: 25.2048, endLng: 55.2708 },
    { startLat: 52.5200, startLng: 13.4050, endLat: 55.7558, endLng: 37.6173 },
    { startLat: 48.8566, startLng: 2.3522, endLat: 25.2048, endLng: 55.2708 },
    // Asia connections
    { startLat: 35.6762, startLng: 139.6503, endLat: 31.2304, endLng: 121.4737 },
    { startLat: 35.6762, startLng: 139.6503, endLat: 1.3521, endLng: 103.8198 },
    { startLat: 31.2304, startLng: 121.4737, endLat: 1.3521, endLng: 103.8198 },
    { startLat: 28.6139, startLng: 77.2090, endLat: 1.3521, endLng: 103.8198 },
    { startLat: 28.6139, startLng: 77.2090, endLat: 25.2048, endLng: 55.2708 },
    { startLat: 55.7558, startLng: 37.6173, endLat: 35.6762, endLng: 139.6503 },
    // Australia connection
    { startLat: 1.3521, startLng: 103.8198, endLat: -33.8688, endLng: 151.2093 },
    // Africa connections - comprehensive network
    { startLat: -1.2921, startLng: 36.8219, endLat: 25.2048, endLng: 55.2708 }, // Nairobi - Dubai
    { startLat: -1.2921, startLng: 36.8219, endLat: 51.5074, endLng: -0.1278 }, // Nairobi - London
    { startLat: -1.2921, startLng: 36.8219, endLat: 28.6139, endLng: 77.2090 }, // Nairobi - New Delhi
    { startLat: -1.2921, startLng: 36.8219, endLat: 6.5244, endLng: 3.3792 }, // Nairobi - Lagos
    { startLat: -1.2921, startLng: 36.8219, endLat: -26.2041, endLng: 28.0473 }, // Nairobi - Johannesburg
    { startLat: -1.2921, startLng: 36.8219, endLat: 30.0444, endLng: 31.2357 }, // Nairobi - Cairo
    { startLat: 6.5244, startLng: 3.3792, endLat: 51.5074, endLng: -0.1278 }, // Lagos - London
    { startLat: 6.5244, startLng: 3.3792, endLat: 5.6037, endLng: -0.1870 }, // Lagos - Accra
    { startLat: 6.5244, startLng: 3.3792, endLat: 9.0579, endLng: 7.4951 }, // Lagos - Abuja
    { startLat: 6.5244, startLng: 3.3792, endLat: -4.4419, endLng: 15.2663 }, // Lagos - Kinshasa
    { startLat: 6.5244, startLng: 3.3792, endLat: 33.5731, endLng: -7.5898 }, // Lagos - Casablanca
    { startLat: -33.9249, startLng: 18.4241, endLat: -26.2041, endLng: 28.0473 }, // Cape Town - Johannesburg
    { startLat: -33.9249, startLng: 18.4241, endLat: 51.5074, endLng: -0.1278 }, // Cape Town - London
    { startLat: -33.9249, startLng: 18.4241, endLat: -1.2921, endLng: 36.8219 }, // Cape Town - Nairobi
    { startLat: 30.0444, startLng: 31.2357, endLat: 51.5074, endLng: -0.1278 }, // Cairo - London
    { startLat: 30.0444, startLng: 31.2357, endLat: 25.2048, endLng: 55.2708 }, // Cairo - Dubai
    { startLat: 30.0444, startLng: 31.2357, endLat: 48.8566, endLng: 2.3522 }, // Cairo - Paris
    { startLat: 30.0444, startLng: 31.2357, endLat: 33.5731, endLng: -7.5898 }, // Cairo - Casablanca
    { startLat: -26.2041, startLng: 28.0473, endLat: 25.2048, endLng: 55.2708 }, // Johannesburg - Dubai
    { startLat: -26.2041, startLng: 28.0473, endLat: -4.4419, endLng: 15.2663 }, // Johannesburg - Kinshasa
    { startLat: 33.5731, startLng: -7.5898, endLat: 48.8566, endLng: 2.3522 }, // Casablanca - Paris
    { startLat: 33.5731, startLng: -7.5898, endLat: 51.5074, endLng: -0.1278 }, // Casablanca - London
    { startLat: 5.6037, startLng: -0.1870, endLat: 51.5074, endLng: -0.1278 }, // Accra - London
    { startLat: 9.0579, startLng: 7.4951, endLat: 6.5244, endLng: 3.3792 }, // Abuja - Lagos
    { startLat: -4.4419, startLng: 15.2663, endLat: -1.2921, endLng: 36.8219 }, // Kinshasa - Nairobi
    // South America
    { startLat: -23.5505, startLng: -46.6333, endLat: -34.6037, endLng: -58.3816 },
    { startLat: -34.6037, startLng: -58.3816, endLat: 51.5074, endLng: -0.1278 },
    { startLat: -23.5505, startLng: -46.6333, endLat: 6.5244, endLng: 3.3792 }, // São Paulo - Lagos
    // Cross-continental
    { startLat: 25.2048, startLng: 55.2708, endLat: 31.2304, endLng: 121.4737 },
    { startLat: -33.8688, startLng: 151.2093, endLat: 31.2304, endLng: 121.4737 },
    { startLat: -33.8688, startLng: 151.2093, endLat: -26.2041, endLng: 28.0473 }, // Sydney - Johannesburg
  ];

  useEffect(() => {
    // Wait for globe to fully initialize
    const timer = setTimeout(() => {
      if (globeRef.current) {
        try {
          // Set initial view first - adjust lat, lng, altitude as needed
          globeRef.current.pointOfView({ lat: 31.2304, lng: 121.4737, altitude: 1.0 }, 0);
          
          const controls = globeRef.current.controls();
          if (controls) {
            controls.enableZoom = false;
            // Start auto-rotate after 1 second so initial view is visible first
            setTimeout(() => {
              if (controls) {
                controls.autoRotate = true;
                controls.autoRotateSpeed = 0.4;
              }
            }, 1000);
          }
        } catch (error) {
          console.log('Globe initializing...');
        }
      }
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <Globe
        ref={globeRef}
        // Clean digital globe
        globeImageUrl="https://raw.githubusercontent.com/vasturiano/three-globe/master/example/img/earth-blue-marble.jpg"
        
        // Brand color atmosphere glow - no shadow
        showAtmosphere={true}
        atmosphereColor="#fff"
        atmosphereAltitude={0.12}
        
        // Network nodes - brand color points
        pointsData={places}
        pointLat="lat"
        pointLng="lng"
        pointColor={() => '#e07030'}
        pointAltitude={0.015}
        pointRadius={0.6}
        pointLabel={d => `
          <div style="
            background: rgba(18, 6, 30, 0.95);
            padding: 8px 14px;
            border-radius: 6px;
            font-family: Inter, sans-serif;
            font-size: 12px;
            font-weight: 600;
            color: #fff;
            border: 1px solid rgba(224, 112, 48, 0.5);
          ">
            <div style="color: #e07030; margin-bottom: 2px;">${d.city}</div>
            <div style="font-size: 9px; color: rgba(255,255,255,0.7); text-transform: uppercase; letter-spacing: 0.5px;">● Active</div>
          </div>
        `}
        
        // Network connections - brand color arcs
        arcsData={arcs}
        arcColor={() => ['#fff', '#fff']}
        arcDashLength={0.4}
        arcDashGap={0.2}
        arcDashAnimateTime={1500}
        arcStroke={0.4}
        arcAltitude={0.1}
        arcAltitudeAutoScale={0.3}
        
        // Subtle rings from nodes - brand color
        ringsData={places}
        ringLat="lat"
        ringLng="lng"
        ringColor={() => () => '#fff'}
        ringMaxRadius={4.5}
        ringPropagationSpeed={1.5}
        ringRepeatPeriod={2500}
        
        // Rendering settings
        width={typeof window !== 'undefined' ? Math.min(window.innerWidth * 0.95, 700) : 700}
        height={typeof window !== 'undefined' && window.innerWidth < 1024 ? 420 : 800}
        backgroundColor="rgba(0,0,0,0)"
      />
    </div>
  );
}
