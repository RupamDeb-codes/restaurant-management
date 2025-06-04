import React from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import CTAButton from '../components/CTAButton';
import FoodImage from '../components/FoodImage';

const GetStartedPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/select-type');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 text-amber-900 p-4 overflow-hidden">
      <div className="absolute top-8 left-8 z-10">
        <Logo />
      </div>
      
      <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
        <div className="animate-fade-in-up delay-300">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 tracking-tight leading-tight">
            Delicious Food<br className="md:hidden" /> 
            <span className="text-primary-600">Delivered</span> to You
          </h1>
          
          <p className="text-lg sm:text-xl md:text-2xl mb-10 opacity-90 leading-relaxed">
            Your culinary adventure starts here. Order from your favorite restaurants with just a few taps.
          </p>
          
          <div className="mt-8">
            <CTAButton onClick={handleGetStarted}>
              Get Started
            </CTAButton>
          </div>
        </div>
      </div>
      
      <div className="absolute -bottom-16 -right-16 md:right-0 md:bottom-0 w-80 h-80 md:w-96 md:h-96 opacity-50 md:opacity-70 pointer-events-none">
        <FoodImage />
      </div>
      
      <div className="absolute bottom-4 left-0 right-0 text-center text-sm opacity-70">
        © 2025 Taste Restaurant
      </div>
    </div>
  );
};

export default GetStartedPage;