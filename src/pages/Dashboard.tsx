import { useState } from 'react';
import {
  Activity,
  Target as TargetIcon,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Brain,
  Zap,
  Shield,
  Radar,
  Eye,
  Crosshair,
  ArrowUpRight
} from 'lucide-react';
import TacticalMap from '@/components/map/TacticalMap';
import { VideoFeed } from '@/components/dashboard/VideoFeed';
import { useGlobalState } from '@/context/GlobalContext';
import { mockTargets, mockWeapons, mockSensors, mockSystemStatus, mockMissionPlans, mockIntelReports } from '@/data/mockData';
import type { Target } from '@/types';

export function Dashboard() {
  const { nominateTarget, addNotification } = useGlobalState();
  const [selectedTarget, setSelectedTarget] = useState<Target | null>(null);
  const [showModal, setShowModal] = useState<{type: string, title: string, content: string} | null>(null);

  const stats = [
    {
      label: '活跃目标',
      value: `${mockTargets.filter(t => t.status === 'detected' || t.status === 'nominated').length}/${mockTargets.length}`,
      icon: TargetIcon,
      color: '#8b4444',
      change: '+3 新增',
      detail: `当前共有 ${mockTargets.length} 个侦测目标，其中 ${mockTargets.filter(t => t.status === 'detected').length} 个已确认，${mockTargets.filter(t => t.priority === 'critical').length} 个紧急优先级。最新目标于 ${new Date().toLocaleTimeString('zh-CN')} 更新。`
    },
    {
      label: '武器就绪',
      value: `${mockWeapons.filter(w => w.availability === 'available').length}/${mockWeapons.length}`,
      icon: Crosshair,
      color: '#8b956d',
      change: '系统正常',
      detail: `武器库共 ${mockWeapons.length} 套系统，${mockWeapons.filter(w => w.availability === 'available').length} 套处于可用状态，${mockWeapons.filter(w => w.availability === 'standby').length} 套待命，${mockWeapons.filter(w => w.availability === 'maintenance').length} 套维护中。所有系统运行正常。`
    },
    {
      label: '在线传感器',
      value: `${mockSensors.filter(s => s.status === 'active').length}/${mockSensors.length}`,
      icon: Radar,
      color: '#4a7c59',
      change: '156 个数据流',
      detail: `${mockSensors.filter(s => s.status === 'active').length} 个传感器在线运行中，包括 ${mockSensors.filter(s => s.type === 'satellite').length} 颗卫星、${mockSensors.filter(s => s.type === 'uav').length} 架无人机、${mockSensors.filter(s => s.type === 'radar').length} 台雷达。数据延迟 <50ms。`
    },
    {
      label: '待处理任务',
      value: mockSystemStatus.pendingTargets.toString(),
      icon: Clock,
      color: '#c9a050',
      change: '需要关注',
      detail: `当前有 ${mockSystemStatus.pendingTargets} 个任务需要处理：${mockMissionPlans.filter(m => m.status === 'proposed').length} 个待审批任务、${mockIntelReports.filter(r => r.classification === 'secret').length} 条机密情报。建议优先处理高优先级目标。`
    }
  ];

  const aiRecommendations = [
    {
      id: 'strike-window',
      icon: Shield,
      color: 'amber-400',
      title: '最佳打击窗口',
      description: '03:00 - 05:30 UTC（敌方活动低）',
      detail: '根据敌方活动规律分析，凌晨3:00至5:30（UTC时间）是最佳打击窗口。此时段敌方防空系统活跃度降低45%，巡逻频率减少60%，能显著提高任务成功率并降低我方风险。'
    },
    {
      id: 'asset-allocation',
      icon: Crosshair,
      color: 'emerald-400',
      title: '资产分配建议',
      description: 'MQ-9 死神无人机 → 渡鸦目标区（匹配度94%）',
      detail: 'AI分析显示MQ-9 死神无人机与渡鸦目标区的匹配度达94%。该无人机具备长航时（24小时）、多传感器载荷、精确打击能力，适合执行持续侦察和即时打击任务。预计到达时间4分23秒。'
    },
    {
      id: 'threat-alert',
      icon: AlertTriangle,
      color: 'red-400',
      title: '威胁预警',
      description: '检测到狮子目标区SA-15防空系统激活',
      detail: '【紧急】狮子目标区检测到SA-15"道尔"M1防空系统激活信号。该系统射程12公里，对低空目标构成严重威胁。建议调整飞行路径或优先使用防区外打击武器。威胁等级：HIGH。'
    }
  ];

  return (
    <div className="h-[calc(100vh-64px)] overflow-y-auto bg-[#0d1117]">
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(null)}>
          <div className="bg-[#161b22] border border-[#21262d] rounded-xl p-6 max-w-lg w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#21262d]">
              <h3 className="text-lg font-bold text-white">{showModal.title}</h3>
              <button
                onClick={() => setShowModal(null)}
                className="p-1.5 hover:bg-[#21262d] rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">{showModal.content}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(null)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-[#21262d] transition-colors"
              >
                关闭
              </button>
              {showModal.type === 'ai-action' && (
                <button
                  onClick={() => {
                    addNotification(`已执行操作：${showModal.title}`, 'success');
                    setShowModal(null);
                  }}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-[#8b956d] text-[#0d1117] hover:bg-[#9ba57d] transition-colors"
                >
                  立即执行
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Top Status Bar */}
      <div className="px-6 py-4 border-b border-[#21262d] bg-gradient-to-r from-[#161b22] to-transparent">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <Radar className="w-6 h-6 text-[#8b956d]" />
              态势感知总览
            </h2>
            <p className="text-sm text-slate-500 mt-1 font-mono">MAVEN 智能指挥系统</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowModal({
                type: 'info',
                title: '全域互联状态',
                content: 'JADC2（联合全域指挥控制）系统已成功连接至156个数据源节点。包括卫星通信链路、无人机数据流、地面雷达网络、电子战系统等。所有链路状态正常，数据同步延迟<100ms。系统就绪度：98.5%。'
              })}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-500/40 cursor-pointer transition-all"
            >
              <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span className="text-sm font-semibold text-emerald-400">全域互联</span>
            </button>
            <button
              onClick={() => setShowModal({
                type: 'info',
                title: 'AI引擎 v2.4 详情',
                content: 'MAVEN AI引擎版本2.4正在运行。核心功能包括：①计算机视觉目标识别（准确率94.2%）；②多源数据融合分析；③杀伤链自动化优化；④武器-目标匹配算法。当前处理负载：67%，模型更新时间：2026-03-23 08:00 UTC。'
              })}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#8b956d]/10 border border-[#8b956d]/20 hover:border-[#8b956d]/40 cursor-pointer transition-all"
            >
              <Brain className="w-4 h-4 text-[#8b956d]" />
              <span className="text-sm font-semibold text-[#8b956d]">AI引擎 v2.4</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                onClick={() => setShowModal({
                  type: 'detail',
                  title: `${stat.label}详情`,
                  content: stat.detail
                })}
                className="bg-[#161b22] rounded-lg border border-[#21262d] p-5 hover:border-[#30363d] transition-all group cursor-pointer active:scale-[0.98]"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2.5 rounded-lg`} style={{ backgroundColor: `${stat.color}15` }}>
                    <Icon className="w-5 h-5" style={{ color: stat.color }} />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
                </div>
                <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-xs text-slate-500 mb-2">{stat.label}</p>
                <span className="text-[11px] font-medium" style={{ color: stat.color }}>{stat.change}</span>
              </div>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column - Map (8 cols) */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            {/* Tactical Map */}
            <div className="bg-[#161b22] rounded-lg border border-[#21262d] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#21262d] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-[#8b956d]" />
                  <h3 className="font-bold text-white">地理空间情报</h3>
                  <span className="text-xs text-slate-500 font-mono">GEOINT 图层</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">伊朗战区</span>
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                </div>
              </div>
              <div className="h-[400px] relative">
                <TacticalMap
                  targets={mockTargets}
                  selectedTargetId={selectedTarget?.id}
                  onTargetSelect={(target) => setSelectedTarget(target)}
                  zoom={9}
                />
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
                    <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                      <div><span className="text-slate-500 block">类型</span><span className="text-white font-medium">{selectedTarget.type === 'vehicle' ? '车辆' : selectedTarget.type === 'personnel' ? '人员' : '设施'}</span></div>
                      <div><span className="text-slate-500 block">优先级</span><span className={`font-bold ${selectedTarget.priority === 'critical' ? 'text-red-400' : selectedTarget.priority === 'high' ? 'text-amber-400' : 'text-emerald-400'}`}>{selectedTarget.priority === 'critical' ? '紧急' : selectedTarget.priority === 'high' ? '高' : '中'}</span></div>
                      <div><span className="text-slate-500 block">纬度</span><span className="text-white font-mono">{selectedTarget.coordinates[0].toFixed(4)}°N</span></div>
                      <div><span className="text-slate-500 block">经度</span><span className="text-white font-mono">{selectedTarget.coordinates[1].toFixed(4)}°E</span></div>
                    </div>
                    <div className="pt-3 border-t border-[#21262d]">
                      <p className="text-xs text-slate-300">{selectedTarget.description}</p>
                    </div>
                    <button
                      onClick={() => {
                        if (selectedTarget) {
                          nominateTarget(selectedTarget);
                          addNotification(`✓ 目标 "${selectedTarget.name}" 已提交至目标提名工作流`, 'success');
                          setSelectedTarget(null);
                        }
                      }}
                      className="mt-3 w-full py-2 rounded-md bg-[#8b956d] text-[#0d1117] text-xs font-bold hover:bg-[#9ba57d] transition-colors"
                    >
                      提交至提名工作流
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Video Feed with CV */}
            <VideoFeed />
          </div>

          {/* Right Column - Data Panels (4 cols) */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            {/* Kill Chain Status */}
            <div className="bg-[#161b22] rounded-lg border border-[#21262d] p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-[#8b956d]" />
                  <h3 className="font-bold text-white">杀伤链状态</h3>
                </div>
                <button
                  onClick={() => setShowModal({
                    type: 'info',
                    title: '杀伤链流程说明',
                    content: 'F2T2EA杀伤链包含6个阶段：\n\n① 发现(FIND)：通过多源侦察发现潜在目标\n② 定位(FIX)：精确定位目标坐标和属性\n③ 跟踪(TRACK)：持续监控目标动态变化\n④ 瞄准(TARGET)：评估打击方案和附带损伤\n⑤ 交战(ENGAGE)：下达攻击指令并执行打击\n⑥ 评估(ASSESS)：评估打击效果并反馈\n\n当前平均完成时间：4.2分钟（传统方式需数小时）'
                  })}
                  className="text-xs font-mono text-[#8b956d] hover:text-[#9ba57d] cursor-pointer underline decoration-dotted"
                >
                  平均 4.2 分钟
                </button>
              </div>

              <div className="space-y-3">
                {[
                  { stage: '发现', status: 'complete', time: '00:45', desc: 'UAV-09发现异常热源信号' },
                  { stage: '定位', status: 'active', time: '01:23', desc: '多源融合确认目标身份' },
                  { stage: '跟踪', status: 'pending', time: '--:--', desc: '等待资源分配' },
                  { stage: '瞄准', status: 'pending', time: '--:--', desc: '等待审批' },
                  { stage: '交战', status: 'pending', time: '--:--', desc: '等待指令' },
                  { stage: '评估', status: 'pending', time: '--:--', desc: '等待结果' },
                ].map((item) => (
                  <div
                    key={item.stage}
                    onClick={() => item.status !== 'pending' && setShowModal({
                      type: 'info',
                      title: `${item.stage}阶段详情`,
                      content: item.desc
                    })}
                    className={`flex items-center gap-3 group ${item.status !== 'pending' ? 'cursor-pointer hover:bg-[#21262d]/50 rounded-lg p-1.5 -mx-1.5 transition-colors' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-md flex items-center justify-center ${
                      item.status === 'complete' ? 'bg-[#4a7c59]/20' :
                      item.status === 'active' ? 'bg-[#8b956d]/20 animate-pulse' :
                      'bg-[#21262d]'
                    }`}>
                      <CheckCircle2 className={`w-4 h-4 ${
                        item.status === 'complete' ? 'text-[#4a7c59]' :
                        item.status === 'active' ? 'text-[#8b956d]' :
                        'text-slate-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-300">{item.stage}</p>
                    </div>
                    <span className={`text-xs font-mono ${
                      item.status === 'complete' ? 'text-[#4a7c59]' :
                      item.status === 'active' ? 'text-[#8b956d]' :
                      'text-slate-600'
                    }`}>{item.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* High Priority Targets */}
            <div className="bg-[#161b22] rounded-lg border border-[#21262d] p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <h3 className="font-bold text-white">高价值目标</h3>
                </div>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-red-500/20 text-red-400">
                  {mockTargets.filter(t => t.priority === 'critical').length}
                </span>
              </div>

              <div className="space-y-3 max-h-[280px] overflow-y-auto">
                {mockTargets.filter(t => t.priority === 'critical').slice(0, 4).map((target) => (
                  <div
                    key={target.id}
                    onClick={() => setShowModal({
                      type: 'target-detail',
                      title: target.name,
                      content: `类型：${target.type === 'vehicle' ? '车辆' : target.type === 'personnel' ? '人员' : '设施'}\n优先级：紧急\n威胁等级：${target.threatLevel}/100\n置信度：${target.confidence}%\n状态：${target.status === 'detected' ? '已侦测' : target.status === 'nominated' ? '已提名' : '未知'}\n\n描述：${target.description}\n\n坐标：${target.coordinates[0].toFixed(6)}°N, ${target.coordinates[1].toFixed(6)}°E\n侦测时间：${new Date(target.detectedAt).toLocaleString('zh-CN')}`
                    })}
                    className="p-3 rounded-lg bg-[#0d1117] border border-[#21262d] hover:border-red-500/50 cursor-pointer transition-all active:scale-[0.98]"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-sm font-semibold text-white">{target.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-bold">
                        紧急
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 mb-2">{target.description}</p>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-mono">{target.coordinates[0].toFixed(2)}°N</span>
                      <span className="text-red-400 font-bold">威胁: {target.threatLevel}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Recommendations */}
            <div className="bg-gradient-to-br from-[#8b956d]/10 to-[#161b22] rounded-lg border border-[#8b956d]/30 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white">AI智能推荐</h3>
              </div>

              <div className="space-y-3">
                {aiRecommendations.map((rec) => {
                  const RecIcon = rec.icon;
                  return (
                    <div
                      key={rec.id}
                      onClick={() => setShowModal({
                        type: rec.id === 'threat-alert' ? 'ai-action' : 'ai-info',
                        title: rec.title,
                        content: rec.detail
                      })}
                      className="p-3 bg-[#0d1117]/80 rounded-lg border border-[#21262d] hover:border-[#8b956d]/40 cursor-pointer transition-all active:scale-[0.98] group"
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <RecIcon className={`w-4 h-4 mt-0.5 text-${rec.color} group-hover:scale-110 transition-transform`} />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">{rec.title}</p>
                          <p className="text-xs text-slate-400 mt-1">{rec.description}</p>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-slate-600 group-hover:text-[#8b956d] transition-colors" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}