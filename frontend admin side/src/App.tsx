import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, AlertCircle, Package, Wifi, WifiOff, BarChart3, ChefHat } from 'lucide-react';
import { OrderCard, Order, OrderStatus } from './components/OrderCard';
import { FilterTabs } from './components/FilterTabs';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ToastContainer } from './components/Toast';
import { Analytics } from './components/Analytics';
import { MenuManagement } from './components/MenuManagement';
import { useToast } from './hooks/useToast';
import { fetchOrders, updateOrderStatus } from './services/api';

type ActiveTab = 'orders' | 'analytics' | 'menu';

function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [activeFilter, setActiveFilter] = useState<'All' | OrderStatus>('All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { toasts, addToast, removeToast } = useToast();

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadOrders = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      const fetchedOrders = await fetchOrders();
      setOrders(fetchedOrders);
      
      if (isRefresh) {
        addToast('success', `Loaded ${fetchedOrders.length} orders successfully`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load orders';
      setError(errorMessage);
      addToast('error', errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [addToast]);

  useEffect(() => {
    if (activeTab === 'orders') {
      loadOrders();
    }
  }, [loadOrders, activeTab]);

  useEffect(() => {
    if (activeFilter === 'All') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(order => order.status === activeFilter));
    }
  }, [orders, activeFilter]);

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      
      addToast('success', `Order #${orderId.slice(-6)} status updated to ${newStatus}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update order status';
      addToast('error', errorMessage);
    }
  };

  const handleRefresh = () => {
    if (!isOnline) {
      addToast('error', 'No internet connection. Please check your network and try again.');
      return;
    }
    loadOrders(true);
  };

  const getOrderCounts = () => {
    const counts = {
      All: orders.length,
      Placed: orders.filter(o => o.status === 'Placed').length,
      Preparing: orders.filter(o => o.status === 'Preparing').length,
      Ready: orders.filter(o => o.status === 'Ready').length,
      Delivered: orders.filter(o => o.status === 'Delivered').length
    };
    return counts;
  };

  if (activeTab === 'analytics') {
    return (
      <div className="min-h-screen bg-gray-50">
        <ToastContainer toasts={toasts} onClose={removeToast} />
        
        {/* Tab Navigation */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab('orders')}
                className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Orders
                </div>
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className="py-4 px-1 border-b-2 border-blue-500 text-blue-600 font-medium text-sm"
              >
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Analytics
                </div>
              </button>
              <button
                onClick={() => setActiveTab('menu')}
                className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm transition-colors"
              >
                <div className="flex items-center gap-2">
                  <ChefHat className="w-4 h-4" />
                  Menu
                </div>
              </button>
            </div>
          </div>
        </div>

        <Analytics />
      </div>
    );
  }

  if (activeTab === 'menu') {
    return (
      <div className="min-h-screen bg-gray-50">
        <ToastContainer toasts={toasts} onClose={removeToast} />
        
        {/* Tab Navigation */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab('orders')}
                className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Orders
                </div>
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm transition-colors"
              >
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Analytics
                </div>
              </button>
              <button
                onClick={() => setActiveTab('menu')}
                className="py-4 px-1 border-b-2 border-green-500 text-green-600 font-medium text-sm"
              >
                <div className="flex items-center gap-2">
                  <ChefHat className="w-4 h-4" />
                  Menu
                </div>
              </button>
            </div>
          </div>
        </div>

        <MenuManagement />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <LoadingSpinner />
            <p className="mt-4 text-gray-600">Loading orders from restaurant backend...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer toasts={toasts} onClose={removeToast} />
      
      {/* Tab Navigation */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('orders')}
              className="py-4 px-1 border-b-2 border-blue-500 text-blue-600 font-medium text-sm"
            >
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Orders
              </div>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm transition-colors"
            >
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Analytics
              </div>
            </button>
            <button
              onClick={() => setActiveTab('menu')}
              className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm transition-colors"
            >
              <div className="flex items-center gap-2">
                <ChefHat className="w-4 h-4" />
                Menu
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Restaurant Admin Dashboard</h1>
                <div className="flex items-center gap-2 text-gray-600">
                  <span>Manage your restaurant orders</span>
                  <div className="flex items-center gap-1">
                    {isOnline ? (
                      <Wifi className="w-4 h-4 text-green-500" />
                    ) : (
                      <WifiOff className="w-4 h-4 text-red-500" />
                    )}
                    <span className={`text-xs ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                      {isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm text-gray-500">Total Orders</div>
                <div className="text-2xl font-bold text-gray-900">{orders.length}</div>
              </div>
              <button
                onClick={handleRefresh}
                disabled={refreshing || !isOnline}
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
        {/* Filter Tabs */}
        <div className="mb-8">
          <FilterTabs
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            orderCounts={getOrderCounts()}
          />
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Error loading orders</span>
            </div>
            <p className="text-red-700 mt-1">{error}</p>
            <button
              onClick={() => loadOrders()}
              disabled={!isOnline}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Offline Warning */}
        {!isOnline && (
          <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-yellow-800">
              <WifiOff className="w-5 h-5" />
              <span className="font-medium">You're offline</span>
            </div>
            <p className="text-yellow-700 mt-1">
              Some features may not work properly. Please check your internet connection.
            </p>
          </div>
        )}

        {/* Orders Grid */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600">
              {activeFilter === 'All' 
                ? orders.length === 0 
                  ? 'No orders available at the moment. Orders will appear here when customers place them.'
                  : 'No orders available at the moment.'
                : `No orders with status "${activeFilter}" found.`
              }
            </p>
            {orders.length === 0 && (
              <button
                onClick={() => loadOrders(true)}
                disabled={!isOnline}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                Refresh Orders
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrders.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                onStatusUpdate={handleStatusUpdate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;