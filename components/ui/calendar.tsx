'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

export type CalendarProps = Record<string, unknown>;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  // Placeholder: DayPicker removed for security and bloat reasons
  return (
    <div className={typeof className === 'string' ? className : undefined}>
      Calendar component unavailable (DayPicker dependency removed).
    </div>
  );
}

Calendar.displayName = 'Calendar';

export { Calendar };
