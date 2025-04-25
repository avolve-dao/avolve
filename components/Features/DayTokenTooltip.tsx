import React, { useState, useEffect } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useFeatures } from '@/hooks/useFeatures';
import { Calendar } from 'lucide-react';

interface DayTokenTooltipProps {
  dayName: string;
  dayOfWeek: number;
  children: React.ReactNode;
}

interface TokenInfo {
  symbol: string;
  name: string;
  description: string;
  day: string;
  dayOfWeek: number;
  gradient: string;
}

export const DayTokenTooltip: React.FC<DayTokenTooltipProps> = ({
  dayName,
  dayOfWeek,
  children,
}) => {
  const { isDayTokenUnlocked, featureStatus, getDayTokenInfo } = useFeatures();

  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTokenInfo = async () => {
      try {
        setLoading(true);
        const info = await getDayTokenInfo(dayOfWeek);
        setTokenInfo(info);
      } catch (error) {
        console.error('Failed to fetch token info', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTokenInfo();
  }, [dayOfWeek, getDayTokenInfo]);

  const isUnlocked = isDayTokenUnlocked(dayName.toLowerCase());
  const unlockReason = featureStatus?.dayTokens[dayName.toLowerCase()]?.unlockReason || '';

  if (loading) {
    return <div className="relative cursor-pointer">{children}</div>;
  }

  if (!tokenInfo) {
    return <div className="relative cursor-pointer">{children}</div>;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative cursor-pointer">
            {children}
            {!isUnlocked && (
              <div className="absolute top-0 right-0 -mt-1 -mr-1">
                <Calendar className="h-4 w-4 text-amber-500" />
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="font-medium">
            {tokenInfo.name} ({tokenInfo.symbol})
          </p>
          <p className="text-sm">{tokenInfo.description}</p>
          <div className={`h-1 w-full rounded mt-1 bg-gradient-to-r ${tokenInfo.gradient}`}></div>
          <p className="text-sm mt-2">
            {isUnlocked ? `Available on ${tokenInfo.day}s` : unlockReason}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default DayTokenTooltip;
