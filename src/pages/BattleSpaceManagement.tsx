import { useState } from 'react';
import {
  Map as MapIcon,
  Eye,
  Layers,
  Target as TargetIcon,
  Crosshair,
  Brain,
  Activity,
  Maximize2,
  Minimize2,
  Satellite,
  Radio,
  Zap,
  ChevronRight
} from 'lucide-react';
import TacticalMap from '@/components/map/TacticalMap';
import { useGlobalState } from '@/context/GlobalContext';
import { mockTargets } from '@/data/mockData';
import { mockSensorsData, mockWeaponsData, mockFlightRoutes, mockFriendlyForces, mockAreasOfInterest } from '@/data/layerData';
import type { Target } from '@/types';

type ViewMode = 'tactical' | 'satellite' | 'fusion' | 'sensor';

export function BattleSpaceManagement() {
  const { state, nominateTarget, advanceStage } = useGlobalState();
  const [selectedTarget, setSelectedTarget] = useState<Target | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('tactical');
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [activeLayers, setActiveLayers] = useState<string[]>(['targets', 'sensors', 'weapons', 'routes', 'friendly', 'aoi']);

  const viewModes: { id: ViewMode; label: string; icon: React.ElementType; description: string }[] = [
    { id: 'tactical', label: '战术态势', icon: Crosshair, description: '实时目标分布与威胁评估' },
    { id: 'satellite', label: '卫星影像', icon: Satellite, description: '高分辨率光学/SAR卫星底图' },
    { id: 'fusion', label: '多源融合', icon: Brain, description: 'GEOINT+SIGINT+HUMINT融合视图' },
    { id: 'sensor', label: '传感器覆盖', icon: Radio, description: '所有传感器覆盖范围与信号强度' }
  ];

  const layers = [
    { id: 'targets', label: '目标图层', icon: TargetIcon, color: '#ef4444', count: state.nominatedTargets.length + mockTargets.length },
    { id: 'sensors', label: '传感器', icon: Radio, color: '#22c55e', count: mockSensorsData.length },
    { id: 'weapons', label: '武器部署', icon: Crosshair, color: '#8b956d', count: state.weaponAssignments.length + mockWeaponsData.length },
    { id: 'routes', label: '飞行路线', icon: Zap, color: '#f59e0b', count: mockFlightRoutes.length + state.activeMissions.filter(m => m.status === 'executing').length },
    { id: 'friendly', label: '友军位置', icon: Activity, color: '#3b82f6', count: mockFriendlyForces.length },
    { id: 'aoi', label: '关注区域', icon: Eye, color: '#8b5cf6', count: mockAreasOfInterest.length }
  ];

  const toggleLayer = (layerId: string) => {
    setActiveLayers(prev =>
      prev.includes(layerId) ? prev.filter(l => l !== layerId) : [...prev, layerId]
    );
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-[#0d1117]">
      {/* Header */}
      <div className="px-6 py-3 border-b border-[#21262d] bg-gradient-to-r from-[#161b22] to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <MapIcon className="w-5 h-5 text-[#8b956d]" />
              <h2 className="text-lg font-bold text-white">战场空间管理</h2>
              <span className="text-xs text-slate-500 bg-[#21262d] px-2 py-1 rounded">BATTLESPACE MGMT</span>
            </div>

            {/* View Mode Selector */}
            <div className="flex items-center gap-1 bg-[#0d1117] rounded-lg p-1 border border-[#21262d]">
              {viewModes.map((mode) => {
                const ModeIcon = mode.icon;
                const isActive = viewMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    onClick={() => setViewMode(mode.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                      isActive ? 'bg-[#8b956d] text-[#0d1117]' : 'text-slate-400 hover:text-white hover:bg-[#161b22]'
                    }`}
                  >
                    <ModeIcon className="w-3.5 h-3.5" />
                    <span>{mode.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Stats */}
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#0d1117] border border-[#21262d]">
              <TargetIcon className="w-3.5 h-3.5 text-red-400" />
              <span className="text-slate-400">目标:</span>
              <span className="text-white font-bold">{state.nominatedTargets.length + mockTargets.length}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#0d1117] border border-[#21262d]">
              <Crosshair className="w-3.5 h-3.5 text-[#8b956d]" />
              <span className="text-slate-400">武器:</span>
              <span className="text-white font-bold">{state.weaponAssignments.length + mockWeaponsData.length}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#0d1117] border border-[#21262d]">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400">任务:</span>
              <span className="text-white font-bold">{state.activeMissions.length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Layer Control */}
        {showLeftPanel && (
          <div className="w-64 border-r border-[#21262d] bg-[#161b22]/30 overflow-y-auto p-4 space-y-4">
            {/* Layer Control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white flex items-center gap-2 text-sm">
                  <Layers className="w-4 h-4 text-[#8b956d]" />
                  图层控制
                </h3>
                <button onClick={() => setShowLeftPanel(false)} className="p-1 hover:bg-[#21262d] rounded text-slate-400">
                  ✕
                </button>
              </div>

              {layers.map((layer) => {
                const LayerIcon = layer.icon;
                const isActive = activeLayers.includes(layer.id);
                
                return (
                  <label
                    key={layer.id}
                    className="flex items-center gap-3 px-2 py-2 rounded-lg cursor-pointer transition-colors"
                    style={{ backgroundColor: isActive ? `${layer.color}15` : 'transparent' }}
                    onClick={() => toggleLayer(layer.id)}
                  >
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={() => {}}
                      className="w-4 h-4 rounded border-[#30363d] bg-[#0d1117] checked:bg-[#8b956d]"
                    />
                    <LayerIcon className="w-4 h-4 flex-shrink-0" style={{ color: layer.color }} />
                    <span className="text-sm text-slate-300 flex-1">{layer.label}</span>
                    <span
                      className="text-xs font-mono px-1.5 py-0.5 rounded"
                      style={{
                        backgroundColor: `${layer.color}20`,
                        color: layer.color
                      }}
                    >
                      {layer.count}
                    </span>
                  </label>
                );
              })}
            </div>

            {/* Nominated Targets Quick List */}
            <div className="pt-4 border-t border-[#21262d]">
              <h3 className="font-bold text-white flex items-center gap-2 text-sm mb-3">
                <TargetIcon className="w-4 h-4 text-red-400" />
                已提名目标
                <span className="ml-auto text-xs font-mono text-red-400 bg-red-500/10 px-2 py-0.5 rounded">
                  {state.nominatedTargets.filter(t => t.stage !== 'executed').length}
                </span>
              </h3>

              <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                {state.nominatedTargets.slice(0, 8).map((item) => (
                  <div
                    key={item.target.id}
                    onClick={() => setSelectedTarget(item.target)}
                    className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                      selectedTarget?.id === item.target.id
                        ? 'border-[#8b956d] bg-[#8b956d]/10'
                        : 'border-[#21262d] bg-[#0d1117] hover:border-[#30363d]'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1.5">
                      <span className="text-xs font-semibold text-white truncate flex-1">{item.target.name}</span>
                      <span
                        className="text-[9px] px-1.5 py-0.5 rounded font-bold ml-2 flex-shrink-0"
                        style={{
                          backgroundColor:
                            item.stage === 'executed' ? '#4a7c5920' :
                            item.stage === 'prosecution' ? '#8b956d20' :
                            item.stage === 'review' ? '#c9a05020' :
                            item.stage === 'nomination' ? '#d4a57420' :
                            '#5a7a8a20',
                          color:
                            item.stage === 'executed' ? '#4a7c59' :
                            item.stage === 'prosecution' ? '#8b956d' :
                            item.stage === 'review' ? '#c9a050' :
                            item.stage === 'nomination' ? '#d4a574' :
                            '#5a7a8a'
                        }}
                      >
                        {item.stage === 'detection' ? '检测' :
                         item.stage === 'nomination' ? '提名' :
                         item.stage === 'review' ? '审核' :
                         item.stage === 'prosecution' ? '规划' : '完成'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span className="font-mono">{item.target.coordinates[0].toFixed(2)}°N</span>
                      <span>威胁: {item.target.threatLevel}</span>
                    </div>

                    {item.assignedWeapon && (
                      <div className="mt-1.5 pt-1.5 border-t border-[#21262d]/50">
                        <span className="text-[9px] text-[#8b956d]">→ {item.assignedWeapon.name}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Active Missions */}
            <div className="pt-4 border-t border-[#21262d]">
              <h3 className="font-bold text-white flex items-center gap-2 text-sm mb-3">
                <Zap className="w-4 h-4 text-amber-400" />
                进行中任务
              </h3>

              {state.activeMissions.filter(m => m.status !== 'completed').slice(0, 3).map((mission) => (
                <div key={mission.id} className="mb-2 p-2.5 rounded-lg bg-[#0d1117] border border-[#21262d]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-white truncate">{mission.name}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                        mission.status === 'executing' ? 'bg-amber-500/20 text-amber-400 animate-pulse' :
                        mission.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                        'bg-slate-500/20 text-slate-400'
                      }`}
                    >
                      {mission.status === 'planning' ? '规划中' :
                       mission.status === 'approved' ? '已批准' :
                       mission.status === 'executing' ? '执行中' : '已完成'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500">
                    <span>{mission.targets.length} 目标</span>
                    <span>|</span>
                    <span>{mission.weapons.length} 武器</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main - Map */}
        <div className="flex-1 relative overflow-hidden">
          <TacticalMap
            targets={mockTargets}
            sensors={mockSensorsData}
            weapons={mockWeaponsData}
            flightRoutes={mockFlightRoutes}
            friendlyForces={mockFriendlyForces}
            areasOfInterest={mockAreasOfInterest}
            selectedTargetId={selectedTarget?.id}
            onTargetSelect={setSelectedTarget}
            zoom={9}
            activeLayers={activeLayers}
          />

          {/* Selected Target Overlay */}
          {selectedTarget && (
            <div className="absolute top-4 left-4 right-4 z-[450] bg-[#161b22]/95 backdrop-blur-xl border border-[#21262d] rounded-lg p-4 shadow-2xl">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <TargetIcon className="w-5 h-5 text-red-400" />
                  <h3 className="font-bold text-white">{selectedTarget.name}</h3>
                </div>
                <button
                  onClick={() => setSelectedTarget(null)}
                  className="p-1 hover:bg-[#21262d] rounded transition-colors text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-4 gap-3 text-xs mb-3">
                <div><span className="text-slate-500 block mb-1">类型</span><span className="text-white font-medium">{selectedTarget.type === 'vehicle' ? '车辆' : selectedTarget.type === 'personnel' ? '人员' : '设施'}</span></div>
                <div><span className="text-slate-500 block mb-1">优先级</span><span className={`font-bold ${selectedTarget.priority === 'critical' ? 'text-red-400' : selectedTarget.priority === 'high' ? 'text-amber-400' : 'text-emerald-400'}`}>{selectedTarget.priority === 'critical' ? '紧急' : selectedTarget.priority === 'high' ? '高' : '中'}</span></div>
                <div><span className="text-slate-500 block mb-1">纬度</span><span className="text-white font-mono">{selectedTarget.coordinates[0].toFixed(4)}°N</span></div>
                <div><span className="text-slate-500 block mb-1">经度</span><span className="text-white font-mono">{selectedTarget.coordinates[1].toFixed(4)}°E</span></div>
              </div>

              <div className="pt-3 border-t border-[#21262d]">
                <p className="text-xs text-slate-300">{selectedTarget.description}</p>
              </div>

              {/* Quick Actions */}
              <div className="mt-3 pt-3 border-t border-[#21262d] flex gap-2">
                <button
                  onClick={() => {
                    if (selectedTarget) nominateTarget(selectedTarget);
                  }}
                  className="flex-1 py-2 rounded-md bg-[#d4a574] text-[#0d1117] text-xs font-bold hover:bg-[#e4b584] transition-colors"
                >
                  提交提名
                </button>
                <button
                  onClick={() => {
                    if (selectedTarget) advanceStage(selectedTarget.id);
                  }}
                  className="flex-1 py-2 rounded-md bg-[#8b956d] text-[#0d1117] text-xs font-bold hover:bg-[#9ba57d] transition-colors"
                >
                  武器匹配
                </button>
                <button
                  className="flex-1 py-2 rounded-md bg-[#161b22] text-slate-300 border border-[#21262d] text-xs font-medium hover:border-[#30363d] transition-colors"
                >
                  查看详情
                </button>
              </div>
            </div>
          )}

          {/* View Mode Description */}
          <div className="absolute bottom-4 left-4 z-[450] bg-[#161b22]/90 backdrop-blur-sm border border-[#21262d] rounded-lg px-4 py-2">
            <div className="flex items-center gap-2">
              {(() => {
                const currentMode = viewModes.find(m => m.id === viewMode);
                const ModeIcon = currentMode?.icon || MapIcon;
                return <ModeIcon className="w-4 h-4 text-[#8b956d]" />;
              })()}
              <span className="text-xs text-slate-300">
                当前模式：{viewModes.find(m => m.id === viewMode)?.description}
              </span>
            </div>
          </div>

          {/* Toggle Left Panel Button */}
          {!showLeftPanel && (
            <button
              onClick={() => setShowLeftPanel(true)}
              className="absolute top-4 left-4 z-[450] p-2 bg-[#161b22]/90 backdrop-blur-sm border border-[#21262d] rounded-lg hover:bg-[#21262d] transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </button>
          )}

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setShowRightPanel(!showRightPanel)}
            className="absolute top-4 right-4 z-[450] p-2 bg-[#161b22]/90 backdrop-blur-sm border border-[#21262d] rounded-lg hover:bg-[#21262d] transition-colors"
          >
            {showRightPanel ? <Minimize2 className="w-4 h-4 text-slate-300" /> : <Maximize2 className="w-4 h-4 text-slate-300" />}
          </button>
        </div>

        {/* Right Panel - Target Details & Actions */}
        {showRightPanel && selectedTarget && (
          <div className="w-80 border-l border-[#21262d] bg-[#161b22] overflow-y-auto">
            <div className="p-4 border-b border-[#21262d] sticky top-0 bg-[#161b22] z-10">
              <h3 className="font-bold text-white">目标详情面板</h3>
            </div>

            <div className="p-4 space-y-4">
              {/* Basic Info */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">基本信息</h4>
                <div className="bg-[#0d1117] rounded-lg p-3 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">ID</span>
                    <span className="text-white font-mono">{selectedTarget.id}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">类型</span>
                    <span className="text-white">{selectedTarget.type}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">优先级</span>
                    <span className={`font-bold ${
                      selectedTarget.priority === 'critical' ? 'text-red-400' :
                      selectedTarget.priority === 'high' ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {selectedTarget.priority.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">状态</span>
                    <span className="text-emerald-400">{selectedTarget.status}</span>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">位置信息</h4>
                <div className="bg-[#0d1117] rounded-lg p-3 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">纬度</span>
                    <span className="text-white font-mono">{selectedTarget.coordinates[0].toFixed(6)}°</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">经度</span>
                    <span className="text-white font-mono">{selectedTarget.coordinates[1].toFixed(6)}°</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">置信度</span>
                    <span className="text-emerald-400 font-bold">{selectedTarget.confidence}%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">威胁等级</span>
                    <span className={`font-bold ${
                      selectedTarget.threatLevel > 70 ? 'text-red-400' :
                      selectedTarget.threatLevel > 40 ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {selectedTarget.threatLevel}/100
                    </span>
                  </div>
                </div>
              </div>

              {/* Workflow Status */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">工作流状态</h4>
                <div className="space-y-2">
                  {['检测识别', '目标提名', '待审评估', '打击规划', '任务完成'].map((stage, idx) => {
                    const nominatedItem = state.nominatedTargets.find(n => n.target.id === selectedTarget.id);
                    const isCompleted = nominatedItem && ['detection'].includes(nominatedItem.stage) && idx <= ['detection','nomination','review','prosecution','executed'].indexOf(nominatedItem.stage);
                    const isCurrent = nominatedItem?.stage === ['nomination','review','prosecution','executed'][idx];
                    
                    return (
                      <div key={stage} className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          isCompleted ? 'bg-[#4a7c59] text-white' :
                          isCurrent ? 'bg-[#8b956d] text-[#0d1117] animate-pulse' :
                          'bg-[#21262d] text-slate-600'
                        }`}>
                          {isCompleted ? '✓' : idx + 1}
                        </div>
                        <span className={`text-xs flex-1 ${
                          isCompleted ? 'text-[#4a7c59]' :
                          isCurrent ? 'text-[#8b956d] font-medium' :
                          'text-slate-600'
                        }`}>{stage}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">描述</h4>
                <p className="text-xs text-slate-300 leading-relaxed bg-[#0d1117] rounded-lg p-3">
                  {selectedTarget.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-[#21262d] space-y-2">
                <button 
                  onClick={() => {
                    if (selectedTarget) nominateTarget(selectedTarget);
                  }}
                  className="w-full py-2.5 rounded-md bg-[#d4a574] text-[#0d1117] text-xs font-bold hover:bg-[#e4b584] transition-colors flex items-center justify-center gap-1.5"
                >
                  <Crosshair className="w-4 h-4" /> 提交至提名工作流
                </button>
                <button 
                  onClick={() => {
                    if (selectedTarget) advanceStage(selectedTarget.id);
                  }}
                  className="w-full py-2.5 rounded-md bg-[#8b956d] text-[#0d1117] text-xs font-bold hover:bg-[#9ba57d] transition-colors flex items-center justify-center gap-1.5"
                >
                  <Crosshair className="w-4 h-4" /> 转入武器匹配
                </button>
                <button 
                  className="w-full py-2.5 rounded-md bg-[#161b22] text-slate-300 border border-[#21262d] text-xs font-medium hover:border-[#30363d] transition-colors flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-4 h-4" /> 展开子图分析
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}