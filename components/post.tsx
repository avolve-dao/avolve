'use client';

import * as React from 'react';

import { useState, useRef, useCallback, memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EmojiReactions } from '@/components/emoji-reactions';
import { logActivity } from '@/lib/activity-logger';

// Import the haptics utility at the top
import { useHaptics } from '@/lib/haptics';

// Add gesture interactions to the post component
// Import the gesture hook at the top
import { useGestures } from '@/hooks/use-gestures';

interface PostProps {
  post: {
    id: string;
    content: string;
    media: string[];
    createdAt: string;
    user: {
      id: string;
      name: string;
      avatar: string;
    };
    likeCount: number;
    commentCount: number;
    liked: boolean;
  };
  currentUserId?: string;
  onLike: (postId: string) => void;
}

// Add the gesture hook inside the component
const Post = memo(function Post({ post, currentUserId, onLike }: PostProps) {
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');
  const [saved, setSaved] = useState(false);
  const haptics = useHaptics();
  const postRef = useRef<HTMLDivElement>(null);

  // Set up gesture handlers
  // useGestures expects RefObject<HTMLElement>, so cast postRef as needed
  useGestures(postRef as React.RefObject<HTMLElement>, {
    onDoubleTap: () => {
      // Double tap to like
      if (!post.liked) {
        onLike(post.id);
      }
    },
    onSwipeLeft: () => {
      // Swipe left to save
      setSaved(true);
    },
    onSwipeRight: () => {
      // Swipe right to show comments
      setShowComments(true);
    },
    onLongPress: () => {
      // Long press could show more options
      console.log('Long press detected');
    },
  });

  const handleLike = useCallback(() => {
    // Trigger appropriate haptic feedback based on like state
    haptics.trigger(post.liked ? 'light' : 'success');

    onLike(post.id);

    // Log the activity if user is liking (not unliking)
    if (!post.liked && currentUserId) {
      logActivity({
        userId: currentUserId,
        action: 'post_like',
        entityType: 'post',
        entityId: post.id,
        metadata: {
          post_owner_id: post.user.id,
          post_owner_name: post.user.name,
          content: post.content.substring(0, 100),
        },
      });
    }
  }, [
    post.id,
    post.liked,
    post.user.id,
    post.user.name,
    post.content,
    currentUserId,
    onLike,
    haptics,
  ]);

  const handleSave = useCallback(() => {
    // Trigger haptic feedback
    haptics.trigger('medium');

    setSaved(!saved);
  }, [saved, haptics]);

  const handleComment = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!comment.trim() || !currentUserId) return;

      // In a real app, this would send the comment to Supabase
      console.log('Comment:', comment);

      // Log the activity
      await logActivity({
        userId: currentUserId,
        action: 'post_comment',
        entityType: 'post',
        entityId: post.id,
        metadata: {
          post_owner_id: post.user.id,
          post_owner_name: post.user.name,
          content: comment,
        },
      });

      setComment('');
    },
    [comment, currentUserId, post.id, post.user.id, post.user.name]
  );

  const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });

  // Update the return to add the ref
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md" ref={postRef}>
      <CardHeader className="p-4 pb-0">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10 border">
              <AvatarImage src={post.user.avatar} alt={post.user.name} />
              <AvatarFallback>{post.user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <Link
                href={`/dashboard/profile/${post.user.id}`}
                className="font-medium hover:underline"
              >
                {post.user.name}
              </Link>
              <p className="text-xs text-muted-foreground">{timeAgo}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          <p className="whitespace-pre-line text-body-emphasis">{post.content}</p>

          {post.media.length > 0 && (
            <div
              className={cn(
                'grid gap-2 rounded-lg overflow-hidden',
                post.media.length > 1 && 'grid-cols-2'
              )}
            >
              {post.media.map((src, i) => (
                <div
                  key={i}
                  className={cn(
                    'relative aspect-square md:aspect-video overflow-hidden rounded-lg',
                    post.media.length === 1 && 'col-span-2'
                  )}
                >
                  <Image
                    src={src || '/placeholder.svg'}
                    alt={`Post media ${i + 1}`}
                    fill
                    className="object-cover"
                    loading="lazy"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex flex-col">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-1 h-auto px-2"
              onClick={handleLike}
            >
              <Heart className={cn('h-5 w-5', post.liked && 'fill-red-500 text-red-500')} />
              <span>{post.likeCount}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-1 h-auto px-2"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircle className="h-5 w-5" />
              <span>{post.commentCount}</span>
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center space-x-1 h-auto px-2">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
          <Button variant="ghost" size="sm" className="h-auto px-2" onClick={handleSave}>
            <Bookmark className={cn('h-5 w-5', saved && 'fill-primary text-primary')} />
          </Button>
        </div>

        {/* Emoji reactions */}
        <div className="mt-2 w-full">
          <EmojiReactions
            itemId={post.id}
            itemType="post"
            userId={currentUserId || ''}
            username={currentUserId === post.user.id ? 'You' : 'Anonymous'}
          />
        </div>

        {showComments && (
          <div className="mt-4 w-full">
            <form onSubmit={handleComment} className="flex items-center space-x-2">
              <Textarea
                placeholder="Add a comment..."
                value={comment}
                onChange={e => setComment(e.target.value)}
                className="min-h-0 h-9 resize-none py-2"
              />
              <Button type="submit" size="sm" disabled={!comment.trim()}>
                Post
              </Button>
            </form>
          </div>
        )}
      </CardFooter>
    </Card>
  );
});

export { Post };
