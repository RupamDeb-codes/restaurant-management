import React, { useState } from 'react';
import { Clock, User, Package, IndianRupee, FileText } from 'lucide-react';

export type OrderStatus = 'Placed' | 'Preparing' | 'Ready' | 'Delivered';

export interface OrderItem {
  menuItem: {
    name: string;
    price: number;
  } | null;
  quantity: number;
  notes?: string;
}

export interface Order {
  id: string;
  customerName: string;
  status: OrderStatus;
  createdAt: string;
  items: OrderItem[];
  total: number;
}

interface OrderCardProps {
  order: Order;
  onStatusUpdate: (orderId: string, newStatus: OrderStatus) => Promise<void>;
}

const statusColors = {
  Placed: 'bg-blue-100 text-blue-800 border-blue-200',
  Preparing: 'bg-orange-100 text-orange-800 border-orange-200',
  Ready: 'bg-green-100 text-green-800 border-green-200',
  Delivered: 'bg-gray-100 text-gray-800 border-gray-200'
};

const statusOptions: OrderStatus[] = ['Placed', 'Preparing', 'Ready', 'Delivered'];

function formatCurrency(amount: number | undefined | null): string {
  const validAmount = Number(amount) || 0;
  return `₹${validAmount.toFixed(2)}`;
}

function formatTimeAgo(dateString: string): string {
  const now = new Date();
  const orderTime = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(orderTime.getTime())) {
    return 'Unknown time';
  }
  
  const diffInMinutes = Math.floor((now.getTime() - orderTime.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} mins ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} days ago`;
}

function formatFullTimestamp(dateString: string): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return 'Invalid date';
  }
  return date.toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

function isRecentOrder(dateString: string): boolean {
  const now = new Date();
  const orderTime = new Date(dateString);
  const diffInMinutes = Math.floor((now.getTime() - orderTime.getTime()) / (1000 * 60));
  return diffInMinutes <= 30; // Consider orders within 30 minutes as recent
}

export function OrderCard({ order, onStatusUpdate }: OrderCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (newStatus === order.status) return;
    
    setIsUpdating(true);
    try {
      await onStatusUpdate(order.id, newStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  const validItems = order.items.filter(item => item.menuItem && item.menuItem.name);
  const isRecent = isRecentOrder(order.createdAt);

  return (
    <div className={`bg-white rounded-lg shadow-md border p-6 hover:shadow-lg transition-all duration-200 ${
      isRecent ? 'border-blue-300 ring-2 ring-blue-100' : 'border-gray-200'
    }`}>
      {/* Recent order indicator */}
      {isRecent && (
        <div className="mb-3">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            🔥 Recent Order
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-gray-100 p-2 rounded-lg">
            <Package className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Order #{order.id.slice(-6)}</h3>
            <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
              <User className="w-4 h-4" />
              <span>{order.customerName}</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          <span 
            className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[order.status]}`}
          >
            {order.status}
          </span>
          <div 
            className="flex items-center gap-1 text-xs text-gray-500 cursor-help"
            title={formatFullTimestamp(order.createdAt)}
          >
            <Clock className="w-3 h-3" />
            <span>{formatTimeAgo(order.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="space-y-3 mb-4">
        <h4 className="font-medium text-gray-900 text-sm">Order Items:</h4>
        {validItems.length > 0 ? (
          validItems.map((item, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{item.menuItem!.name}</span>
                    <span className="text-sm text-gray-500">x{item.quantity}</span>
                  </div>
                  {item.notes && (
                    <div className="flex items-center gap-1 mt-1 text-sm text-gray-600">
                      <FileText className="w-3 h-3" />
                      <span className="italic">{item.notes}</span>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">
                    {formatCurrency(item.menuItem!.price)} ea.
                  </div>
                  <div className="font-medium text-gray-900">
                    {formatCurrency(item.menuItem!.price * item.quantity)}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-600">No valid items found in this order</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <div className="flex items-center gap-1 text-lg font-semibold text-gray-900">
          <IndianRupee className="w-5 h-5" />
          <span>{formatCurrency(order.total)}</span>
        </div>
        
        <div className="flex items-center gap-2">
          {isUpdating && (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
          )}
          <select
            value={order.status}
            onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
            disabled={isUpdating}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {statusOptions.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}