import React from 'react';
import TeamsList from '@/components/Teams/TeamsList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const metadata = {
  title: 'Teams | Avolve',
  description: 'Join or create teams to collaborate on superpuzzles and earn rewards together',
};

export default function TeamsPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Teams</h1>
      <p className="text-slate-600 mb-8">
        Teams allow Superachievers to collaborate on superpuzzles and earn SCQ tokens together.
        Join an existing team or create your own after completing 10 challenges.
      </p>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="all">All Teams</TabsTrigger>
          <TabsTrigger value="my">My Teams</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <TeamsList showJoinButtons={true} userTeamsOnly={false} />
        </TabsContent>
        
        <TabsContent value="my">
          <TeamsList showJoinButtons={false} userTeamsOnly={true} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
