'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { useInView } from 'react-intersection-observer';

interface MediaGridProps {
  userId: string;
}

// Mock media items - in a real app, these would come from Supabase
const mockMediaItems = [
  {
    id: '1',
    type: 'image',
    url: '/placeholder.svg?height=400&width=400',
    alt: 'Image 1',
  },
  {
    id: '2',
    type: 'image',
    url: '/placeholder.svg?height=400&width=400',
    alt: 'Image 2',
  },
  {
    id: '3',
    type: 'image',
    url: '/placeholder.svg?height=400&width=400',
    alt: 'Image 3',
  },
  {
    id: '4',
    type: 'image',
    url: '/placeholder.svg?height=400&width=400',
    alt: 'Image 4',
  },
  {
    id: '5',
    type: 'image',
    url: '/placeholder.svg?height=400&width=400',
    alt: 'Image 5',
  },
  {
    id: '6',
    type: 'image',
    url: '/placeholder.svg?height=400&width=400',
    alt: 'Image 6',
  },
];

export function MediaGrid({ userId }: MediaGridProps) {
  const [media, setMedia] = useState<typeof mockMediaItems>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const { ref, inView } = useInView();

  // Simulate initial loading
  useEffect(() => {
    setTimeout(() => {
      setMedia(mockMediaItems);
      setLoading(false);
    }, 1000);
  }, []);

  // Simulate loading more media when the user scrolls to the bottom
  useEffect(() => {
    if (inView && hasMore) {
      setTimeout(() => {
        setMedia(prevMedia => [
          ...prevMedia,
          ...mockMediaItems.map(item => ({
            ...item,
            id: `${item.id}-${page}`,
          })),
        ]);
        setPage(prevPage => prevPage + 1);

        // Stop infinite loading after 3 pages for this demo
        if (page >= 3) {
          setHasMore(false);
        }
      }, 1500);
    }
  }, [inView, page, hasMore]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <Skeleton key={i} className="aspect-square rounded-md" />
        ))}
      </div>
    );
  }

  if (media.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium">No media found</h3>
        <p className="text-muted-foreground mt-2">This user hasn't posted any media yet.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {media.map(item => (
          <div key={item.id} className="aspect-square relative rounded-md overflow-hidden">
            <Image
              src={item.url || '/placeholder.svg'}
              alt={item.alt}
              fill
              className="object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        ))}
      </div>

      {hasMore && (
        <div ref={ref} className="flex justify-center p-4 mt-4">
          <div className="animate-pulse flex space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <div className="w-2 h-2 bg-primary rounded-full"></div>
          </div>
        </div>
      )}
    </div>
  );
}
