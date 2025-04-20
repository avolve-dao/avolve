'use client';

import React, { JSX, CSSProperties } from 'react';

// Define consistent spacing scale
export const spacing = {
  0: '0',
  0.5: '0.125rem', // 2px
  1: '0.25rem',    // 4px
  1.5: '0.375rem', // 6px
  2: '0.5rem',     // 8px
  2.5: '0.625rem', // 10px
  3: '0.75rem',    // 12px
  3.5: '0.875rem', // 14px
  4: '1rem',       // 16px
  5: '1.25rem',    // 20px
  6: '1.5rem',     // 24px
  7: '1.75rem',    // 28px
  8: '2rem',       // 32px
  9: '2.25rem',    // 36px
  10: '2.5rem',    // 40px
  11: '2.75rem',   // 44px
  12: '3rem',      // 48px
  14: '3.5rem',    // 56px
  16: '4rem',      // 64px
  20: '5rem',      // 80px
  24: '6rem',      // 96px
  28: '7rem',      // 112px
  32: '8rem',      // 128px
  36: '9rem',      // 144px
  40: '10rem',     // 160px
  44: '11rem',     // 176px
  48: '12rem',     // 192px
  52: '13rem',     // 208px
  56: '14rem',     // 224px
  60: '15rem',     // 240px
  64: '16rem',     // 256px
  72: '18rem',     // 288px
  80: '20rem',     // 320px
  96: '24rem',     // 384px
};

// Define typography scale
export const typography = {
  fontSizes: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
    '6xl': '3.75rem',  // 60px
    '7xl': '4.5rem',   // 72px
    '8xl': '6rem',     // 96px
    '9xl': '8rem',     // 128px
  },
  fontWeights: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
  lineHeights: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
  letterSpacings: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
};

// Define consistent border radius scale
export const borderRadius = {
  none: '0',
  sm: '0.125rem',    // 2px
  DEFAULT: '0.25rem', // 4px
  md: '0.375rem',    // 6px
  lg: '0.5rem',      // 8px
  xl: '0.75rem',     // 12px
  '2xl': '1rem',     // 16px
  '3xl': '1.5rem',   // 24px
  full: '9999px',
};

// Define consistent shadow scale
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  none: 'none',
};

// Define consistent z-index scale
export const zIndex = {
  0: '0',
  10: '10',
  20: '20',
  30: '30',
  40: '40',
  50: '50',
  auto: 'auto',
};

// Typography components with consistent styling
interface HeadingProps {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
  className?: string;
  weight?: keyof typeof typography.fontWeights;
}

export function Heading({ 
  level = 1, 
  children, 
  className = '',
  weight = 'bold'
}: HeadingProps) {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  
  const sizeMap = {
    1: typography.fontSizes['4xl'],
    2: typography.fontSizes['3xl'],
    3: typography.fontSizes['2xl'],
    4: typography.fontSizes.xl,
    5: typography.fontSizes.lg,
    6: typography.fontSizes.base,
  };
  
  const style = {
    fontSize: sizeMap[level],
    fontWeight: typography.fontWeights[weight],
    lineHeight: typography.lineHeights.tight,
  };
  
  return (
    <Tag className={className} style={style}>
      {children}
    </Tag>
  );
}

interface TextProps {
  children: React.ReactNode;
  size?: keyof typeof typography.fontSizes;
  weight?: keyof typeof typography.fontWeights;
  className?: string;
  muted?: boolean;
}

export function Text({ 
  children, 
  size = 'base', 
  weight = 'normal',
  className = '',
  muted = false
}: TextProps) {
  const style = {
    fontSize: typography.fontSizes[size],
    fontWeight: typography.fontWeights[weight],
    lineHeight: typography.lineHeights.normal,
    color: muted ? 'var(--muted-foreground)' : 'inherit',
  };
  
  return (
    <p className={className} style={style}>
      {children}
    </p>
  );
}

// Spacing components
interface SpacerProps {
  size?: keyof typeof spacing;
  axis?: 'horizontal' | 'vertical';
  className?: string;
}

export function Spacer({ 
  size = 4, 
  axis = 'vertical',
  className = ''
}: SpacerProps) {
  const width = axis === 'horizontal' ? spacing[size] : '100%';
  const height = axis === 'vertical' ? spacing[size] : '100%';
  
  return (
    <div 
      className={className}
      style={{
        width,
        height,
        minWidth: width,
        minHeight: height,
      }}
    />
  );
}

interface ContainerProps {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | 'none';
  padding?: keyof typeof spacing;
  className?: string;
}

export function Container({ 
  children, 
  maxWidth = 'lg',
  padding = 4,
  className = ''
}: ContainerProps) {
  const maxWidthMap = {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
    full: '100%',
    none: 'none',
  };
  
  const style = {
    maxWidth: maxWidthMap[maxWidth],
    padding: spacing[padding],
    margin: '0 auto',
    width: '100%',
  };
  
  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
}

// Grid components
interface GridProps {
  children: React.ReactNode;
  columns?: number;
  gap?: keyof typeof spacing;
  className?: string;
}

export function Grid({ 
  children, 
  columns = 1,
  gap = 4,
  className = ''
}: GridProps) {
  const style = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
    gap: spacing[gap],
  };
  
  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
}

// Flex components
interface FlexProps {
  children: React.ReactNode;
  direction?: 'row' | 'column';
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  gap?: keyof typeof spacing;
  wrap?: boolean;
  className?: string;
}

export function Flex({ 
  children, 
  direction = 'row',
  align = 'start',
  justify = 'start',
  gap = 4,
  wrap = false,
  className = ''
}: FlexProps) {
  const alignMap = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    stretch: 'stretch',
    baseline: 'baseline',
  };
  
  const justifyMap = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    between: 'space-between',
    around: 'space-around',
    evenly: 'space-evenly',
  };
  
  const style: React.CSSProperties = {
    display: 'flex',
    flexDirection: direction,
    alignItems: alignMap[align],
    justifyContent: justifyMap[justify],
    gap: spacing[gap],
    flexWrap: wrap ? ('wrap' as React.CSSProperties['flexWrap']) : ('nowrap' as React.CSSProperties['flexWrap']),
  };
  
  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
}
