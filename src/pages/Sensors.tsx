import { useState } from 'react';
import { Radio, Satellite, Plane, Radar, Activity, Power, Settings, Signal } from 'lucide-react';
import TacticalMap from '@/components/map/TacticalMap';
import { mockSensors, mockTargets } from '@/data/mockData';
import type { Sensor } from '@/types';

export function Sensors() {
  const [selectedSensor, setSelectedSensor] = useState<Sensor | null>(null);

  const sensorTypeIcons = {
    satellite: Satellite,
    uav: Plane,
    radar: Radar,
    signal: Signal
  };

  const sensorTypeLabels = {
    satellite: '卫星',
    uav: '无人机',
    radar: '雷达',
    signal: '信号侦察'
  };

  const statusColors = {
    active: 'text-emerald-400 bg-emerald-400/10',
    standby: 'text-amber-400 bg-amber-400/10',
    offline: 'text-slate-400 bg-slate-400/10'
  };

  const statusLabels = {
    active: '在线',
    standby: '待命',
    offline: '离线'
  };

  const activeSensors = mockSensors.filter(s => s.status === 'active');
  const standbySensors = mockSensors.filter(s => s.status === 'standby');
  const offlineSensors = mockSensors.filter(s => s.status === 'offline');

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">传感器管理</h2>
          <p className="text-slate-400">侦察平台监控与调度</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-2xl font-bold text-emerald-400">{activeSensors.length}</p>
            <p className="text-xs text-slate-400">在线</p>
          </div>
          <div className="h-10 w-px bg-slate-700" />
          <div className="text-right">
            <p className="text-2xl font-bold text-amber-400">{standbySensors.length}</p>
            <p className="text-xs text-slate-400">待命</p>
          </div>
          <div className="h-10 w-px bg-slate-700" />
          <div className="text-right">
            <p className="text-2xl font-bold text-slate-400">{offlineSensors.length}</p>
            <p className="text-xs text-slate-400">离线</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Sensor List */}
        <div className="space-y-6">
          <div className="military-card">
            <div className="military-card-header">
              <Radio className="w-5 h-5 text-amber-400" />
              <h3 className="font-semibold text-white">传感器列表</h3>
              <span className="ml-auto text-xs text-slate-400">{mockSensors.length} 个</span>
            </div>
            <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
              {mockSensors.map((sensor) => {
                const Icon = sensorTypeIcons[sensor.type];
                return (
                  <div 
                    key={sensor.id}
                    onClick={() => setSelectedSensor(sensor)}
                    className={`p-4 rounded-lg cursor-pointer transition-colors ${
                      selectedSensor?.id === sensor.id 
                        ? 'bg-amber-500/20 border border-amber-500/50' 
                        : 'bg-slate-800/50 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          sensor.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                          sensor.status === 'standby' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-slate-700 text-slate-400'
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-medium text-white">{sensor.name}</h4>
                          <p className="text-xs text-slate-400">{sensorTypeLabels[sensor.type]}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${statusColors[sensor.status]}`}>
                        {statusLabels[sensor.status]}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>覆盖: {sensor.coverage}km</span>
                      <span>更新: {new Date(sensor.lastUpdate).toLocaleTimeString('zh-CN')}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Center - Map */}
        <div className="lg:col-span-2 space-y-6">
          <div className="military-card">
            <div className="military-card-header">
              <Activity className="w-5 h-5 text-amber-400" />
              <h3 className="font-semibold text-white">传感器分布</h3>
            </div>
            <div className="h-[400px]">
              <TacticalMap 
                targets={mockTargets}
              />
            </div>
          </div>

          {/* Sensor Detail */}
          {selectedSensor && (
            <div className="military-card">
              <div className="military-card-header">
                <Settings className="w-5 h-5 text-amber-400" />
                <h3 className="font-semibold text-white">传感器详情: {selectedSensor.name}</h3>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                    <p className="text-xs text-slate-500 mb-1">类型</p>
                    <p className="text-lg font-medium text-white">{sensorTypeLabels[selectedSensor.type]}</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                    <p className="text-xs text-slate-500 mb-1">状态</p>
                    <p className={`text-lg font-medium ${statusColors[selectedSensor.status].split(' ')[0]}`}>
                      {statusLabels[selectedSensor.status]}
                    </p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                    <p className="text-xs text-slate-500 mb-1">覆盖范围</p>
                    <p className="text-lg font-medium text-white">{selectedSensor.coverage}km</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                    <p className="text-xs text-slate-500 mb-1">数据速率</p>
                    <p className="text-lg font-medium text-emerald-400">15 Mbps</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-white mb-3">位置信息</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">纬度</span>
                        <span className="text-white font-mono">{selectedSensor.location[0].toFixed(6)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">经度</span>
                        <span className="text-white font-mono">{selectedSensor.location[1].toFixed(6)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">高度</span>
                        <span className="text-white font-mono">10,000m</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-white mb-3">性能指标</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">分辨率</span>
                        <span className="text-white">0.5m</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">刷新率</span>
                        <span className="text-white">30秒</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">信号强度</span>
                        <span className="text-emerald-400">-45 dBm</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-4">
                  <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm hover:bg-emerald-500/30 transition-colors">
                    <Power className="w-4 h-4" />
                    {selectedSensor.status === 'active' ? '关闭' : '启动'}
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-sm hover:bg-slate-700 transition-colors">
                    <Settings className="w-4 h-4" />
                    配置
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
