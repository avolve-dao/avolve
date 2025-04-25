'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MoreVertical, Info } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/chat/theme-toggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ChatHeaderProps {
  chatName: string;
  chatImage?: string;
  isGroup?: boolean;
  memberCount?: number;
  onBackClick?: () => void;
  onViewInfo?: () => void;
}

export function ChatHeader({
  chatName,
  chatImage,
  isGroup = false,
  memberCount,
  onBackClick,
  onViewInfo,
}: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-3">
        {onBackClick && (
          <Button variant="ghost" size="icon" onClick={onBackClick} className="md:hidden">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <Avatar className="h-10 w-10">
          <AvatarImage src={chatImage} />
          <AvatarFallback>{chatName[0]}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-semibold">{chatName}</h2>
          {isGroup && memberCount && (
            <p className="text-xs text-muted-foreground">{memberCount} members</p>
          )}
        </div>
      </div>
      <div className="flex items-center">
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onViewInfo && (
              <DropdownMenuItem onClick={onViewInfo}>
                <Info className="h-4 w-4 mr-2" />
                View Info
              </DropdownMenuItem>
            )}
            {isGroup && (
              <DropdownMenuItem asChild>
                <Link href={`/messages`}>Leave Group</Link>
              </DropdownMenuItem>
            )}
            {!isGroup && (
              <DropdownMenuItem asChild>
                <Link href={`/profile/${chatName}`}>View Profile</Link>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
