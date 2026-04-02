import type { Weapon } from '@/types';
import { Rocket, MapPin, Gauge, DollarSign, Crosshair } from 'lucide-react';

interface WeaponCardProps {
  weapon: Weapon;
  selected?: boolean;
  onClick?: () => void;
  showMatchScore?: number;
}

const typeLabels = {
  missile: '导弹',
  drone: '无人机',
  artillery: '火炮',
  aircraft: '战机',
  naval: '舰艇'
};

const availabilityConfig = {
  available: { label: '可用', color: 'text-emerald-400 bg-emerald-400/10' },
  standby: { label: '待命', color: 'text-amber-400 bg-amber-400/10' },
  engaged: { label: ' engaged', color: 'text-red-400 bg-red-400/10' },
  maintenance: { label: '维护中', color: 'text-slate-400 bg-slate-400/10' }
};

export function WeaponCard({ 
  weapon, 
  selected = false, 
  onClick,
  showMatchScore
}: WeaponCardProps) {
  const availability = availabilityConfig[weapon.availability];

  const formatCost = (cost: number) => {
    if (cost >= 1000000) {
      return `¥${(cost / 1000000).toFixed(1)}M`;
    }
    if (cost >= 1000) {
      return `¥${(cost / 1000).toFixed(0)}K`;
    }
    return `¥${cost}`;
  };

  return (
    <div 
      className={`target-card ${selected ? 'selected' : ''}`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#5a7a8a]/20 text-[#5a7a8a] flex items-center justify-center">
            <Rocket className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-white">{weapon.name}</h4>
            <p className="text-xs text-slate-400">{typeLabels[weapon.type]}</p>
          </div>
        </div>
        <div className={`px-2 py-1 rounded text-xs font-medium ${availability.color}`}>
          {availability.label}
        </div>
      </div>

      {/* Match Score */}
      {showMatchScore !== undefined && (
        <div className="mb-3 p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs text-amber-400">匹配度</span>
            <span className="text-lg font-bold text-amber-400">{showMatchScore}%</span>
          </div>
        </div>
      )}

      {/* Specs Grid */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-slate-800/50 rounded-lg p-2">
          <div className="flex items-center gap-1 text-slate-400 mb-1">
            <Gauge className="w-3 h-3" />
            <span className="text-xs">射程</span>
          </div>
          <p className="text-sm font-mono text-white">{weapon.range}km</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-2">
          <div className="flex items-center gap-1 text-slate-400 mb-1">
            <Crosshair className="w-3 h-3" />
            <span className="text-xs">精度</span>
          </div>
          <p className="text-sm font-mono text-white">{weapon.accuracy}%</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-2">
          <div className="flex items-center gap-1 text-slate-400 mb-1">
            <MapPin className="w-3 h-3" />
            <span className="text-xs">ETA</span>
          </div>
          <p className="text-sm font-mono text-white">{weapon.eta}min</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-2">
          <div className="flex items-center gap-1 text-slate-400 mb-1">
            <DollarSign className="w-3 h-3" />
            <span className="text-xs">成本</span>
          </div>
          <p className="text-sm font-mono text-white">{formatCost(weapon.cost)}</p>
        </div>
      </div>

      {/* Payload */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-400">弹头:</span>
        <span className="text-white">{weapon.payload}</span>
      </div>

      {/* Coordinates */}
      <div className="mt-2 text-xs text-slate-500 font-mono">
        {weapon.location[0].toFixed(4)}, {weapon.location[1].toFixed(4)}
      </div>
    </div>
  );
}
