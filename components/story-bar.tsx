'use client';

import { useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock stories - in a real app, these would come from Supabase
const mockStories = [
  {
    id: '1',
    user: {
      id: 'user1',
      name: 'You',
      avatar: '/placeholder.svg?height=40&width=40',
    },
    viewed: false,
    isCurrentUser: true,
  },
  {
    id: '2',
    user: {
      id: 'user2',
      name: 'Alex',
      avatar: '/placeholder.svg?height=40&width=40',
    },
    viewed: false,
    isCurrentUser: false,
  },
  {
    id: '3',
    user: {
      id: 'user3',
      name: 'Sarah',
      avatar: '/placeholder.svg?height=40&width=40',
    },
    viewed: false,
    isCurrentUser: false,
  },
  {
    id: '4',
    user: {
      id: 'user4',
      name: 'Michael',
      avatar: '/placeholder.svg?height=40&width=40',
    },
    viewed: true,
    isCurrentUser: false,
  },
  {
    id: '5',
    user: {
      id: 'user5',
      name: 'Emma',
      avatar: '/placeholder.svg?height=40&width=40',
    },
    viewed: true,
    isCurrentUser: false,
  },
  {
    id: '6',
    user: {
      id: 'user6',
      name: 'David',
      avatar: '/placeholder.svg?height=40&width=40',
    },
    viewed: true,
    isCurrentUser: false,
  },
  {
    id: '7',
    user: {
      id: 'user7',
      name: 'Olivia',
      avatar: '/placeholder.svg?height=40&width=40',
    },
    viewed: true,
    isCurrentUser: false,
  },
];

export function StoryBar() {
  const scrollRef = useRef<HTMLDivElement>(null);

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

  return (
    <Card className="relative p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">Stories</h3>
        <Button variant="ghost" size="sm" className="text-xs">
          View All
        </Button>
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
          {mockStories.map(story => (
            <div key={story.id} className="flex flex-col items-center space-y-1 flex-shrink-0">
              <div
                className={cn(
                  'p-0.5 rounded-full',
                  !story.viewed
                    ? 'bg-gradient-to-tr from-pink-500 via-purple-500 to-blue-500'
                    : 'bg-muted'
                )}
              >
                <div className="p-0.5 bg-background rounded-full">
                  <Avatar className="h-16 w-16 border-2 border-background">
                    {story.isCurrentUser && (
                      <div className="absolute bottom-0 right-0 z-10 rounded-full bg-primary p-1 text-primary-foreground">
                        <Plus className="h-3 w-3" />
                      </div>
                    )}
                    <AvatarImage src={story.user.avatar} alt={story.user.name} />
                    <AvatarFallback>{story.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <span className="text-xs">{story.user.name}</span>
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
}
