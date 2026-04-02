import type { MissionPlan } from '@/types';
import { Clock, Target, AlertTriangle, Users, CheckCircle2, XCircle, Play } from 'lucide-react';

interface MissionPlanCardProps {
  plan: MissionPlan;
  selected?: boolean;
  onClick?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  onExecute?: () => void;
}

const collateralConfig = {
  minimal: { label: '极小', color: 'text-emerald-400' },
  low: { label: '低', color: 'text-[#5a7a8a]' },
  moderate: { label: '中等', color: 'text-amber-400' },
  high: { label: '高', color: 'text-red-400' }
};

const statusConfig = {
  proposed: { label: '待审批', color: 'text-amber-400 bg-amber-400/10' },
  approved: { label: '已批准', color: 'text-[#5a7a8a] bg-[#5a7a8a]/10' },
  executing: { label: '执行中', color: 'text-purple-400 bg-purple-400/10' },
  completed: { label: '已完成', color: 'text-emerald-400 bg-emerald-400/10' }
};

export function MissionPlanCard({ 
  plan, 
  selected = false, 
  onClick,
  onApprove,
  onReject,
  onExecute
}: MissionPlanCardProps) {
  const collateral = collateralConfig[plan.collateralDamage];
  const status = statusConfig[plan.status];

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
          <div className="w-10 h-10 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-white">作战方案 {plan.id}</h4>
            <p className="text-xs text-slate-400">{plan.weaponName}</p>
          </div>
        </div>
        <div className={`px-2 py-1 rounded text-xs font-medium ${status.color}`}>
          {status.label}
        </div>
      </div>

      {/* Success Probability */}
      <div className="mb-3 p-3 bg-gradient-to-r from-amber-500/10 to-transparent border-l-2 border-amber-500 rounded">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400">成功概率</span>
          <span className="text-2xl font-bold text-amber-400">{plan.successProbability}%</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-slate-800/50 rounded-lg p-2">
          <div className="flex items-center gap-1 text-slate-400 mb-1">
            <Clock className="w-3 h-3" />
            <span className="text-xs">打击时间</span>
          </div>
          <p className="text-sm font-mono text-white">{plan.timeToImpact}分钟</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-2">
          <div className="flex items-center gap-1 text-slate-400 mb-1">
            <AlertTriangle className="w-3 h-3" />
            <span className="text-xs">附带损伤</span>
          </div>
          <p className={`text-sm font-medium ${collateral.color}`}>{collateral.label}</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-2">
          <div className="flex items-center gap-1 text-slate-400 mb-1">
            <Users className="w-3 h-3" />
            <span className="text-xs">预计伤亡</span>
          </div>
          <p className="text-sm font-mono text-white">{plan.estimatedCasualties}人</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-2">
          <div className="flex items-center gap-1 text-slate-400 mb-1">
            <span className="text-xs">¥</span>
            <span className="text-xs">任务成本</span>
          </div>
          <p className="text-sm font-mono text-white">{formatCost(plan.cost)}</p>
        </div>
      </div>

      {/* Actions */}
      {plan.status === 'proposed' && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-slate-700">
          <button 
            onClick={(e) => { e.stopPropagation(); onApprove?.(); }}
            className="flex-1 military-btn-success py-2 text-xs flex items-center justify-center gap-1"
          >
            <CheckCircle2 className="w-4 h-4" />
            批准
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onReject?.(); }}
            className="flex-1 military-btn-danger py-2 text-xs flex items-center justify-center gap-1"
          >
            <XCircle className="w-4 h-4" />
            拒绝
          </button>
        </div>
      )}

      {plan.status === 'approved' && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-slate-700">
          <button 
            onClick={(e) => { e.stopPropagation(); onExecute?.(); }}
            className="flex-1 military-btn py-2 text-xs flex items-center justify-center gap-1"
          >
            <Play className="w-4 h-4" />
            执行打击
          </button>
        </div>
      )}
    </div>
  );
}
