import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { ChevronLeft, Plus, Minus, ShoppingCart } from 'lucide-react';

interface MenuItem {
  _id: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  tags: string[];
}

interface CartItem extends MenuItem {
  quantity: number;
  notes: string;
}

const MenuPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cart, setCart] = useState<Record<string, CartItem>>({});
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [itemNotes, setItemNotes] = useState<Record<string, string>>({});

  const type = searchParams.get('type') || '';
  const spice = searchParams.get('spice') || '';
  const diet = searchParams.get('diet') || '';

  useEffect(() => {
    const savedCart = localStorage.getItem('cartItems');
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      setCart(parsedCart);
      
      // Initialize quantities and notes from saved cart
      const savedQuantities: Record<string, number> = {};
      const savedNotes: Record<string, string> = {};
      Object.entries(parsedCart).forEach(([_id, item]: [string, CartItem]) => {
        savedQuantities[_id] = item.quantity;
        savedNotes[_id] = item.notes;
      });
      setQuantities(savedQuantities);
      setItemNotes(savedNotes);
    }
  }, []);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const isDessertOrJuice = type === 'Dessert' || type === 'Juices';
        const apiUrl = isDessertOrJuice
          ? `https://restaurant-management-backend-tw4c.onrender.com/api/menu?category=${type}&diet=${diet}&ts=${Date.now()}`
          : `https://restaurant-management-backend-tw4c.onrender.com/api/menu?category=${type}&spice=${spice}&diet=${diet}&ts=${Date.now()}`;

        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('Failed to fetch menu items');
        const data = await response.json();

        const filteredData = data.filter((item: MenuItem) => {
          const isVegetarian = item.tags.includes('vegetarian');
          const isSpicy = item.tags.includes('spicy');

          if (isDessertOrJuice) {
            if (diet === 'vegetarian') return isVegetarian;
            if (diet === 'non-vegetarian') return !isVegetarian;
            return true;
          }

          if (diet === 'vegetarian' && spice === 'spicy') {
            return isVegetarian && isSpicy;
          }
          if (diet === 'vegetarian' && spice === 'non-spicy') {
            return isVegetarian && !isSpicy;
          }
          if (diet === 'non-vegetarian' && spice === 'spicy') {
            return !isVegetarian && isSpicy;
          }
          if (diet === 'non-vegetarian' && spice === 'non-spicy') {
            return !isVegetarian && !isSpicy;
          }

          return true;
        });

        setMenuItems(filteredData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, [type, spice, diet]);

  const updateQuantity = (item: MenuItem, delta: number) => {
    const itemId = item._id;
    const currentQuantity = quantities[itemId] || 0;
    const newQuantity = Math.max(0, currentQuantity + delta);

    // Update quantities state
    setQuantities(prev => ({
      ...prev,
      [itemId]: newQuantity
    }));

    // Update cart state
    setCart(prev => {
      const newCart = { ...prev };
      
      if (newQuantity === 0) {
        delete newCart[itemId];
      } else {
        newCart[itemId] = {
          ...item,
          quantity: newQuantity,
          notes: itemNotes[itemId] || ''
        };
      }
      
      localStorage.setItem('cartItems', JSON.stringify(newCart));
      return newCart;
    });
  };

  const updateNotes = (itemId: string, notes: string) => {
    // Update notes state
    setItemNotes(prev => ({
      ...prev,
      [itemId]: notes
    }));

    // Update cart state if item exists
    setCart(prev => {
      if (prev[itemId]) {
        const newCart = {
          ...prev,
          [itemId]: {
            ...prev[itemId],
            notes
          }
        };
        localStorage.setItem('cartItems', JSON.stringify(newCart));
        return newCart;
      }
      return prev;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <div className="animate-pulse text-xl text-amber-900">Loading menu...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <div className="text-error-600 text-center">
          <p className="text-xl mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between py-6">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-amber-900 hover:text-primary-600 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            <span>Back</span>
          </button>
          <Logo />
          <button
            onClick={() => navigate('/review-order')}
            className="relative text-amber-900 hover:text-primary-600 transition-colors"
          >
            <ShoppingCart className="w-6 h-6" />
            {Object.keys(cart).length > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {Object.keys(cart).length}
              </span>
            )}
          </button>
        </div>

        <div className="mt-12 animate-fade-in">
          <h1 className="text-3xl font-bold mb-8 text-amber-900 text-center">
            {type} Menu
          </h1>

          {menuItems.length === 0 ? (
            <div className="text-center text-amber-900 py-12">
              <p className="text-xl">No items match your preferences.</p>
              <button
                onClick={() => navigate(-1)}
                className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
              >
                Change Preferences
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {menuItems.map((item) => (
                <div
                  key={item._id}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-semibold text-amber-900">{item.name}</h3>
                      <span className="text-lg font-medium text-primary-600">
                        ₹{item.price.toFixed(2)}
                      </span>
                    </div>

                    {item.description && (
                      <p className="text-amber-700 mb-4">{item.description}</p>
                    )}

                    <div className="flex flex-wrap gap-2 mb-4">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={() => updateQuantity(item, -1)}
                            className="p-1 rounded-full hover:bg-amber-100 text-amber-900 transition-colors"
                            disabled={!quantities[item._id]}
                          >
                            <Minus className="w-5 h-5" />
                          </button>
                          <span className="text-lg font-medium w-8 text-center">
                            {quantities[item._id] || 0}
                          </span>
                          <button
                            onClick={() => updateQuantity(item, 1)}
                            className="p-1 rounded-full hover:bg-amber-100 text-amber-900 transition-colors"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {quantities[item._id] > 0 && (
                        <textarea
                          placeholder="Add special instructions..."
                          value={itemNotes[item._id] || ''}
                          onChange={(e) => updateNotes(item._id, e.target.value)}
                          className="w-full p-2 border border-amber-200 rounded-lg text-amber-900 text-sm
                                   focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                          rows={2}
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuPage;