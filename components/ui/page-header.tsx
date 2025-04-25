'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  actionsClassName?: string;
}

export function PageHeader({
  title,
  description,
  actions,
  className,
  titleClassName,
  descriptionClassName,
  actionsClassName,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col space-y-2 pb-8 pt-6 md:flex-row md:items-center md:justify-between md:space-y-0',
        className
      )}
    >
      <div>
        <h1 className={cn('text-3xl font-bold tracking-tight', titleClassName)}>{title}</h1>
        {description && (
          <p className={cn('text-muted-foreground', descriptionClassName)}>{description}</p>
        )}
      </div>
      {actions && (
        <div className={cn('flex items-center space-x-2', actionsClassName)}>{actions}</div>
      )}
    </div>
  );
}
