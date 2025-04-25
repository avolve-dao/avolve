'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { clientDb } from '@/lib/db';
import { Post } from '@/components/post';
import { Skeleton } from '@/components/ui/skeleton';
import { useInView } from 'react-intersection-observer';
import dynamic from 'next/dynamic';

// Dynamic import for the error component to reduce initial bundle size
const ErrorDisplay = dynamic(() => import('@/components/error-display'), {
  loading: () => <div className="p-6 text-center">Loading error display...</div>,
  ssr: false,
});

interface PostFeedProps {
  userId?: string;
  initialPosts?: any[];
}

const POSTS_PER_PAGE = 5;

export function PostFeed({ userId, initialPosts = [] }: PostFeedProps) {
  const [posts, setPosts] = useState<any[]>(initialPosts);
  const [loading, setLoading] = useState(!initialPosts.length);
  const [page, setPage] = useState(initialPosts.length ? 1 : 0);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadingRef = useRef(false);
  const supabase = createClient();

  const { ref, inView } = useInView({
    threshold: 0.1,
    rootMargin: '200px',
  });

  const loadMorePosts = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;

    loadingRef.current = true;
    try {
      setLoading(true);
      setError(null);

      const { data: newPosts, error } = await supabase
        .from('posts')
        .select(
          `
          *,
          profiles:user_id (
            id,
            username,
            full_name,
            avatar_url
          )
        `
        )
        .order('created_at', { ascending: false })
        .range(page * POSTS_PER_PAGE, (page + 1) * POSTS_PER_PAGE - 1);

      if (error) {
        console.error('Error loading posts:', error);
        setError('Failed to load posts. Please try again later.');
        return;
      }

      if (newPosts.length === 0) {
        setHasMore(false);
        return;
      }

      // Process posts in batches to avoid blocking the main thread
      const processedPosts = await processPosts(newPosts, userId);

      setPosts(prev => [...prev, ...processedPosts]);
      setPage(prev => prev + 1);
    } catch (error) {
      console.error('Error loading more posts:', error);
      setError('Failed to load posts. Please try again later.');
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [page, userId, supabase, hasMore]);

  // Process posts in batches to avoid blocking the main thread
  const processPosts = async (posts: any[], userId?: string) => {
    if (!userId) return posts;

    const processedPosts = [...posts];
    const batchSize = 3;

    for (let i = 0; i < processedPosts.length; i += batchSize) {
      const batch = processedPosts.slice(i, i + batchSize);

      // Process batch in parallel
      await Promise.all(
        batch.map(async (post, index) => {
          try {
            // Check if user has liked the post
            post.liked = await clientDb.isPostLiked(userId, post.id);

            // Get like count
            const { count: likeCount, error: likeError } = await supabase
              .from('likes')
              .select('*', { count: 'exact', head: true })
              .eq('post_id', post.id);

            if (!likeError) {
              post.likeCount = likeCount || 0;
            } else {
              post.likeCount = 0;
            }

            // Get comment count
            const { count: commentCount, error: commentError } = await supabase
              .from('comments')
              .select('*', { count: 'exact', head: true })
              .eq('post_id', post.id);

            if (!commentError) {
              post.commentCount = commentCount || 0;
            } else {
              post.commentCount = 0;
            }

            processedPosts[i + index] = post;
          } catch (err) {
            console.error('Error processing post:', err);
            post.liked = false;
            post.likeCount = 0;
            post.commentCount = 0;
          }
        })
      );

      // Small delay to avoid blocking the main thread
      await new Promise(resolve => setTimeout(resolve, 0));
    }

    return processedPosts;
  };

  // Load more posts when scrolling to the bottom
  useEffect(() => {
    if (inView && !loading && hasMore) {
      loadMorePosts();
    }
  }, [inView, loading, hasMore, loadMorePosts]);

  // Initial load if no initial posts were provided
  useEffect(() => {
    if (initialPosts.length === 0 && !loading && page === 0) {
      loadMorePosts();
    }
  }, [initialPosts.length, loading, page, loadMorePosts]);

  const handleLike = useCallback(
    async (postId: string) => {
      if (!userId) return;

      try {
        const liked = await clientDb.likePost(userId, postId);

        setPosts(prevPosts =>
          prevPosts.map(post =>
            post.id === postId
              ? {
                  ...post,
                  liked,
                  likeCount: liked ? post.likeCount + 1 : post.likeCount - 1,
                }
              : post
          )
        );
      } catch (error) {
        console.error('Error liking post:', error);
      }
    },
    [userId]
  );

  // Memoize the skeleton loaders to prevent unnecessary re-renders
  const skeletonLoaders = useMemo(
    () => (
      <div className="space-y-6">
        {[1, 2, 3].map(i => (
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
    ),
    []
  );

  if (loading && posts.length === 0) {
    return skeletonLoaders;
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => {
            setError(null);
            loadMorePosts();
          }}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map(post => (
        <Post
          key={post.id}
          post={{
            id: post.id,
            content: post.content,
            media: post.media_urls || [],
            createdAt: post.created_at,
            user: {
              id: post.profiles?.id,
              name: post.profiles?.full_name || post.profiles?.username || 'Unknown User',
              avatar: post.profiles?.avatar_url,
            },
            likeCount: post.likeCount || 0,
            commentCount: post.commentCount || 0,
            liked: post.liked || false,
          }}
          currentUserId={userId}
          onLike={handleLike}
        />
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

      {!hasMore && posts.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">No posts found</h3>
          <p className="text-muted-foreground mt-2">Be the first to create a post!</p>
        </div>
      )}
    </div>
  );
}
