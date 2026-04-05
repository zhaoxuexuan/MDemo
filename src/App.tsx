import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { GlobalProvider } from '@/context/GlobalContext';
import { ToastProvider } from '@/components/ui/Toast';
import { Dashboard } from '@/pages/Dashboard';
import { Reconnaissance } from '@/pages/Reconnaissance';
import { Nomination } from '@/pages/Nomination';
import { Weapons } from '@/pages/Weapons';
import { Mission } from '@/pages/Mission';
import { Assessment } from '@/pages/Assessment';
import { MapPage } from '@/pages/MapPage';
import { Intelligence } from '@/pages/Intelligence';
import { Sensors } from '@/pages/Sensors';
import { DataFusion } from '@/pages/DataFusion';
import { BattleSpaceManagement } from '@/pages/BattleSpaceManagement';
import { ChevronRight, Home } from 'lucide-react';

const pageMeta: Record<string, { title: string; breadcrumb: string }> = {
  dashboard: { title: '态势总览', breadcrumb: '态势总览' },
  battlespace: { title: '战场空间管理', breadcrumb: '战场空间管理' },
  reconnaissance: { title: '目标侦察', breadcrumb: '侦察 / 目标识别' },
  nomination: { title: '目标提名工作流', breadcrumb: '杀伤链 / 目标提名' },
  weapons: { title: '武器匹配', breadcrumb: '火力 / 武器匹配' },
  mission: { title: '作战方案', breadcrumb: '规划 / 作战方案' },
  assessment: { title: '战损评估', breadcrumb: '评估 / 战损分析' },
  map: { title: '战场地图', breadcrumb: '地理 / 战场地图' },
  intelligence: { title: '情报中心', breadcrumb: '情报 / 分析中心' },
  sensors: { title: '传感器管理', breadcrumb: '侦察 / 传感器' },
  data: { title: '数据融合与本体建模', breadcrumb: '数据 / 融合建模' },
};

function AppContent() {
  const [currentPage, setCurrentPage] = useState('battlespace');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handlePageChange = (page: string) => {
    if (page === currentPage) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentPage(page);
      setTimeout(() => setIsTransitioning(false), 50);
    }, 150);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'battlespace': return <BattleSpaceManagement />;
      case 'reconnaissance': return <Reconnaissance />;
      case 'nomination': return <Nomination />;
      case 'weapons': return <Weapons />;
      case 'mission': return <Mission />;
      case 'assessment': return <Assessment />;
      case 'map': return <MapPage />;
      case 'intelligence': return <Intelligence />;
      case 'sensors': return <Sensors />;
      case 'data': return <DataFusion />;
      default: return <BattleSpaceManagement />;
    }
  };

  const meta = pageMeta[currentPage] || pageMeta.battlespace;

  return (
    <div className="min-h-screen bg-[#0a0f1a] flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar currentPage={currentPage} onPageChange={handlePageChange} />
        <main className="flex-1 flex flex-col overflow-auto relative">
          {/* Breadcrumb Navigation */}
          <div className="px-6 py-2 border-b border-[#21262d]/50 bg-[#0d1117]/80 backdrop-blur-sm flex items-center gap-2 text-xs sticky top-0 z-10">
            <Home className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-500">MAVEN</span>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            <span className="text-slate-300 font-medium">{meta.breadcrumb}</span>
            <span className="ml-auto text-slate-600 font-mono">{meta.title}</span>
          </div>

          {/* Page Content with Transition */}
          <div
            className={`flex-1 transition-opacity duration-150 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
          >
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <GlobalProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </GlobalProvider>
  );
}

export default App;
