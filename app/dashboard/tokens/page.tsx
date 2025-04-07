import { Suspense } from 'react';
import { Metadata } from 'next';
import { TokensDashboard } from '@/components/token/tokens-dashboard';
import { PageHeader } from '@/components/ui/page-header';
import { Spinner } from '@/components/ui/spinner';

export const metadata: Metadata = {
  title: 'Your Tokens | Avolve',
  description: 'Manage your tokens and view your token balance',
};

/**
 * Tokens page that displays the user's tokens and allows them to manage them.
 */
export default function TokensPage() {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <PageHeader
        title="Your Tokens"
        description="Manage your tokens and view your token balance"
      />
      
      <Suspense fallback={<div className="flex justify-center py-12"><Spinner size="lg" /></div>}>
        <TokensDashboard />
      </Suspense>
    </div>
  );
}
