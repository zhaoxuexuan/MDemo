import { useState } from 'react';
import { FileText, Search, Eye, Lock, Clock, MapPin, Download, Share2 } from 'lucide-react';
import { mockIntelReports } from '@/data/mockData';
import type { IntelReport } from '@/types';

export function Intelligence() {
  const [selectedReport, setSelectedReport] = useState<IntelReport | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClassification, setFilterClassification] = useState<string>('all');

  const filteredReports = mockIntelReports.filter(report => {
    if (filterClassification !== 'all' && report.classification !== filterClassification) return false;
    if (searchQuery && !report.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const classificationColors = {
    unclassified: 'text-emerald-400 bg-emerald-400/10',
    confidential: 'text-[#5a7a8a] bg-[#5a7a8a]/10',
    secret: 'text-amber-400 bg-amber-400/10',
    topsecret: 'text-red-400 bg-red-400/10'
  };

  const classificationLabels = {
    unclassified: '公开',
    confidential: '内部',
    secret: '机密',
    topsecret: '绝密'
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">情报中心</h2>
          <p className="text-slate-400">多源情报融合与分析</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="status-badge status-active">情报更新正常</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Report List */}
        <div className="military-card">
          <div className="military-card-header">
            <FileText className="w-5 h-5 text-amber-400" />
            <h3 className="font-semibold text-white">情报报告</h3>
            <span className="ml-auto text-xs text-slate-400">{filteredReports.length} 份</span>
          </div>
          
          {/* Search & Filter */}
          <div className="p-4 border-b border-slate-700 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索情报..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
            <select
              value={filterClassification}
              onChange={(e) => setFilterClassification(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
            >
              <option value="all">所有密级</option>
              <option value="unclassified">公开</option>
              <option value="confidential">内部</option>
              <option value="secret">机密</option>
              <option value="topsecret">绝密</option>
            </select>
          </div>

          {/* Report List */}
          <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
            {filteredReports.map((report) => (
              <div 
                key={report.id}
                onClick={() => setSelectedReport(report)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedReport?.id === report.id 
                    ? 'bg-amber-500/20 border border-amber-500/50' 
                    : 'bg-slate-800/50 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-medium text-white line-clamp-2">{report.title}</h4>
                  <span className={`px-2 py-0.5 rounded text-xs ${classificationColors[report.classification]}`}>
                    {classificationLabels[report.classification]}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(report.timestamp).toLocaleDateString('zh-CN')}
                  </span>
                  <span>{report.source}</span>
                </div>
              </div>
            ))}
            {filteredReports.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>无符合条件的情报</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Report Detail */}
        <div className="lg:col-span-2">
          {selectedReport ? (
            <div className="military-card">
              <div className="military-card-header">
                <Eye className="w-5 h-5 text-amber-400" />
                <h3 className="font-semibold text-white">情报详情</h3>
                <div className="ml-auto flex items-center gap-2">
                  <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                {/* Report Header */}
                <div className="mb-6 pb-6 border-b border-slate-700">
                  <div className="flex items-start justify-between mb-4">
                    <h2 className="text-xl font-bold text-white">{selectedReport.title}</h2>
                    <span className={`px-3 py-1 rounded-lg text-sm font-medium ${classificationColors[selectedReport.classification]}`}>
                      <Lock className="w-4 h-4 inline mr-1" />
                      {classificationLabels[selectedReport.classification]}
                    </span>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-slate-400">
                    <span className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {new Date(selectedReport.timestamp).toLocaleString('zh-CN')}
                    </span>
                    <span>来源: {selectedReport.source}</span>
                    <span>报告编号: {selectedReport.id}</span>
                  </div>
                </div>

                {/* Report Content */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">摘要</h4>
                    <p className="text-white leading-relaxed">{selectedReport.summary}</p>
                  </div>

                  {selectedReport.coordinates && (
                    <div>
                      <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">位置信息</h4>
                      <div className="flex items-center gap-2 text-white">
                        <MapPin className="w-4 h-4 text-amber-400" />
                        <span className="font-mono">
                          {selectedReport.coordinates[0].toFixed(4)}, {selectedReport.coordinates[1].toFixed(4)}
                        </span>
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">详细分析</h4>
                    <div className="bg-slate-800/50 rounded-lg p-4 space-y-3">
                      <p className="text-slate-300 text-sm leading-relaxed">
                        根据多源情报融合分析，该目标已被确认为高价值军事目标。
                        卫星图像显示目标区域存在明显的军事活动迹象，包括车辆调动和人员集结。
                      </p>
                      <p className="text-slate-300 text-sm leading-relaxed">
                        信号情报截获显示该区域存在加密通信活动，频率分析与已知敌方指挥通信特征匹配度达到87%。
                        建议将该目标列为优先打击对象。
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">相关情报</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-800/50 rounded-lg p-3">
                        <p className="text-xs text-slate-500 mb-1">关联目标</p>
                        <p className="text-sm text-white">3个相关目标</p>
                      </div>
                      <div className="bg-slate-800/50 rounded-lg p-3">
                        <p className="text-xs text-slate-500 mb-1">置信度</p>
                        <p className="text-sm text-amber-400">92%</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 pt-6 border-t border-slate-700 flex gap-3">
                  <button className="military-btn py-2 px-4 text-sm">
                    生成目标提名
                  </button>
                  <button className="military-btn-secondary py-2 px-4 text-sm">
                    添加到监视列表
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="military-card h-full flex items-center justify-center">
              <div className="text-center text-slate-500">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>选择一份情报查看详情</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
