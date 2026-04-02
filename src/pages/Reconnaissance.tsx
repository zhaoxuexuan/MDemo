import { useState } from 'react';
import {
  Target,
  Eye,
  Camera,
  Brain,
  Crosshair,
  MapPin,
  CheckCircle2,
  Radio,
  Satellite
} from 'lucide-react';
import { VideoFeed } from '@/components/dashboard/VideoFeed';
import TacticalMap from '@/components/map/TacticalMap';
import { useGlobalState } from '@/context/GlobalContext';
import { mockTargets } from '@/data/mockData';
import type { Target as TargetType } from '@/types';

export function Reconnaissance() {
  const { state, nominateTarget, advanceStage } = useGlobalState();
  const [selectedTarget, setSelectedTarget] = useState<TargetType | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [showCVPanel, setShowCVPanel] = useState(true);

  const filteredTargets = mockTargets.filter(target => {
    if (filterType !== 'all' && target.type !== filterType) return false;
    if (filterPriority !== 'all' && target.priority !== filterPriority) return false;
    return true;
  });

  const handleNominateFromCard = (target: TargetType) => {
    nominateTarget(target);
  };

  const handleNominateFromVideo = (target: TargetType) => {
    nominateTarget(target);
    // 自动选中该目标
    setSelectedTarget(target);
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-[#0d1117]">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#21262d] bg-gradient-to-r from-[#161b22] to-transparent">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <Eye className="w-6 h-6 text-emerald-400" />
              目标侦察
            </h2>
            <p className="text-sm text-slate-500 mt-1">多源情报融合与AI目标识别</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <Brain className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span className="text-sm font-semibold text-emerald-400">AI识别引擎运行中</span>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
              <div className="flex items-center gap-1.5">
                <Satellite className="w-3.5 h-3.5" />
                <span>链路正常</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5" />
                <span>15 Mbps</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left - Video Feed + Map (60%) */}
        <div className={`flex-1 p-4 space-y-4 transition-all ${showCVPanel ? '' : 'pr-4'}`}>
          {/* Real-time Video Feed with CV Detection */}
          <div className="bg-[#161b22] rounded-lg border border-[#21262d] overflow-hidden">
            <div className="px-4 py-3 border-b border-[#21262d] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Camera className="w-5 h-5 text-red-400" />
                <h3 className="font-bold text-white">实时侦察画面</h3>
                <span className="text-xs text-slate-500 font-mono">UAV-09 REAPER | FMV</span>
              </div>
              
              <div className="flex items-center gap-3">
                {/* CV Stats */}
                <div className="flex items-center gap-3 text-xs">
                  <div className="px-2 py-1 rounded bg-red-500/10 border border-red-500/20">
                    <span className="text-red-400 font-mono font-bold">5</span>
                    <span className="text-slate-500 ml-1">检测目标</span>
                  </div>
                  <div className="px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20">
                    <span className="text-emerald-400 font-mono font-bold">94%</span>
                    <span className="text-slate-500 ml-1">平均置信度</span>
                  </div>
                </div>

                <button
                  onClick={() => setShowCVPanel(!showCVPanel)}
                  className={`p-1.5 hover:bg-[#21262d] rounded transition-colors ${showCVPanel ? 'text-white' : 'text-slate-400'}`}
                >
                  {showCVPanel ? '▼' : '▲'}
                </button>
              </div>
            </div>

            <VideoFeed onTargetNominate={handleNominateFromVideo} />
          </div>

          {/* Target Location Distribution Map */}
          <div className="bg-[#161b22] rounded-lg border border-[#21262d] overflow-hidden">
            <div className="px-4 py-3 border-b border-[#21262d] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#8b956d]" />
                <h3 className="font-bold text-white">目标位置分布</h3>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>伊朗战区</span>
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              </div>
            </div>
            
            <div className="h-[320px]">
              <TacticalMap
                targets={filteredTargets}
                selectedTargetId={selectedTarget?.id}
                onTargetSelect={setSelectedTarget}
                zoom={11}
              />
            </div>
          </div>
        </div>

        {/* Right - Target List & Workflow (40%) */}
        <div className="w-[420px] border-l border-[#21262d] flex flex-col overflow-hidden">
          {/* Header with filters */}
          <div className="p-4 border-b border-[#21262d] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-amber-400" />
                侦测目标列表
              </h3>
              <span className="text-xs font-mono px-2 py-1 rounded bg-[#0d1117] border border-[#21262d]">
                {filteredTargets.length} 个目标
              </span>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-2 gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-[#0d1117] border border-[#21262d] rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-[#8b956d]"
              >
                <option value="all">全部类型</option>
                <option value="vehicle">车辆装备</option>
                <option value="personnel">人员</option>
                <option value="infrastructure">基础设施</option>
              </select>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="bg-[#0d1117] border border-[#21262d] rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-[#8b956d]"
              >
                <option value="all">全部优先级</option>
                <option value="critical">紧急</option>
                <option value="high">高</option>
                <option value="medium">中</option>
              </select>
            </div>
          </div>

          {/* Nominated Targets Status (from Global State) */}
          <div className="px-4 py-3 border-b border-[#21262d] bg-[#0d1117]/50">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              提名工作流状态 ({state.nominatedTargets.filter(t => t.stage !== 'executed').length})
            </h4>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {['nomination', 'review', 'prosecution'].map((stage) => {
                const count = state.nominatedTargets.filter(t => t.stage === stage).length;
                const stageLabels: Record<string, string> = {
                  nomination: '提名',
                  review: '审核',
                  prosecution: '规划'
                };
                return count > 0 ? (
                  <div key={stage} className="flex-shrink-0 px-2 py-1 rounded bg-[#161b22] border border-[#21262d]">
                    <span className="text-[10px] text-slate-500">{stageLabels[stage]}:</span>
                    <span className="text-xs font-bold text-white ml-1">{count}</span>
                  </div>
                ) : null;
              })}
            </div>
          </div>

          {/* Target Cards List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredTargets.map((target) => {
              const isNominated = state.nominatedTargets.some(n => n.target.id === target.id);
              const nominatedItem = state.nominatedTargets.find(n => n.target.id === target.id);

              return (
                <div
                  key={target.id}
                  onClick={() => setSelectedTarget(target)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all group ${
                    selectedTarget?.id === target.id
                      ? 'border-[#8b956d] bg-[#8b956d]/10 shadow-lg shadow-[#8b956d]/20'
                      : 'border-[#21262d] bg-[#0d1117] hover:border-[#30363d]'
                  }`}
                >
                  {/* Target Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Target
                        className="w-4 h-4"
                        style={{
                          color:
                            target.threatLevel > 70
                              ? '#ef4444'
                              : target.threatLevel > 40
                                ? '#f59e0b'
                                : '#22c55e'
                        }}
                      />
                      <span className="text-sm font-semibold text-white">{target.name}</span>
                    </div>
                    
                    <div className="flex items-center gap-1.5">
                      {isNominated && nominatedItem && (
                        <span
                          className="text-[9px] px-1.5 py-0.5 rounded font-bold"
                          style={{
                            backgroundColor:
                              nominatedItem.stage === 'prosecution' ? '#8b956d20' :
                              nominatedItem.stage === 'review' ? '#c9a05020' :
                              '#d4a57420',
                            color:
                              nominatedItem.stage === 'prosecution' ? '#8b956d' :
                              nominatedItem.stage === 'review' ? '#c9a050' :
                              '#d4a574'
                          }}
                        >
                          {nominatedItem.stage === 'nomination' ? '已提名' :
                           nominatedItem.stage === 'review' ? '审核中' :
                           nominatedItem.stage === 'prosecution' ? '规划中' : nominatedItem.stage}
                        </span>
                      )}
                      
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded font-bold"
                        style={{
                          backgroundColor:
                            target.priority === 'critical' ? '#ef444420' :
                            target.priority === 'high' ? '#f59e0b20' :
                            '#22c55e20',
                          color:
                            target.priority === 'critical' ? '#ef4444' :
                            target.priority === 'high' ? '#f59e0b' :
                            '#22c55e'
                        }}
                      >
                        {target.priority === 'critical' ? '紧急' : target.priority === 'high' ? '高' : '中'}
                      </span>
                    </div>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="bg-[#0d1117]/50 rounded p-2">
                      <span className="text-[10px] text-slate-500 block">类型</span>
                      <span className="text-xs text-white">{target.type === 'vehicle' ? '车辆' : target.type === 'personnel' ? '人员' : '设施'}</span>
                    </div>
                    <div className="bg-[#0d1117]/50 rounded p-2">
                      <span className="text-[10px] text-slate-500 block">威胁</span>
                      <span
                        className="text-xs font-bold"
                        style={{
                          color:
                            target.threatLevel > 70 ? '#ef4444' :
                            target.threatLevel > 40 ? '#f59e0b' : '#22c55e'
                        }}
                      >
                        {target.threatLevel}
                      </span>
                    </div>
                    <div className="bg-[#0d1117]/50 rounded p-2">
                      <span className="text-[10px] text-slate-500 block">置信度</span>
                      <span className="text-xs font-bold text-emerald-400">{target.confidence}%</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-400 line-clamp-2 mb-3">{target.description}</p>

                  {/* Coordinates */}
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-3 font-mono">
                    <MapPin className="w-3 h-3" />
                    <span>{target.coordinates[0].toFixed(4)}°N, {target.coordinates[1].toFixed(4)}°E</span>
                  </div>

                  {/* Action Button */}
                  {!isNominated && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNominateFromCard(target);
                      }}
                      className="w-full py-2 rounded text-xs font-bold bg-[#d4a574] text-[#0d1117] hover:bg-[#e4b584] transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Crosshair className="w-3.5 h-3.5" /> 提交至提名工作流
                    </button>
                  )}

                  {isNominated && nominatedItem && nominatedItem.stage !== 'executed' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        advanceStage(target.id);
                      }}
                      className="w-full py-2 rounded text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                      style={{
                        backgroundColor:
                          nominatedItem.stage === 'nomination' ? '#c9a050' :
                          nominatedItem.stage === 'review' ? '#8b956d' :
                          '#4a7c59',
                        color: '#0d1117'
                      }}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {nominatedItem.stage === 'nomination' ? '推进至审核' :
                       nominatedItem.stage === 'review' ? '推进至打击规划' : '执行任务'}
                    </button>
                  )}

                  {isNominated && nominatedItem && nominatedItem.stage === 'executed' && (
                    <div className="w-full py-2 rounded text-xs font-bold bg-[#4a7c59]/20 text-[#4a7c59] flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> 已完成
                    </div>
                  )}
                </div>
              );
            })}

            {filteredTargets.length === 0 && (
              <div className="text-center py-12 text-slate-600">
                <Target className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-sm">无符合条件的目标</p>
                <p className="text-xs mt-1">请调整筛选条件</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}