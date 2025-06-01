import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { ChevronLeft, Trash2 } from 'lucide-react';
import CTAButton from '../components/CTAButton';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  notes: string;
}

interface OrderPayload {
  customerName: string;
  items: {
    menuItem: string;
    quantity: number;
    notes: string;
  }[];
}

const ReviewOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<Record<string, CartItem>>({});
  const [customerName, setCustomerName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderStatus, setOrderStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  useEffect(() => {
    const savedCart = localStorage.getItem('cartItems');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  const totalAmount = Object.values(cartItems).reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleRemoveItem = (itemId: string) => {
    const newCart = { ...cartItems };
    delete newCart[itemId];
    setCartItems(newCart);
    localStorage.setItem('cartItems', JSON.stringify(newCart));
  };

  const handlePlaceOrder = async () => {
    if (!customerName.trim()) {
      setOrderStatus({
        type: 'error',
        message: 'Please enter your name',
      });
      return;
    }

    if (Object.keys(cartItems).length === 0) {
      setOrderStatus({
        type: 'error',
        message: 'Your cart is empty',
      });
      return;
    }

    const orderPayload: OrderPayload = {
      customerName: customerName.trim(),
      items: Object.values(cartItems).map(item => ({
        menuItem: item.id,
        quantity: item.quantity,
        notes: item.notes,
      })),
    };

    setIsSubmitting(true);
    setOrderStatus({ type: null, message: '' });

    try {
      const response = await fetch(
        'https://restaurant-management-backend-tw4c.onrender.com/api/order/place',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(orderPayload),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to place order');
      }

      setOrderStatus({
        type: 'success',
        message: 'Order placed successfully!',
      });
      
      // Clear cart after successful order
      localStorage.removeItem('cartItems');
      setCartItems({});
      
    } catch (error) {
      setOrderStatus({
        type: 'error',
        message: 'Failed to place order. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between py-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-amber-900 hover:text-primary-600 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            <span>Back</span>
          </button>
          <Logo />
        </div>

        <div className="mt-12 animate-fade-in">
          <h1 className="text-3xl font-bold mb-8 text-amber-900 text-center">
            Review Your Order
          </h1>

          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="mb-6">
              <label
                htmlFor="customerName"
                className="block text-sm font-medium text-amber-900 mb-2"
              >
                Your Name
              </label>
              <input
                type="text"
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-amber-200 focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                placeholder="Enter your name"
              />
            </div>

            {Object.keys(cartItems).length === 0 ? (
              <div className="text-center py-8 text-amber-900">
                <p className="text-lg mb-4">Your cart is empty</p>
                <button
                  onClick={() => navigate('/select-type')}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Browse Menu
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.values(cartItems).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between p-4 border border-amber-100 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-amber-900">
                          {item.name}
                        </h3>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-error-600 hover:text-error-700 p-1"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="text-amber-700 mb-2">
                        Quantity: {item.quantity} × ₹{item.price.toFixed(2)}
                      </div>
                      {item.notes && (
                        <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
                          Note: {item.notes}
                        </div>
                      )}
                      <div className="text-right text-lg font-medium text-primary-600 mt-2">
                        ₹{(item.quantity * item.price).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}

                <div className="border-t border-amber-200 pt-4 mt-6">
                  <div className="flex justify-between items-center text-xl font-semibold text-amber-900">
                    <span>Total Amount:</span>
                    <span>₹{totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {orderStatus.message && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                orderStatus.type === 'success'
                  ? 'bg-success-100 text-success-700'
                  : 'bg-error-100 text-error-700'
              }`}
            >
              {orderStatus.message}
            </div>
          )}

          <div className="flex justify-center">
            <CTAButton onClick={handlePlaceOrder}>
              {isSubmitting ? 'Placing Order...' : 'Place Order'}
            </CTAButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewOrderPage;