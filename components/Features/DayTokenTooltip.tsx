import React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useFeatures } from '@/hooks/useFeatures';
import { Calendar } from 'lucide-react';

interface DayTokenTooltipProps {
  dayName: string;
  dayOfWeek: number;
  children: React.ReactNode;
}

export const DayTokenTooltip: React.FC<DayTokenTooltipProps> = ({ 
  dayName, 
  dayOfWeek,
  children 
}) => {
  const { isDayTokenUnlocked, featureStatus, getDayTokenInfo } = useFeatures();
  
  const isUnlocked = isDayTokenUnlocked(dayName.toLowerCase());
  const unlockReason = featureStatus?.dayTokens[dayName.toLowerCase()]?.unlockReason || '';
  const tokenInfo = getDayTokenInfo(dayOfWeek);

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
          <p className="font-medium">{tokenInfo.name} ({tokenInfo.symbol})</p>
          <p className="text-sm">{tokenInfo.description}</p>
          <div className={`h-1 w-full rounded mt-1 bg-gradient-to-r ${tokenInfo.gradient}`}></div>
          <p className="text-sm mt-2">
            {isUnlocked 
              ? `Available on ${tokenInfo.day}s` 
              : unlockReason}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default DayTokenTooltip;
