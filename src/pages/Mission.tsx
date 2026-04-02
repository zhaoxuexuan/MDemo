import { useState } from 'react';
import { ClipboardCheck, Play, Eye, AlertTriangle, CheckCircle2, Clock, Target } from 'lucide-react';
import { MissionPlanCard } from '@/components/weapon/MissionPlanCard';
import TacticalMap from '@/components/map/TacticalMap';
import { useGlobalState } from '@/context/GlobalContext';
import type { AssessmentResult } from '@/context/GlobalContext';
import { mockMissionPlans, mockTargets } from '@/data/mockData';
import type { MissionPlan } from '@/types';

export function Mission() {
  const { approveMission, executeMission, completeMission, addNotification } = useGlobalState();
  const [selectedPlan, setSelectedPlan] = useState<MissionPlan | null>(null);
  const [executingPlan, setExecutingPlan] = useState<string | null>(null);
  const [executionProgress, setExecutionProgress] = useState(0);

  const proposedPlans = mockMissionPlans.filter(p => p.status === 'proposed');
  const approvedPlans = mockMissionPlans.filter(p => p.status === 'approved');
  const executingPlans = mockMissionPlans.filter(p => p.status === 'executing');

  const handleApprove = (plan: MissionPlan) => {
    approveMission(plan.id);
    addNotification(`✅ 作战方案 ${plan.id} 已批准`, 'success');
  };

  const handleReject = (plan: MissionPlan) => {
    addNotification(`❌ 作战方案 ${plan.id} 已拒绝`, 'warning');
  };

  const handleExecute = (plan: MissionPlan) => {
    executeMission(plan.id);
    setExecutingPlan(plan.id);
    setExecutionProgress(0);
    
    // Simulate execution progress
    const interval = setInterval(() => {
      setExecutionProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setExecutingPlan(null);
          // 模拟任务完成结果
          const result: AssessmentResult = {
            status: 'success',
            collateralDamage: 'low',
            civilianCasualties: 0,
            targetDestroyed: true,
            timestamp: new Date().toISOString(),
            notes: `作战方案 ${plan.id} 执行成功，目标已被摧毁`
          };
          completeMission(plan.id, result);
          addNotification(`🎉 作战方案 ${plan.id} 执行完成！目标已被摧毁`, 'success');
          return 100;
        }
        return prev + 2;
      });
    }, 100);
  };

  const getTargetById = (id: string) => mockTargets.find(t => t.id === id);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">作战方案</h2>
          <p className="text-slate-400">打击方案生成、审批与执行</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-2xl font-bold text-amber-400">{proposedPlans.length}</p>
            <p className="text-xs text-slate-400">待审批</p>
          </div>
          <div className="h-10 w-px bg-slate-700" />
          <div className="text-right">
            <p className="text-2xl font-bold text-[#5a7a8a]">{approvedPlans.length}</p>
            <p className="text-xs text-slate-400">已批准</p>
          </div>
          <div className="h-10 w-px bg-slate-700" />
          <div className="text-right">
            <p className="text-2xl font-bold text-purple-400">{executingPlans.length}</p>
            <p className="text-xs text-slate-400">执行中</p>
          </div>
        </div>
      </div>

      {/* Execution Progress */}
      {executingPlan && (
        <div className="military-card border-purple-500/50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Play className="w-5 h-5 text-purple-400 animate-pulse" />
                <span className="font-semibold text-white">任务执行中</span>
                <span className="text-sm text-slate-400">{executingPlan}</span>
              </div>
              <span className="text-2xl font-bold text-purple-400">{executionProgress}%</span>
            </div>
            <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full transition-all duration-100"
                style={{ width: `${executionProgress}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
              <span>武器发射</span>
              <span>飞行中</span>
              <span>接近目标</span>
              <span>打击完成</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Pending Plans */}
        <div className="space-y-6">
          <div className="military-card">
            <div className="military-card-header">
              <ClipboardCheck className="w-5 h-5 text-amber-400" />
              <h3 className="font-semibold text-white">待审批方案</h3>
              <span className="ml-auto text-xs text-slate-400">{proposedPlans.length} 个</span>
            </div>
            <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
              {proposedPlans.map((plan) => (
                <MissionPlanCard
                  key={plan.id}
                  plan={plan}
                  selected={selectedPlan?.id === plan.id}
                  onClick={() => setSelectedPlan(plan)}
                  onApprove={() => handleApprove(plan)}
                  onReject={() => handleReject(plan)}
                />
              ))}
              {proposedPlans.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-emerald-500" />
                  <p>所有方案已审批完毕</p>
                </div>
              )}
            </div>
          </div>

          {/* Approved Plans */}
          <div className="military-card">
            <div className="military-card-header">
              <CheckCircle2 className="w-5 h-5 text-[#5a7a8a]" />
              <h3 className="font-semibold text-white">已批准方案</h3>
              <span className="ml-auto text-xs text-slate-400">{approvedPlans.length} 个</span>
            </div>
            <div className="p-4 space-y-4 max-h-[300px] overflow-y-auto">
              {approvedPlans.map((plan) => (
                <MissionPlanCard
                  key={plan.id}
                  plan={plan}
                  selected={selectedPlan?.id === plan.id}
                  onClick={() => setSelectedPlan(plan)}
                  onExecute={() => handleExecute(plan)}
                />
              ))}
              {approvedPlans.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>暂无已批准方案</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Center - Map & Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Map */}
          <div className="military-card">
            <div className="military-card-header">
              <Target className="w-5 h-5 text-amber-400" />
              <h3 className="font-semibold text-white">任务区域</h3>
              {selectedPlan && (
                <div className="ml-auto flex items-center gap-4 text-sm">
                  <span className="text-slate-400">武器: <span className="text-white">{selectedPlan.weaponName}</span></span>
                  <span className="text-slate-400">ETA: <span className="text-amber-400">{selectedPlan.timeToImpact}分钟</span></span>
                </div>
              )}
            </div>
            <div className="h-[400px]">
              <TacticalMap 
                targets={selectedPlan ? [getTargetById(selectedPlan.targetId)!].filter(Boolean) : mockTargets}
              />
            </div>
          </div>

          {/* Plan Details */}
          {selectedPlan && (
            <div className="military-card">
              <div className="military-card-header">
                <Eye className="w-5 h-5 text-amber-400" />
                <h3 className="font-semibold text-white">方案详情</h3>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-amber-400">{selectedPlan.successProbability}%</p>
                    <p className="text-xs text-slate-500 mt-1">成功概率</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-[#5a7a8a]">{selectedPlan.timeToImpact}</p>
                    <p className="text-xs text-slate-500 mt-1">打击时间(分钟)</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-purple-400">{selectedPlan.estimatedCasualties}</p>
                    <p className="text-xs text-slate-500 mt-1">预计伤亡</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-emerald-400">
                      ¥{(selectedPlan.cost / 1000000).toFixed(1)}M
                    </p>
                    <p className="text-xs text-slate-500 mt-1">任务成本</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-white mb-3">风险评估</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">附带损伤</span>
                        <span className={`
                          ${selectedPlan.collateralDamage === 'minimal' ? 'text-emerald-400' : ''}
                          ${selectedPlan.collateralDamage === 'low' ? 'text-[#5a7a8a]' : ''}
                          ${selectedPlan.collateralDamage === 'moderate' ? 'text-amber-400' : ''}
                          ${selectedPlan.collateralDamage === 'high' ? 'text-red-400' : ''}
                        `}>
                          {selectedPlan.collateralDamage === 'minimal' && '极小'}
                          {selectedPlan.collateralDamage === 'low' && '低'}
                          {selectedPlan.collateralDamage === 'moderate' && '中等'}
                          {selectedPlan.collateralDamage === 'high' && '高'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">平民风险</span>
                        <span className="text-emerald-400">低</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">友军风险</span>
                        <span className="text-emerald-400">无</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-white mb-3">法律合规</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>符合交战规则</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>目标确认合法</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>比例原则满足</span>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedPlan.status === 'proposed' && (
                  <div className="flex gap-3 mt-4 pt-4 border-t border-slate-700">
                    <button 
                      onClick={() => handleApprove(selectedPlan)}
                      className="flex-1 military-btn-success py-3 text-sm flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      批准方案
                    </button>
                    <button 
                      onClick={() => handleReject(selectedPlan)}
                      className="flex-1 military-btn-danger py-3 text-sm flex items-center justify-center gap-2"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      拒绝方案
                    </button>
                  </div>
                )}

                {selectedPlan.status === 'approved' && (
                  <div className="flex gap-3 mt-4 pt-4 border-t border-slate-700">
                    <button 
                      onClick={() => handleExecute(selectedPlan)}
                      className="flex-1 military-btn py-3 text-sm flex items-center justify-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      执行打击
                    </button>
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
