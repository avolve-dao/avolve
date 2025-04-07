'use client';

import { useEffect, useState } from 'react';
import { getPillars } from '@/lib/utils/avolve-db';
import type { Pillar } from '@/lib/types/database.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function PillarList() {
  const [pillars, setPillars] = useState<Pillar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPillars() {
      try {
        setLoading(true);
        const data = await getPillars();
        setPillars(data || []);
        setError(null);
      } catch (err) {
        console.error('Error loading pillars:', err);
        setError('Failed to load pillars. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    loadPillars();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Avolve Pillars</h2>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="w-full">
            <CardHeader>
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-md">
        <h2 className="text-xl font-bold">Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Avolve Pillars</h2>
      {pillars.length === 0 ? (
        <p className="text-gray-500">No pillars found. Please run the seed script to populate the database.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pillars.map((pillar) => (
            <Card key={pillar.id} className={`w-full ${pillar.gradient_class || 'bg-gradient-to-r from-blue-500 to-purple-500'}`}>
              <CardHeader>
                <CardTitle className="text-white">{pillar.title}</CardTitle>
                {pillar.subtitle && <CardDescription className="text-white/80">{pillar.subtitle}</CardDescription>}
              </CardHeader>
              <CardContent>
                <p className="text-white/90">{pillar.description || 'No description available'}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
