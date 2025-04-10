'use client';

import React from 'react';

// Define token color system
export const tokenColors = {
  // Primary token
  GEN: {
    primary: '#3b82f6', // blue-500
    secondary: '#1d4ed8', // blue-700
    background: 'rgba(59, 130, 246, 0.1)', // blue-500 with 10% opacity
    border: 'rgba(59, 130, 246, 0.3)', // blue-500 with 30% opacity
    text: '#93c5fd', // blue-300
    icon: '/tokens/gen.svg'
  },
  
  // Utility tokens
  SAP: {
    primary: '#8b5cf6', // violet-500
    secondary: '#6d28d9', // violet-700
    background: 'rgba(139, 92, 246, 0.1)', // violet-500 with 10% opacity
    border: 'rgba(139, 92, 246, 0.3)', // violet-500 with 30% opacity
    text: '#c4b5fd', // violet-300
    icon: '/tokens/sap.svg'
  },
  PSP: {
    primary: '#ec4899', // pink-500
    secondary: '#be185d', // pink-700
    background: 'rgba(236, 72, 153, 0.1)', // pink-500 with 10% opacity
    border: 'rgba(236, 72, 153, 0.3)', // pink-500 with 30% opacity
    text: '#f9a8d4', // pink-300
    icon: '/tokens/psp.svg'
  },
  BSP: {
    primary: '#10b981', // emerald-500
    secondary: '#047857', // emerald-700
    background: 'rgba(16, 185, 129, 0.1)', // emerald-500 with 10% opacity
    border: 'rgba(16, 185, 129, 0.3)', // emerald-500 with 30% opacity
    text: '#6ee7b7', // emerald-300
    icon: '/tokens/bsp.svg'
  },
  SMS: {
    primary: '#f59e0b', // amber-500
    secondary: '#b45309', // amber-700
    background: 'rgba(245, 158, 11, 0.1)', // amber-500 with 10% opacity
    border: 'rgba(245, 158, 11, 0.3)', // amber-500 with 30% opacity
    text: '#fcd34d', // amber-300
    icon: '/tokens/sms.svg'
  },
  SCQ: {
    primary: '#ef4444', // red-500
    secondary: '#b91c1c', // red-700
    background: 'rgba(239, 68, 68, 0.1)', // red-500 with 10% opacity
    border: 'rgba(239, 68, 68, 0.3)', // red-500 with 30% opacity
    text: '#fca5a5', // red-300
    icon: '/tokens/scq.svg'
  },
  SPD: {
    primary: '#06b6d4', // cyan-500
    secondary: '#0e7490', // cyan-700
    background: 'rgba(6, 182, 212, 0.1)', // cyan-500 with 10% opacity
    border: 'rgba(6, 182, 212, 0.3)', // cyan-500 with 30% opacity
    text: '#67e8f9', // cyan-300
    icon: '/tokens/spd.svg'
  },
  SHE: {
    primary: '#84cc16', // lime-500
    secondary: '#4d7c0f', // lime-700
    background: 'rgba(132, 204, 22, 0.1)', // lime-500 with 10% opacity
    border: 'rgba(132, 204, 22, 0.3)', // lime-500 with 30% opacity
    text: '#bef264', // lime-300
    icon: '/tokens/she.svg'
  },
  SSA: {
    primary: '#7c3aed', // purple-600
    secondary: '#5b21b6', // purple-800
    background: 'rgba(124, 58, 237, 0.1)', // purple-600 with 10% opacity
    border: 'rgba(124, 58, 237, 0.3)', // purple-600 with 30% opacity
    text: '#c4b5fd', // purple-300
    icon: '/tokens/ssa.svg'
  },
  SGB: {
    primary: '#2dd4bf', // teal-400
    secondary: '#0f766e', // teal-700
    background: 'rgba(45, 212, 191, 0.1)', // teal-400 with 10% opacity
    border: 'rgba(45, 212, 191, 0.3)', // teal-400 with 30% opacity
    text: '#5eead4', // teal-300
    icon: '/tokens/sgb.svg'
  }
};

// Token badge component with consistent styling
interface TokenBadgeProps {
  tokenType: string;
  amount?: number;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function TokenBadge({ 
  tokenType, 
  amount, 
  showIcon = true, 
  size = 'md',
  className = '' 
}: TokenBadgeProps) {
  const token = tokenColors[tokenType as keyof typeof tokenColors] || tokenColors.GEN;
  
  const sizeClasses = {
    sm: 'text-xs py-0.5 px-1.5',
    md: 'text-sm py-1 px-2',
    lg: 'text-base py-1.5 px-3'
  };
  
  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };
  
  return (
    <span 
      className={`inline-flex items-center rounded-full font-medium ${sizeClasses[size]} ${className}`}
      style={{ 
        backgroundColor: token.background,
        borderColor: token.border,
        color: token.primary,
        borderWidth: '1px',
        borderStyle: 'solid'
      }}
    >
      {showIcon && (
        <img 
          src={token.icon} 
          alt={tokenType} 
          className={`${iconSizes[size]} mr-1`}
        />
      )}
      {tokenType}
      {amount !== undefined && (
        <span className="ml-1 font-bold">{amount}</span>
      )}
    </span>
  );
}

// Token icon component
interface TokenIconProps {
  tokenType: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function TokenIcon({ 
  tokenType, 
  size = 'md',
  className = '' 
}: TokenIconProps) {
  const token = tokenColors[tokenType as keyof typeof tokenColors] || tokenColors.GEN;
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };
  
  return (
    <div 
      className={`flex items-center justify-center rounded-full ${sizeClasses[size]} ${className}`}
      style={{ 
        backgroundColor: token.background,
        borderColor: token.border,
        borderWidth: '1px',
        borderStyle: 'solid'
      }}
    >
      <img 
        src={token.icon} 
        alt={tokenType} 
        className="w-2/3 h-2/3"
      />
    </div>
  );
}

// Token button component
interface TokenButtonProps {
  tokenType: string;
  children: React.ReactNode;
  variant?: 'solid' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export function TokenButton({ 
  tokenType, 
  children, 
  variant = 'solid',
  size = 'md',
  onClick,
  className = '',
  disabled = false
}: TokenButtonProps) {
  const token = tokenColors[tokenType as keyof typeof tokenColors] || tokenColors.GEN;
  
  const sizeClasses = {
    sm: 'text-xs py-1 px-2 rounded-md',
    md: 'text-sm py-2 px-3 rounded-md',
    lg: 'text-base py-2.5 px-4 rounded-md'
  };
  
  const getVariantStyles = () => {
    switch (variant) {
      case 'solid':
        return {
          backgroundColor: disabled ? '#374151' : token.primary,
          borderColor: disabled ? '#374151' : token.secondary,
          color: disabled ? '#6b7280' : 'white',
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: disabled ? '#374151' : token.primary,
          color: disabled ? '#6b7280' : token.primary,
        };
      case 'ghost':
        return {
          backgroundColor: disabled ? 'transparent' : token.background,
          borderColor: 'transparent',
          color: disabled ? '#6b7280' : token.primary,
        };
      default:
        return {};
    }
  };
  
  return (
    <button 
      className={`inline-flex items-center justify-center font-medium transition-colors ${sizeClasses[size]} border ${className}`}
      style={getVariantStyles()}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

// Token card component
interface TokenCardProps {
  tokenType: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function TokenCard({ 
  tokenType, 
  title, 
  description, 
  children,
  className = '' 
}: TokenCardProps) {
  const token = tokenColors[tokenType as keyof typeof tokenColors] || tokenColors.GEN;
  
  return (
    <div 
      className={`rounded-lg border p-4 ${className}`}
      style={{ 
        borderColor: token.border,
        backgroundColor: token.background,
      }}
    >
      <div className="flex items-start mb-3">
        <TokenIcon tokenType={tokenType} className="mr-3" />
        <div>
          <h3 className="font-medium" style={{ color: token.primary }}>{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}
