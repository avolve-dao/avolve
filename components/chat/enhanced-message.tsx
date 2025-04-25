'use client';

import { useState, useRef, useEffect, memo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import { FileIcon, FileTextIcon, Download, Check, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useMessagingTheme } from '@/contexts/theme-context';
import { cn } from '@/lib/utils';
import { EmojiReactions } from '@/components/emoji-reactions';

interface EnhancedMessageProps {
  message: {
    id: string;
    content: string;
    type: string;
    media_url?: string;
    created_at: string;
    user: {
      id: string;
      name: string;
      avatar?: string;
    };
  };
  isCurrentUser: boolean;
  readReceipts?: {
    user: {
      id: string;
      name: string;
      avatar?: string;
    };
    readAt: string;
  }[];
  onInView?: (messageId: string) => void;
  currentUserId: string;
}

const EnhancedMessage = memo(function EnhancedMessage({
  message,
  isCurrentUser,
  readReceipts = [],
  onInView,
  currentUserId,
}: EnhancedMessageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const messageRef = useRef<HTMLDivElement>(null);
  const { isDark } = useMessagingTheme();
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Observe when message comes into view
  useEffect(() => {
    if (!messageRef.current || !onInView) return;

    observerRef.current = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          onInView(message.id);
          observerRef.current?.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    observerRef.current.observe(messageRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [message.id, onInView]);

  const getFileIcon = () => {
    const fileType = message.media_url?.split('.').pop()?.toLowerCase();

    if (['pdf', 'doc', 'docx'].includes(fileType || '')) {
      return <FileTextIcon className="h-10 w-10 text-zinc-500" />;
    }

    return <FileIcon className="h-10 w-10 text-zinc-500" />;
  };

  return (
    <div
      ref={messageRef}
      className={`flex gap-2 mb-4 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isCurrentUser && (
        <Avatar className="h-8 w-8">
          <AvatarImage src={message.user.avatar} />
          <AvatarFallback>{message.user.name[0]}</AvatarFallback>
        </Avatar>
      )}

      <div className={`max-w-[70%] ${isCurrentUser ? 'items-end' : 'items-start'}`}>
        {!isCurrentUser && (
          <div className="text-xs text-muted-foreground mb-1">{message.user.name}</div>
        )}

        <Card
          className={cn(
            'p-3 shadow-sm',
            isCurrentUser
              ? 'bg-primary text-primary-foreground'
              : isDark
                ? 'bg-zinc-800 text-zinc-100'
                : 'bg-zinc-100 text-zinc-900'
          )}
        >
          {message.type === 'text' && <div className="whitespace-pre-wrap">{message.content}</div>}

          {message.type === 'image' && message.media_url && (
            <div className="relative">
              <div
                className={`w-full h-40 bg-muted flex items-center justify-center ${imageLoaded ? 'hidden' : 'block'}`}
              >
                Loading image...
              </div>
              <Image
                src={message.media_url || '/placeholder.svg'}
                alt="Image attachment"
                width={300}
                height={200}
                className={`rounded-md object-cover ${imageLoaded ? 'block' : 'hidden'}`}
                onLoad={() => setImageLoaded(true)}
                loading="lazy"
              />
            </div>
          )}

          {message.type === 'file' && message.media_url && (
            <div className="flex items-center gap-2">
              {getFileIcon()}
              <div className="flex-1 min-w-0">
                <div className="truncate text-sm">{message.media_url.split('/').pop()}</div>
                {message.content && <div className="text-xs opacity-80">{message.content}</div>}
              </div>
              <Button size="icon" variant="ghost" asChild>
                <a href={message.media_url} target="_blank" rel="noopener noreferrer" download>
                  <Download className="h-4 w-4" />
                </a>
              </Button>
            </div>
          )}
        </Card>

        <div className="flex items-center mt-1">
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
          </span>

          {isCurrentUser && (
            <div className="ml-2 flex items-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-muted-foreground">
                      {readReceipts.length > 0 ? (
                        <CheckCheck className="h-3.5 w-3.5" />
                      ) : (
                        <Check className="h-3.5 w-3.5" />
                      )}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    {readReceipts.length > 0 ? (
                      <div className="text-xs">
                        Read by: {readReceipts.map(r => r.user.name).join(', ')}
                      </div>
                    ) : (
                      <div className="text-xs">Sent</div>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>

        {/* Emoji reactions */}
        <EmojiReactions
          itemId={message.id}
          itemType="message"
          userId={currentUserId}
          username={isCurrentUser ? 'You' : message.user.name}
        />
      </div>
    </div>
  );
});

export { EnhancedMessage };
