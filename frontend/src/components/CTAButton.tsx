import React from 'react';
import { ArrowRight } from 'lucide-react';

interface CTAButtonProps {
  onClick: () => void;
  children: React.ReactNode;
}

const CTAButton: React.FC<CTAButtonProps> = ({ onClick, children }) => {
  return (
    <button
      onClick={onClick}
      className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-primary-600 px-8 py-4 text-white font-medium text-lg transition-all duration-300 ease-out hover:bg-primary-700 focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 focus:outline-none transform hover:scale-105"
    >
      <span className="relative mr-2">{children}</span>
      <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
      
      <span className="absolute inset-0 h-full w-full scale-0 rounded-full bg-white/10 transition-all duration-300 group-hover:scale-100"></span>
    </button>
  );
};

export default CTAButton;