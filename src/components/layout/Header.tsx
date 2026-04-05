import { useState, useEffect } from 'react';
import { Radar, User, Bell, Settings, Shield, Wifi, Clock } from 'lucide-react';
import { mockUser, mockSystemStatus } from '@/data/mockData';

const notifications = [
  { id: '1', title: 'SA-15防空系统激活', desc: '狮子目标区检测到SA-15道尔M1防空系统激活信号', time: '2分钟前', level: 'critical' as const },
  { id: '2', title: '新目标侦测', desc: 'UAV-09在渡鸦目标区发现3个新增移动目标', time: '5分钟前', level: 'warning' as const },
  { id: '3', title: '数据链路降级', desc: 'SIGINT通信情报链路延迟增至180ms', time: '12分钟前', level: 'info' as const },
];

export function Header() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-notification-panel]') && !target.closest('[data-notification-btn]')) {
        setShowNotifications(false);
      }
      if (!target.closest('[data-settings-panel]') && !target.closest('[data-settings-btn]')) {
        setShowSettings(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
            <span className="text-xs font-mono text-slate-300">{currentTime.toLocaleTimeString('zh-CN', { hour12: false })}</span>
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
        <div className="relative">
          <button
            data-notification-btn
            onClick={() => { setShowNotifications(!showNotifications); setShowSettings(false); }}
            className={`relative p-2 rounded-lg transition-colors ${showNotifications ? 'text-white bg-[#161b22]' : 'text-slate-400 hover:text-white hover:bg-[#161b22]'}`}
          >
            <Bell className="w-4.5 h-4.5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50" />
          </button>

          {showNotifications && (
            <div data-notification-panel className="absolute top-full right-0 mt-2 w-80 bg-[#161b22] border border-[#21262d] rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-[100]">
              <div className="px-4 py-3 border-b border-[#21262d] flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">系统告警</h3>
                <span className="text-xs text-red-400 font-mono">{notifications.length} 条未读</span>
              </div>
              <div className="max-h-[320px] overflow-y-auto">
                {notifications.map((notif) => (
                  <div key={notif.id} className={`px-4 py-3 border-b border-[#21262d]/50 hover:bg-[#0d1117] transition-colors cursor-pointer ${notif.level === 'critical' ? 'border-l-2 border-l-red-500' : ''}`}>
                    <div className="flex items-start justify-between mb-1">
                      <span className="text-sm font-semibold text-white">{notif.title}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                        notif.level === 'critical' ? 'bg-red-500/20 text-red-400' :
                        notif.level === 'warning' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-[#5a7a8a]/20 text-[#5a7a8a]'
                      }`}>
                        {notif.level === 'critical' ? '紧急' : notif.level === 'warning' ? '警告' : '信息'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2">{notif.desc}</p>
                    <span className="text-[10px] text-slate-600 mt-1 block">{notif.time}</span>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2 border-t border-[#21262d] text-center">
                <button className="text-xs text-[#8b956d] hover:text-[#9ba57d] transition-colors font-medium">查看全部告警</button>
              </div>
            </div>
          )}
        </div>

        {/* Settings */}
        <div className="relative">
          <button
            data-settings-btn
            onClick={() => { setShowSettings(!showSettings); setShowNotifications(false); }}
            className={`p-2 rounded-lg transition-colors ${showSettings ? 'text-white bg-[#161b22]' : 'text-slate-400 hover:text-white hover:bg-[#161b22]'}`}
          >
            <Settings className="w-4.5 h-4.5" />
          </button>

          {showSettings && (
            <div data-settings-panel className="absolute top-full right-0 mt-2 w-56 bg-[#161b22] border border-[#21262d] rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-[100]">
              <div className="px-4 py-3 border-b border-[#21262d]">
                <h3 className="text-sm font-bold text-white">系统设置</h3>
              </div>
              <div className="py-1">
                {[
                  { icon: Bell, label: '通知偏好', desc: '管理告警推送方式' },
                  { icon: Shield, label: '安全设置', desc: '权限与访问控制' },
                  { icon: Radar, label: '显示配置', desc: '地图与图层选项' },
                  { icon: Wifi, label: '网络状态', desc: '数据链路与延迟' },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button key={item.label} className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-[#0d1117] transition-colors text-left">
                      <Icon className="w-4 h-4 text-slate-400" />
                      <div>
                        <span className="text-sm text-white block">{item.label}</span>
                        <span className="text-[10px] text-slate-500">{item.desc}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

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