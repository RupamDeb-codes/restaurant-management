import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Logo from '../components/Logo';
import { ChevronLeft } from 'lucide-react';
import CTAButton from '../components/CTAButton';

const PreferencesPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const type = searchParams.get('type') || '';
  
  const [preferences, setPreferences] = useState({
    spice: 'non-spicy',
    diet: 'non-vegetarian'
  });

  const showSpiceOption = !['Dessert', 'Juices'].includes(type);

  const handleContinue = () => {
    const params = new URLSearchParams({
      type,
      ...preferences
    });
    navigate(`/menu?${params.toString()}`);
  };

  const ToggleButton = ({ 
    value, 
    options, 
    onChange 
  }: { 
    value: string, 
    options: [string, string], 
    onChange: (value: string) => void 
  }) => (
    <div className="flex gap-2 justify-center">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onChange(option)}
          className={`px-6 py-3 rounded-full text-lg font-medium transition-all duration-300
            ${value === option 
              ? 'bg-primary-600 text-white shadow-lg scale-105' 
              : 'bg-white text-amber-900 hover:bg-primary-50'}`}
        >
          {option.charAt(0).toUpperCase() + option.slice(1)}
        </button>
      ))}
    </div>
  );

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
        
        <div className="mt-12 text-center animate-fade-in">
          <h1 className="text-3xl font-bold mb-8 text-amber-900">
            Customize Your {type}
          </h1>
          
          <div className="space-y-12 mt-10">
            {showSpiceOption && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-amber-900">Spice Level</h2>
                <ToggleButton
                  value={preferences.spice}
                  options={['spicy', 'non-spicy']}
                  onChange={(value) => setPreferences(prev => ({ ...prev, spice: value }))}
                />
              </div>
            )}
            
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-amber-900">Dietary Preference</h2>
              <ToggleButton
                value={preferences.diet}
                options={['vegetarian', 'non-vegetarian']}
                onChange={(value) => setPreferences(prev => ({ ...prev, diet: value }))}
              />
            </div>
          </div>
          
          <div className="mt-12">
            <CTAButton onClick={handleContinue}>
              Continue
            </CTAButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreferencesPage;