import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { GlobalProvider } from '@/context/GlobalContext';
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

function AppContent() {
  const [currentPage, setCurrentPage] = useState('battlespace');

  const renderPage = () => {
    switch (currentPage) {
      case 'battlespace':
        return <BattleSpaceManagement />;
      case 'reconnaissance':
        return <Reconnaissance />;
      case 'nomination':
        return <Nomination />;
      case 'weapons':
        return <Weapons />;
      case 'mission':
        return <Mission />;
      case 'assessment':
        return <Assessment />;
      case 'map':
        return <MapPage />;
      case 'intelligence':
        return <Intelligence />;
      case 'sensors':
        return <Sensors />;
      case 'data':
        return <DataFusion />;
      case 'dashboard':
        return <Dashboard />;
      default:
        return <BattleSpaceManagement />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1a] flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
        <main className="flex-1 overflow-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <GlobalProvider>
      <AppContent />
    </GlobalProvider>
  );
}

export default App;