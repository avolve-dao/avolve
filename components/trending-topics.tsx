'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp } from 'lucide-react';
import Link from 'next/link';

// Mock trending topics - in a real app, these would come from Supabase
const mockTrendingTopics = [
  {
    id: '1',
    name: 'AI Revolution',
    category: 'Technology',
    postCount: 2453,
  },
  {
    id: '2',
    name: 'Climate Action',
    category: 'Environment',
    postCount: 1892,
  },
  {
    id: '3',
    name: 'Space Exploration',
    category: 'Science',
    postCount: 1245,
  },
  {
    id: '4',
    name: 'Quantum Computing',
    category: 'Technology',
    postCount: 987,
  },
];

export function TrendingTopics() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Trending Topics</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {mockTrendingTopics.map(topic => (
          <div key={topic.id} className="grid gap-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <Link
                  href={`/dashboard/discover?topic=${topic.name}`}
                  className="font-medium text-sm hover:underline"
                >
                  {topic.name}
                </Link>
              </div>
              <span className="text-xs text-muted-foreground">{topic.postCount} posts</span>
            </div>
            <p className="text-xs text-muted-foreground">Trending in {topic.category}</p>
          </div>
        ))}
        <Button variant="ghost" size="sm" className="w-full text-xs">
          Show More
        </Button>
      </CardContent>
    </Card>
  );
}
