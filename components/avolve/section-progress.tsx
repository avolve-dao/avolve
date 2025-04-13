'use client';

import { useEffect, useState } from 'react';
import { getSectionsForPillar, getUserSectionProgress } from '@/lib/utils/avolve-db';
import type { Section, UserSectionProgress } from '@/lib/types/database.types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface SectionProgressProps {
  pillarId: string;
  userId: string;
}

export function SectionProgress({ pillarId, userId }: SectionProgressProps) {
  const [sections, setSections] = useState<Section[]>([]);
  const [progress, setProgress] = useState<Record<string, UserSectionProgress | null>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        
        // Load sections for the pillar
        const sectionsData = await getSectionsForPillar(pillarId);
        setSections(sectionsData || []);
        
        // Load progress for each section
        const progressData: Record<string, UserSectionProgress | null> = {};
        
        for (const section of sectionsData) {
          try {
            const sectionProgress = await getUserSectionProgress(userId, section.id);
            progressData[section.id] = sectionProgress;
          } catch (err) {
            // If no progress exists yet, that's okay
            progressData[section.id] = null;
          }
        }
        
        setProgress(progressData);
        setError(null);
      } catch (err) {
        console.error('Error loading section data:', err);
        setError('Failed to load section data. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    if (pillarId && userId) {
      loadData();
    }
  }, [pillarId, userId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Sections</h2>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="w-full">
            <CardHeader>
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-2 w-full" />
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

  function getProgressPercentage(status: string): number {
    switch (status) {
      case 'not_started':
        return 0;
      case 'in_progress':
        return 50;
      case 'completed':
        return 100;
      default:
        return 0;
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'not_started':
        return <Badge variant="outline">Not Started</Badge>;
      case 'in_progress':
        return <Badge variant="secondary">In Progress</Badge>;
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      default:
        return <Badge variant="outline">Not Started</Badge>;
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Sections</h2>
      {sections.length === 0 ? (
        <p className="text-gray-500">No sections found for this pillar.</p>
      ) : (
        <div className="space-y-4">
          {sections.map((section) => {
            const sectionProgress = progress[section.id];
            const progressValue = sectionProgress ? getProgressPercentage(sectionProgress.status) : 0;
            
            return (
              <Card key={section.id} className="w-full">
                <CardHeader>
                  <CardTitle>{section.title}</CardTitle>
                  {section.subtitle && <CardDescription>{section.subtitle}</CardDescription>}
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">{section.description || 'No description available'}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Progress</span>
                      {sectionProgress ? getStatusBadge(sectionProgress.status) : <Badge variant="outline">Not Started</Badge>}
                    </div>
                    <Progress value={progressValue} className="h-2" />
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="text-sm text-gray-500">
                    {sectionProgress?.started_at ? (
                      <span>Started: {new Date(sectionProgress.started_at).toLocaleDateString()}</span>
                    ) : (
                      <span>Not started yet</span>
                    )}
                    {sectionProgress?.completed_at && (
                      <span className="ml-4">Completed: {new Date(sectionProgress.completed_at).toLocaleDateString()}</span>
                    )}
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
