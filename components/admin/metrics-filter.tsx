'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function MetricsFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const timeRanges = [
    { label: '24h', value: '1d' },
    { label: '7d', value: '7d' },
    { label: '30d', value: '30d' },
    { label: '90d', value: '90d' },
  ];

  const metrics = [
    { label: 'Users', value: 'users' },
    { label: 'Teams', value: 'teams' },
    { label: 'Tokens', value: 'tokens' },
    { label: 'Revenue', value: 'revenue' },
  ];

  const currentRange = searchParams?.get('range') || '30d';
  const currentMetrics = searchParams?.get('metrics')?.split(',') || ['users', 'teams'];

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams?.toString() || '');

    if (key === 'range') {
      params.set('range', value);
    } else if (key === 'metrics') {
      const metrics = params.get('metrics')?.split(',') || [];
      if (metrics.includes(value)) {
        params.set('metrics', metrics.filter(m => m !== value).join(','));
      } else {
        params.set('metrics', [...metrics, value].join(','));
      }
    }

    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Time Range */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-zinc-400">Time Range:</span>
        <div className="flex items-center gap-2">
          {timeRanges.map(range => (
            <Button
              key={range.value}
              variant={currentRange === range.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateFilters('range', range.value)}
            >
              {range.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Metrics */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-zinc-400">Metrics:</span>
        <div className="flex items-center gap-2">
          {metrics.map(metric => (
            <Button
              key={metric.value}
              variant={currentMetrics.includes(metric.value) ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateFilters('metrics', metric.value)}
            >
              {metric.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Export */}
      <Button variant="outline" size="sm" className="ml-auto sm:ml-0">
        <svg
          className="mr-2 h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
          />
        </svg>
        Export
      </Button>
    </div>
  );
}
