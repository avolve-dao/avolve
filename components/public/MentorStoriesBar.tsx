// This file is deprecated. All mentor stories functionality has been replaced by UserAdminStoriesBar. Safe to delete.

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MentorStory {
  id: string;
  mentor_name: string;
  avatar_url?: string;
  story: string;
  context?: string; // e.g., canvas:123, experiment:456
}

interface MentorStoriesBarProps {
  context?: string; // Optionally filter by context (canvas or experiment)
}

const MentorStoriesBar: React.FC<MentorStoriesBarProps> = ({ context }) => {
  const [stories, setStories] = useState<MentorStory[]>([]);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch mentor stories from Supabase, filtered by context if provided
    const fetchStories = async () => {
      // @ts-ignore: supabase import path
      const { supabase } = await import('../../lib/supabaseClient');
      let query = supabase.from('mentor_stories').select('*').order('created_at', { ascending: false });
      if (context) {
        query = query.ilike('context', `%${context}%`);
      }
      const { data, error } = await query;
      if (!error) setStories(data || []);
    };
    fetchStories();
  }, [context]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = 200;
      if (direction === 'left') {
        current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  if (stories.length === 0) return null;

  return (
    <Card className="relative p-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">Mentor Stories</h3>
      </div>
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm shadow-sm"
          onClick={() => scroll('left')}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div
          ref={scrollRef}
          className="flex space-x-4 overflow-x-auto scrollbar-hide py-2 px-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {stories.map((story) => (
            <div key={story.id} className="flex flex-col items-center space-y-2 flex-shrink-0 w-64">
              <div className="p-0.5 rounded-full bg-gradient-to-tr from-zinc-500 via-blue-500 to-emerald-500">
                <div className="p-0.5 bg-background rounded-full">
                  <Avatar className="h-12 w-12 border-2 border-background">
                    {story.avatar_url ? (
                      <AvatarImage src={story.avatar_url} alt={story.mentor_name} />
                    ) : (
                      <AvatarFallback>{story.mentor_name.charAt(0)}</AvatarFallback>
                    )}
                  </Avatar>
                </div>
              </div>
              <span className="text-xs font-semibold">{story.mentor_name}</span>
              <div className="text-xs text-muted-foreground text-center line-clamp-4">{story.story}</div>
            </div>
          ))}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm shadow-sm"
          onClick={() => scroll('right')}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};

export default MentorStoriesBar;
