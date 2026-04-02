import { useState, useEffect } from 'react';
import {
  Target,
  Crosshair,
  CheckCircle2,
  Clock,
  ArrowRight,
  Eye,
  Brain,
  Zap,
  MapPin,
  Plus,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import TacticalMap from '@/components/map/TacticalMap';
import { useGlobalState } from '@/context/GlobalContext';
import { mockTargets, mockWeapons } from '@/data/mockData';
import type { Target as TargetType, Weapon } from '@/types';

type WorkflowStage = 'detection' | 'nomination' | 'review' | 'prosecution' | 'executed';

export function Nomination() {
  const { state, nominateTarget, advanceStage } = useGlobalState();
  const [selectedTarget, setSelectedTarget] = useState<TargetType | null>(null);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [showMapPanel, setShowMapPanel] = useState(false);
  const [notifications, setNotifications] = useState<{id: string, message: string, type: 'success' | 'info' | 'warning', time: string}[]>([]);
  const [aiMetrics, setAiMetrics] = useState({
    timeToTarget: 70,
    distance: 60,
    timeOnStation: 50,
    fuel: 80,
    munitions: 90,
    agmMatch: 85
  });
  const [selectedWeapon, setSelectedWeapon] = useState<Weapon | null>(null);

  // 使用全局状态的提名目标作为工作流数据
  const workflowItems = state.nominatedTargets;

  const stages: { id: WorkflowStage; label: string; color: string; icon: React.ElementType; count: number }[] = [
    { id: 'detection', label: '检测识别', color: '#5a7a8a', icon: Eye, count: workflowItems.filter(i => i.stage === 'detection').length },
    { id: 'nomination', label: '目标提名', color: '#d4a574', icon: Crosshair, count: workflowItems.filter(i => i.stage === 'nomination').length },
    { id: 'review', label: '待审评估', color: '#c9a050', icon: Clock, count: workflowItems.filter(i => i.stage === 'review').length },
    { id: 'prosecution', label: '打击规划', color: '#8b956d', icon: Zap, count: workflowItems.filter(i => i.stage === 'prosecution').length },
    { id: 'executed', label: '任务完成', color: '#4a7c59', icon: CheckCircle2, count: workflowItems.filter(i => i.stage === 'executed').length }
  ];

  const addLocalNotification = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const id = Date.now().toString();
    const time = new Date().toLocaleTimeString('zh-CN');
    setNotifications(prev => [{ id, message, type, time }, ...prev].slice(0, 5));
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  // 使用全局状态的advanceStage方法
  const handleAdvanceStage = (targetId: string) => {
    advanceStage(targetId);
    const target = workflowItems.find(item => item.target.id === targetId)?.target;
    if (target) {
      addLocalNotification(`✓ 目标"${target.name}"已推进至下一阶段`, 'success');
    }
  };

  // 使用全局状态的nominateTarget方法
  const handleNominateTarget = (targetId: string) => {
    const target = workflowItems.find(item => item.target.id === targetId)?.target || mockTargets.find(t => t.id === targetId);
    if (target && !workflowItems.some(item => item.target.id === targetId)) {
      nominateTarget(target);
      addLocalNotification(`✓ 目标"${target.name}"已成功提名至工作流`, 'success');
    }
  };

  const getBestWeapon = () => {
    const availableWeapons = mockWeapons.filter(w => w.availability === 'available');
    let bestWeapon = availableWeapons[0];
    let bestScore = 0;

    availableWeapons.forEach(weapon => {
      let score = 0;
      score += weapon.accuracy * (aiMetrics.agmMatch / 100);
      score += (1000 / weapon.range) * (aiMetrics.distance / 100);
      score += (weapon.eta ? (600 / weapon.eta) * (aiMetrics.timeToTarget / 100) : 0);

      if (score > bestScore) {
        bestScore = score;
        bestWeapon = weapon;
      }
    });

    return bestWeapon;
  };

  useEffect(() => {
    if (showAIPanel && selectedTarget) {
      const weapon = getBestWeapon();
      setSelectedWeapon(weapon);
    }
  }, [showAIPanel, selectedTarget, aiMetrics]);

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-[#0d1117] relative">
      {/* Notifications Toast */}
      <div className="fixed top-20 right-6 z-[9999] space-y-2 max-w-sm">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`px-4 py-3 rounded-lg shadow-xl border backdrop-blur-sm animate-slide-in-right ${
              notif.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
              notif.type === 'warning' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
              'bg-blue-500/10 border-blue-500/30 text-blue-400'
            }`}
          >
            <p className="text-sm font-medium">{notif.message}</p>
            <p className="text-xs opacity-60 mt-1">{notif.time}</p>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="px-6 py-3 border-b border-[#21262d] bg-[#161b22]/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Crosshair className="w-5 h-5 text-[#8b956d]" />
              <h2 className="text-lg font-bold text-white">目标提名工作流</h2>
              <span className="text-xs text-slate-500 bg-[#21262d] px-2 py-1 rounded">杀伤链自动化</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowMapPanel(!showMapPanel)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                showMapPanel
                  ? 'bg-[#5a7a8a] text-white'
                  : 'bg-[#161b22] text-slate-400 border border-[#21262d] hover:border-[#5a7a8a]'
              }`}
            >
              {showMapPanel ? <ChevronDown className="w-4 h-4 inline mr-1" /> : <ChevronUp className="w-4 h-4 inline mr-1" />}
              地图视图
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#0d1117] border border-[#21262d]">
              <Brain className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-medium text-slate-300">AI辅助</span>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <button
              onClick={() => setShowAIPanel(!showAIPanel)}
              className={`px-4 py-2 rounded-md text-xs font-semibold transition-all ${
                showAIPanel
                  ? 'bg-[#8b956d] text-[#0d1117]'
                  : 'bg-[#161b22] text-[#8b956d] border border-[#8b956d]/30 hover:border-[#8b956d]'
              }`}
            >
              <Brain className="w-4 h-4 inline mr-2" />
              武器优选
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left - Kanban Board (主工作区) */}
        <div className={`flex-1 p-6 overflow-x-auto transition-all duration-300 ${showAIPanel ? 'pr-0' : ''}`}>
          <div className="flex gap-4 h-full min-w-max">
            {stages.map((stage) => {
              const StageIcon = stage.icon;
              const stageItems = workflowItems.filter(i => i.stage === stage.id);

              return (
                <div
                  key={stage.id}
                  className={`flex-shrink-0 flex flex-col rounded-lg border border-[#21262d] bg-[#161b22]/30 ${showAIPanel ? 'w-56' : 'w-64'}`}
                >
                  {/* Stage Header */}
                  <div
                    className="p-3 border-b border-[#21262d] flex items-center justify-between"
                    style={{ backgroundColor: `${stage.color}10` }}
                  >
                    <div className="flex items-center gap-2">
                      <StageIcon className="w-4 h-4" style={{ color: stage.color }} />
                      <span className="text-xs font-bold" style={{ color: stage.color }}>
                        {stage.label}
                      </span>
                    </div>
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-mono font-bold"
                      style={{ backgroundColor: `${stage.color}20`, color: stage.color }}
                    >
                      {stage.count}
                    </span>
                  </div>

                  {/* Stage Items */}
                  <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                    {stageItems.map((item) => (
                      <div
                        key={item.target.id}
                        onClick={() => setSelectedTarget(item.target)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all group ${
                          selectedTarget?.id === item.target.id
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
                                  item.target.threatLevel > 70
                                    ? '#8b4444'
                                    : item.target.threatLevel > 40
                                      ? '#d4a574'
                                      : '#4a7c59'
                              }}
                            />
                            <span className="text-sm font-semibold text-white">{item.target.name}</span>
                          </div>
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold"
                            style={{
                              backgroundColor: `${
                                item.target.priority === 'critical'
                                  ? '#8b4444'
                                  : item.target.priority === 'high'
                                    ? '#d4a574'
                                    : item.target.priority === 'medium'
                                      ? '#c9a050'
                                      : '#4a7c59'
                              }20`,
                              color:
                                item.target.priority === 'critical'
                                  ? '#ef4444'
                                  : item.target.priority === 'high'
                                    ? '#f59e0b'
                                    : item.target.priority === 'medium'
                                      ? '#fbbf24'
                                      : '#22c55e'
                            }}
                          >
                            {item.target.priority === 'critical' ? '紧急' : item.target.priority === 'high' ? '高' : item.target.priority === 'medium' ? '中' : '低'}
                          </span>
                        </div>

                        {/* Coordinates */}
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-2 font-mono">
                          <MapPin className="w-3 h-3" />
                          <span>{item.target.coordinates[0].toFixed(4)}, {item.target.coordinates[1].toFixed(4)}</span>
                        </div>

                        {/* Metrics */}
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div className="bg-[#0d1117] rounded p-2">
                            <span className="text-[10px] text-slate-500 block">置信度</span>
                            <span className="text-sm font-bold text-emerald-400">{item.target.confidence}%</span>
                          </div>
                          <div className="bg-[#0d1117] rounded p-2">
                            <span className="text-[10px] text-slate-500 block">威胁等级</span>
                            <span
                              className="text-sm font-bold"
                              style={{
                                color:
                                  item.target.threatLevel > 70
                                    ? '#ef4444'
                                  : item.target.threatLevel > 40
                                    ? '#f59e0b'
                                    : '#22c55e'
                              }}
                            >
                              {item.target.threatLevel}
                            </span>
                          </div>
                        </div>

                        {/* Action Button */}
                        {item.stage !== 'executed' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (item.stage === 'detection') {
                                handleNominateTarget(item.target.id);
                              } else {
                                handleAdvanceStage(item.target.id);
                              }
                            }}
                            className="w-full py-2 rounded text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                            style={{
                              backgroundColor: stage.color,
                              color: '#0d1117'
                            }}
                          >
                            {item.stage === 'detection' ? (
                              <>
                                <Plus className="w-3.5 h-3.5" /> 提名
                              </>
                            ) : item.stage === 'nomination' ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" /> 审核
                              </>
                            ) : item.stage === 'review' ? (
                              <>
                                <Zap className="w-3.5 h-3.5" /> 规划
                              </>
                            ) : (
                              <>
                                <ArrowRight className="w-3.5 h-3.5" /> 执行
                              </>
                            )}
                          </button>
                        )}

                        {item.stage === 'executed' && (
                          <div className="w-full py-2 rounded text-xs font-bold bg-[#4a7c59]/20 text-[#4a7c59] flex items-center justify-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" /> 已完成
                          </div>
                        )}

                        {item.nominatedAt && (
                          <div className="mt-2 pt-2 border-t border-[#21262d] text-[10px] text-slate-500 font-mono">
                            提名时间: {new Date(item.nominatedAt).toLocaleTimeString('zh-CN')}
                          </div>
                        )}
                      </div>
                    ))}

                    {stageItems.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-8 text-slate-600">
                        <StageIcon className="w-8 h-8 mb-2 opacity-30" />
                        <span className="text-xs">暂无目标</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right - Target Detail & AI Panel (侧边栏，可收起) */}
        {showAIPanel && (
          <div className="w-80 border-l border-[#21262d] flex flex-col bg-[#161b22]">
            {/* Selected Target Info */}
            {selectedTarget ? (
              <div className="p-4 border-b border-[#21262d]">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-red-400" />
                    <h3 className="font-bold text-white">{selectedTarget.name}</h3>
                  </div>
                  <button
                    onClick={() => setSelectedTarget(null)}
                    className="p-1 hover:bg-[#21262d] rounded transition-colors"
                  >
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                  <div>
                    <span className="text-slate-500 block mb-1">类型</span>
                    <span className="text-white font-medium">{selectedTarget.type === 'vehicle' ? '车辆' : selectedTarget.type === 'personnel' ? '人员' : selectedTarget.type === 'infrastructure' ? '设施' : '装备'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">优先级</span>
                    <span
                      className="font-bold"
                      style={{
                        color:
                          selectedTarget.priority === 'critical'
                            ? '#ef4444'
                            : selectedTarget.priority === 'high'
                              ? '#f59e0b'
                              : selectedTarget.priority === 'medium'
                                ? '#fbbf24'
                                : '#22c55e'
                      }}
                    >
                      {selectedTarget.priority === 'critical' ? '紧急' : selectedTarget.priority === 'high' ? '高' : selectedTarget.priority === 'medium' ? '中' : '低'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">纬度</span>
                    <span className="text-white font-mono">{selectedTarget.coordinates[0].toFixed(4)}°N</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">经度</span>
                    <span className="text-white font-mono">{selectedTarget.coordinates[1].toFixed(4)}°E</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#21262d]">
                  <span className="text-slate-500 text-xs block mb-1">描述</span>
                  <p className="text-sm text-slate-300">{selectedTarget.description}</p>
                </div>
              </div>
            ) : (
              <div className="p-4 border-b border-[#21262d] text-center text-slate-500 text-sm">
                <Target className="w-10 h-10 mx-auto mb-2 opacity-30" />
                点击目标卡片查看详情
              </div>
            )}

            {/* AI Weapon Selection Panel */}
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-sm">AI武器优选</h3>
              </div>

              {!selectedTarget ? (
                <div className="text-center py-6 text-slate-500 text-sm">
                  请先选择一个目标
                </div>
              ) : (
                <>
                  <div className="mb-4 p-3 bg-[#0d1117] rounded-lg border border-[#21262d]">
                    <p className="text-xs text-slate-400 mb-3 font-medium">调整AI优化指标权重：</p>

                    <div className="space-y-3">
                      {Object.entries(aiMetrics).map(([key, value]) => (
                        <div key={key}>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[11px] text-slate-300 font-medium">
                              {key === 'timeToTarget' ? '到达时间' :
                               key === 'distance' ? '距离' :
                               key === 'timeOnStation' ? '驻留时间' :
                               key === 'fuel' ? '燃料' :
                               key === 'munitions' ? '弹药' :
                               key === 'agmMatch' ? '匹配度' : key}
                            </label>
                            <span className="text-[11px] font-mono text-amber-400">{value}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={value}
                            onChange={(e) =>
                              setAiMetrics(prev => ({ ...prev, [key]: Number(e.target.value) }))
                            }
                            className="w-full h-1.5 bg-[#21262d] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-400 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommended Weapon */}
                  {selectedWeapon && (
                    <div className="p-3 bg-gradient-to-r from-[#8b956d]/10 to-transparent rounded-lg border border-[#8b956d]/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-[#8b956d]" />
                        <span className="text-xs font-bold text-[#8b956d]">推荐武器</span>
                      </div>

                      <div className="bg-[#0d1117] rounded-lg p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-bold text-white text-sm">{selectedWeapon.name}</h4>
                            <span className="text-[11px] text-slate-500">{selectedWeapon.type}</span>
                          </div>
                          <span
                            className="px-2 py-0.5 rounded text-[10px] font-bold"
                            style={{
                              backgroundColor:
                                selectedWeapon.availability === 'available'
                                  ? '#4a7c5920'
                                  : selectedWeapon.availability === 'standby'
                                    ? '#c9a05020'
                                    : '#8b444420',
                              color:
                                selectedWeapon.availability === 'available'
                                  ? '#4a7c59'
                                  : selectedWeapon.availability === 'standby'
                                    ? '#c9a050'
                                    : '#8b4444'
                            }}
                          >
                            {selectedWeapon.availability === 'available' ? '可用' : selectedWeapon.availability === 'standby' ? '待命' : '维护中'}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                          <div>
                            <span className="text-[10px] text-slate-500 block">射程</span>
                            <span className="text-xs font-mono text-white">{selectedWeapon.range}km</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 block">到达时间</span>
                            <span className="text-xs font-mono text-amber-400">{selectedWeapon.eta}分钟</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 block">精度</span>
                            <span className="text-xs font-mono text-emerald-400">{selectedWeapon.accuracy}%</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          addLocalNotification(`🚀 任务已执行：${selectedWeapon?.name} → ${selectedTarget?.name}`, 'success');
                          if (selectedTarget) {
                            handleAdvanceStage(selectedTarget.id);
                          }
                        }}
                        className="w-full mt-3 py-2.5 rounded-md bg-[#8b956d] text-[#0d1117] text-xs font-bold hover:bg-[#9ba57d] transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        批准并执行
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Map Panel (可折叠的底部地图) */}
      {showMapPanel && (
        <div className="h-[300px] border-t border-[#21262d] relative">
          <TacticalMap
            targets={mockTargets}
            selectedTargetId={selectedTarget?.id}
            onTargetSelect={setSelectedTarget}
            zoom={11}
          />
          <button
            onClick={() => setShowMapPanel(false)}
            className="absolute top-2 right-2 z-[450] p-2 bg-[#161b22]/90 backdrop-blur-sm border border-[#21262d] rounded-lg hover:bg-[#21262d] transition-colors"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      )}
    </div>
  );
}