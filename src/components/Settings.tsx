import React from 'react';
import { Palette, Download, Upload, Trash2, Info, Type, Paintbrush } from 'lucide-react';
import { useTheme, FontFamily } from '../contexts/ThemeContext';
import { useData } from '../contexts/DataContext';

export const Settings: React.FC = () => {
  const { theme, setTheme, fontFamily, setFontFamily, customColors, setCustomColors, themes } = useTheme();
  const { notes, calendarEvents, reminders, inventory, lending } = useData();
  const currentTheme = themes[theme];

  const exportData = () => {
    const data = {
      notes,
      calendarEvents,
      reminders,
      inventory,
      lending,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `productivity-hub-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        // Validate data structure
        if (data.notes) localStorage.setItem('productivity-notes', JSON.stringify(data.notes));
        if (data.calendarEvents) localStorage.setItem('productivity-events', JSON.stringify(data.calendarEvents));
        if (data.reminders) localStorage.setItem('productivity-reminders', JSON.stringify(data.reminders));
        if (data.inventory) localStorage.setItem('productivity-inventory', JSON.stringify(data.inventory));
        if (data.lending) localStorage.setItem('productivity-lending', JSON.stringify(data.lending));

        alert('Data imported successfully! Please refresh the page to see your imported data.');
      } catch (error) {
        alert('Error importing data. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to delete all data? This action cannot be undone.')) {
      localStorage.removeItem('productivity-notes');
      localStorage.removeItem('productivity-events');
      localStorage.removeItem('productivity-reminders');
      localStorage.removeItem('productivity-inventory');
      localStorage.removeItem('productivity-lending');
      alert('All data has been cleared. Please refresh the page.');
    }
  };

  const totalItems = notes.length + calendarEvents.length + reminders.length + inventory.length + lending.length;

  const fontOptions = [
    { key: 'default', name: 'Default (Sans Serif)', class: 'font-sans' },
    { key: 'serif', name: 'Serif', class: 'font-serif' },
    { key: 'mono', name: 'Monospace', class: 'font-mono' },
    { key: 'rounded', name: 'Rounded', class: 'font-sans' }
  ];

  return (
    <div className={`p-6 ${currentTheme.background} min-h-screen`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${currentTheme.text} mb-2`}>Settings</h1>
          <p className={`${currentTheme.text} opacity-70`}>
            Customize your experience and manage your data
          </p>
        </div>

        <div className="space-y-8">
          {/* Theme Settings */}
          <div className={`${currentTheme.surface} p-6 rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50`}>
            <div className="flex items-center mb-4">
              <Palette className={`${currentTheme.text} mr-3`} size={24} />
              <h2 className={`text-xl font-semibold ${currentTheme.text}`}>Theme Selection</h2>
            </div>
            <p className={`${currentTheme.text} opacity-70 mb-6`}>
              Choose your preferred color theme for the application
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(themes).map(([key, themeConfig]) => (
                <button
                  key={key}
                  onClick={() => setTheme(key as any)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                    theme === key
                      ? 'border-blue-500 shadow-lg'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-4 h-4 rounded-full ${themeConfig.primary}`}></div>
                    <div className={`w-4 h-4 rounded-full ${themeConfig.accent}`}></div>
                    <div className={`w-4 h-4 rounded-full ${themeConfig.secondary}`}></div>
                  </div>
                  <p className={`font-medium ${currentTheme.text}`}>{themeConfig.name}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Font Settings */}
          <div className={`${currentTheme.surface} p-6 rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50`}>
            <div className="flex items-center mb-4">
              <Type className={`${currentTheme.text} mr-3`} size={24} />
              <h2 className={`text-xl font-semibold ${currentTheme.text}`}>Font Selection</h2>
            </div>
            <p className={`${currentTheme.text} opacity-70 mb-6`}>
              Choose your preferred font family for the application
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fontOptions.map((font) => (
                <button
                  key={font.key}
                  onClick={() => setFontFamily(font.key as FontFamily)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 hover:scale-105 text-left ${
                    fontFamily === font.key
                      ? 'border-blue-500 shadow-lg'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                  } ${font.class}`}
                >
                  <p className={`font-medium ${currentTheme.text} mb-1`}>{font.name}</p>
                  <p className={`text-sm ${currentTheme.text} opacity-70`}>
                    The quick brown fox jumps over the lazy dog
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Colors */}
          <div className={`${currentTheme.surface} p-6 rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50`}>
            <div className="flex items-center mb-4">
              <Paintbrush className={`${currentTheme.text} mr-3`} size={24} />
              <h2 className={`text-xl font-semibold ${currentTheme.text}`}>Custom Colors</h2>
            </div>
            <p className={`${currentTheme.text} opacity-70 mb-6`}>
              Customize the color scheme for your personal preference
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={`block text-sm font-medium ${currentTheme.text} mb-2`}>
                  Primary Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={customColors.primary}
                    onChange={(e) => setCustomColors({ ...customColors, primary: e.target.value })}
                    className="w-12 h-12 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={customColors.primary}
                    onChange={(e) => setCustomColors({ ...customColors, primary: e.target.value })}
                    className={`flex-1 px-3 py-2 ${currentTheme.surface} border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${currentTheme.text}`}
                  />
                </div>
              </div>
              
              <div>
                <label className={`block text-sm font-medium ${currentTheme.text} mb-2`}>
                  Secondary Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={customColors.secondary}
                    onChange={(e) => setCustomColors({ ...customColors, secondary: e.target.value })}
                    className="w-12 h-12 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={customColors.secondary}
                    onChange={(e) => setCustomColors({ ...customColors, secondary: e.target.value })}
                    className={`flex-1 px-3 py-2 ${currentTheme.surface} border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${currentTheme.text}`}
                  />
                </div>
              </div>
              
              <div>
                <label className={`block text-sm font-medium ${currentTheme.text} mb-2`}>
                  Accent Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={customColors.accent}
                    onChange={(e) => setCustomColors({ ...customColors, accent: e.target.value })}
                    className="w-12 h-12 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={customColors.accent}
                    onChange={(e) => setCustomColors({ ...customColors, accent: e.target.value })}
                    className={`flex-1 px-3 py-2 ${currentTheme.surface} border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${currentTheme.text}`}
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h4 className={`font-semibold ${currentTheme.text} mb-2`}>Color Preview</h4>
              <div className="flex gap-3">
                <div 
                  className="w-16 h-16 rounded-lg shadow-lg flex items-center justify-center text-white font-semibold"
                  style={{ backgroundColor: customColors.primary }}
                >
                  Primary
                </div>
                <div 
                  className="w-16 h-16 rounded-lg shadow-lg flex items-center justify-center text-gray-800 font-semibold"
                  style={{ backgroundColor: customColors.secondary }}
                >
                  Secondary
                </div>
                <div 
                  className="w-16 h-16 rounded-lg shadow-lg flex items-center justify-center text-white font-semibold"
                  style={{ backgroundColor: customColors.accent }}
                >
                  Accent
                </div>
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div className={`${currentTheme.surface} p-6 rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50`}>
            <div className="flex items-center mb-4">
              <Info className={`${currentTheme.text} mr-3`} size={24} />
              <h2 className={`text-xl font-semibold ${currentTheme.text}`}>Data Management</h2>
            </div>
            
            {/* Data Overview */}
            <div className="mb-6">
              <h3 className={`font-semibold ${currentTheme.text} mb-3`}>Your Data Overview</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className={`p-3 rounded-lg ${currentTheme.secondary}`}>
                  <p className={`text-2xl font-bold ${currentTheme.text}`}>{notes.length}</p>
                  <p className={`text-sm ${currentTheme.text} opacity-70`}>Notes</p>
                </div>
                <div className={`p-3 rounded-lg ${currentTheme.secondary}`}>
                  <p className={`text-2xl font-bold ${currentTheme.text}`}>{calendarEvents.length}</p>
                  <p className={`text-sm ${currentTheme.text} opacity-70`}>Events</p>
                </div>
                <div className={`p-3 rounded-lg ${currentTheme.secondary}`}>
                  <p className={`text-2xl font-bold ${currentTheme.text}`}>{reminders.length}</p>
                  <p className={`text-sm ${currentTheme.text} opacity-70`}>Reminders</p>
                </div>
                <div className={`p-3 rounded-lg ${currentTheme.secondary}`}>
                  <p className={`text-2xl font-bold ${currentTheme.text}`}>{inventory.length}</p>
                  <p className={`text-sm ${currentTheme.text} opacity-70`}>Inventory</p>
                </div>
                <div className={`p-3 rounded-lg ${currentTheme.secondary}`}>
                  <p className={`text-2xl font-bold ${currentTheme.text}`}>{lending.length}</p>
                  <p className={`text-sm ${currentTheme.text} opacity-70`}>Lending</p>
                </div>
              </div>
              <p className={`text-sm ${currentTheme.text} opacity-70 mt-3`}>
                Total items: {totalItems}
              </p>
            </div>

            {/* Data Actions */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={exportData}
                  className={`flex-1 ${currentTheme.primary} text-white py-3 px-4 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center justify-center font-medium`}
                >
                  <Download size={20} className="mr-2" />
                  Export Data
                </button>
                <label className={`flex-1 ${currentTheme.secondary} ${currentTheme.text} py-3 px-4 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center justify-center font-medium cursor-pointer`}>
                  <Upload size={20} className="mr-2" />
                  Import Data
                  <input
                    type="file"
                    accept=".json"
                    onChange={importData}
                    className="hidden"
                  />
                </label>
              </div>
              
              <button
                onClick={clearAllData}
                className="w-full bg-red-500 text-white py-3 px-4 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center font-medium"
              >
                <Trash2 size={20} className="mr-2" />
                Clear All Data
              </button>
            </div>

            <div className={`mt-6 p-4 rounded-lg ${currentTheme.secondary}`}>
              <h4 className={`font-semibold ${currentTheme.text} mb-2`}>Data Storage Information</h4>
              <ul className={`text-sm ${currentTheme.text} opacity-70 space-y-1`}>
                <li>• All data is stored locally in your browser</li>
                <li>• No data is sent to external servers</li>
                <li>• Export your data regularly to prevent loss</li>
                <li>• Clearing browser data will remove all information</li>
              </ul>
            </div>
          </div>

          {/* App Information */}
          <div className={`${currentTheme.surface} p-6 rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50`}>
            <h2 className={`text-xl font-semibold ${currentTheme.text} mb-4`}>About ProductivityHub</h2>
            <div className={`${currentTheme.text} opacity-70 space-y-2 text-sm`}>
              <p>Version: 1.0.0</p>
              <p>A comprehensive productivity management application featuring:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Note-taking with categories and color coding</li>
                <li>Calendar management with events</li>
                <li>Reminder system with priority levels</li>
                <li>Inventory tracking with warranty management</li>
                <li>Lending and borrowing tracker</li>
                <li>Multiple theme options</li>
                <li>Drag and drop dashboard</li>
                <li>Data export and import capabilities</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};