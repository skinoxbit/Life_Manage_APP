import React from 'react';
import { 
  LayoutDashboard, 
  StickyNote, 
  Calendar, 
  Bell, 
  Package, 
  Users, 
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { ActiveView } from '../App';
import { useTheme } from '../contexts/ThemeContext';

interface SidebarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
  collapsed,
  setCollapsed,
}) => {
  const { theme, themes } = useTheme();
  const currentTheme = themes[theme];

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'notes', label: 'Notes', icon: StickyNote },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'reminders', label: 'Reminders', icon: Bell },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'lending', label: 'Lending', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className={`fixed left-0 top-0 h-full ${currentTheme.surface} border-r border-gray-200 dark:border-gray-700 transition-all duration-300 z-50 ${
      collapsed ? 'w-16' : 'w-64'
    } ${theme === 'cyberpunk2' ? 'cyberpunk2-border cyberpunk2-font' : ''}`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        {!collapsed && (
          <h1 className={`text-xl font-bold ${currentTheme.text}`}>
            ProductivityHub
          </h1>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`p-2 rounded-lg hover:${currentTheme.secondary} transition-colors ${currentTheme.text}`}
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className="mt-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as ActiveView)}
              className={`w-full flex items-center px-4 py-3 text-left transition-all duration-200 hover:scale-105 ${
                isActive
                  ? `${currentTheme.primary} text-white shadow-lg`
                  : `${currentTheme.text} hover:${currentTheme.secondary}`
              } ${collapsed ? 'justify-center' : ''}`}
            >
              <Icon size={20} className={collapsed ? '' : 'mr-3'} />
              {!collapsed && (
                <span className="font-medium">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};