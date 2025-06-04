import React from 'react';

const FoodImage: React.FC = () => {
  return (
    <div className="relative w-full h-full animate-float">
      <img 
        src="https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=500" 
        alt="Delicious food" 
        className="w-full h-full object-cover rounded-full shadow-xl"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-primary-600/40 rounded-full"></div>
    </div>
  );
};

export default FoodImage;