'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/use-toast';
import { Heart, MessageCircle, Share2, MoreHorizontal, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Post {
  id: string;
  user_id: string;
  content: string;
  media_urls?: any;
  post_type: string;
  visibility: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  created_at: string;
  updated_at: string;
  profiles?: {
    username?: string;
    full_name?: string;
    avatar_url?: string;
  };
}

export function PostFeed() {
  const supabase = createClient();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPostContent, setNewPostContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetchPosts();
    fetchUser();
  }, []);

  const fetchUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      // Fetch posts with profile information
      const { data, error } = await supabase
        .from('posts')
        .select(
          `
          *,
          profiles:user_id (
            username,
            full_name,
            avatar_url
          )
        `
        )
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      if (data) {
        setPosts(data as Post[]);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: 'Error loading posts',
        description: 'There was a problem loading the feed. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;

    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .insert({
          user_id: user?.id,
          content: newPostContent,
          post_type: 'standard',
          visibility: 'public',
        })
        .select();

      if (error) throw error;

      setNewPostContent('');
      toast({
        title: 'Post created',
        description: 'Your post has been published to the feed.',
      });

      // Refresh the feed
      fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: 'Error creating post',
        description: 'There was a problem publishing your post. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikePost = async (postId: string) => {
    try {
      // Call the toggle_like function
      const { data, error } = await supabase.rpc('toggle_post_like', {
        p_post_id: postId,
      });

      if (error) throw error;

      // Update the post in the local state
      setPosts(prevPosts =>
        prevPosts.map(post => {
          if (post.id === postId) {
            // If the function returned true, we liked the post, otherwise we unliked it
            const likeDelta = data === true ? 1 : -1;
            return {
              ...post,
              likes_count: post.likes_count + likeDelta,
            };
          }
          return post;
        })
      );
    } catch (error) {
      console.error('Error liking post:', error);
      toast({
        title: 'Error',
        description: 'There was a problem processing your action. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Placeholder for now - would be implemented with the comments functionality
  const handleCommentPost = (postId: string) => {
    toast({
      title: 'Comments',
      description: 'Comments functionality coming soon!',
    });
  };

  // Placeholder for now - would be implemented with the sharing functionality
  const handleSharePost = (postId: string) => {
    toast({
      title: 'Share',
      description: 'Sharing functionality coming soon!',
    });
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Create post card */}
      {user && (
        <Card>
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <Avatar>
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback>{getInitials(user?.user_metadata?.full_name)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold">Share your progress</h3>
              <p className="text-sm text-muted-foreground">
                Post an update to your Superachiever journey
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="What's on your mind? Share your progress, insights, or questions..."
              className="min-h-[100px]"
              value={newPostContent}
              onChange={e => setNewPostContent(e.target.value)}
            />
          </CardContent>
          <CardFooter className="justify-end">
            <Button
              onClick={handleCreatePost}
              disabled={submitting || !newPostContent.trim()}
              className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600"
            >
              {submitting ? 'Posting...' : 'Post Update'}
              <Send className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Posts feed */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Community Feed</h2>

        {loading ? (
          // Loading skeletons
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-3 w-[150px]" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))
        ) : posts.length > 0 ? (
          posts.map(post => (
            <Card key={post.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={post.profiles?.avatar_url} />
                      <AvatarFallback>{getInitials(post.profiles?.full_name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">
                        {post.profiles?.full_name || 'Anonymous User'}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(post.created_at))} ago
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="whitespace-pre-line">{post.content}</p>
                {post.media_urls && (
                  <div className="mt-3">{/* Media rendering would go here */}</div>
                )}
              </CardContent>
              <CardFooter className="border-t pt-3 flex justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLikePost(post.id)}
                  className="text-muted-foreground hover:text-amber-500"
                >
                  <Heart className="mr-1 h-4 w-4" />
                  {post.likes_count > 0 && post.likes_count}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCommentPost(post.id)}
                  className="text-muted-foreground"
                >
                  <MessageCircle className="mr-1 h-4 w-4" />
                  {post.comments_count > 0 && post.comments_count}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSharePost(post.id)}
                  className="text-muted-foreground"
                >
                  <Share2 className="mr-1 h-4 w-4" />
                  {post.shares_count > 0 && post.shares_count}
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No posts yet. Be the first to share!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
