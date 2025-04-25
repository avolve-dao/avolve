'use client';

import React from 'react';
import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface CustomTooltipProps {
  content: string;
  children?: React.ReactNode;
}

/**
 * User-friendly tooltip component that shows information on hover
 */
export const CustomTooltip: React.FC<CustomTooltipProps> = ({ content, children }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center cursor-help">
            {children || <Info className="h-4 w-4 text-gray-500 hover:text-gray-700" />}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default CustomTooltip;
