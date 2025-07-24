import React, { useState } from 'react';
import { Plus, Package, Search, Filter, Calendar, DollarSign, AlertTriangle, FileText, MapPin } from 'lucide-react';
import { useData, InventoryItem } from '../contexts/DataContext';
import { useTheme } from '../contexts/ThemeContext';

const categories = ['Electronics', 'Appliances', 'Furniture', 'Clothing', 'Books', 'Tools', 'Other'];

export const Inventory: React.FC = () => {
  const { inventory, addInventoryItem, updateInventoryItem, deleteInventoryItem } = useData();
  const { theme, themes } = useTheme();
  const currentTheme = themes[theme];

  const [isAddingItem, setIsAddingItem] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'Electronics',
    purchaseDate: new Date(),
    purchasePrice: 0,
    warrantyExpiry: undefined as Date | undefined,
    returnDeadline: undefined as Date | undefined,
    receiptImage: '',
    notes: '',
    location: ''
  });

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.notes.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddItem = () => {
    if (newItem.name.trim()) {
      addInventoryItem(newItem);
      setNewItem({
        name: '',
        category: 'Electronics',
        purchaseDate: new Date(),
        purchasePrice: 0,
        warrantyExpiry: undefined,
        returnDeadline: undefined,
        receiptImage: '',
        notes: '',
        location: ''
      });
      setIsAddingItem(false);
    }
  };

  const isExpiringSoon = (date: Date | undefined) => {
    if (!date) return false;
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    return new Date(date) <= thirtyDaysFromNow;
  };

  const getStatusColor = (item: InventoryItem) => {
    const isWarrantyExpiring = item.warrantyExpiry && isExpiringSoon(item.warrantyExpiry);
    const isReturnExpiring = item.returnDeadline && isExpiringSoon(item.returnDeadline);
    
    if (isWarrantyExpiring || isReturnExpiring) {
      return 'border-l-red-500 bg-red-50 dark:bg-red-900/20';
    }
    return 'border-l-blue-500';
  };

  const handleItemDragStart = (e: React.DragEvent, itemId: string) => {
    setDraggedItem(itemId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleItemDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleItemDrop = (e: React.DragEvent, targetItemId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedItem || draggedItem === targetItemId) return;

    const reorderedItems = [...inventory];
    const draggedItemObj = reorderedItems.find(i => i.id === draggedItem);
    const targetItemObj = reorderedItems.find(i => i.id === targetItemId);
    
    if (draggedItemObj && targetItemObj) {
      const draggedIndex = reorderedItems.findIndex(i => i.id === draggedItem);
      const targetIndex = reorderedItems.findIndex(i => i.id === targetItemId);
      
      reorderedItems.splice(draggedIndex, 1);
      reorderedItems.splice(targetIndex, 0, draggedItemObj);
      
      // Update inventory
      reorderedItems.forEach((item) => {
        updateInventoryItem(item.id, { ...item });
      });
    }

    setDraggedItem(null);
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className={`text-3xl font-bold ${currentTheme.text} mb-2`}>Inventory</h1>
            <p className={`${currentTheme.text} opacity-70`}>
              Track your purchases, warranties, and receipts
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

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${currentTheme.text} opacity-50`} size={20} />
            <input
              type="text"
              placeholder="Search inventory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 ${currentTheme.surface} border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${currentTheme.text}`}
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={`px-4 py-2 ${currentTheme.surface} border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${currentTheme.text}`}
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        {/* Add Item Form */}
        {isAddingItem && (
          <div className={`${currentTheme.surface} p-6 rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 mb-6`}>
            <h2 className={`text-xl font-semibold ${currentTheme.text} mb-4`}>Add New Item</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Item name"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                className={`px-4 py-3 ${currentTheme.surface} border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${currentTheme.text}`}
              />
              <select
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                className={`px-4 py-3 ${currentTheme.surface} border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${currentTheme.text}`}
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <input
                type="date"
                value={newItem.purchaseDate.toISOString().split('T')[0]}
                onChange={(e) => setNewItem({ ...newItem, purchaseDate: new Date(e.target.value) })}
                className={`px-4 py-3 ${currentTheme.surface} border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${currentTheme.text}`}
              />
              <input
                type="number"
                placeholder="Purchase price"
                value={newItem.purchasePrice || ''}
                onChange={(e) => setNewItem({ ...newItem, purchasePrice: parseFloat(e.target.value) || 0 })}
                className={`px-4 py-3 ${currentTheme.surface} border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${currentTheme.text}`}
              />
              <input
                type="date"
                placeholder="Warranty expiry"
                value={newItem.warrantyExpiry?.toISOString().split('T')[0] || ''}
                onChange={(e) => setNewItem({ ...newItem, warrantyExpiry: e.target.value ? new Date(e.target.value) : undefined })}
                className={`px-4 py-3 ${currentTheme.surface} border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${currentTheme.text}`}
              />
              <input
                type="date"
                placeholder="Return deadline"
                value={newItem.returnDeadline?.toISOString().split('T')[0] || ''}
                onChange={(e) => setNewItem({ ...newItem, returnDeadline: e.target.value ? new Date(e.target.value) : undefined })}
                className={`px-4 py-3 ${currentTheme.surface} border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${currentTheme.text}`}
              />
              <input
                type="text"
                placeholder="Location"
                value={newItem.location}
                onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
                className={`px-4 py-3 ${currentTheme.surface} border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${currentTheme.text}`}
              />
              <div className="md:col-span-1">
                <input
                  type="url"
                  placeholder="Receipt image URL"
                  value={newItem.receiptImage}
                  onChange={(e) => setNewItem({ ...newItem, receiptImage: e.target.value })}
                  className={`w-full px-4 py-3 ${currentTheme.surface} border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${currentTheme.text}`}
                />
              </div>
              <div className="md:col-span-2">
                <textarea
                  placeholder="Notes (optional)"
                  value={newItem.notes}
                  onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                  className={`w-full px-4 py-3 h-24 ${currentTheme.surface} border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${currentTheme.text}`}
                />
              </div>
            </div>
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

        {/* Inventory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInventory.map((item) => (
            <div
              key={item.id}
              draggable
              onDragStart={(e) => handleItemDragStart(e, item.id)}
              onDragOver={handleItemDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleItemDrop(e, item.id)}
              onClick={() => setSelectedItem(item)}
              className={`${currentTheme.surface} p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border-l-4 ${getStatusColor(item)} border border-gray-200/50 dark:border-gray-700/50 hover:scale-105 drag-target`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className={`text-lg font-semibold ${currentTheme.text}`}>{item.name}</h3>
                  <p className={`text-sm ${currentTheme.text} opacity-70`}>{item.category}</p>
                </div>
                <Package className={`${currentTheme.text} opacity-50`} size={24} />
              </div>

              <div className="space-y-2 mb-4">
                <div className={`flex items-center text-sm ${currentTheme.text} opacity-70`}>
                  <Calendar size={16} className="mr-2" />
                  Purchased: {new Date(item.purchaseDate).toLocaleDateString()}
                </div>
                <div className={`flex items-center text-sm ${currentTheme.text} opacity-70`}>
                  <DollarSign size={16} className="mr-2" />
                  ${item.purchasePrice.toFixed(2)}
                </div>
                {item.location && (
                  <div className={`flex items-center text-sm ${currentTheme.text} opacity-70`}>
                    <MapPin size={16} className="mr-2" />
                    {item.location}
                  </div>
                )}
              </div>

              {(item.warrantyExpiry || item.returnDeadline) && (
                <div className="space-y-1">
                  {item.warrantyExpiry && (
                    <div className={`flex items-center text-sm ${isExpiringSoon(item.warrantyExpiry) ? 'text-red-600' : `${currentTheme.text} opacity-70`}`}>
                      <AlertTriangle size={16} className="mr-2" />
                      Warranty: {new Date(item.warrantyExpiry).toLocaleDateString()}
                      {isExpiringSoon(item.warrantyExpiry) && (
                        <span className="ml-2 text-xs bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 px-2 py-1 rounded-full">
                          Expiring Soon
                        </span>
                      )}
                    </div>
                  )}
                  {item.returnDeadline && (
                    <div className={`flex items-center text-sm ${isExpiringSoon(item.returnDeadline) ? 'text-red-600' : `${currentTheme.text} opacity-70`}`}>
                      <AlertTriangle size={16} className="mr-2" />
                      Return by: {new Date(item.returnDeadline).toLocaleDateString()}
                      {isExpiringSoon(item.returnDeadline) && (
                        <span className="ml-2 text-xs bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 px-2 py-1 rounded-full">
                          Expiring Soon
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {item.receiptImage && (
                <div className="mt-3">
                  <div className={`flex items-center text-sm ${currentTheme.text} opacity-70`}>
                    <FileText size={16} className="mr-2" />
                    Receipt available
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredInventory.length === 0 && (
          <div className={`text-center py-12 ${currentTheme.text} opacity-70`}>
            <Package size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg">No inventory items found</p>
            <p className="text-sm">Click "Add Item" to start tracking your purchases</p>
          </div>
        )}

        {/* Item Detail Modal */}
        {selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className={`${currentTheme.surface} rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className={`text-2xl font-bold ${currentTheme.text}`}>{selectedItem.name}</h2>
                    <p className={`${currentTheme.text} opacity-70`}>{selectedItem.category}</p>
                  </div>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className={`${currentTheme.text} opacity-50 hover:opacity-100 transition-opacity`}
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className={`font-semibold ${currentTheme.text} mb-2`}>Purchase Details</h3>
                      <div className="space-y-2">
                        <p className={`text-sm ${currentTheme.text} opacity-70`}>
                          Date: {new Date(selectedItem.purchaseDate).toLocaleDateString()}
                        </p>
                        <p className={`text-sm ${currentTheme.text} opacity-70`}>
                          Price: ${selectedItem.purchasePrice.toFixed(2)}
                        </p>
                        {selectedItem.location && (
                          <p className={`text-sm ${currentTheme.text} opacity-70`}>
                            Location: {selectedItem.location}
                          </p>
                        )}
                      </div>
                    </div>

                    {(selectedItem.warrantyExpiry || selectedItem.returnDeadline) && (
                      <div>
                        <h3 className={`font-semibold ${currentTheme.text} mb-2`}>Important Dates</h3>
                        <div className="space-y-2">
                          {selectedItem.warrantyExpiry && (
                            <p className={`text-sm ${isExpiringSoon(selectedItem.warrantyExpiry) ? 'text-red-600' : `${currentTheme.text} opacity-70`}`}>
                              Warranty expires: {new Date(selectedItem.warrantyExpiry).toLocaleDateString()}
                            </p>
                          )}
                          {selectedItem.returnDeadline && (
                            <p className={`text-sm ${isExpiringSoon(selectedItem.returnDeadline) ? 'text-red-600' : `${currentTheme.text} opacity-70`}`}>
                              Return deadline: {new Date(selectedItem.returnDeadline).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {selectedItem.notes && (
                      <div>
                        <h3 className={`font-semibold ${currentTheme.text} mb-2`}>Notes</h3>
                        <p className={`text-sm ${currentTheme.text} opacity-70`}>{selectedItem.notes}</p>
                      </div>
                    )}
                  </div>

                  {selectedItem.receiptImage && (
                    <div>
                      <h3 className={`font-semibold ${currentTheme.text} mb-2`}>Receipt</h3>
                      <img
                        src={selectedItem.receiptImage}
                        alt="Receipt"
                        className="w-full rounded-lg shadow-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this item?')) {
                        deleteInventoryItem(selectedItem.id);
                        setSelectedItem(null);
                      }
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Delete Item
                  </button>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className={`px-4 py-2 ${currentTheme.secondary} ${currentTheme.text} rounded-lg hover:shadow-lg transition-all duration-200`}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};