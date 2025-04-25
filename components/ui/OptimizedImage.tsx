'use client';

import React from 'react';
import Image, { ImageProps } from 'next/image';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends Omit<ImageProps, 'alt'> {
  alt: string;
  fallbackSrc?: string;
  className?: string;
  containerClassName?: string;
  aspectRatio?: string;
}

/**
 * Optimized image component with fallback and responsive behavior
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  fallbackSrc = '/images/fallback-image.png',
  className,
  containerClassName,
  aspectRatio = 'aspect-square',
  priority = false,
  ...props
}) => {
  const [error, setError] = React.useState(false);
  
  // Handle image load error
  const handleError = () => {
    setError(true);
  };
  
  return (
    <div className={cn(
      aspectRatio,
      "relative overflow-hidden rounded-md bg-gray-100",
      containerClassName
    )}>
      <Image
        src={error ? fallbackSrc : src}
        alt={alt}
        width={width}
        height={height}
        onError={handleError}
        className={cn(
          "object-cover w-full h-full transition-opacity duration-300",
          className
        )}
        priority={priority}
        quality={85}
        {...props}
      />
    </div>
  );
};

export default OptimizedImage;
