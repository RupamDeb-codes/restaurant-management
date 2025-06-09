import { Order, OrderStatus } from '../components/OrderCard';

const API_BASE_URL = 'https://restaurant-management-backend-tw4c.onrender.com';

// Helper function to add delay between retries
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function fetchOrders(): Promise<Order[]> {
  const maxRetries = 3;
  const retryDelay = 2000; // 2 seconds
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/order/admin`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Handle different possible response structures
      const orders = Array.isArray(data) ? data : (data.orders || data.data || []);
      
      // Filter out invalid orders and transform data structure
      const validOrders = orders
        .filter((order: any) => {
          // Check if order has valid items
          if (!order.items || !Array.isArray(order.items) || order.items.length === 0) {
            return false;
          }
          
          // Check if at least one item has a valid menuItem
          return order.items.some((item: any) => 
            item.menuItem && 
            typeof item.menuItem === 'object' && 
            item.menuItem.name
          );
        })
        .map((order: any): Order => ({
          id: order._id || order.id || 'Unknown',
          customerName: order.customerName || order.customer?.name || 'Unknown Customer',
          status: mapStatus(order.status),
          createdAt: order.createdAt || order.orderDate || new Date().toISOString(),
          items: order.items.map((item: any) => ({
            menuItem: item.menuItem ? {
              name: item.menuItem.name || 'Unknown Item',
              price: Number(item.menuItem.price) || 0
            } : null,
            quantity: Number(item.quantity) || 1,
            notes: item.notes || item.specialInstructions || undefined
          })),
          total: calculateTotal(order.items) || Number(order.total) || Number(order.totalAmount) || 0
        }));
      
      return validOrders;
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);
      
      // If this is the last attempt, throw the error
      if (attempt === maxRetries) {
        console.error('All retry attempts failed:', error);
        throw new Error('Failed to load orders. Please check your connection and try again.');
      }
      
      // Wait before retrying (with exponential backoff)
      const waitTime = retryDelay * attempt;
      console.log(`Retrying in ${waitTime}ms... (attempt ${attempt + 1}/${maxRetries})`);
      await delay(waitTime);
    }
  }
  
  // This should never be reached, but TypeScript requires it
  throw new Error('Unexpected error in fetchOrders');
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/order/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: status.toLowerCase() })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    console.log(`Order ${orderId} status updated to ${status}`);
  } catch (error) {
    console.error('Failed to update order status:', error);
    throw new Error('Failed to update order status. Please try again.');
  }
}

// Helper function to map various status formats to our standard format
function mapStatus(status: string): OrderStatus {
  if (!status) return 'Placed';
  
  const normalizedStatus = status.toLowerCase().trim();
  
  switch (normalizedStatus) {
    case 'placed':
    case 'pending':
    case 'new':
      return 'Placed';
    case 'preparing':
    case 'cooking':
    case 'in_progress':
    case 'inprogress':
      return 'Preparing';
    case 'ready':
    case 'completed':
    case 'done':
      return 'Ready';
    case 'delivered':
    case 'served':
    case 'fulfilled':
      return 'Delivered';
    default:
      return 'Placed';
  }
}

// Helper function to calculate total from items
function calculateTotal(items: any[]): number {
  if (!Array.isArray(items)) return 0;
  
  return items.reduce((total, item) => {
    const price = Number(item.menuItem?.price) || 0;
    const quantity = Number(item.quantity) || 1;
    return total + (price * quantity);
  }, 0);
}