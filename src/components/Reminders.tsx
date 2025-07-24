import React, { useState } from 'react';
import { Plus, Bell, Calendar, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useData, Reminder } from '../contexts/DataContext';
import { useTheme } from '../contexts/ThemeContext';

export const Reminders: React.FC = () => {
  const { reminders, addReminder, updateReminder, deleteReminder } = useData();
  const { theme, themes } = useTheme();
  const currentTheme = themes[theme];

  const [isAddingReminder, setIsAddingReminder] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [draggedReminder, setDraggedReminder] = useState<string | null>(null);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [newReminder, setNewReminder] = useState({
    title: '',
    description: '',
    dueDate: new Date(),
    priority: 'medium' as 'low' | 'medium' | 'high',
    completed: false
  });

  const filteredReminders = reminders.filter(reminder => {
    if (filter === 'pending') return !reminder.completed;
    if (filter === 'completed') return reminder.completed;
    return true;
  }).sort((a, b) => {
    if (a.completed && !b.completed) return 1;
    if (!a.completed && b.completed) return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const handleAddReminder = () => {
    if (newReminder.title.trim()) {
      addReminder(newReminder);
      setNewReminder({
        title: '',
        description: '',
        dueDate: new Date(),
        priority: 'medium',
        completed: false
      });
      setIsAddingReminder(false);
    }
  };

  const handleUpdateReminder = () => {
    if (editingReminder && editingReminder.title.trim()) {
      updateReminder(editingReminder.id, editingReminder);
      setEditingReminder(null);
    }
  };

  const toggleReminderCompletion = (reminder: Reminder) => {
    updateReminder(reminder.id, { completed: !reminder.completed });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const isOverdue = (dueDate: Date) => {
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
  };

  const isDueToday = (dueDate: Date) => {
    return new Date(dueDate).toDateString() === new Date().toDateString();
  };

  const handleReminderDragStart = (e: React.DragEvent, reminderId: string) => {
    setDraggedReminder(reminderId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleReminderDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleReminderDrop = (e: React.DragEvent, targetReminderId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedReminder || draggedReminder === targetReminderId) return;

    const reorderedReminders = [...reminders];
    const draggedReminderObj = reorderedReminders.find(r => r.id === draggedReminder);
    const targetReminderObj = reorderedReminders.find(r => r.id === targetReminderId);
    
    if (draggedReminderObj && targetReminderObj) {
      const draggedIndex = reorderedReminders.findIndex(r => r.id === draggedReminder);
      const targetIndex = reorderedReminders.findIndex(r => r.id === targetReminderId);
      
      reorderedReminders.splice(draggedIndex, 1);
      reorderedReminders.splice(targetIndex, 0, draggedReminderObj);
      
      // Update reminders
      reorderedReminders.forEach((reminder) => {
        updateReminder(reminder.id, { ...reminder });
      });
    }

    setDraggedReminder(null);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
  };

  return (
    <div className={`p-6 ${currentTheme.background} min-h-screen`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className={`text-3xl font-bold ${currentTheme.text} mb-2`}>Reminders</h1>
            <p className={`${currentTheme.text} opacity-70`}>
              Keep track of important tasks and deadlines
            </p>
          </div>
          <button
            onClick={() => setIsAddingReminder(true)}
            className={`mt-4 sm:mt-0 ${currentTheme.primary} text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center hover:scale-105`}
          >
            <Plus size={20} className="mr-2" />
            Add Reminder
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 mb-6">
          {[
            { key: 'all', label: 'All', count: reminders.length },
            { key: 'pending', label: 'Pending', count: reminders.filter(r => !r.completed).length },
            { key: 'completed', label: 'Completed', count: reminders.filter(r => r.completed).length }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                filter === tab.key
                  ? `${currentTheme.primary} text-white shadow-lg`
                  : `${currentTheme.surface} ${currentTheme.text} hover:${currentTheme.secondary}`
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Add Reminder Form */}
        {isAddingReminder && (
          <div className={`${currentTheme.surface} p-6 rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 mb-6`}>
            <h2 className={`text-xl font-semibold ${currentTheme.text} mb-4`}>Create New Reminder</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <input
                  type="text"
                  placeholder="Reminder title"
                  value={newReminder.title}
                  onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
                  className={`w-full px-4 py-3 ${currentTheme.surface} border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${currentTheme.text}`}
                  autoFocus
                />
              </div>
              <div className="md:col-span-2">
                <textarea
                  placeholder="Description (optional)"
                  value={newReminder.description}
                  onChange={(e) => setNewReminder({ ...newReminder, description: e.target.value })}
                  className={`w-full px-4 py-3 h-24 ${currentTheme.surface} border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${currentTheme.text}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${currentTheme.text} mb-2`}>Due Date</label>
                <input
                  type="datetime-local"
                  value={newReminder.dueDate.toISOString().slice(0, 16)}
                  onChange={(e) => setNewReminder({ ...newReminder, dueDate: new Date(e.target.value) })}
                  className={`w-full px-4 py-3 ${currentTheme.surface} border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${currentTheme.text}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${currentTheme.text} mb-2`}>Priority</label>
                <select
                  value={newReminder.priority}
                  onChange={(e) => setNewReminder({ ...newReminder, priority: e.target.value as any })}
                  className={`w-full px-4 py-3 ${currentTheme.surface} border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${currentTheme.text}`}
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddReminder}
                className={`flex-1 ${currentTheme.primary} text-white py-3 rounded-lg hover:shadow-lg transition-all duration-200 font-medium`}
              >
                Create Reminder
              </button>
              <button
                onClick={() => setIsAddingReminder(false)}
                className={`flex-1 ${currentTheme.secondary} ${currentTheme.text} py-3 rounded-lg hover:shadow-lg transition-all duration-200 font-medium`}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Reminders List */}
        <div className="space-y-4">
          {filteredReminders.map((reminder) => (
            <div
              key={reminder.id}
              draggable
              onDragStart={(e) => handleReminderDragStart(e, reminder.id)}
              onDragOver={handleReminderDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleReminderDrop(e, reminder.id)}
              className={`${currentTheme.surface} p-6 rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300 drag-target ${
                reminder.completed ? 'opacity-75' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                <button
                  onClick={() => toggleReminderCompletion(reminder)}
                  className={`mt-1 transition-all duration-200 hover:scale-110 ${
                    reminder.completed ? 'text-green-500' : `${currentTheme.text} opacity-40 hover:text-green-500`
                  }`}
                >
                  {reminder.completed ? <CheckCircle size={24} /> : <Clock size={24} />}
                </button>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className={`text-lg font-semibold ${currentTheme.text} ${
                      reminder.completed ? 'line-through opacity-60' : ''
                    }`}>
                      {reminder.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${getPriorityColor(reminder.priority)}`}></span>
                      <span className={`text-sm font-medium ${currentTheme.text} opacity-70 capitalize`}>
                        {reminder.priority}
                      </span>
                    </div>
                  </div>

                  {reminder.description && (
                    <p className={`${currentTheme.text} opacity-80 mb-3 ${
                      reminder.completed ? 'line-through opacity-60' : ''
                    }`}>
                      {reminder.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`flex items-center gap-2 ${
                        isOverdue(reminder.dueDate) && !reminder.completed ? 'text-red-500' :
                        isDueToday(reminder.dueDate) && !reminder.completed ? 'text-orange-500' :
                        `${currentTheme.text} opacity-70`
                      }`}>
                        <Calendar size={16} />
                        <span className="text-sm font-medium">
                          {new Date(reminder.dueDate).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        {isOverdue(reminder.dueDate) && !reminder.completed && (
                          <span className="text-xs bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 px-2 py-1 rounded-full font-medium">
                            Overdue
                          </span>
                        )}
                        {isDueToday(reminder.dueDate) && !reminder.completed && (
                          <span className="text-xs bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 px-2 py-1 rounded-full font-medium">
                            Due Today
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this reminder?')) {
                          deleteReminder(reminder.id);
                        }
                      }}
                      className={`text-red-500 hover:text-red-700 transition-colors p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30`}
                    >
                      <AlertCircle size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredReminders.length === 0 && (
          <div className={`text-center py-12 ${currentTheme.text} opacity-70`}>
            <Bell size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg">No reminders found</p>
            <p className="text-sm">
              {filter === 'all' ? "Click 'Add Reminder' to create your first reminder" :
                filter === 'pending' ? 'No pending reminders' :
                'No completed reminders'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};