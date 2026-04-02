import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import { DivIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Crosshair, MapPin, AlertTriangle, Info, Radio, Rocket, Eye, Zap, Users } from 'lucide-react';
import type { Target, Sensor, Weapon } from '@/types';

// Custom target icons
const createTargetIcon = (threatLevel: number, isHovered: boolean = false) => {
  const color = threatLevel > 70 ? '#8b4444' : threatLevel > 30 ? '#d4a574' : '#4a7c59';
  const pulseColor = threatLevel > 70 ? 'rgba(139, 68, 68, 0.4)' : threatLevel > 30 ? 'rgba(212, 165, 116, 0.4)' : 'rgba(74, 124, 89, 0.4)';
  const hoverScale = isHovered ? '1.2' : '1';
  const hoverBoxShadow = isHovered ? `0 0 12px ${color}` : `0 0 8px ${color}`;
  
  return new DivIcon({
    className: 'custom-target-icon',
    html: `
      <div style="position: relative; width: 40px; height: 40px; transition: transform 0.2s ease-in-out;">
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) scale(${hoverScale});
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: ${pulseColor};
          animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          transition: transform 0.2s ease-in-out;
        "></div>
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) scale(${hoverScale});
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: ${color};
          border: 2px solid #1a1a1a;
          box-shadow: ${hoverBoxShadow};
          transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
        "></div>
        <svg style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) scale(${hoverScale});
          width: 24px;
          height: 24px;
          transition: transform 0.2s ease-in-out;
        " viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="2" x2="12" y2="6"/>
          <line x1="12" y1="18" x2="12" y2="22"/>
          <line x1="2" y1="12" x2="6" y2="12"/>
          <line x1="18" y1="12" x2="22" y2="12"/>
        </svg>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

// Custom sensor icon
const createSensorIcon = (type: string) => {
  const color = type === 'satellite' ? '#5a7a8a' : type === 'radar' ? '#3b82f6' : type === 'uav' ? '#10b981' : '#8b5cf6';
  
  return new DivIcon({
    className: 'custom-sensor-icon',
    html: `
      <div style="position: relative; width: 32px; height: 32px;">
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: ${color}20;
          border: 2px solid ${color};
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

// Custom weapon icon
const createWeaponIcon = (type: string) => {
  const color = type === 'uav' ? '#8b956d' : type === 'missile' ? '#ef4444' : type === 'aircraft' ? '#3b82f6' : '#f59e0b';
  
  return new DivIcon({
    className: 'custom-weapon-icon',
    html: `
      <div style="position: relative; width: 32px; height: 32px;">
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: ${color}20;
          border: 2px solid ${color};
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

// Custom friendly force icon
const createFriendlyIcon = (_type: string) => {
  const color = '#3b82f6';
  
  return new DivIcon({
    className: 'custom-friendly-icon',
    html: `
      <div style="position: relative; width: 32px; height: 32px;">
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: ${color}20;
          border: 2px solid ${color};
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

interface TacticalMapProps {
  targets: Target[];
  sensors?: Sensor[];
  weapons?: Weapon[];
  flightRoutes?: Array<{
    id: string;
    name: string;
    coordinates: [number, number][];
    type: string;
    status: string;
  }>;
  friendlyForces?: Array<{
    id: string;
    name: string;
    type: string;
    coordinates: [number, number];
  }>;
  areasOfInterest?: Array<{
    id: string;
    name: string;
    centerCoordinates: [number, number];
    radius: number;
    priority: string;
  }>;
  selectedTargetId?: string | null;
  onTargetSelect?: (target: Target) => void;
  center?: [number, number];
  zoom?: number;
  strikeRoute?: [number, number][];
  activeLayers?: string[];
}

// Map controller component
function MapController({ selectedTarget }: { selectedTarget: Target | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (selectedTarget) {
      map.setView(selectedTarget.coordinates, 10, {
        animate: true,
        duration: 0.5,
      });
    }
  }, [selectedTarget, map]);
  
  return null;
}

export default function TacticalMap({ 
  targets, 
  sensors = [],
  weapons = [],
  flightRoutes = [],
  friendlyForces = [],
  areasOfInterest = [],
  selectedTargetId,
  onTargetSelect,
  center = [32.4279, 53.6880],
  zoom = 6,
  strikeRoute,
  activeLayers = ['targets', 'sensors', 'weapons', 'routes', 'friendly', 'aoi']
}: TacticalMapProps) {
  const [hoveredTargetId, setHoveredTargetId] = useState<string | null>(null);
  
  // Find selected target by ID
  const selectedTarget = targets.find(target => target.id === selectedTargetId) || null;

  return (
    <div className="relative w-full h-full animate-expand-in">
      {/* Grid Overlay */}
      <div className="absolute inset-0 tactical-grid pointer-events-none z-[400]" />
      
      {/* Corner Decorations */}
      <div className="absolute top-4 left-4 z-[400] pointer-events-none">
        <div className="w-16 h-16 border-l-2 border-t-2 border-[#8b956d]/50" />
      </div>
      <div className="absolute top-4 right-4 z-[400] pointer-events-none">
        <div className="w-16 h-16 border-r-2 border-t-2 border-[#8b956d]/50" />
      </div>
      <div className="absolute bottom-4 left-4 z-[400] pointer-events-none">
        <div className="w-16 h-16 border-l-2 border-b-2 border-[#8b956d]/50" />
      </div>
      <div className="absolute bottom-4 right-4 z-[400] pointer-events-none">
        <div className="w-16 h-16 border-r-2 border-b-2 border-[#8b956d]/50" />
      </div>

      <MapContainer
        center={center}
        zoom={zoom}
        className="w-full h-full"
        style={{ background: '#1a1a1a' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        <MapController selectedTarget={selectedTarget} />

        {/* Areas of Interest */}
        {activeLayers.includes('aoi') && areasOfInterest.map((aoi) => (
          <Circle
            key={aoi.id}
            center={aoi.centerCoordinates}
            radius={aoi.radius}
            pathOptions={{
              color: aoi.priority === 'critical' ? '#ef4444' : aoi.priority === 'high' ? '#f59e0b' : '#22c55e',
              fillColor: aoi.priority === 'critical' ? '#ef4444' : aoi.priority === 'high' ? '#f59e0b' : '#22c55e',
              fillOpacity: 0.1,
              weight: 2,
              dashArray: '5, 5',
            }}
          >
            <Popup className="custom-popup">
              <div className="bg-[#2a2a2a] p-3 rounded min-w-[200px]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-[#e0e0e0]">{aoi.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded uppercase ${
                    aoi.priority === 'critical' ? 'bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/50' :
                    aoi.priority === 'high' ? 'bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/50' :
                    'bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/50'
                  }`}>
                    {aoi.priority === 'critical' ? '紧急' : aoi.priority === 'high' ? '高' : '中'}
                  </span>
                </div>
                <div className="space-y-1 text-xs text-[#a0a0a0]">
                  <div className="flex items-center gap-2">
                    <Eye className="w-3 h-3 text-[#8b5cf6]" />
                    <span>关注区域</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-[#5a7a8a]" />
                    <span className="font-mono">{aoi.centerCoordinates[0].toFixed(4)}, {aoi.centerCoordinates[1].toFixed(4)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Info className="w-3 h-3 text-[#8b956d]" />
                    <span>半径: {(aoi.radius / 1000).toFixed(1)}km</span>
                  </div>
                </div>
              </div>
            </Popup>
          </Circle>
        ))}

        {/* Flight Routes */}
        {activeLayers.includes('routes') && flightRoutes.map((route) => (
          <Polyline
            key={route.id}
            positions={route.coordinates}
            color={route.type === 'strike' ? '#ef4444' : '#3b82f6'}
            weight={3}
            opacity={0.8}
            dashArray={route.type === 'strike' ? '10, 10' : '5, 5'}
          >
            <Popup className="custom-popup">
              <div className="bg-[#2a2a2a] p-3 rounded min-w-[200px]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-[#e0e0e0]">{route.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded uppercase ${
                    route.status === 'active' ? 'bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/50' :
                    'bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/50'
                  }`}>
                    {route.status === 'active' ? '活跃' : '计划'}
                  </span>
                </div>
                <div className="space-y-1 text-xs text-[#a0a0a0]">
                  <div className="flex items-center gap-2">
                    <Zap className="w-3 h-3 text-[#f59e0b]" />
                    <span>类型: {route.type === 'strike' ? '打击' : '侦察'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Info className="w-3 h-3 text-[#8b956d]" />

                  </div>
                </div>
              </div>
            </Popup>
          </Polyline>
        ))}

        {/* Sensor Coverage Circles */}
        {activeLayers.includes('sensors') && sensors.map((sensor) => (
          <Circle
            key={sensor.id}
            center={sensor.location}
            radius={sensor.coverage}
            pathOptions={{
              color: sensor.type === 'satellite' ? '#5a7a8a' : sensor.type === 'radar' ? '#3b82f6' : sensor.type === 'uav' ? '#10b981' : '#8b5cf6',
              fillColor: sensor.type === 'satellite' ? '#5a7a8a' : sensor.type === 'radar' ? '#3b82f6' : sensor.type === 'uav' ? '#10b981' : '#8b5cf6',
              fillOpacity: 0.1,
              weight: 1,
              dashArray: '5, 5',
            }}
          />
        ))}

        {/* Sensor Markers */}
        {activeLayers.includes('sensors') && sensors.map((sensor) => (
          <Marker
            key={sensor.id}
            position={sensor.location}
            icon={createSensorIcon(sensor.type)}
          >
            <Popup className="custom-popup">
              <div className="bg-[#2a2a2a] p-3 rounded min-w-[200px]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-[#e0e0e0]">{sensor.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded uppercase ${
                    sensor.status === 'active' ? 'bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/50' :
                    'bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/50'
                  }`}>
                    {sensor.status === 'active' ? '活跃' : '离线'}
                  </span>
                </div>
                <div className="space-y-1 text-xs text-[#a0a0a0]">
                  <div className="flex items-center gap-2">
                    <Radio className="w-3 h-3 text-[#5a7a8a]" />
                    <span>类型: {sensor.type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-[#5a7a8a]" />
                    <span className="font-mono">{sensor.location[0].toFixed(4)}, {sensor.location[1].toFixed(4)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Info className="w-3 h-3 text-[#8b956d]" />
                    <span>覆盖范围: {(sensor.coverage / 1000).toFixed(1)}km</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Info className="w-3 h-3 text-[#8b956d]" />
                    <span>状态: {sensor.status}</span>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Weapon Markers */}
        {activeLayers.includes('weapons') && weapons.map((weapon) => (
          <Marker
            key={weapon.id}
            position={weapon.location}
            icon={createWeaponIcon(weapon.type)}
          >
            <Popup className="custom-popup">
              <div className="bg-[#2a2a2a] p-3 rounded min-w-[200px]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-[#e0e0e0]">{weapon.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded uppercase ${
                    weapon.availability === 'available' ? 'bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/50' :
                    weapon.availability === 'standby' ? 'bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/50' :
                    'bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/50'
                  }`}>
                    {weapon.availability === 'available' ? '可用' : weapon.availability === 'standby' ? '待命' : '维护'}
                  </span>
                </div>
                <div className="space-y-1 text-xs text-[#a0a0a0]">
                  <div className="flex items-center gap-2">
                    <Rocket className="w-3 h-3 text-[#ef4444]" />
                    <span>类型: {weapon.type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-[#5a7a8a]" />
                    <span className="font-mono">{weapon.location[0].toFixed(4)}, {weapon.location[1].toFixed(4)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Info className="w-3 h-3 text-[#8b956d]" />
                    <span>射程: {(weapon.range / 1000).toFixed(1)}km</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Info className="w-3 h-3 text-[#8b956d]" />
                    <span>载荷: {weapon.payload}</span>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Friendly Force Markers */}
        {activeLayers.includes('friendly') && friendlyForces.map((force) => (
          <Marker
            key={force.id}
            position={force.coordinates}
            icon={createFriendlyIcon(force.type)}
          >
            <Popup className="custom-popup">
              <div className="bg-[#2a2a2a] p-3 rounded min-w-[200px]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-[#e0e0e0]">{force.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded uppercase bg-[#3b82f6]/20 text-[#3b82f6] border border-[#3b82f6]/50">
                    友军
                  </span>
                </div>
                <div className="space-y-1 text-xs text-[#a0a0a0]">
                  <div className="flex items-center gap-2">
                    <Users className="w-3 h-3 text-[#3b82f6]" />
                    <span>类型: {force.type === 'ground' ? '地面' : force.type === 'air' ? '空中' : '海上'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-[#5a7a8a]" />
                    <span className="font-mono">{force.coordinates[0].toFixed(4)}, {force.coordinates[1].toFixed(4)}</span>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Target Markers */}
        {activeLayers.includes('targets') && targets.map((target) => (
          <Marker
            key={target.id}
            position={target.coordinates}
            icon={createTargetIcon(target.threatLevel, hoveredTargetId === target.id)}
            eventHandlers={{
              click: () => onTargetSelect?.(target),
              mouseover: () => setHoveredTargetId(target.id),
              mouseout: () => setHoveredTargetId(null),
            }}
          >
            <Popup className="custom-popup">
              <div className="bg-[#2a2a2a] p-3 rounded min-w-[200px]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-[#e0e0e0]">{target.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded uppercase ${
                    target.threatLevel > 70 ? 'bg-[#8b4444]/20 text-[#8b4444] border border-[#8b4444]/50' :
                    target.threatLevel > 30 ? 'bg-[#d4a574]/20 text-[#d4a574] border border-[#d4a574]/50' :
                    'bg-[#4a7c59]/20 text-[#4a7c59] border border-[#4a7c59]/50'
                  }`}>
                    {target.threatLevel > 70 ? '高' : target.threatLevel > 30 ? '中' : '低'}
                  </span>
                </div>
                <div className="space-y-1 text-xs text-[#a0a0a0]">
                  <div className="flex items-center gap-2">
                    <Crosshair className="w-3 h-3 text-[#8b956d]" />
                    <span>Type: {target.type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-[#5a7a8a]" />
                    <span className="font-mono">{target.coordinates[0].toFixed(4)}, {target.coordinates[1].toFixed(4)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Info className="w-3 h-3 text-[#8b956d]" />
                    <span>Confidence: {(target.confidence * 100).toFixed(0)}%</span>
                  </div>
                  {target.threatLevel > 70 && (
                    <div className="flex items-center gap-2 text-[#8b4444]">
                      <AlertTriangle className="w-3 h-3" />
                      <span>高优先级目标</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => onTargetSelect?.(target)}
                  className="mt-3 w-full bg-[#8b956d] text-[#1a1a1a] text-xs py-1.5 rounded font-semibold uppercase tracking-wide hover:shadow-lg transition-all duration-200"
                >
                  Select Target
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Strike Route */}
        {strikeRoute && strikeRoute.length > 0 && (
          <Polyline
            positions={strikeRoute}
            color="#8b956d"
            weight={3}
            opacity={0.8}
            dashArray="10, 10"
          />
        )}

      </MapContainer>

      {/* Map Controls Overlay */}
      <div className="absolute bottom-6 left-6 z-[400] bg-[#2a2a2a]/90 backdrop-blur border border-[#3a3a3a] rounded-lg p-3">
        <div className="text-xs text-[#666666] uppercase tracking-wider mb-2">图例</div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#8b4444] border border-[#1a1a1a]" />
            <span className="text-xs text-[#a0a0a0]">高威胁</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#d4a574] border border-[#1a1a1a]" />
            <span className="text-xs text-[#a0a0a0]">中威胁</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#4a7c59] border border-[#1a1a1a]" />
            <span className="text-xs text-[#a0a0a0]">低威胁</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 border border-dashed border-[#5a7a8a]" />
            <span className="text-xs text-[#a0a0a0]">传感器覆盖</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 border border-[#3b82f6]" />
            <span className="text-xs text-[#a0a0a0]">友军位置</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 border border-dashed border-[#8b5cf6]" />
            <span className="text-xs text-[#a0a0a0]">关注区域</span>
          </div>
        </div>
      </div>

      {/* Coordinate Display */}
      <div className="absolute bottom-6 right-80 z-[400] bg-[#2a2a2a]/90 backdrop-blur border border-[#3a3a3a] rounded-lg px-3 py-2">
        <span className="text-xs font-mono text-[#8b956d]">
          {selectedTarget ? 
            `${selectedTarget.coordinates[0].toFixed(4)}°N, ${selectedTarget.coordinates[1].toFixed(4)}°E` : 
            `${center[0].toFixed(4)}°N, ${center[1].toFixed(4)}°E`
          }
        </span>
      </div>
    </div>
  );
}