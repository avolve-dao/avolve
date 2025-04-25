'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useMessagingTheme } from '@/contexts/theme-context';
import { cn } from '@/lib/utils';

interface TypingIndicatorProps {
  users: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
}

export function TypingIndicator({ users }: TypingIndicatorProps) {
  const { isDark } = useMessagingTheme();

  if (users.length === 0) return null;

  return (
    <div className="flex items-start gap-2 mb-4">
      {users.length === 1 ? (
        <Avatar className="h-8 w-8">
          <AvatarImage src={users[0].avatar} />
          <AvatarFallback>{users[0].name[0]}</AvatarFallback>
        </Avatar>
      ) : (
        <div className="h-8 w-8 relative">
          {users.slice(0, 2).map((user, i) => (
            <div
              key={user.id}
              className={`absolute h-6 w-6 rounded-full overflow-hidden border-2 border-background ${
                i === 0 ? 'top-0 left-0' : 'bottom-0 right-0'
              }`}
            >
              {user.avatar ? (
                <img
                  src={user.avatar || '/placeholder.svg'}
                  alt={user.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-primary flex items-center justify-center text-primary-foreground text-xs">
                  {user.name[0]}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div
        className={cn(
          'p-3 rounded-md shadow-sm',
          isDark ? 'bg-zinc-800 text-zinc-100' : 'bg-zinc-100 text-zinc-900'
        )}
      >
        <div className="flex items-center">
          <span className="text-sm mr-2">
            {users.length === 1
              ? `${users[0].name} is typing`
              : `${users.length} people are typing`}
          </span>
          <div className="flex space-x-1">
            <div
              className="w-1.5 h-1.5 bg-current rounded-full animate-bounce"
              style={{ animationDelay: '0ms' }}
            ></div>
            <div
              className="w-1.5 h-1.5 bg-current rounded-full animate-bounce"
              style={{ animationDelay: '150ms' }}
            ></div>
            <div
              className="w-1.5 h-1.5 bg-current rounded-full animate-bounce"
              style={{ animationDelay: '300ms' }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
