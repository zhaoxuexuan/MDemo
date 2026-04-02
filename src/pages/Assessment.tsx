import { useState } from 'react';
import { BarChart3, Target, CheckCircle2, XCircle, AlertTriangle, Camera, FileText, RotateCcw } from 'lucide-react';
import TacticalMap from '@/components/map/TacticalMap';
import { mockTargets } from '@/data/mockData';
import type { Target as TargetType } from '@/types';

export function Assessment() {
  const [selectedTarget, setSelectedTarget] = useState<TargetType | null>(null);
  const [assessmentStep, setAssessmentStep] = useState<'initial' | 'analyzing' | 'complete'>('initial');

  // Targets that have been engaged
  const engagedTargets = mockTargets.filter(t => t.status === 'engaged' || t.status === 'complete');
  const completedTargets = mockTargets.filter(t => t.status === 'complete');

  const damageLevels = [
    { value: 'none', label: '无损伤', color: 'text-slate-400' },
    { value: 'light', label: '轻微', color: 'text-[#5a7a8a]' },
    { value: 'moderate', label: '中等', color: 'text-amber-400' },
    { value: 'severe', label: '严重', color: 'text-orange-400' },
    { value: 'destroyed', label: '摧毁', color: 'text-red-400' }
  ];
  
  // Use damageLevels to avoid unused variable warning
  console.log(damageLevels);

  const handleAnalyze = () => {
    setAssessmentStep('analyzing');
    setTimeout(() => {
      setAssessmentStep('complete');
    }, 2000);
  };

  const handleComplete = () => {
    alert('战损评估已完成，目标已归档');
    setAssessmentStep('initial');
    setSelectedTarget(null);
  };

  const handleReengage = () => {
    alert('已生成二次打击方案');
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
          <div className="h-10 w-px bg-slate-700" />
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
          <div className="military-card">
            <div className="military-card-header">
              <Target className="w-5 h-5 text-amber-400" />
              <h3 className="font-semibold text-white">待评估目标</h3>
              <span className="ml-auto text-xs text-slate-400">{engagedTargets.length} 个</span>
            </div>
            <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
              {engagedTargets.map((target) => (
                <div 
                  key={target.id}
                  onClick={() => setSelectedTarget(target)}
                  className={`target-card cursor-pointer ${selectedTarget?.id === target.id ? 'selected' : ''}`}
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
          <div className="military-card">
            <div className="military-card-header">
              <BarChart3 className="w-5 h-5 text-amber-400" />
              <h3 className="font-semibold text-white">评估统计</h3>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">完全摧毁</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500 rounded-full" style={{ width: '60%' }} />
                    </div>
                    <span className="text-sm text-white w-8">60%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">严重损伤</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500 rounded-full" style={{ width: '25%' }} />
                    </div>
                    <span className="text-sm text-white w-8">25%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">中等损伤</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: '10%' }} />
                    </div>
                    <span className="text-sm text-white w-8">10%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">需要二次打击</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-[#5a7a8a] rounded-full" style={{ width: '5%' }} />
                    </div>
                    <span className="text-sm text-white w-8">5%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Center - Assessment */}
        <div className="lg:col-span-2 space-y-6">
          {/* Map */}
          <div className="military-card">
            <div className="military-card-header">
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
          {selectedTarget && (
            <div className="military-card">
              <div className="military-card-header">
                <FileText className="w-5 h-5 text-amber-400" />
                <h3 className="font-semibold text-white">战损评估: {selectedTarget.name}</h3>
              </div>
              <div className="p-4">
                {assessmentStep === 'initial' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <button className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-slate-500 transition-colors text-center">
                        <XCircle className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                        <p className="text-sm text-slate-400">无损伤</p>
                      </button>
                      <button className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-[#5a7a8a] transition-colors text-center">
                        <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-[#5a7a8a]" />
                        <p className="text-sm text-[#5a7a8a]">轻微损伤</p>
                      </button>
                      <button className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-amber-500 transition-colors text-center">
                        <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-amber-400" />
                        <p className="text-sm text-amber-400">中等损伤</p>
                      </button>
                      <button className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-red-500 transition-colors text-center">
                        <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-red-400" />
                        <p className="text-sm text-red-400">完全摧毁</p>
                      </button>
                    </div>

                    <div className="bg-slate-800/50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-white mb-3">AI辅助评估</h4>
                      <p className="text-sm text-slate-400 mb-4">
                        系统将分析打击前后的卫星图像、传感器数据和情报报告，自动生成战损评估报告。
                      </p>
                      <button 
                        onClick={handleAnalyze}
                        className="w-full military-btn py-3 text-sm flex items-center justify-center gap-2"
                      >
                        <BarChart3 className="w-4 h-4" />
                        开始AI分析
                      </button>
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
                      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center">
                        <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-red-400" />
                        <p className="text-lg font-bold text-red-400">完全摧毁</p>
                        <p className="text-xs text-slate-400 mt-1">置信度 96%</p>
                      </div>
                      <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-emerald-400">0</p>
                        <p className="text-xs text-slate-400">附带伤亡</p>
                      </div>
                      <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-emerald-400">无</p>
                        <p className="text-xs text-slate-400">平民损伤</p>
                      </div>
                      <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-emerald-400">优秀</p>
                        <p className="text-xs text-slate-400">打击精度</p>
                      </div>
                    </div>

                    <div className="bg-slate-800/50 rounded-lg p-4">
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
                        className="flex-1 military-btn-success py-3 text-sm flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        完成评估
                      </button>
                      <button 
                        onClick={handleReengage}
                        className="flex-1 military-btn-secondary py-3 text-sm flex items-center justify-center gap-2"
                      >
                        <RotateCcw className="w-4 h-4" />
                        二次打击
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
