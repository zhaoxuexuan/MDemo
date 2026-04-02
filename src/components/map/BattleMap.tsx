import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Target, Weapon, Sensor } from '@/types';
import { Target as TargetIcon, Crosshair, Radio } from 'lucide-react';
import { renderToString } from 'react-dom/server';

interface BattleMapProps {
  targets?: Target[];
  weapons?: Weapon[];
  sensors?: Sensor[];
  selectedTargetId?: string | null;
  onTargetSelect?: (target: Target) => void;
  center?: [number, number];
  zoom?: number;
  showWeaponRange?: boolean;
}

// Custom icon creator
const createIcon = (iconComponent: React.ReactElement, color: string) => {
  const svgString = renderToString(iconComponent);
  
  return L.divIcon({
    html: `<div style="
      width: 32px; 
      height: 32px; 
      background: ${color}; 
      border-radius: 50%; 
      display: flex; 
      align-items: center; 
      justify-content: center;
      border: 2px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.4);
    ">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
        ${svgString.match(/<path[^>]*>/)?.[0] || ''}
      </svg>
    </div>`,
    className: 'custom-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

const targetIcon = (priority: string) => {
  const colors = {
    low: '#10b981',
    medium: '#f59e0b',
    high: '#ef4444',
    critical: '#dc2626'
  };
  return createIcon(<TargetIcon />, colors[priority as keyof typeof colors] || '#f59e0b');
};

const weaponIcon = createIcon(<Crosshair />, '#3b82f6');
const sensorIcon = createIcon(<Radio />, '#06b6d4');

// Map Controller component
function MapController({ center }: { center?: [number, number] }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  
  return null;
}

export function BattleMap({
  targets = [],
  weapons = [],
  sensors = [],
  selectedTargetId,
  onTargetSelect,
  center = [39.9042, 116.4074],
  zoom = 12,
  showWeaponRange = false
}: BattleMapProps) {
  return (
    <div className="map-container h-full w-full relative">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%', background: '#0d1117' }}
        zoomControl={false}
      >
        <MapController center={center} />
        
        {/* Dark theme map tiles */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* Target Markers */}
        {targets.map((target) => (
          <Marker
            key={target.id}
            position={target.coordinates}
            icon={targetIcon(target.priority)}
            eventHandlers={{
              click: () => onTargetSelect?.(target)
            }}
          >
            <Popup className="military-popup">
              <div className="min-w-[200px]">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-white">{target.name}</h4>
                  <span className={`status-badge status-${target.status === 'detected' ? 'pending' : target.status === 'engaged' ? 'danger' : 'active'}`}>
                    {target.status}
                  </span>
                </div>
                <div className="space-y-1 text-sm">
                  <p><span className="text-slate-400">类型:</span> {target.type}</p>
                  <p><span className="text-slate-400">置信度:</span> <span className="text-amber-400">{target.confidence}%</span></p>
                  <p><span className="text-slate-400">优先级:</span> <span className={`text-${target.priority === 'critical' ? 'red' : 'amber'}-400`}>{target.priority}</span></p>
                  <p><span className="text-slate-400">坐标:</span> {target.coordinates[0].toFixed(4)}, {target.coordinates[1].toFixed(4)}</p>
                </div>
                {target.description && (
                  <p className="mt-2 text-xs text-slate-400 border-t border-slate-700 pt-2">{target.description}</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Weapon Markers */}
        {weapons.map((weapon) => (
          <Marker key={weapon.id} position={weapon.location} icon={weaponIcon}>
            <Popup>
              <div className="min-w-[180px]">
                <h4 className="font-bold text-white mb-2">{weapon.name}</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="text-slate-400">类型:</span> {weapon.type}</p>
                  <p><span className="text-slate-400">射程:</span> {weapon.range}km</p>
                  <p><span className="text-slate-400">状态:</span> <span className={weapon.availability === 'available' ? 'text-emerald-400' : 'text-amber-400'}>{weapon.availability}</span></p>
                  <p><span className="text-slate-400">精度:</span> <span className="text-amber-400">{weapon.accuracy}%</span></p>
                </div>
                {showWeaponRange && (
                  <Circle
                    center={weapon.location}
                    radius={weapon.range * 1000}
                    pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.1, weight: 1 }}
                  />
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Sensor Markers */}
        {sensors.map((sensor) => (
          <Marker key={sensor.id} position={sensor.location} icon={sensorIcon}>
            <Popup>
              <div className="min-w-[180px]">
                <h4 className="font-bold text-white mb-2">{sensor.name}</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="text-slate-400">类型:</span> {sensor.type}</p>
                  <p><span className="text-slate-400">覆盖:</span> {sensor.coverage}km</p>
                  <p><span className="text-slate-400">状态:</span> <span className={sensor.status === 'active' ? 'text-emerald-400' : 'text-amber-400'}>{sensor.status}</span></p>
                </div>
                <Circle
                  center={sensor.location}
                  radius={sensor.coverage * 1000}
                  pathOptions={{ color: '#06b6d4', fillColor: '#06b6d4', fillOpacity: 0.05, weight: 1, dashArray: '5, 5' }}
                />
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Connection lines between weapons and selected target */}
        {selectedTargetId && weapons.map((weapon) => {
          const target = targets.find(t => t.id === selectedTargetId);
          if (!target) return null;
          return (
            <Polyline
              key={`line-${weapon.id}`}
              positions={[weapon.location, target.coordinates]}
              pathOptions={{ color: '#f59e0b', weight: 2, opacity: 0.6, dashArray: '10, 10' }}
            />
          );
        })}
      </MapContainer>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 military-card p-3 z-[1000]">
        <h5 className="text-xs font-semibold text-slate-400 uppercase mb-2">图例</h5>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-slate-300">高价值目标</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-slate-300">中价值目标</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#5a7a8a]" />
            <span className="text-slate-300">武器平台</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cyan-500" />
            <span className="text-slate-300">传感器</span>
          </div>
        </div>
      </div>
    </div>
  );
}
