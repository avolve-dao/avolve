import { Suspense } from 'react';
import { Metadata } from 'next';
import { JourneyDashboard } from '@/components/token/journey-dashboard';
import { PageHeader } from '@/components/ui/page-header';
import { Spinner } from '@/components/ui/spinner';

export const metadata: Metadata = {
  title: 'Your Journey | Avolve',
  description: 'Track your progress through the Avolve platform and see your achievements',
};

/**
 * Journey page that displays the user's progress through the platform
 * and their achievements.
 */
export default function JourneyPage() {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <PageHeader
        title="Your Journey"
        description="Track your progress through the Avolve platform and see your achievements"
      />
      
      <Suspense fallback={<div className="flex justify-center py-12"><Spinner size="lg" /></div>}>
        <JourneyDashboard />
      </Suspense>
    </div>
  );
}
