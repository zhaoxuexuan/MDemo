import { useState } from 'react';
import { Map as MapIcon, Layers, Filter, Target, Crosshair, Radio } from 'lucide-react';
import TacticalMap from '@/components/map/TacticalMap';
import { mockTargets, mockWeapons, mockSensors } from '@/data/mockData';
import type { Target as TargetType } from '@/types';

export function MapPage() {
  const [showTargets, setShowTargets] = useState(true);
  const [showWeapons, setShowWeapons] = useState(true);
  const [showSensors, setShowSensors] = useState(true);
  const [selectedTarget, setSelectedTarget] = useState<TargetType | null>(null);

  const visibleTargets = showTargets ? mockTargets : [];


  return (
    <div className="h-[calc(100vh-64px)] flex">
      {/* Sidebar */}
      <div className="w-80 bg-[#0d1117] border-r border-[#21262d] flex flex-col">
        <div className="p-4 border-b border-[#21262d]">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <MapIcon className="w-5 h-5 text-[#8b956d]" />
            战场地图
          </h2>
          <p className="text-sm text-slate-400">实时态势显示</p>
        </div>

        {/* Layer Controls */}
        <div className="p-4 border-b border-[#21262d]">
          <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4" />
            图层控制
          </h3>
          <div className="space-y-2">
            <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#161b22] cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={showTargets}
                onChange={(e) => setShowTargets(e.target.checked)}
                className="w-4 h-4 rounded border-[#30363d] bg-[#0d1117] text-[#8b956d] focus:ring-0 focus:ring-offset-0"
              />
              <Target className="w-4 h-4 text-red-400" />
              <span className="text-sm text-white">目标</span>
              <span className="ml-auto text-xs text-slate-500">{mockTargets.length}</span>
            </label>
            <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#161b22] cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={showWeapons}
                onChange={(e) => setShowWeapons(e.target.checked)}
                className="w-4 h-4 rounded border-[#30363d] bg-[#0d1117] text-[#8b956d] focus:ring-0 focus:ring-offset-0"
              />
              <Crosshair className="w-4 h-4 text-[#5a7a8a]" />
              <span className="text-sm text-white">武器平台</span>
              <span className="ml-auto text-xs text-slate-500">{mockWeapons.length}</span>
            </label>
            <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#161b22] cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={showSensors}
                onChange={(e) => setShowSensors(e.target.checked)}
                className="w-4 h-4 rounded border-[#30363d] bg-[#0d1117] text-[#8b956d] focus:ring-0 focus:ring-offset-0"
              />
              <Radio className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-white">传感器</span>
              <span className="ml-auto text-xs text-slate-500">{mockSensors.length}</span>
            </label>
          </div>
        </div>

        {/* Target List */}
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Filter className="w-4 h-4" />
            目标列表
          </h3>
          <div className="space-y-2">
            {mockTargets.map((target) => (
              <div
                key={target.id}
                onClick={() => setSelectedTarget(target)}
                className={`p-3 rounded-lg cursor-pointer transition-all border ${
                  selectedTarget?.id === target.id
                    ? 'bg-[#8b956d]/10 border-[#8b956d]/50'
                    : 'bg-[#0d1117] border border-[#21262d] hover:border-[#30363d]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white font-medium">{target.name}</span>
                  <span className={`w-2 h-2 rounded-full ${
                    target.priority === 'critical' ? 'bg-red-500' :
                    target.priority === 'high' ? 'bg-orange-500' :
                    target.priority === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
                  }`} />
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  {target.coordinates[0].toFixed(4)}, {target.coordinates[1].toFixed(4)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1">
        <TacticalMap
          targets={visibleTargets}
          selectedTargetId={selectedTarget?.id}
          onTargetSelect={setSelectedTarget}
          zoom={11}
        />
      </div>
    </div>
  );
}
