import React, { useState, Suspense } from 'react';
import { DataProvider } from './contexts/DataContext';
import { Sidebar } from './components/Sidebar';

// Lazy-loaded route components for code-splitting
const Dashboard = React.lazy(() => import('./components/Dashboard'));
const Notes = React.lazy(() => import('./components/Notes').then(m => ({ default: m.Notes })));
const Calendar = React.lazy(() => import('./components/Calendar').then(m => ({ default: m.Calendar })));
const Reminders = React.lazy(() => import('./components/Reminders').then(m => ({ default: m.Reminders })));
const Inventory = React.lazy(() => import('./components/Inventory').then(m => ({ default: m.Inventory })));
const Lending = React.lazy(() => import('./components/Lending').then(m => ({ default: m.Lending })));
const Settings = React.lazy(() => import('./components/Settings').then(m => ({ default: m.Settings })));

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
      <div
        className={`flex h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 ${
          theme === 'cyberpunk2' ? 'matrix-bg cyberpunk2-font' : ''
        }`}
      >
        <Sidebar
          activeView={activeView}
          setActiveView={setActiveView}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
        />
        <main
          className={`flex-1 transition-all duration-300 ${
            sidebarCollapsed ? 'ml-16' : 'ml-64'
          }`}
        >
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-full w-full text-gray-500 dark:text-gray-400">
                Loading…
              </div>
            }
          >
            {renderActiveView()}
          </Suspense>
        </main>
      </div>
    </DataProvider>
  );
}

export default App;