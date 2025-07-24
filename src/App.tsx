import React, { useState, useEffect } from 'react';
import { DataProvider } from './contexts/DataContext';
import { Sidebar } from './components/Sidebar';
import Dashboard from './components/Dashboard';
import { Notes } from './components/Notes';
import { Calendar } from './components/Calendar';
import { Reminders } from './components/Reminders';
import { Inventory } from './components/Inventory';
import { Lending } from './components/Lending';
import { Settings } from './components/Settings';

import { useTheme } from './contexts/ThemeContext';

export type ActiveView = 'dashboard' | 'notes' | 'calendar' | 'reminders' | 'inventory' | 'lending' | 'settings';

function App() {
  const { theme } = useTheme();
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard setActiveView={setActiveView} />;
      case 'notes':
        return <Notes />;
      case 'calendar':
        return <Calendar />;
      case 'reminders':
        return <Reminders />;
      case 'inventory':
        return <Inventory />;
      case 'lending':
        return <Lending />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard setActiveView={setActiveView} />;
    }
  };

  return (
    <DataProvider>
      <div className={`flex h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 ${
        theme === 'cyberpunk2' ? 'matrix-bg cyberpunk2-font' : ''
      }`}>
        <Sidebar
          activeView={activeView}
          setActiveView={setActiveView}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
        />
        <main className={`flex-1 transition-all duration-300 ${
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        }`}>
          {renderActiveView()}
        </main>
      </div>
    </DataProvider>
  );
}

export default App;