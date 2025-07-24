import React from 'react';
import { BarChart3, Users, DollarSign, TrendingUp, StickyNote, Calendar, Bell, Package, ArrowUpRight, TrendingDown } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useTheme } from '../contexts/ThemeContext';

interface DashboardProps {
  setActiveView: (view: string) => void;
}

export default function Dashboard({ setActiveView }: DashboardProps) {
  const { notes, calendarEvents, reminders, inventory, lending } = useData();
  const { theme, themes } = useTheme();
  const currentTheme = themes[theme];

  // Calculate total revenue from inventory purchases
  const totalRevenue = inventory.reduce((sum, item) => sum + item.purchasePrice, 0);
  
  // Calculate total expenses (assuming 70% of revenue as expenses for demo)
  const totalExpenses = totalRevenue * 0.7;
  
  // Calculate active reminders
  const activeReminders = reminders.filter(r => !r.completed).length;
  
  // Calculate active lending items
  const activeLending = lending.filter(l => !l.returned).length;
  
  // Calculate upcoming events (next 7 days)
  const upcomingEvents = calendarEvents.filter(event => {
    const eventDate = new Date(event.date);
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return eventDate >= today && eventDate <= nextWeek;
  }).length;
  const stats = [
    {
      title: 'Total Revenue',
      value: `$${totalRevenue.toLocaleString()}`,
      change: '+12%',
      icon: DollarSign,
      color: theme === 'cyberpunk2' ? 'text-green-400' : 'text-green-600',
      bgColor: theme === 'cyberpunk2' ? 'bg-green-500/20' : 'bg-green-50',
      onClick: () => setActiveView('inventory')
    },
    {
      title: 'Total Expenses',
      value: `$${totalExpenses.toLocaleString()}`,
      change: '+8%',
      icon: TrendingDown,
      color: theme === 'cyberpunk2' ? 'text-green-300' : 'text-red-600',
      bgColor: theme === 'cyberpunk2' ? 'bg-green-400/20' : 'bg-red-50',
      onClick: () => setActiveView('inventory')
    },
    {
      title: 'Active Reminders',
      value: activeReminders.toString(),
      change: `${reminders.length} total`,
      icon: Bell,
      color: theme === 'cyberpunk2' ? 'text-green-400' : 'text-orange-600',
      bgColor: theme === 'cyberpunk2' ? 'bg-green-500/20' : 'bg-orange-50',
      onClick: () => setActiveView('reminders')
    },
    {
      title: 'Active Lending',
      value: activeLending.toString(),
      change: `${lending.length} total`,
      icon: ArrowUpRight,
      color: theme === 'cyberpunk2' ? 'text-green-300' : 'text-purple-600',
      bgColor: theme === 'cyberpunk2' ? 'bg-green-400/20' : 'bg-purple-50',
      onClick: () => setActiveView('lending')
    }
  ];

  const dataSummary = [
    {
      title: 'Notes',
      value: notes.length.toString(),
      icon: StickyNote,
      color: theme === 'cyberpunk2' ? 'text-green-400' : 'text-blue-600',
      bgColor: theme === 'cyberpunk2' ? 'bg-green-500/20' : 'bg-blue-50',
      onClick: () => setActiveView('notes')
    },
    {
      title: 'Calendar Events',
      value: calendarEvents.length.toString(),
      subtitle: `${upcomingEvents} upcoming`,
      icon: Calendar,
      color: theme === 'cyberpunk2' ? 'text-green-400' : 'text-green-600',
      bgColor: theme === 'cyberpunk2' ? 'bg-green-500/20' : 'bg-green-50',
      onClick: () => setActiveView('calendar')
    },
    {
      title: 'Reminders',
      value: reminders.length.toString(),
      subtitle: `${activeReminders} active`,
      icon: Bell,
      color: theme === 'cyberpunk2' ? 'text-green-300' : 'text-orange-600',
      bgColor: theme === 'cyberpunk2' ? 'bg-green-400/20' : 'bg-orange-50',
      onClick: () => setActiveView('reminders')
    },
    {
      title: 'Inventory Items',
      value: inventory.length.toString(),
      subtitle: `$${totalRevenue.toLocaleString()} total value`,
      icon: Package,
      color: theme === 'cyberpunk2' ? 'text-green-400' : 'text-purple-600',
      bgColor: theme === 'cyberpunk2' ? 'bg-green-500/20' : 'bg-purple-50',
      onClick: () => setActiveView('inventory')
    },
    {
      title: 'Lending Items',
      value: lending.length.toString(),
      subtitle: `${activeLending} active`,
      icon: Users,
      color: theme === 'cyberpunk2' ? 'text-green-300' : 'text-indigo-600',
      bgColor: theme === 'cyberpunk2' ? 'bg-green-400/20' : 'bg-indigo-50',
      onClick: () => setActiveView('lending')
    },
    {
      title: 'Growth Rate',
      value: '23%',
      subtitle: '+5% this month',
      icon: TrendingUp,
      color: theme === 'cyberpunk2' ? 'text-green-400' : 'text-cyan-600',
      bgColor: theme === 'cyberpunk2' ? 'bg-green-500/20' : 'bg-cyan-50',
      onClick: () => setActiveView('dashboard')
    }
  ];

  return (
    <div className={`p-6 ${currentTheme.background} min-h-screen`}>
      <div className="mb-8">
        <h1 className={`text-3xl font-bold ${currentTheme.text} mb-2`}>Dashboard</h1>
        <p className={`${currentTheme.text} opacity-70`}>Welcome back! Here's your productivity overview.</p>
      </div>

      {/* Financial Overview */}
      <div className="mb-8">
        <h2 className={`text-xl font-semibold ${currentTheme.text} mb-4`}>Financial Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div 
                key={index} 
                onClick={stat.onClick}
                className={`${currentTheme.surface} rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-6 cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${stat.bgColor} ${stat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-medium text-green-600">{stat.change}</span>
                </div>
                <div>
                  <p className={`text-2xl font-bold ${currentTheme.text} mb-1`}>{stat.value}</p>
                  <p className={`text-sm ${currentTheme.text} opacity-70`}>{stat.title}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Data Summary */}
      <div className="mb-8">
        <h2 className={`text-xl font-semibold ${currentTheme.text} mb-4`}>Data Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dataSummary.map((item, index) => {
            const Icon = item.icon;
            return (
              <div 
                key={index}
                onClick={item.onClick}
                className={`${currentTheme.surface} rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-6 cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${item.bgColor} ${item.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
                <div>
                  <p className={`text-2xl font-bold ${currentTheme.text} mb-1`}>{item.value}</p>
                  <p className={`text-sm ${currentTheme.text} opacity-70 mb-1`}>{item.title}</p>
                  {item.subtitle && (
                    <p className={`text-xs ${currentTheme.text} opacity-50`}>{item.subtitle}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`${currentTheme.surface} rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-6`}>
          <h3 className={`text-lg font-semibold ${currentTheme.text} mb-4`}>Recent Activity</h3>
          <div className="space-y-4">
            {notes.length > 0 && (
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <p className={`text-sm ${currentTheme.text} opacity-70`}>
                  {notes.length} notes created
                </p>
                <span className={`text-xs ${currentTheme.text} opacity-50 ml-auto`}>Recent</span>
              </div>
            )}
            {activeReminders > 0 && (
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <p className={`text-sm ${currentTheme.text} opacity-70`}>
                  {activeReminders} active reminders
                </p>
                <span className={`text-xs ${currentTheme.text} opacity-50 ml-auto`}>Pending</span>
              </div>
            )}
            {upcomingEvents > 0 && (
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className={`text-sm ${currentTheme.text} opacity-70`}>
                  {upcomingEvents} upcoming events
                </p>
                <span className={`text-xs ${currentTheme.text} opacity-50 ml-auto`}>This week</span>
              </div>
            )}
            {activeLending > 0 && (
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <p className={`text-sm ${currentTheme.text} opacity-70`}>
                  {activeLending} items being lent/borrowed
                </p>
                <span className={`text-xs ${currentTheme.text} opacity-50 ml-auto`}>Active</span>
              </div>
            )}
            {inventory.length > 0 && (
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                <p className={`text-sm ${currentTheme.text} opacity-70`}>
                  {inventory.length} items in inventory
                </p>
                <span className={`text-xs ${currentTheme.text} opacity-50 ml-auto`}>Total</span>
              </div>
            )}
          </div>
        </div>

        <div className={`${currentTheme.surface} rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-6`}>
          <h3 className={`text-lg font-semibold ${currentTheme.text} mb-4`}>Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setActiveView('inventory')}
              className={`p-3 text-left rounded-lg border border-gray-200 dark:border-gray-600 hover:${currentTheme.secondary} transition-all duration-200 hover:scale-105`}
            >
              <p className={`font-medium ${currentTheme.text}`}>Inventory</p>
              <p className={`text-sm ${currentTheme.text} opacity-70`}>Manage items</p>
            </button>
            <button
              onClick={() => setActiveView('lending')}
              className={`p-3 text-left rounded-lg border border-gray-200 dark:border-gray-600 hover:${currentTheme.secondary} transition-all duration-200 hover:scale-105`}
            >
              <p className={`font-medium ${currentTheme.text}`}>Lending</p>
              <p className={`text-sm ${currentTheme.text} opacity-70`}>Track loans</p>
            </button>
            <button
              onClick={() => setActiveView('calendar')}
              className={`p-3 text-left rounded-lg border border-gray-200 dark:border-gray-600 hover:${currentTheme.secondary} transition-all duration-200 hover:scale-105`}
            >
              <p className={`font-medium ${currentTheme.text}`}>Calendar</p>
              <p className={`text-sm ${currentTheme.text} opacity-70`}>View schedule</p>
            </button>
            <button
              onClick={() => setActiveView('notes')}
              className={`p-3 text-left rounded-lg border border-gray-200 dark:border-gray-600 hover:${currentTheme.secondary} transition-all duration-200 hover:scale-105`}
            >
              <p className={`font-medium ${currentTheme.text}`}>Notes</p>
              <p className={`text-sm ${currentTheme.text} opacity-70`}>Quick notes</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}