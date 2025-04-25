'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { goldenSpiralPath, PHI, AVOLVE_SACRED_PATTERNS } from '@/lib/sacred-geometry';

interface SacredSpiralProps extends React.SVGAttributes<SVGSVGElement> {
  section?: keyof typeof AVOLVE_SACRED_PATTERNS;
  size?: number;
  turns?: number;
  animated?: boolean;
  strokeWidth?: number;
  fillOpacity?: number;
}

/**
 * SacredSpiral component that renders a golden spiral based on the
 * golden ratio (φ), which appears throughout nature and sacred geometry.
 */
export function SacredSpiral({
  section = 'superachiever',
  size = 200,
  turns = 4,
  animated = true,
  strokeWidth = 2,
  fillOpacity = 0.1,
  className,
  ...props
}: SacredSpiralProps) {
  const pattern = AVOLVE_SACRED_PATTERNS[section];
  const [rotation, setRotation] = useState(0);

  // Generate the golden spiral path
  const spiralPath = goldenSpiralPath(size / 2, size / 2, size / 3, turns);

  // Animation effect
  useEffect(() => {
    if (!animated) return;

    let animationFrame: number;
    let startTime: number | null = null;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;

      // Complete one full rotation every 10 seconds
      setRotation(((elapsed / 10000) * 360) % 360);

      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [animated]);

  // Extract colors from gradient class
  const getGradientColors = () => {
    const gradientClass = pattern.gradient;
    const fromMatch = gradientClass.match(/from-([a-z]+-\d+)/);
    const viaMatch = gradientClass.match(/via-([a-z]+-\d+)/);
    const toMatch = gradientClass.match(/to-([a-z]+-\d+)/);

    return {
      from: fromMatch ? fromMatch[1] : 'zinc-500',
      via: viaMatch ? viaMatch[1] : undefined,
      to: toMatch ? toMatch[1] : 'zinc-700',
    };
  };

  const colors = getGradientColors();

  // Convert Tailwind color classes to CSS variables
  const getTailwindColor = (colorClass: string) => {
    return `var(--tw-${colorClass.replace('-', '-')})`;
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={cn('overflow-visible', className)}
      style={{
        transform: `rotate(${rotation}deg)`,
        transition: 'transform 0.1s linear',
      }}
      {...props}
    >
      <defs>
        <linearGradient id={`spiral-gradient-${section}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" className={`text-${colors.from}`} stopColor="currentColor" />
          {colors.via && (
            <stop offset="50%" className={`text-${colors.via}`} stopColor="currentColor" />
          )}
          <stop offset="100%" className={`text-${colors.to}`} stopColor="currentColor" />
        </linearGradient>

        {/* Fibonacci-based dash pattern */}
        <pattern id="fibonacci-dash" patternUnits="userSpaceOnUse" width="13" height="13">
          <line
            x1="0"
            y1="6.5"
            x2="13"
            y2="6.5"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="1,2,3,5,8"
          />
        </pattern>
      </defs>

      {/* Background sacred geometry pattern */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={size / 2 - strokeWidth}
        fill="none"
        stroke={`url(#spiral-gradient-${section})`}
        strokeWidth={strokeWidth / 2}
        strokeOpacity={0.3}
        strokeDasharray="1,2,3,5,8,13,21"
      />

      {/* Golden spiral path */}
      <path
        d={spiralPath}
        fill="none"
        stroke={`url(#spiral-gradient-${section})`}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Fibonacci circles at key points */}
      {[1, 2, 3, 5, 8, 13, 21].map((fib, index) => {
        const scaledFib = (fib / 21) * (size / 3);
        const angle = index * (PHI * Math.PI);
        const x = size / 2 + Math.cos(angle) * scaledFib * 2;
        const y = size / 2 + Math.sin(angle) * scaledFib * 2;

        return (
          <circle
            key={fib}
            cx={x}
            cy={y}
            r={scaledFib / 3}
            fill={`url(#spiral-gradient-${section})`}
            fillOpacity={fillOpacity}
            stroke={`url(#spiral-gradient-${section})`}
            strokeWidth={strokeWidth / 2}
          />
        );
      })}
    </svg>
  );
}
