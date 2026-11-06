import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Drone {
  id: number;
  type: string;
  status: string;
  lat: number;
  lon: number;
  battery: number;
  color: string;
  deployedAt?: number;
}

interface TacticalMapProps {
  drones: Drone[];
  targetLat: string;
  targetLon: string;
}

const getTargetStyle = (drones: Drone[], currentTime: number) => {
  const mostRecent = drones.length > 0 ? Math.max(...drones.map(d => d.deployedAt || 0)) : null;
  if (!mostRecent) return { color: '#9ca3af', rgba: 'rgba(156,163,175,0.4)' };
  const age = (currentTime - mostRecent) / 1000;
  if (age < 10) return { color: '#ef4444', rgba: 'rgba(239,68,68,0.4)' };
  if (age < 30) return { color: '#eab308', rgba: 'rgba(234,179,8,0.4)' };
  return { color: '#22c55e', rgba: 'rgba(34,197,94,0.4)' };
};

const TacticalMap: React.FC<TacticalMapProps> = ({ drones, targetLat, targetLon }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<number, L.CircleMarker>>(new Map());
  const targetMarkersRef = useRef<L.Marker[]>([]);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const lastTargetRef = useRef('');
  const lastStyleRef = useRef('');
  const dronesRef = useRef<Drone[]>([]);

  // Update time every 2 seconds instead of 1 for better performance
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 2000);
    return () => clearInterval(interval);
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    const map = L.map(mapRef.current, {
      center: [parseFloat(targetLat) || 31.9686, parseFloat(targetLon) || 35.9163],
      zoom: 8, zoomControl: true, preferCanvas: true
    });
    mapInstanceRef.current = map;
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap', maxZoom: 19
    }).addTo(map);
    return () => { map.remove(); mapInstanceRef.current = null; };
  }, []);

  // Update map view when target changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const targetKey = targetLat + '-' + targetLon;
    if (lastTargetRef.current === targetKey) return;
    lastTargetRef.current = targetKey;
    map.setView([parseFloat(targetLat) || 31.9686, parseFloat(targetLon) || 35.9163], 14);
  }, [targetLat, targetLon]);

  // Update target markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    
    const lat = parseFloat(targetLat) || 31.9686;
    const lon = parseFloat(targetLon) || 35.9163;
    const s = getTargetStyle(drones, currentTime);
    const styleKey = s.color + '-' + lat + '-' + lon;
    
    // Only recreate if style or position changed
    if (lastStyleRef.current === styleKey) return;
    lastStyleRef.current = styleKey;
    
    targetMarkersRef.current.forEach(m => m.remove());
    targetMarkersRef.current = [];

    const h = L.divIcon({ className: 'th', html: `<div style="position:relative;width:200px;height:200px;animation:blink 0.5s ease-in-out infinite"><div style="position:absolute;top:50%;left:50%;width:180px;height:180px;border:4px solid ${s.rgba};border-radius:50%;transform:translate(-50%,-50%)"></div><div style="position:absolute;top:50%;left:50%;width:140px;height:140px;border:3px solid ${s.rgba};border-radius:50%;transform:translate(-50%,-50%)"></div><div style="position:absolute;top:50%;left:50%;width:100px;height:100px;border:2px solid ${s.rgba};border-radius:50%;transform:translate(-50%,-50%)"></div><div style="position:absolute;top:50%;left:50%;width:200px;height:200px;background:radial-gradient(circle,${s.rgba} 0%,transparent 70%);border-radius:50%;transform:translate(-50%,-50%)"></div></div>`, iconSize: [200, 200], iconAnchor: [100, 100] });
    targetMarkersRef.current.push(L.marker([lat, lon], { icon: h }).addTo(map));

    const c = L.divIcon({ className: 'tc', html: `<div style="position:relative;width:80px;height:80px;animation:blink 0.5s ease-in-out infinite"><div style="position:absolute;top:50%;left:0;right:0;height:2px;background:${s.color};transform:translateY(-50%)"></div><div style="position:absolute;left:50%;top:0;bottom:0;width:2px;background:${s.color};transform:translateX(-50%)"></div><div style="position:absolute;top:50%;left:50%;width:40px;height:40px;border:3px solid ${s.color};border-radius:50%;transform:translate(-50%,-50%)"></div><div style="position:absolute;top:50%;left:50%;width:28px;height:28px;border:2px solid ${s.color};border-radius:50%;transform:translate(-50%,-50%)"></div><div style="position:absolute;top:50%;left:50%;width:16px;height:16px;border:2px solid ${s.color};border-radius:50%;transform:translate(-50%,-50%)"></div><div style="position:absolute;top:50%;left:50%;width:6px;height:6px;background:${s.color};border-radius:50%;transform:translate(-50%,-50%)"></div></div>`, iconSize: [80, 80], iconAnchor: [40, 40] });
    targetMarkersRef.current.push(L.marker([lat, lon], { icon: c }).addTo(map));

    const l = L.divIcon({ className: 'tl', html: `<div style="background:${s.color};color:white;padding:8px 12px;border-radius:6px;font-weight:bold;font-size:11px;white-space:nowrap;border:2px solid white;box-shadow:0 4px 15px ${s.rgba};font-family:monospace;animation:blink 0.5s ease-in-out infinite">🎯 TARGET LOCK<br/><span style="font-size:10px;opacity:0.9">LAT: ${lat.toFixed(6)}</span><br/><span style="font-size:10px;opacity:0.9">LON: ${lon.toFixed(6)}</span></div>`, iconSize: [140, 60], iconAnchor: [70, -50] });
    targetMarkersRef.current.push(L.marker([lat, lon], { icon: l }).addTo(map));
  }, [targetLat, targetLon, drones.length, currentTime]);

  // Update drone markers - optimized to only update when drones change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    
    // Check if drones actually changed (not just time update)
    const dronesChanged = drones !== dronesRef.current;
    dronesRef.current = drones;
    
    if (!dronesChanged && markersRef.current.size > 0) {
      // Just update colors without recreating markers
      const now = currentTime;
      markersRef.current.forEach((marker, id) => {
        const drone = drones.find(d => d.id === id);
        if (drone) {
          const age = drone.deployedAt ? (now - drone.deployedAt) / 1000 : 999;
          const col = age < 10 ? '#ef4444' : age < 30 ? '#eab308' : '#22c55e';
          marker.setStyle({ fillColor: col });
        }
      });
      return;
    }
    
    // Remove markers that no longer exist
    const currentIds = new Set(drones.map(d => d.id));
    markersRef.current.forEach((marker, id) => {
      if (!currentIds.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    });
    
    const now = currentTime;
    
    // Add or update markers
    drones.forEach((d) => {
      const age = d.deployedAt ? (now - d.deployedAt) / 1000 : 999;
      const col = age < 10 ? '#ef4444' : age < 30 ? '#eab308' : '#22c55e';
      const label = age < 10 ? 'RECENT' : age < 30 ? 'ACTIVE' : 'COMPLETED';
      
      if (markersRef.current.has(d.id)) {
        // Update existing marker
        const marker = markersRef.current.get(d.id)!;
        marker.setStyle({ fillColor: col });
      } else {
        // Create new marker
        const m = L.circleMarker([d.lat, d.lon], { 
          radius: 6, fillColor: col, color: '#fff', weight: 1, opacity: 1, fillOpacity: 0.9 
        }).addTo(map);
        m.bindPopup('<div class="text-xs font-mono"><strong>DRONE #' + d.id + '</strong><br/>Type: ' + d.type + '<br/>Status: ' + d.status.toUpperCase() + '<br/>State: <span style="color:' + col + ';font-weight:bold">' + label + '</span><br/>Battery: ' + d.battery + '%<br/>Lat: ' + d.lat.toFixed(4) + ', Lon: ' + d.lon.toFixed(4) + '</div>');
        markersRef.current.set(d.id, m);
      }
    });

    // Fit bounds only when new drones added
    if (dronesChanged && drones.length > 0) {
      const lat = parseFloat(targetLat) || 31.9686;
      const lon = parseFloat(targetLon) || 35.9163;
      const bounds = L.latLngBounds([[lat, lon], ...drones.slice(0, 100).map(d => [d.lat, d.lon] as [number, number])]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [drones, currentTime, targetLat, targetLon]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="absolute inset-0 rounded-lg border-2 border-primary/30" />
      <div className="absolute bottom-4 right-4 bg-background/95 border border-primary/30 rounded-lg p-3 font-mono text-xs">
        <div className="font-bold text-primary mb-2">DEPLOYMENT AGE</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#ef4444]"></div><span>Recent (&lt;10s)</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#eab308]"></div><span>Active (10-30s)</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#22c55e]"></div><span>Completed (&gt;30s)</span></div>
        </div>
      </div>
    </div>
  );
};

export default TacticalMap;
