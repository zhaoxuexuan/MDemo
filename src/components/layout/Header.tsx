import { Radar, User, Bell, Settings, Shield, Wifi, Clock } from 'lucide-react';
import { mockUser, mockSystemStatus } from '@/data/mockData';

export function Header() {
  return (
    <header className="h-16 bg-[#0d1117] border-b border-[#21262d] flex items-center justify-between px-6 sticky top-0 z-50">
      {/* Left Section - MAVEN Branding */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-br from-[#8b956d] to-[#4a7c59] rounded-lg flex items-center justify-center shadow-lg shadow-[#8b956d]/20">
            <Radar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-widest">MAVEN</h1>
            <p className="text-[10px] text-slate-500 font-mono tracking-wider">联合全域指挥控制系统</p>
          </div>
        </div>

        {/* Separator */}
        <div className="h-8 w-px bg-[#21262d]" />

        {/* Mission Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#161b22] border border-[#21262d]">
            <Wifi className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-xs font-medium text-emerald-400">系统已连接</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#161b22] border border-[#21262d]">
            <Clock className="w-3.5 h-3.5 text-[#8b956d]" />
            <span className="text-xs font-mono text-slate-300" id="maven-time">{new Date().toLocaleTimeString('zh-CN', { hour12: false })}</span>
          </div>
        </div>
      </div>

      {/* Center Section - Real-time Metrics */}
      <div className="hidden xl:flex items-center gap-6">
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-500">数据源</span>
            <span className="text-sm font-bold text-amber-400">{mockSystemStatus.dataSources}</span>
          </div>
          <div className="w-px h-6 bg-[#21262d]" />
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-500">传感器</span>
            <span className="text-sm font-bold text-emerald-400">{mockSystemStatus.activeSensors}</span>
          </div>
          <div className="w-px h-6 bg-[#21262d]" />
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-500">待处理</span>
            <span className="text-sm font-bold text-red-400">{mockSystemStatus.pendingTargets}</span>
          </div>
          <div className="w-px h-6 bg-[#21262d]" />
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-500">任务数</span>
            <span className="text-sm font-bold text-[#8b956d]">{mockSystemStatus.activeMissions}</span>
          </div>
        </div>
      </div>

      {/* Right Section - User Actions */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button className="relative p-2 text-slate-400 hover:text-white hover:bg-[#161b22] rounded-lg transition-colors group">
          <Bell className="w-4.5 h-4.5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50" />
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-[#161b22] border border-[#21262d] rounded text-[10px] text-slate-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            3 条新告警
          </span>
        </button>

        {/* Settings */}
        <button className="p-2 text-slate-400 hover:text-white hover:bg-[#161b22] rounded-lg transition-colors">
          <Settings className="w-4.5 h-4.5" />
        </button>

        {/* Separator */}
        <div className="h-8 w-px bg-[#21262d]" />

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-2">
          <div className="relative">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#21262d] to-[#161b22] border border-[#30363d] flex items-center justify-center">
              <User className="w-4.5 h-4.5 text-slate-300" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0d1117]" />
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-semibold text-white leading-tight">{mockUser.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Shield className="w-3 h-3 text-[#8b956d]" />
              <span className="text-[11px] text-[#8b956d] font-medium">{mockUser.role === 'commander' ? '指挥官' : mockUser.role === 'analyst' ? '分析师' : '操作员'}</span>
              <span className="text-slate-600">•</span>
              <span className="text-[11px] text-slate-500">{mockUser.unit}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}