import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type StoryType = 'user' | 'admin';

interface UserAdminStory {
  id: string;
  type: StoryType; // 'user' or 'admin'
  author_name: string;
  avatar_url?: string;
  story: string;
  context?: string; // e.g., canvas:123, experiment:456
}

interface UserAdminStoriesBarProps {
  context?: string; // Optionally filter by context (canvas or experiment)
  showTypes?: StoryType[]; // Optionally filter by story type
}

const UserAdminStoriesBar: React.FC<UserAdminStoriesBarProps> = ({ context, showTypes }) => {
  const [stories, setStories] = useState<UserAdminStory[]>([]);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch user/admin stories from Supabase, filtered by context and type if provided
    const fetchStories = async () => {
      // @ts-ignore: supabase import path
      const { supabase } = await import('../../lib/supabaseClient');
      let query = supabase.from('user_admin_stories').select('*').order('created_at', { ascending: false });
      if (context) {
        query = query.ilike('context', `%${context}%`);
      }
      if (showTypes && showTypes.length > 0) {
        query = query.in('type', showTypes);
      }
      const { data, error } = await query;
      if (!error) setStories(data || []);
    };
    fetchStories();
  }, [context, showTypes]);

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
        <h3 className="text-sm font-medium">{showTypes && showTypes.length === 1 ? (showTypes[0] === 'admin' ? 'Admin Stories' : 'User Stories') : 'Stories'}</h3>
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
              <div className={cn(
                'p-0.5 rounded-full',
                story.type === 'admin'
                  ? 'bg-gradient-to-tr from-blue-500 via-zinc-500 to-emerald-500'
                  : 'bg-gradient-to-tr from-amber-400 via-pink-400 to-emerald-300'
              )}>
                <div className="p-0.5 bg-background rounded-full">
                  <Avatar className="h-12 w-12 border-2 border-background">
                    {story.avatar_url ? (
                      <AvatarImage src={story.avatar_url} alt={story.author_name} />
                    ) : (
                      <AvatarFallback>{story.author_name.charAt(0)}</AvatarFallback>
                    )}
                  </Avatar>
                </div>
              </div>
              <span className="text-xs font-semibold">{story.author_name}</span>
              <span className={cn(
                'text-xs',
                story.type === 'admin' ? 'text-blue-600 font-bold' : 'text-amber-600 font-bold'
              )}>{story.type === 'admin' ? 'Admin Story' : 'User Story'}</span>
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

export default UserAdminStoriesBar;
