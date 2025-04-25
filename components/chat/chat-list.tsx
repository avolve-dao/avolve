'use client';

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Users, UserPlus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { PREDEFINED_GROUPS } from '@/lib/predefined-groups';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { NewDirectMessageDialog } from '@/components/chat/new-direct-message-dialog';
import { Badge } from '@/components/ui/badge';
import { useMessagingTheme } from '@/contexts/theme-context';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

interface ChatListProps {
  userId: string;
  activeChatId?: string;
}

// Define interface for chat room
interface ChatRoom {
  id: string;
  display_name: string;
  avatar_url?: string;
  is_group: boolean;
  unread_count: number;
  last_message?: string;
  last_activity?: string;
  created_at: string;
}

// Define interface for payload
interface BroadcastPayload {
  type: string;
  event: string;
  [key: string]: any;
}

export function ChatList({ userId, activeChatId }: ChatListProps) {
  const [directChats, setDirectChats] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['Superachiever']);
  const { isDark } = useMessagingTheme();
  const supabase = createClient();

  useEffect(() => {
    const loadChats = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('chats')
          .select('*, chat_participants!inner(user_id), profiles!chat_participants(user_id, full_name, avatar_url, username)')
          .order('updated_at', { ascending: false });
        if (error) throw error;
        // Filter to only include direct (1-on-1) chats for directChats
        const direct = (data || []).filter((chat: any) => !chat.is_group);
        setDirectChats(direct);
        setLoading(false);
      } catch (error) {
        console.error('Error loading chats:', error);
        setLoading(false);
      }
    };

    loadChats();

    // Set up real-time subscription for chat updates
    const chatChannel = supabase
      .channel(`user:${userId}:chats`, {
        config: { broadcast: { self: false } },
      })
      .on('broadcast', { event: 'UPDATE' }, async (payload: BroadcastPayload) => {
        // Refresh the chat list when a chat is updated
        loadChats();
      })
      .on('broadcast', { event: 'INSERT' }, async (payload: BroadcastPayload) => {
        // Refresh the chat list when a new chat is created
        loadChats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(chatChannel);
    };
  }, [userId, supabase]);

  const filteredDirectChats = directChats.filter(chat =>
    chat.display_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const filteredGroups = PREDEFINED_GROUPS.categories
    .map(category => ({
      ...category,
      groups: category.groups.filter(group =>
        group.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter(category => category.groups.length > 0);

  return (
    <div
      className={cn(
        'h-full flex flex-col border-r',
        isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
      )}
    >
      <div className={cn('p-4 border-b', isDark ? 'border-zinc-800' : 'border-zinc-200')}>
        <h2 className="font-semibold text-lg mb-4">Messages</h2>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className={cn('pl-8', isDark ? 'bg-zinc-800 border-zinc-700' : '')}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="mt-4">
          <NewDirectMessageDialog
            userId={userId}
            trigger={
              <Button className="w-full">
                <UserPlus className="h-4 w-4 mr-2" />
                New Message
              </Button>
            }
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        {/* Direct Messages Section */}
        <div className="py-2">
          <h3 className="px-4 text-sm font-medium text-muted-foreground mb-2">Direct Messages</h3>

          {loading ? (
            <div className="space-y-2 p-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
                  <div className="space-y-1 flex-1">
                    <div className="h-4 bg-muted rounded animate-pulse w-1/3" />
                    <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredDirectChats.length === 0 ? (
            <div className="px-4 text-sm text-muted-foreground">
              {searchQuery ? 'No conversations found' : 'No direct messages yet'}
            </div>
          ) : (
            <div>
              {filteredDirectChats.map(chat => (
                <Link key={chat.id} href={`/messages/${chat.id}`} className="block">
                  <div
                    className={cn(
                      'flex items-center gap-3 px-4 py-2 hover:bg-accent/50 transition-colors',
                      chat.id === activeChatId ? 'bg-accent' : '',
                      chat.unread_count > 0 ? 'font-medium' : ''
                    )}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={chat.avatar_url} />
                      <AvatarFallback>{chat.display_name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <h3 className="text-sm truncate">{chat.display_name}</h3>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(chat.last_activity || chat.created_at), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        {chat.last_message && (
                          <p className="text-xs text-muted-foreground truncate">
                            {chat.last_message}
                          </p>
                        )}
                        {chat.unread_count > 0 && (
                          <Badge variant="default" className="ml-2 h-5 min-w-5 px-1.5">
                            {chat.unread_count}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Groups Section */}
        <div className="py-2 mt-4">
          <h3 className="px-4 text-sm font-medium text-muted-foreground mb-2">Groups</h3>

          {filteredGroups.length === 0 ? (
            <div className="px-4 text-sm text-muted-foreground">No groups found</div>
          ) : (
            <div>
              {filteredGroups.map(category => (
                <Collapsible
                  key={category.name}
                  open={expandedCategories.includes(category.name)}
                  onOpenChange={() => toggleCategory(category.name)}
                >
                  <CollapsibleTrigger
                    className={cn(
                      'flex items-center justify-between w-full px-4 py-2 hover:bg-accent/30',
                      isDark ? 'hover:bg-zinc-800' : ''
                    )}
                  >
                    <span className="text-sm font-medium">{category.name}</span>
                    <span className="text-xs">
                      {expandedCategories.includes(category.name) ? '▼' : '►'}
                    </span>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    {category.groups.map(group => (
                      <Link key={group.id} href={`/messages/group/${group.id}`} className="block">
                        <div
                          className={cn(
                            'flex items-center gap-3 pl-8 pr-4 py-2 hover:bg-accent/50 transition-colors',
                            activeChatId === `group-${group.id}` ? 'bg-accent' : ''
                          )}
                        >
                          <Avatar className="h-7 w-7">
                            <div className="bg-primary h-full w-full flex items-center justify-center text-primary-foreground">
                              <Users className="h-4 w-4" />
                            </div>
                          </Avatar>
                          <span className="text-sm">{group.name}</span>
                        </div>
                      </Link>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
