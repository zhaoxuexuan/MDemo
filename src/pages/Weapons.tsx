import { useState, useMemo } from 'react';
import { Rocket, Target, Zap, Filter, Brain, CheckCircle2 } from 'lucide-react';
import TacticalMap from '@/components/map/TacticalMap';
import { WeaponCard } from '@/components/weapon/WeaponCard';
import { TargetCard } from '@/components/target/TargetCard';
import { mockTargets, mockWeapons } from '@/data/mockData';
import type { Target as TargetType, Weapon as WeaponType } from '@/types';
import { useToast } from '@/components/ui/Toast';

export function Weapons() {
  const [selectedTarget, setSelectedTarget] = useState<TargetType | null>(null);
  const [selectedWeapon, setSelectedWeapon] = useState<WeaponType | null>(null);
  const [useAI, setUseAI] = useState(true);
  const [isMatching, setIsMatching] = useState(false);
  const toast = useToast();

  // Approved targets only
  const approvedTargets = mockTargets.filter(t => t.status === 'approved');
  const availableWeapons = mockWeapons.filter(w => w.availability === 'available');

  // Calculate match scores
  const weaponMatches = useMemo(() => {
    if (!selectedTarget) return [];
    
    return availableWeapons.map(weapon => {
      // Calculate distance (simplified)
      const distance = Math.sqrt(
        Math.pow(weapon.location[0] - selectedTarget.coordinates[0], 2) +
        Math.pow(weapon.location[1] - selectedTarget.coordinates[1], 2)
      ) * 111; // Rough conversion to km

      // Calculate match score based on multiple factors
      let score = 0;
      
      // Range factor (can weapon reach target?)
      if (distance <= weapon.range) {
        score += 30;
        score += (1 - distance / weapon.range) * 20; // Closer is better
      }
      
      // Accuracy factor
      score += weapon.accuracy * 0.3;
      
      // Speed factor (ETA)
      if (weapon.eta) {
        score += Math.max(0, (60 - weapon.eta) / 60) * 10;
      }
      
      // Priority match (critical targets get best weapons)
      if (selectedTarget.priority === 'critical' && weapon.accuracy > 90) {
        score += 10;
      }

      return { weapon, score: Math.min(100, Math.round(score)), distance };
    }).sort((a, b) => b.score - a.score);
  }, [selectedTarget, availableWeapons]);

  const handleMatch = () => {
    if (!selectedTarget || !selectedWeapon) return;
    setIsMatching(true);
    setTimeout(() => {
      setIsMatching(false);
      toast.success(`已为 "${selectedTarget.name}" 匹配武器 "${selectedWeapon.name}"（匹配度 ${weaponMatches.find(m => m.weapon.id === selectedWeapon.id)?.score ?? 0}%）`);
    }, 1500);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">武器匹配</h2>
          <p className="text-slate-400">智能武器推荐与匹配系统</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setUseAI(!useAI)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              useAI 
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50' 
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            <Brain className="w-4 h-4" />
            {useAI ? 'AI智能匹配开启' : 'AI智能匹配关闭'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Panel - Target Selection */}
        <div className="military-card">
          <div className="military-card-header">
            <Target className="w-5 h-5 text-amber-400" />
            <h3 className="font-semibold text-white">选择目标</h3>
            <span className="ml-auto text-xs text-slate-400">{approvedTargets.length} 个</span>
          </div>
          <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
            {approvedTargets.map((target) => (
              <TargetCard
                key={target.id}
                target={target}
                selected={selectedTarget?.id === target.id}
                onClick={() => setSelectedTarget(target)}
              />
            ))}
            {approvedTargets.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>暂无已批准目标</p>
              </div>
            )}
          </div>
        </div>

        {/* Center - Map */}
        <div className="lg:col-span-2">
          <div className="military-card h-full">
            <div className="military-card-header">
              <Rocket className="w-5 h-5 text-amber-400" />
              <h3 className="font-semibold text-white">武器覆盖分析</h3>
              {selectedTarget && selectedWeapon && (
                <div className="ml-auto flex items-center gap-2">
                  <span className="text-xs text-slate-400">匹配度:</span>
                  <span className="text-lg font-bold text-amber-400">
                    {weaponMatches.find(m => m.weapon.id === selectedWeapon.id)?.score}%
                  </span>
                </div>
              )}
            </div>
            <div className="h-[500px]">
              <TacticalMap 
                targets={selectedTarget ? [selectedTarget] : []}
                selectedTargetId={selectedTarget?.id}
              />
            </div>
          </div>
        </div>

        {/* Right Panel - Weapon Selection */}
        <div className="space-y-6">
          {/* AI Recommendations */}
          {useAI && selectedTarget && weaponMatches.length > 0 && (
            <div className="military-card border-amber-500/30">
              <div className="military-card-header bg-amber-500/10">
                <Brain className="w-5 h-5 text-amber-400" />
                <h3 className="font-semibold text-white">AI推荐</h3>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center">
                    <Rocket className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{weaponMatches[0].weapon.name}</p>
                    <p className="text-xs text-amber-400">匹配度 {weaponMatches[0].score}%</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedWeapon(weaponMatches[0].weapon)}
                  className="w-full military-btn py-2 text-xs"
                >
                  选择此武器
                </button>
              </div>
            </div>
          )}

          {/* Weapon List */}
          <div className="military-card">
            <div className="military-card-header">
              <Filter className="w-5 h-5 text-amber-400" />
              <h3 className="font-semibold text-white">可用武器</h3>
              <span className="ml-auto text-xs text-slate-400">{availableWeapons.length} 个</span>
            </div>
            <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
              {weaponMatches.map(({ weapon, score }) => (
                <WeaponCard
                  key={weapon.id}
                  weapon={weapon}
                  selected={selectedWeapon?.id === weapon.id}
                  onClick={() => setSelectedWeapon(weapon)}
                  showMatchScore={useAI ? score : undefined}
                />
              ))}
              {weaponMatches.length === 0 && selectedTarget && (
                <div className="text-center py-8 text-slate-500">
                  <Rocket className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>无可匹配武器</p>
                </div>
              )}
              {!selectedTarget && availableWeapons.map((weapon) => (
                <WeaponCard
                  key={weapon.id}
                  weapon={weapon}
                  selected={selectedWeapon?.id === weapon.id}
                  onClick={() => setSelectedWeapon(weapon)}
                />
              ))}
            </div>
          </div>

          {/* Match Button */}
          {selectedTarget && selectedWeapon && (
            <button
              onClick={handleMatch}
              disabled={isMatching}
              className="w-full military-btn py-3 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isMatching ? (
                <>
                  <Zap className="w-4 h-4 animate-pulse" />
                  匹配中...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  确认匹配
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
