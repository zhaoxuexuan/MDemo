import type { Target } from '@/types';
import { Target as TargetIcon, MapPin, Clock, AlertTriangle, CheckCircle2, Crosshair } from 'lucide-react';

interface TargetCardProps {
  target: Target;
  selected?: boolean;
  onClick?: () => void;
  showActions?: boolean;
  onNominate?: () => void;
  onApprove?: () => void;
}

const priorityColors = {
  low: 'text-emerald-400 bg-emerald-400/10',
  medium: 'text-amber-400 bg-amber-400/10',
  high: 'text-orange-400 bg-orange-400/10',
  critical: 'text-red-400 bg-red-400/10'
};

const statusConfig = {
  detected: { label: '已侦测', color: 'text-slate-400 bg-slate-400/10', icon: TargetIcon },
  nominated: { label: '已提名', color: 'text-amber-400 bg-amber-400/10', icon: Crosshair },
  approved: { label: '已批准', color: 'text-[#5a7a8a] bg-[#5a7a8a]/10', icon: CheckCircle2 },
  engaged: { label: '打击中', color: 'text-red-400 bg-red-400/10', icon: AlertTriangle },
  assessed: { label: '评估中', color: 'text-purple-400 bg-purple-400/10', icon: Clock },
  complete: { label: '已完成', color: 'text-emerald-400 bg-emerald-400/10', icon: CheckCircle2 }
};

const typeLabels = {
  vehicle: '车辆',
  personnel: '人员',
  infrastructure: '基础设施',
  equipment: '装备'
};

export function TargetCard({ 
  target, 
  selected = false, 
  onClick,
  showActions = false,
  onNominate,
  onApprove
}: TargetCardProps) {
  const status = statusConfig[target.status];
  const StatusIcon = status.icon;
  
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000 / 60);
    if (diff < 1) return '刚刚';
    if (diff < 60) return `${diff}分钟前`;
    return `${Math.floor(diff / 60)}小时前`;
  };

  return (
    <div 
      className={`target-card ${selected ? 'selected' : ''}`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${priorityColors[target.priority]}`}>
            <TargetIcon className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-white">{target.name}</h4>
            <p className="text-xs text-slate-400">{typeLabels[target.type]}</p>
          </div>
        </div>
        <div className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${status.color}`}>
          <StatusIcon className="w-3 h-3" />
          {status.label}
        </div>
      </div>

      {/* Coordinates */}
      <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
        <MapPin className="w-4 h-4" />
        <span className="font-mono">{target.coordinates[0].toFixed(4)}, {target.coordinates[1].toFixed(4)}</span>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-slate-800/50 rounded-lg p-2 text-center">
          <p className="text-lg font-bold text-amber-400">{target.confidence}%</p>
          <p className="text-xs text-slate-500">置信度</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-2 text-center">
          <p className={`text-lg font-bold ${target.threatLevel > 70 ? 'text-red-400' : target.threatLevel > 40 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {target.threatLevel}
          </p>
          <p className="text-xs text-slate-500">威胁度</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-2 text-center">
          <p className="text-lg font-bold text-slate-300">{formatTime(target.detectedAt)}</p>
          <p className="text-xs text-slate-500">侦测时间</p>
        </div>
      </div>

      {/* Threat Bar */}
      <div className="mb-3">
        <div className="threat-indicator">
          <span className="text-xs text-slate-500">威胁等级</span>
          <div className="threat-bar">
            <div 
              className={`threat-fill ${target.threatLevel > 70 ? 'threat-high' : target.threatLevel > 40 ? 'threat-medium' : 'threat-low'}`}
              style={{ width: `${target.threatLevel}%` }}
            />
          </div>
          <span className="text-xs font-mono w-8 text-right">{target.threatLevel}%</span>
        </div>
      </div>

      {/* Description */}
      {target.description && (
        <p className="text-sm text-slate-400 mb-3 line-clamp-2">{target.description}</p>
      )}

      {/* Actions */}
      {showActions && target.status === 'detected' && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-slate-700">
          <button 
            onClick={(e) => { e.stopPropagation(); onNominate?.(); }}
            className="flex-1 military-btn py-2 text-xs"
          >
            提名目标
          </button>
        </div>
      )}
      
      {showActions && target.status === 'nominated' && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-slate-700">
          <button 
            onClick={(e) => { e.stopPropagation(); onApprove?.(); }}
            className="flex-1 military-btn-success py-2 text-xs"
          >
            批准打击
          </button>
        </div>
      )}
    </div>
  );
}
