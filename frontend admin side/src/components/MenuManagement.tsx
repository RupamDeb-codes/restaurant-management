import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  RefreshCw,
  ChefHat,
  DollarSign,
  Tag,
  Leaf,
  Flame,
  Clock,
  Search,
  Filter,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';
import { useToast } from '../hooks/useToast';
import {
  fetchMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleMenuItemAvailability,
  MenuItem,
  CreateMenuItemData,
  UpdateMenuItemData,
  HttpError
} from '../services/menu';

const CATEGORIES = ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Dessert', 'Juices'];
const TAGS = ['spicy','non-spicy',  'vegetarian', 'non-vegetarian'];

interface MenuFormData {
  name: string;
  category: string;
  price: string;
  tags: string[];
  ingredients: string;
  available: boolean;
}

const initialFormData: MenuFormData = {
  name: '',
  category: 'Breakfast',
  price: '',
  tags: [],
  ingredients: '',
  available: true,
};

function formatCurrency(amount: number | undefined | null): string {
  const validAmount = Number(amount) || 0;
  return `₹${validAmount.toFixed(2)}`;
}

export function MenuManagement() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form states
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<MenuFormData>(initialFormData);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('All');
  
  // Toggle states for individual items
  const [togglingItems, setTogglingItems] = useState<Set<string>>(new Set());
  
  const { addToast } = useToast();

  const loadMenuItems = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      const items = await fetchMenuItems();
      setMenuItems(items);
      
      if (isRefresh) {
        addToast('success', `Loaded ${items.length} menu items successfully`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load menu items';
      setError(errorMessage);
      addToast('error', errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMenuItems();
  }, []);

  // Filter menu items based on search and filters
  useEffect(() => {
    let filtered = menuItems;

    // Search filter - FIXED: Added proper null/undefined checks
    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();
      filtered = filtered.filter(item => {
        // Check item name
        const nameMatch = item.name?.toLowerCase().includes(searchTermLower);
        
        // Check ingredients with proper validation
        const ingredientsMatch = Array.isArray(item.ingredients) && 
          item.ingredients.some(ingredient => 
            ingredient && typeof ingredient === 'string' && 
            ingredient.toLowerCase().includes(searchTermLower)
          );
        
        return nameMatch || ingredientsMatch;
      });
    }

    // Category filter
    if (categoryFilter !== 'All') {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }

    // Availability filter
    if (availabilityFilter !== 'All') {
      filtered = filtered.filter(item => 
        availabilityFilter === 'Available' ? item.available : !item.available
      );
    }

    setFilteredItems(filtered);
  }, [menuItems, searchTerm, categoryFilter, availabilityFilter]);

  const handleRefresh = () => {
    loadMenuItems(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.price) {
      addToast('error', 'Please fill in all required fields');
      return;
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      addToast('error', 'Please enter a valid price');
      return;
    }

    setFormLoading(true);
    
    try {
      const menuItemData = {
        name: formData.name.trim(),
        category: formData.category,
        price: price,
        tags: formData.tags,
        ingredients: formData.ingredients
          .split(',')
          .map(ingredient => ingredient.trim())
          .filter(ingredient => ingredient.length > 0),
        available: formData.available,
      };

      if (editingItem) {
        // Update existing item
        const updatedItem = await updateMenuItem(editingItem._id, menuItemData);
        setMenuItems(prev => 
          prev.map(item => item._id === editingItem._id ? updatedItem : item)
        );
        addToast('success', `Menu item "${formData.name}" updated successfully`);
      } else {
        // Create new item
        const newItem = await createMenuItem(menuItemData);
        setMenuItems(prev => [...prev, newItem]);
        addToast('success', `Menu item "${formData.name}" created successfully`);
      }

      // Reset form
      setFormData(initialFormData);
      setEditingItem(null);
      setShowForm(false);
    } catch (err) {
      if (err instanceof HttpError && err.status === 404) {
        // Item was not found - remove it from local state and show specific message
        if (editingItem) {
          setMenuItems(prev => prev.filter(item => item._id !== editingItem._id));
          addToast('error', `Menu item "${formData.name}" was not found. It may have been deleted by another user.`);
          // Reset form since the item no longer exists
          setFormData(initialFormData);
          setEditingItem(null);
          setShowForm(false);
        }
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Failed to save menu item';
        addToast('error', errorMessage);
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      price: item.price.toString(),
      tags: item.tags || [],
      ingredients: Array.isArray(item.ingredients) ? item.ingredients.join(', ') : '',
      available: item.available,
    });
    setShowForm(true);
  };

  const handleDelete = async (item: MenuItem) => {
    if (!confirm(`Are you sure you want to delete "${item.name}"?`)) {
      return;
    }

    try {
      await deleteMenuItem(item._id);
      setMenuItems(prev => prev.filter(menuItem => menuItem._id !== item._id));
      addToast('success', `Menu item "${item.name}" deleted successfully`);
    } catch (err) {
      if (err instanceof HttpError && err.status === 404) {
        // Item was already deleted - remove it from local state
        setMenuItems(prev => prev.filter(menuItem => menuItem._id !== item._id));
        addToast('error', `Menu item "${item.name}" was not found. It may have already been deleted.`);
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete menu item';
        addToast('error', errorMessage);
      }
    }
  };

  const handleAvailabilityToggle = async (item: MenuItem) => {
    if (togglingItems.has(item._id)) return;

    setTogglingItems(prev => new Set(prev).add(item._id));
    
    try {
      const updatedItem = await toggleMenuItemAvailability(item._id, !item.available);
      setMenuItems(prev => 
        prev.map(menuItem => menuItem._id === item._id ? updatedItem : menuItem)
      );
      addToast('success', `"${item.name}" is now ${updatedItem.available ? 'available' : 'unavailable'}`);
    } catch (err) {
      if (err instanceof HttpError && err.status === 404) {
        // Item was deleted - remove it from local state
        setMenuItems(prev => prev.filter(menuItem => menuItem._id !== item._id));
        addToast('error', `Menu item "${item.name}" was not found. It may have been deleted.`);
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update availability';
        addToast('error', errorMessage);
      }
    } finally {
      setTogglingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(item._id);
        return newSet;
      });
    }
  };

  const handleCancelForm = () => {
    setFormData(initialFormData);
    setEditingItem(null);
    setShowForm(false);
  };

  const handleTagChange = (tag: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      tags: checked 
        ? [...prev.tags, tag]
        : prev.tags.filter(t => t !== tag)
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <LoadingSpinner />
            <p className="mt-4 text-gray-600">Loading menu items...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <ChefHat className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
                <p className="text-gray-600">Manage your restaurant menu items</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm text-gray-500">Total Items</div>
                <div className="text-2xl font-bold text-gray-900">{menuItems.length}</div>
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </button>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error State */}
        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-800">
              <span className="font-medium">Error loading menu items</span>
            </div>
            <p className="text-red-700 mt-1">{error}</p>
            <button
              onClick={() => loadMenuItems()}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Add/Edit Form */}
        {showForm && (
          <div className="mb-8 bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h2>
              <button
                onClick={handleCancelForm}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter item name"
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    {CATEGORIES.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0.00"
                    required
                  />
                </div>

                {/* Available Toggle */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Availability
                  </label>
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, available: !prev.available }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        formData.available ? 'bg-green-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          formData.available ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <span className="ml-3 text-sm text-gray-700">
                      {formData.available ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-3">
                  {TAGS.map(tag => (
                    <label key={tag} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.tags.includes(tag)}
                        onChange={(e) => handleTagChange(tag, e.target.checked)}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 capitalize">{tag}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Ingredients */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ingredients
                </label>
                <textarea
                  value={formData.ingredients}
                  onChange={(e) => setFormData(prev => ({ ...prev, ingredients: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter ingredients separated by commas"
                  rows={3}
                />
                <p className="text-xs text-gray-500 mt-1">Separate ingredients with commas</p>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {formLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {formLoading ? 'Saving...' : editingItem ? 'Update Item' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 bg-white rounded-lg shadow-md border border-gray-200 p-4">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Search menu items..."
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="All">All Categories</option>
                {CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Availability Filter */}
            <div>
              <select
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="All">All Items</option>
                <option value="Available">Available Only</option>
                <option value="Unavailable">Unavailable Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Menu Items List */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <ChefHat className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No menu items found</h3>
            <p className="text-gray-600">
              {menuItems.length === 0 
                ? 'Start by adding your first menu item.'
                : 'Try adjusting your search or filters.'
              }
            </p>
            {menuItems.length === 0 && (
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Add First Item
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map(item => (
              <div key={item._id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                {/* Item Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Tag className="w-4 h-4" />
                      <span>{item.category}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAvailabilityToggle(item)}
                      disabled={togglingItems.has(item._id)}
                      className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                        item.available 
                          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      } ${togglingItems.has(item._id) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      {togglingItems.has(item._id) ? (
                        <div className="animate-spin rounded-full h-3 w-3 border border-current border-t-transparent" />
                      ) : item.available ? (
                        <ToggleRight className="w-3 h-3" />
                      ) : (
                        <ToggleLeft className="w-3 h-3" />
                      )}
                      {item.available ? 'Available' : 'Unavailable'}
                    </button>
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl font-bold text-gray-900">{formatCurrency(item.price)}</span>
                </div>

                {/* Tags */}
                {Array.isArray(item.tags) && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {item.tags.map(tag => (
                      <span key={tag} className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        tag === 'spicy' ? 'bg-red-100 text-red-800' :
                        tag === 'vegetarian' ? 'bg-green-100 text-green-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {tag === 'spicy' && <Flame className="w-3 h-3" />}
                        {tag === 'vegetarian' && <Leaf className="w-3 h-3" />}
                        <span className="capitalize">{tag}</span>
                      </span>
                    ))}
                  </div>
                )}

                {/* Ingredients - FIXED: Added null check */}
                {Array.isArray(item.ingredients) && item.ingredients.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-1">Ingredients:</p>
                    <p className="text-sm text-gray-800">
                      {item.ingredients.filter(ingredient => ingredient && typeof ingredient === 'string').join(', ')}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleEdit(item)}
                    className="flex items-center gap-1 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    className="flex items-center gap-1 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}