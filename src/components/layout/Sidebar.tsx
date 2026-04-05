import { useState } from 'react';
import {
  Target,
  Crosshair,
  Rocket,
  ClipboardCheck,
  BarChart3,
  Map as MapIcon,
  Radio,
  FileText,
  Database,
  Satellite,
  Radar,
  Eye,
  Radio as SignalIcon,
  Users,
  Shield,
  ChevronDown,
  ChevronRight,
  Layers
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

interface LayerItem {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  count?: number;
  checked: boolean;
}

interface LayerGroup {
  id: string;
  label: string;
  icon: React.ElementType;
  items: LayerItem[];
  expanded: boolean;
}

export function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['sensors', 'targets', 'forces']);

  const menuItems = [
    { id: 'dashboard', label: '态势总览', icon: BarChart3 },
    { id: 'battlespace', label: '战场空间管理', icon: MapIcon },
    { id: 'reconnaissance', label: '目标侦察', icon: Eye },
    { id: 'nomination', label: '目标提名', icon: Crosshair },
    { id: 'weapons', label: '武器匹配', icon: Rocket },
    { id: 'mission', label: '作战方案', icon: ClipboardCheck },
    { id: 'assessment', label: '战损评估', icon: BarChart3 },
    { id: 'map', label: '战场地图', icon: MapIcon },
    { id: 'intelligence', label: '情报中心', icon: FileText },
    { id: 'sensors', label: '传感器管理', icon: Radio },
    { id: 'data', label: '数据融合', icon: Database },
  ];

  const [layerGroups, setLayerGroups] = useState<LayerGroup[]>([
    {
      id: 'sensors',
      label: '传感器图层',
      icon: Satellite,
      expanded: true,
      items: [
        { id: 'satellite-geo', label: 'GEOINT 卫星遥感', icon: Satellite, color: '#8b956d', count: 8, checked: true },
        { id: 'satellite-sar', label: 'SAR 合成孔径雷达', icon: Radar, color: '#5a7a8a', count: 4, checked: true },
        { id: 'uav-fmv', label: 'UAV 全动态视频', icon: Eye, color: '#d4a574', count: 12, checked: true },
        { id: 'radar-gmti', label: 'GMTI 地面移动目标', icon: Radio, color: '#c9a050', count: 6, checked: false },
        { id: 'sigint-elint', label: 'SIGINT 电子情报', icon: SignalIcon, color: '#8b4444', count: 9, checked: false },
        { id: 'sigint-comint', label: 'COMINT 通信情报', icon: SignalIcon, color: '#4a7c59', count: 15, checked: false },
      ]
    },
    {
      id: 'targets',
      label: '战术目标区',
      icon: Target,
      expanded: true,
      items: [
        { id: 'opfor', label: 'OPFOR 敌军部队', icon: Shield, color: '#8b4444', count: 24, checked: true },
        { id: 'obj-lion', label: 'Obj LION 狮子目标区', icon: Target, color: '#d4a574', count: 6, checked: true },
        { id: 'obj-raven', label: 'Obj RAVEN 渡鸦目标区', icon: Target, color: '#c9a050', count: 8, checked: true },
        { id: 'pt-alpha', label: 'Pt. ALPHA Alpha点', icon: Crosshair, color: '#5a7a8a', count: 1, checked: true },
        { id: 'pt-delta', label: 'Pt. DELTA Delta点', icon: Crosshair, color: '#4a7c59', count: 1, checked: false },
        { id: 'high-value', label: 'HVT 高价值目标', icon: Target, color: '#8b4444', count: 3, checked: true },
      ]
    },
    {
      id: 'forces',
      label: '友军跟踪',
      icon: Users,
      expanded: false,
      items: [
        { id: 'blue-force', label: 'Blue Force 友军位置', icon: Shield, color: '#4a7c59', count: 45, checked: true },
        { id: 'assets-uav', label: 'UAV 资产状态', icon: Eye, color: '#8b956d', count: 12, checked: true },
        { id: 'assets-aircraft', label: 'Fixed Wing 固定翼', icon: Rocket, color: '#5a7a8a', count: 8, checked: true },
        { id: 'assets-artillery', label: 'Artillery 火炮单元', icon: Crosshair, color: '#d4a574', count: 16, checked: false },
      ]
    }
  ]);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const toggleLayer = (groupId: string, layerId: string) => {
    setLayerGroups(groups =>
      groups.map(group => {
        if (group.id === groupId) {
          return {
            ...group,
            items: group.items.map(item =>
              item.id === layerId ? { ...item, checked: !item.checked } : item
            )
          };
        }
        return group;
      })
    );
  };

  return (
    <aside className="w-72 bg-[#0d1117] border-r border-[#21262d] flex flex-col h-[calc(100vh-64px)] sticky top-16 overflow-y-auto">
      {/* Navigation */}
      <nav className="p-3 pt-4">
        <div className="space-y-0.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 group relative
                  ${isActive
                    ? 'bg-[#1a2332] text-[#8b956d] border-l-2 border-[#8b956d]'
                    : 'text-slate-400 hover:text-white hover:bg-[#161b22] hover:border-l-2 hover:border-transparent'
                  }
                `}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#8b956d]' : 'text-slate-500 group-hover:text-slate-300'}`} />
                <span className="text-xs tracking-wide">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Data Source Layers - Maven Style */}
      <div className="mx-3 mb-3 p-3 bg-[#161b22] rounded-lg border border-[#21262d]">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#21262d]">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#8b956d]" />
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">数据源图层</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono bg-[#0d1117] px-2 py-0.5 rounded">{layerGroups.reduce((acc, g) => acc + g.items.filter(i => i.checked).length, 0)} ACTIVE</span>
        </div>

        <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
          {layerGroups.map((group) => {
            const GroupIcon = group.icon;
            const isExpanded = expandedGroups.includes(group.id);

            return (
              <div key={group.id} className="space-y-1">
                <button
                  onClick={() => toggleGroup(group.id)}
                  className="w-full flex items-center justify-between px-2 py-1.5 rounded hover:bg-[#0d1117] transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronDown className="w-3 h-3 text-slate-500" />
                    ) : (
                      <ChevronRight className="w-3 h-3 text-slate-500" />
                    )}
                    <GroupIcon className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs font-medium text-slate-300">{group.label}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {group.items.filter(i => i.checked).length}/{group.items.length}
                  </span>
                </button>

                {isExpanded && (
                  <div className="ml-4 space-y-0.5 border-l border-[#21262d] pl-2">
                    {group.items.map((item) => {
                      const ItemIcon = item.icon;
                      return (
                        <label
                          key={item.id}
                          className="flex items-center gap-2 px-2 py-1 rounded hover:bg-[#0d1117] cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={item.checked}
                            onChange={() => toggleLayer(group.id, item.id)}
                            className="w-3 h-3 rounded border-[#30363d] bg-[#0d1117] text-[#8b956d] focus:ring-0 focus:ring-offset-0"
                          />
                          <ItemIcon className="w-3 h-3" style={{ color: item.color }} />
                          <span className="text-[11px] text-slate-400 flex-1 truncate">{item.label}</span>
                          {item.count && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#0d1117] text-slate-500">{item.count}</span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* System Status - Bottom */}
      <div className="mt-auto p-3 border-t border-[#21262d] bg-[#0d1117]">
        <div className="mb-3">
          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">JADC2 系统状态</h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#161b22] rounded p-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-slate-500">数据融合</span>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <span className="text-xs font-mono text-emerald-400">156 SOURCES</span>
            </div>
            <div className="bg-[#161b22] rounded p-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-slate-500">杀伤链</span>
                <div className="w-1.5 h-1.5 rounded-full bg-[#8b956d] animate-pulse" />
              </div>
              <span className="text-xs font-mono text-[#8b956d]">4.2 MIN</span>
            </div>
            <div className="bg-[#161b22] rounded p-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-slate-500">AI引擎</span>
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              </div>
              <span className="text-xs font-mono text-amber-400">v2.4.1</span>
            </div>
            <div className="bg-[#161b22] rounded p-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-slate-500">延迟</span>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              </div>
              <span className="text-xs font-mono text-emerald-400">24ms</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-[#21262d]">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/30" />
          <span className="text-[11px] text-emerald-400 font-medium">ALL SYSTEMS NOMINAL</span>
        </div>
      </div>
    </aside>
  );
}