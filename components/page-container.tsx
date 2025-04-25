'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface PageContainerProps {
  children: React.ReactNode;
  title: string | React.ReactNode;
  subtitle?: string;
  className?: string;
  showHeader?: boolean;
}

export function PageContainer({
  children,
  title,
  subtitle,
  className,
  showHeader = true,
}: PageContainerProps) {
  return (
    <div className={cn('w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6', className)}>
      {showHeader && (title || subtitle) && (
        <motion.div
          className="mb-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-2">{title}</h1>
          {subtitle && (
            <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">{subtitle}</p>
          )}
        </motion.div>
      )}
      <motion.div
        className="w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
      >
        {children}
      </motion.div>
    </div>
  );
}

export function PageSection({
  children,
  className,
  title,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <motion.section
      className={cn('mb-10', className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {title && (
        <h2 className="text-2xl font-semibold mb-4 text-zinc-900 dark:text-zinc-50">{title}</h2>
      )}
      {children}
    </motion.section>
  );
}

export function PageCard({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <motion.div
      className={cn(
        'bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200/50 dark:border-zinc-800/50 p-6 transition-all duration-200',
        onClick &&
          'cursor-pointer hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700',
        className
      )}
      whileHover={onClick ? { scale: 1.01 } : {}}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

export function PageGrid({
  children,
  className,
  columns = 3,
}: {
  children: React.ReactNode;
  className?: string;
  columns?: 1 | 2 | 3 | 4;
}) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return <div className={cn('grid gap-6', gridCols[columns], className)}>{children}</div>;
}
