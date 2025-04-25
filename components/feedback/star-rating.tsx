'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function StarRating({ value, onChange, max = 5, size = 'md' }: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  // Size mappings
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  // Handle mouse enter on a star
  const handleMouseEnter = (starValue: number) => {
    setHoverValue(starValue);
  };

  // Handle mouse leave
  const handleMouseLeave = () => {
    setHoverValue(null);
  };

  // Handle click on a star
  const handleClick = (starValue: number) => {
    onChange(starValue);
  };

  // Determine if a star should be filled
  const isFilled = (starValue: number) => {
    if (hoverValue !== null) {
      return starValue <= hoverValue;
    }
    return starValue <= value;
  };

  return (
    <div className="flex items-center space-x-1" onMouseLeave={handleMouseLeave}>
      {Array.from({ length: max }, (_, i) => i + 1).map(starValue => (
        <Star
          key={starValue}
          className={cn(
            sizeClasses[size],
            'cursor-pointer transition-all duration-150',
            isFilled(starValue) ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'
          )}
          onMouseEnter={() => handleMouseEnter(starValue)}
          onClick={() => handleClick(starValue)}
        />
      ))}
    </div>
  );
}
