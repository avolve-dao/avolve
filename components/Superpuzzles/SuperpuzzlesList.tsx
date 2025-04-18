"use client";

import React, { useEffect } from 'react';
import { useSuperpuzzles } from '@/hooks/useSuperpuzzles';
import SuperpuzzleCard from './SuperpuzzleCard';
import { Button } from '@/components/ui/button';
import { PuzzleIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter } from 'next/navigation';

interface SuperpuzzlesListProps {
  showTodayOnly?: boolean;
  teamId?: string;
  contributions?: unknown[];
  showContributeButton?: boolean;
}

// Define interfaces for the formatted superpuzzle items
interface ContributionData {
  id: string;
  points: number;
  isCompleted: boolean;
  progress: number;
}

interface FormattedSuperpuzzleItem {
  superpuzzle: unknown;
  contribution?: ContributionData;
}

export const SuperpuzzlesList: React.FC<SuperpuzzlesListProps> = ({
  showTodayOnly = false,
  teamId,
  contributions,
  showContributeButton = false
}) => {
  const router = useRouter();
  const { 
    loading, 
    activeSuperpuzzles, 
    todaySuperpuzzles, 
    loadActiveSuperpuzzles, 
    loadTodaySuperpuzzles,
    getTokenNameForDay
  } = useSuperpuzzles();

  useEffect(() => {
    if (showTodayOnly) {
      loadTodaySuperpuzzles();
    } else if (!contributions) {
      loadActiveSuperpuzzles();
    }
  }, [showTodayOnly, contributions, loadActiveSuperpuzzles, loadTodaySuperpuzzles]);

  const superpuzzlesToDisplay = contributions || (showTodayOnly ? todaySuperpuzzles : activeSuperpuzzles);

  if (loading && superpuzzlesToDisplay.length === 0) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border rounded-lg p-4">
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2 mb-4" />
            <Skeleton className="h-20 w-full mb-4" />
            <div className="flex justify-between">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // For team contributions, we need to format the data differently
  const formattedSuperpuzzles: FormattedSuperpuzzleItem[] = contributions 
    ? contributions.map(contribution => ({
        contribution: {
          id: contribution.id,
          points: contribution.points,
          isCompleted: contribution.isCompleted,
          progress: contribution.progress
        },
        superpuzzle: contribution.superpuzzle
      }))
    : superpuzzlesToDisplay.map((superpuzzle: unknown) => ({ superpuzzle }));

  // Split into active and completed
  const activeItems = formattedSuperpuzzles.filter(item => 
    !(item.contribution?.isCompleted ?? false) && item.superpuzzle.status !== 'completed'
  );
  
  const completedItems = formattedSuperpuzzles.filter(item => 
    (item.contribution?.isCompleted ?? false) || item.superpuzzle.status === 'completed'
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          {showTodayOnly 
            ? `Today&apos;s Superpuzzles: ${getTokenNameForDay(new Date().getDay())}` 
            : 'Superpuzzles'}
        </h2>
        {!showTodayOnly && !contributions && (
          <Button 
            onClick={() => router.push('/superpuzzles/today')}
            variant="outline"
          >
            View Today&apos;s Superpuzzles
          </Button>
        )}
      </div>

      {superpuzzlesToDisplay.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-slate-50">
          <PuzzleIcon className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-4 text-lg font-medium">No superpuzzles found</h3>
          <p className="mt-2 text-sm text-slate-500">
            {showTodayOnly 
              ? "There are no superpuzzles available for today." 
              : contributions 
                ? "This team hasn&apos;t contributed to any superpuzzles yet."
                : "There are no active superpuzzles available at the moment."}
          </p>
          {!showTodayOnly && (
            <Button 
              onClick={() => router.push('/superpuzzles')}
              variant="outline" 
              className="mt-4"
            >
              Browse All Superpuzzles
            </Button>
          )}
        </div>
      ) : (
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active">
              Active ({activeItems.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedItems.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="active" className="mt-6">
            {activeItems.length === 0 ? (
              <div className="text-center py-12 border rounded-lg bg-slate-50">
                <PuzzleIcon className="mx-auto h-12 w-12 text-slate-400" />
                <h3 className="mt-4 text-lg font-medium">No active superpuzzles</h3>
                <p className="mt-2 text-sm text-slate-500">
                  All superpuzzles have been completed!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeItems.map((item) => (
                  <SuperpuzzleCard 
                    key={item.superpuzzle.id} 
                    superpuzzle={item.superpuzzle} 
                    contribution={item.contribution}
                    showContributeButton={showContributeButton}
                    teamId={teamId}
                  />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="completed" className="mt-6">
            {completedItems.length === 0 ? (
              <div className="text-center py-12 border rounded-lg bg-slate-50">
                <PuzzleIcon className="mx-auto h-12 w-12 text-slate-400" />
                <h3 className="mt-4 text-lg font-medium">No completed superpuzzles</h3>
                <p className="mt-2 text-sm text-slate-500">
                  Start contributing to superpuzzles to see them here when completed.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedItems.map((item) => (
                  <SuperpuzzleCard 
                    key={item.superpuzzle.id} 
                    superpuzzle={item.superpuzzle} 
                    contribution={item.contribution}
                    teamId={teamId}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default SuperpuzzlesList;
