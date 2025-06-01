import React from 'react';
import Logo from '../components/Logo';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const categories = [
  'Breakfast',
  'Lunch',
  'Dinner',
  'Snacks',
  'Dessert',
  'Juices',
  'ChefSpecial',
  'MostOrdered'
];

const SelectTypePage: React.FC = () => {
  const navigate = useNavigate();

  const handleCategorySelect = (category: string) => {
    navigate(`/preferences?type=${category}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between py-6">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center text-amber-900 hover:text-primary-600 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            <span>Back</span>
          </button>
          <Logo />
        </div>
        
        <div className="mt-12 text-center animate-fade-in">
          <h1 className="text-3xl font-bold mb-8 text-amber-900">What would you like to eat?</h1>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-10">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategorySelect(category)}
                className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-all duration-300 
                         hover:scale-105 transform cursor-pointer group"
              >
                <h2 className="text-xl font-semibold text-amber-900 group-hover:text-primary-600 
                             transition-colors">
                  {category}
                </h2>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectTypePage;