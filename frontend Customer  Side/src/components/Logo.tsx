import React from 'react';
import { Utensils } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
}

const Logo: React.FC<LogoProps> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
  };
  
  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-7 h-7',
  };

  return (
    <div className="flex items-center animate-pulse-subtle">
      <Utensils className={`${iconSizes[size]} text-primary-600 mr-2`} />
      <span className={`font-bold ${sizeClasses[size]}`}>
        <span className="text-amber-900">Taste</span>
      </span>
    </div>
  );
};

export default Logo;