'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import { FileIcon, FileTextIcon, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MessageProps {
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
}

export function Message({ message, isCurrentUser }: MessageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  const getFileIcon = () => {
    const fileType = message.media_url?.split('.').pop()?.toLowerCase();

    if (['pdf', 'doc', 'docx'].includes(fileType || '')) {
      return <FileTextIcon className="h-10 w-10 text-blue-500" />;
    }

    return <FileIcon className="h-10 w-10 text-gray-500" />;
  };

  return (
    <div className={`flex gap-2 mb-4 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
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
          className={`p-3 ${isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
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

        <div className="text-xs text-muted-foreground mt-1">
          {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
        </div>
      </div>
    </div>
  );
}
