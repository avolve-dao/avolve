'use client';

import { useState, useEffect } from 'react';
import { Post } from '@/components/post';
import { Skeleton } from '@/components/ui/skeleton';
import { useInView } from 'react-intersection-observer';

interface LikedPostsProps {
  userId: string;
}

// Mock liked posts - in a real app, these would come from Supabase
const mockLikedPosts = [
  {
    id: 'liked1',
    content: 'This is an amazing post about design principles. #design #ux',
    media: ['/placeholder.svg?height=400&width=600'],
    createdAt: new Date().toISOString(),
    user: {
      id: 'user8',
      name: 'Design Guru',
      avatar: '/placeholder.svg?height=40&width=40',
    },
    likeCount: 42,
    commentCount: 7,
    liked: true,
  },
  {
    id: 'liked2',
    content: 'Just released a new open-source project! Check it out on GitHub. #opensource #coding',
    media: [],
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    user: {
      id: 'user9',
      name: 'Code Master',
      avatar: '/placeholder.svg?height=40&width=40',
    },
    likeCount: 36,
    commentCount: 5,
    liked: true,
  },
];

export function LikedPosts({ userId }: LikedPostsProps) {
  const [posts, setPosts] = useState<typeof mockLikedPosts>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const { ref, inView } = useInView();

  // Simulate initial loading
  useEffect(() => {
    setTimeout(() => {
      setPosts(mockLikedPosts);
      setLoading(false);
    }, 1000);
  }, []);

  // Simulate loading more posts when the user scrolls to the bottom
  useEffect(() => {
    if (inView && hasMore) {
      setTimeout(() => {
        setPosts(prevPosts => [
          ...prevPosts,
          ...mockLikedPosts.map(post => ({
            ...post,
            id: `${post.id}-${page}`,
            content: `${post.content} (Page ${page})`,
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

  const handleLike = (postId: string) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? {
              ...post,
              liked: !post.liked,
              likeCount: post.liked ? post.likeCount - 1 : post.likeCount + 1,
            }
          : post
      )
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2].map(i => (
          <div key={i} className="rounded-xl border bg-card text-card-foreground shadow">
            <div className="p-6 space-y-4">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[150px]" />
                </div>
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-[200px] w-full rounded-md" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium">No liked posts</h3>
        <p className="text-muted-foreground mt-2">You haven't liked any posts yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map(post => (
        <Post key={post.id} post={post} currentUserId={userId} onLike={handleLike} />
      ))}

      {hasMore && (
        <div ref={ref} className="flex justify-center p-4">
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
