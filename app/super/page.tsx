import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import React from 'react';

export default async function SuperPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="flex flex-col min-h-screen p-4 md:p-6">
      <h1 className="text-3xl font-bold mb-6">Superachiever Hub</h1>
      <div className="bg-card rounded-lg shadow-md p-6 border border-border">
        <h2 className="text-2xl font-semibold mb-4">Welcome, {user.email || 'Superachiever'}!</h2>
        <p className="text-muted-foreground mb-6">This is your central hub for personal and collective transformation. Choose your path below:</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a href="/super/individual" className="block bg-primary/10 hover:bg-primary/20 transition-colors rounded-lg p-4 text-center">
            <h3 className="text-lg font-medium text-primary">Individual Growth</h3>
            <p className="text-sm text-muted-foreground">Focus on personal success and superpowers.</p>
          </a>
          <a href="/super/collective" className="block bg-primary/10 hover:bg-primary/20 transition-colors rounded-lg p-4 text-center">
            <h3 className="text-lg font-medium text-primary">Collective Impact</h3>
            <p className="text-sm text-muted-foreground">Join forces for superhuman advancements.</p>
          </a>
          <a href="/super/ecosystem" className="block bg-primary/10 hover:bg-primary/20 transition-colors rounded-lg p-4 text-center">
            <h3 className="text-lg font-medium text-primary">Ecosystem Genesis</h3>
            <p className="text-sm text-muted-foreground">Contribute to the supercivilization.</p>
          </a>
        </div>
      </div>
    </div>
  );
}
