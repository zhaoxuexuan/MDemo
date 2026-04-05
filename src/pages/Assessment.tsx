import { useState } from 'react';
import { BarChart3, Target, CheckCircle2, XCircle, AlertTriangle, Camera, FileText, RotateCcw } from 'lucide-react';
import TacticalMap from '@/components/map/TacticalMap';
import { mockTargets } from '@/data/mockData';
import type { Target as TargetType } from '@/types';
import { useToast } from '@/components/ui/Toast';

type DamageLevel = 'none' | 'light' | 'moderate' | 'severe' | 'destroyed';

const damageLevels: { value: DamageLevel; label: string; color: string; icon: React.ElementType }[] = [
  { value: 'none', label: '无损伤', color: 'text-slate-400', icon: XCircle },
  { value: 'light', label: '轻微', color: 'text-[#5a7a8a]', icon: AlertTriangle },
  { value: 'moderate', label: '中等', color: 'text-amber-400', icon: AlertTriangle },
  { value: 'severe', label: '严重', color: 'text-orange-400', icon: AlertTriangle },
  { value: 'destroyed', label: '摧毁', color: 'text-red-400', icon: CheckCircle2 }
];

export function Assessment() {
  const [selectedTarget, setSelectedTarget] = useState<TargetType | null>(null);
  const [assessmentStep, setAssessmentStep] = useState<'initial' | 'analyzing' | 'complete'>('initial');
  const [selectedDamage, setSelectedDamage] = useState<DamageLevel | null>(null);
  const toast = useToast();

  const engagedTargets = mockTargets.filter(t => t.status === 'engaged' || t.status === 'complete');
  const completedTargets = mockTargets.filter(t => t.status === 'complete');

  const handleSelectDamage = (level: DamageLevel) => {
    setSelectedDamage(level);
    setAssessmentStep('analyzing');
    setTimeout(() => {
      setAssessmentStep('complete');
      toast.success(`AI分析完成：目标 "${selectedTarget?.name}" 评估为 ${damageLevels.find(d => d.value === level)?.label}`);
    }, 2000);
  };

  const handleComplete = () => {
    toast.success(`战损评估已完成，目标 "${selectedTarget?.name}" 已归档（${selectedDamage ? damageLevels.find(d => d.value === selectedDamage)?.label : ''}）`);
    setAssessmentStep('initial');
    setSelectedTarget(null);
    setSelectedDamage(null);
  };

  const handleReengage = () => {
    toast.warning(`已生成二次打击方案，目标：${selectedTarget?.name}。建议武器：MQ-9 死神无人机`);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">战损评估</h2>
          <p className="text-slate-400">打击效果评估与后续建议</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-2xl font-bold text-emerald-400">{completedTargets.length}</p>
            <p className="text-xs text-slate-400">已完成评估</p>
          </div>
          <div className="h-10 w-px bg-[#21262d]" />
          <div className="text-right">
            <p className="text-2xl font-bold text-purple-400">
              {Math.round((completedTargets.length / Math.max(1, engagedTargets.length)) * 100)}%
            </p>
            <p className="text-xs text-slate-400">评估完成率</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Target List */}
        <div className="space-y-6">
          <div className="bg-[#161b22] rounded-lg border border-[#21262d]">
            <div className="px-4 py-3 border-b border-[#21262d] flex items-center gap-2">
              <Target className="w-5 h-5 text-amber-400" />
              <h3 className="font-semibold text-white">待评估目标</h3>
              <span className="ml-auto text-xs text-slate-400">{engagedTargets.length} 个</span>
            </div>
            <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
              {engagedTargets.map((target) => (
                <div
                  key={target.id}
                  onClick={() => { setSelectedTarget(target); setAssessmentStep('initial'); setSelectedDamage(null); }}
                  className={`p-4 rounded-lg cursor-pointer transition-colors border ${
                    selectedTarget?.id === target.id
                      ? 'border-[#8b956d] bg-[#8b956d]/10'
                      : 'border-[#21262d] bg-[#0d1117] hover:border-[#30363d]'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-white">{target.name}</h4>
                      <p className="text-xs text-slate-400">{target.type}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      target.status === 'complete'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-purple-500/20 text-purple-400'
                    }`}>
                      {target.status === 'complete' ? '已评估' : '待评估'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="font-mono">{target.coordinates[0].toFixed(4)}, {target.coordinates[1].toFixed(4)}</span>
                  </div>
                </div>
              ))}
              {engagedTargets.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-emerald-500" />
                  <p>无待评估目标</p>
                </div>
              )}
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-[#161b22] rounded-lg border border-[#21262d]">
            <div className="px-4 py-3 border-b border-[#21262d] flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-amber-400" />
              <h3 className="font-semibold text-white">评估统计</h3>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {[
                  { label: '完全摧毁', pct: 60, color: 'bg-red-500' },
                  { label: '严重损伤', pct: 25, color: 'bg-orange-500' },
                  { label: '中等损伤', pct: 10, color: 'bg-amber-500' },
                  { label: '需要二次打击', pct: 5, color: 'bg-[#5a7a8a]' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">{item.label}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-[#21262d] rounded-full overflow-hidden">
                        <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.pct}%` }} />
                      </div>
                      <span className="text-sm text-white w-8">{item.pct}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Center - Assessment */}
        <div className="lg:col-span-2 space-y-6">
          {/* Map */}
          <div className="bg-[#161b22] rounded-lg border border-[#21262d]">
            <div className="px-4 py-3 border-b border-[#21262d] flex items-center gap-2">
              <Camera className="w-5 h-5 text-amber-400" />
              <h3 className="font-semibold text-white">打击区域</h3>
            </div>
            <div className="h-[300px]">
              <TacticalMap
                targets={selectedTarget ? [selectedTarget] : engagedTargets}
                selectedTargetId={selectedTarget?.id}
                onTargetSelect={setSelectedTarget}
              />
            </div>
          </div>

          {/* Assessment Panel */}
          {selectedTarget ? (
            <div className="bg-[#161b22] rounded-lg border border-[#21262d]">
              <div className="px-4 py-3 border-b border-[#21262d] flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <h3 className="font-semibold text-white">战损评估: {selectedTarget.name}</h3>
              </div>
              <div className="p-4">
                {assessmentStep === 'initial' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {damageLevels.map((level) => {
                        const Icon = level.icon;
                        return (
                          <button
                            key={level.value}
                            onClick={() => handleSelectDamage(level.value)}
                            className="p-4 bg-[#0d1117]/50 rounded-lg border border-[#21262d] hover:border-[#30363d] transition-all text-center group"
                          >
                            <Icon className={`w-8 h-8 mx-auto mb-2 ${level.color} group-hover:scale-110 transition-transform`} />
                            <p className="text-sm text-slate-300">{level.label}</p>
                          </button>
                        );
                      })}
                    </div>

                    <div className="bg-[#0d1117]/50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-white mb-3">AI辅助评估</h4>
                      <p className="text-sm text-slate-400 mb-4">
                        系统将分析打击前后的卫星图像、传感器数据和情报报告，自动生成战损评估报告。请选择上方损伤等级以启动AI分析。
                      </p>
                    </div>
                  </div>
                )}

                {assessmentStep === 'analyzing' && (
                  <div className="py-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
                    <p className="text-lg text-white font-medium">AI分析中...</p>
                    <p className="text-sm text-slate-400 mt-2">正在比对打击前后图像数据</p>
                  </div>
                )}

                {assessmentStep === 'complete' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className={`${selectedDamage === 'destroyed' ? 'bg-red-500/10 border-red-500/30' : 'bg-[#0d1117]/50'} border rounded-lg p-4 text-center`}>
                        <CheckCircle2 className={`w-8 h-8 mx-auto mb-2 ${damageLevels.find(d => d.value === selectedDamage)?.color || 'text-red-400'}`} />
                        <p className="lg font-bold" style={{ color: damageLevels.find(d => d.value === selectedDamage)?.color?.replace('text-', '') || '#ef4444' }}>
                          {damageLevels.find(d => d.value === selectedDamage)?.label || '已评估'}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">置信度 96%</p>
                      </div>
                      <div className="bg-[#0d1117]/50 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-emerald-400">0</p>
                        <p className="text-xs text-slate-400 mt-1">附带伤亡</p>
                      </div>
                      <div className="bg-[#0d1117]/50 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-emerald-400">无</p>
                        <p className="text-xs text-slate-400 mt-1">平民损伤</p>
                      </div>
                      <div className="bg-[#0d1117]/50 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-emerald-400">优秀</p>
                        <p className="text-xs text-slate-400 mt-1">打击精度</p>
                      </div>
                    </div>

                    <div className="bg-[#0d1117]/50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-white mb-3">评估详情</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">目标功能丧失</span>
                          <span className="text-emerald-400">100%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">结构完整性</span>
                          <span className="text-red-400">0% (完全摧毁)</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">二次打击建议</span>
                          <span className="text-emerald-400">不需要</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={handleComplete}
                        className="flex-1 py-3 rounded-lg text-sm font-medium bg-[#4a7c59] text-white hover:bg-[#5a8c69] transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" /> 完成评估
                      </button>
                      <button
                        onClick={handleReengage}
                        className="flex-1 py-3 rounded-lg text-sm font-medium bg-[#161b22] text-slate-300 border border-[#21262d] hover:border-[#30363d] transition-colors flex items-center justify-center gap-2"
                      >
                        <RotateCcw className="w-4 h-4" /> 二次打击
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-[#161b22] rounded-lg border border-[#21262d] h-[300px] flex items-center justify-center">
              <div className="text-center text-slate-500">
                <Target className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>选择一个目标进行战损评估</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
