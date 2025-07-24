import React, { useState } from 'react';
import { Plus, Users, ArrowUpRight, ArrowDownLeft, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';
import { useData, LendingItem } from '../contexts/DataContext';
import { useTheme } from '../contexts/ThemeContext';

export const Lending: React.FC = () => {
  const { lending, addLendingItem, updateLendingItem, deleteLendingItem, inventory } = useData();
  const { theme, themes } = useTheme();
  const currentTheme = themes[theme];

  const [isAddingItem, setIsAddingItem] = useState(false);
  const [filter, setFilter] = useState<'all' | 'lent' | 'borrowed' | 'active' | 'returned'>('all');
  const [draggedLendingItem, setDraggedLendingItem] = useState<string | null>(null);
  const [showInventorySelector, setShowInventorySelector] = useState(false);
  const [newItem, setNewItem] = useState({
    itemName: '',
    personName: '',
    type: 'lent' as 'lent' | 'borrowed',
    lentDate: new Date(),
    expectedReturnDate: new Date(),
    notes: '',
    returned: false
  });

  const filteredLending = lending.filter(item => {
    if (filter === 'lent') return item.type === 'lent';
    if (filter === 'borrowed') return item.type === 'borrowed';
    if (filter === 'active') return !item.returned;
    if (filter === 'returned') return item.returned;
    return true;
  }).sort((a, b) => {
    if (a.returned && !b.returned) return 1;
    if (!a.returned && b.returned) return -1;
    return new Date(a.expectedReturnDate).getTime() - new Date(b.expectedReturnDate).getTime();
  });

  const handleAddItem = () => {
    if (newItem.itemName.trim() && newItem.personName.trim()) {
      addLendingItem(newItem);
      setNewItem({
        itemName: '',
        personName: '',
        type: 'lent',
        lentDate: new Date(),
        expectedReturnDate: new Date(),
        notes: '',
        returned: false
      });
      setIsAddingItem(false);
    }
  };

  const toggleItemReturn = (item: LendingItem) => {
    updateLendingItem(item.id, { 
      returned: !item.returned,
      returnDate: !item.returned ? new Date() : undefined
    });
  };

  const isOverdue = (expectedDate: Date, returned: boolean) => {
    return !returned && new Date(expectedDate) < new Date();
  };

  const isDueSoon = (expectedDate: Date, returned: boolean) => {
    if (returned) return false;
    const today = new Date();
    const threeDaysFromNow = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
    return new Date(expectedDate) <= threeDaysFromNow;
  };

  const stats = {
    total: lending.length,
    lent: lending.filter(item => item.type === 'lent').length,
    borrowed: lending.filter(item => item.type === 'borrowed').length,
    active: lending.filter(item => !item.returned).length,
    overdue: lending.filter(item => isOverdue(item.expectedReturnDate, item.returned)).length
  };

  const handleLendingDragStart = (e: React.DragEvent, itemId: string) => {
    setDraggedLendingItem(itemId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleLendingDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleLendingDrop = (e: React.DragEvent, targetItemId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedLendingItem || draggedLendingItem === targetItemId) return;

    const reorderedItems = [...lending];
    const draggedItemObj = reorderedItems.find(i => i.id === draggedLendingItem);
    const targetItemObj = reorderedItems.find(i => i.id === targetItemId);
    
    if (draggedItemObj && targetItemObj) {
      const draggedIndex = reorderedItems.findIndex(i => i.id === draggedLendingItem);
      const targetIndex = reorderedItems.findIndex(i => i.id === targetItemId);
      
      reorderedItems.splice(draggedIndex, 1);
      reorderedItems.splice(targetIndex, 0, draggedItemObj);
      
      // Update lending items
      reorderedItems.forEach((item) => {
        updateLendingItem(item.id, { ...item });
      });
    }

    setDraggedLendingItem(null);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
  };

  const selectFromInventory = (inventoryItem: any) => {
    setNewItem({
      ...newItem,
      itemName: inventoryItem.name
    });
    setShowInventorySelector(false);
  };

  return (
    <div className={`p-6 ${currentTheme.background} min-h-screen`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className={`text-3xl font-bold ${currentTheme.text} mb-2`}>Lending & Borrowing</h1>
            <p className={`${currentTheme.text} opacity-70`}>
              Track items you've lent out or borrowed from others
            </p>
          </div>
          <button
            onClick={() => setIsAddingItem(true)}
            className={`mt-4 sm:mt-0 ${currentTheme.primary} text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center hover:scale-105`}
          >
            <Plus size={20} className="mr-2" />
            Add Item
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {[
            { label: 'Total Items', value: stats.total, color: 'bg-blue-500' },
            { label: 'Items Lent', value: stats.lent, color: 'bg-green-500' },
            { label: 'Items Borrowed', value: stats.borrowed, color: 'bg-orange-500' },
            { label: 'Active', value: stats.active, color: 'bg-purple-500' },
            { label: 'Overdue', value: stats.overdue, color: 'bg-red-500' }
          ].map((stat, index) => (
            <div key={index} className={`${currentTheme.surface} p-4 rounded-lg shadow-lg border border-gray-200/50 dark:border-gray-700/50`}>
              <div className={`w-3 h-3 rounded-full ${stat.color} mb-2`}></div>
              <p className={`text-2xl font-bold ${currentTheme.text}`}>{stat.value}</p>
              <p className={`text-sm ${currentTheme.text} opacity-70`}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: 'all', label: 'All Items' },
            { key: 'active', label: 'Active' },
            { key: 'lent', label: 'Lent Out' },
            { key: 'borrowed', label: 'Borrowed' },
            { key: 'returned', label: 'Returned' }
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
              {tab.label}
            </button>
          ))}
        </div>

        {/* Add Item Form */}
        {isAddingItem && (
          <div className={`${currentTheme.surface} p-6 rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 mb-6`}>
            <h2 className={`text-xl font-semibold ${currentTheme.text} mb-4`}>Add New Item</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Item name"
                  value={newItem.itemName}
                  onChange={(e) => setNewItem({ ...newItem, itemName: e.target.value })}
                  className={`w-full px-4 py-3 ${currentTheme.surface} border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${currentTheme.text}`}
                />
                {inventory.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowInventorySelector(!showInventorySelector)}
                    className={`absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 text-xs ${currentTheme.primary} text-white rounded hover:shadow-lg transition-all duration-200`}
                  >
                    From Inventory
                  </button>
                )}
              </div>
              <input
                type="text"
                placeholder="Person's name"
                value={newItem.personName}
                onChange={(e) => setNewItem({ ...newItem, personName: e.target.value })}
                className={`px-4 py-3 ${currentTheme.surface} border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${currentTheme.text}`}
              />
              <select
                value={newItem.type}
                onChange={(e) => setNewItem({ ...newItem, type: e.target.value as 'lent' | 'borrowed' })}
                className={`px-4 py-3 ${currentTheme.surface} border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${currentTheme.text}`}
              >
                <option value="lent">Lent Out</option>
                <option value="borrowed">Borrowed</option>
              </select>
              <input
                type="date"
                value={newItem.lentDate.toISOString().split('T')[0]}
                onChange={(e) => setNewItem({ ...newItem, lentDate: new Date(e.target.value) })}
                className={`px-4 py-3 ${currentTheme.surface} border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${currentTheme.text}`}
              />
              <input
                type="date"
                placeholder="Expected return date"
                value={newItem.expectedReturnDate.toISOString().split('T')[0]}
                onChange={(e) => setNewItem({ ...newItem, expectedReturnDate: new Date(e.target.value) })}
                className={`px-4 py-3 ${currentTheme.surface} border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${currentTheme.text}`}
              />
              <div className="md:col-span-2">
                <textarea
                  placeholder="Notes (optional)"
                  value={newItem.notes}
                  onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                  className={`w-full px-4 py-3 h-24 ${currentTheme.surface} border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${currentTheme.text}`}
                />
              </div>
            </div>
            
            {/* Inventory Selector */}
            {showInventorySelector && inventory.length > 0 && (
              <div className="mt-4">
                <h3 className={`text-lg font-semibold ${currentTheme.text} mb-3`}>Select from Inventory</h3>
                <div className="max-h-60 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg">
                  {inventory.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => selectFromInventory(item)}
                      className={`w-full text-left p-3 hover:${currentTheme.secondary} transition-colors border-b border-gray-200 dark:border-gray-700 last:border-b-0`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className={`font-medium ${currentTheme.text}`}>{item.name}</p>
                          <p className={`text-sm ${currentTheme.text} opacity-70`}>
                            {item.category} • ${item.purchasePrice.toFixed(2)}
                          </p>
                        </div>
                        <div className={`text-xs ${currentTheme.text} opacity-50`}>
                          {new Date(item.purchaseDate).toLocaleDateString()}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setShowInventorySelector(false)}
                  className={`mt-2 px-4 py-2 text-sm ${currentTheme.secondary} ${currentTheme.text} rounded-lg hover:shadow-lg transition-all duration-200`}
                >
                  Cancel
                </button>
              </div>
            )}
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddItem}
                className={`flex-1 ${currentTheme.primary} text-white py-3 rounded-lg hover:shadow-lg transition-all duration-200 font-medium`}
              >
                Add Item
              </button>
              <button
                onClick={() => setIsAddingItem(false)}
                className={`flex-1 ${currentTheme.secondary} ${currentTheme.text} py-3 rounded-lg hover:shadow-lg transition-all duration-200 font-medium`}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Items List */}
        <div className="space-y-4">
          {filteredLending.map((item) => (
            <div
              key={item.id}
             draggable
             onDragStart={(e) => handleLendingDragStart(e, item.id)}
             onDragOver={handleLendingDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
             onDrop={(e) => handleLendingDrop(e, item.id)}
              className={`${currentTheme.surface} p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50 drag-target ${
                item.returned ? 'opacity-75' : ''
              } ${isOverdue(item.expectedReturnDate, item.returned) ? 'border-l-4 border-l-red-500' : isDueSoon(item.expectedReturnDate, item.returned) ? 'border-l-4 border-l-orange-500' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`p-3 rounded-full ${item.type === 'lent' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-orange-100 dark:bg-orange-900/30'}`}>
                    {item.type === 'lent' ? (
                      <ArrowUpRight className={`${item.type === 'lent' ? 'text-green-600' : 'text-orange-600'}`} size={24} />
                    ) : (
                      <ArrowDownLeft className={`${item.type === 'lent' ? 'text-green-600' : 'text-orange-600'}`} size={24} />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className={`text-lg font-semibold ${currentTheme.text} ${item.returned ? 'line-through opacity-60' : ''}`}>
                        {item.itemName}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.type === 'lent' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                          : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                      }`}>
                        {item.type === 'lent' ? 'Lent to' : 'Borrowed from'} {item.personName}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mb-3">
                      <div className={`flex items-center gap-2 text-sm ${currentTheme.text} opacity-70`}>
                        <Calendar size={16} />
                        <span>
                          Given: {new Date(item.lentDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className={`flex items-center gap-2 text-sm ${
                        isOverdue(item.expectedReturnDate, item.returned) ? 'text-red-600' :
                        isDueSoon(item.expectedReturnDate, item.returned) ? 'text-orange-600' :
                        `${currentTheme.text} opacity-70`
                      }`}>
                        <Calendar size={16} />
                        <span>
                          Expected: {new Date(item.expectedReturnDate).toLocaleDateString()}
                        </span>
                        {isOverdue(item.expectedReturnDate, item.returned) && (
                          <span className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 px-2 py-1 rounded-full text-xs font-medium">
                            Overdue
                          </span>
                        )}
                        {isDueSoon(item.expectedReturnDate, item.returned) && !isOverdue(item.expectedReturnDate, item.returned) && (
                          <span className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 px-2 py-1 rounded-full text-xs font-medium">
                            Due Soon
                          </span>
                        )}
                      </div>
                      {item.returned && item.returnDate && (
                        <div className={`flex items-center gap-2 text-sm text-green-600`}>
                          <CheckCircle size={16} />
                          <span>
                            Returned: {new Date(item.returnDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>

                    {item.notes && (
                      <p className={`text-sm ${currentTheme.text} opacity-80 mb-3 ${item.returned ? 'line-through opacity-60' : ''}`}>
                        {item.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleItemReturn(item)}
                    className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
                      item.returned
                        ? `${currentTheme.secondary} ${currentTheme.text}`
                        : 'bg-green-500 text-white hover:bg-green-600'
                    }`}
                  >
                    {item.returned ? 'Mark as Active' : 'Mark as Returned'}
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this item?')) {
                        deleteLendingItem(item.id);
                      }
                    }}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                  >
                    <AlertTriangle size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredLending.length === 0 && (
          <div className={`text-center py-12 ${currentTheme.text} opacity-70`}>
            <Users size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg">No lending records found</p>
            <p className="text-sm">
              {filter === 'all' ? "Click 'Add Item' to start tracking your lending and borrowing" :
                `No ${filter} items found`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};