'use client';

import { Coins, Star, Trophy, Target, Gift } from 'lucide-react';

interface TokenIconProps {
  type: string;
  className?: string;
}

export function TokenIcon({ type, className = 'w-8 h-8 text-primary' }: TokenIconProps) {
  switch (type.toUpperCase()) {
    case 'GEN':
      return <Star className={className} />;
    case 'SAP':
    case 'PSP':
    case 'BSP':
      return <Trophy className={className} />;
    case 'SMS':
    case 'SCQ':
    case 'SPD':
      return <Target className={className} />;
    case 'SHE':
    case 'SSA':
    case 'SGB':
      return <Gift className={className} />;
    default:
      return <Coins className={className} />;
  }
}
