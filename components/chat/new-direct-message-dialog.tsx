'use client';

import * as React from 'react';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

interface NewDirectMessageDialogProps {
  userId: string;
  trigger?: React.ReactNode;
}

interface User {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
}

interface Chat {
  id: string;
  is_group: boolean;
  participants: User[];
  name?: string;
}

export function NewDirectMessageDialog({ userId, trigger }: NewDirectMessageDialogProps) {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('profiles')
          .select('id, username, full_name, avatar_url')
          .neq('id', userId)
          .order('full_name', { ascending: true })
          .limit(20);
        if (error) throw error;
        setUsers(data || []);
      } catch (error) {
        setError('Failed to load users.');
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, [userId]);

  const filteredUsers = users.filter(
    user =>
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStartChat = async (selectedUserId: string) => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      // Check for existing direct chat
      const { data: existingChats, error: existingChatsError } = await supabase
        .from('chats')
        .select('id, is_group, participants:chat_participants(user_id)')
        .eq('is_group', false)
        .contains('chat_participants', [{ user_id: userId }, { user_id: selectedUserId }]);
      if (existingChatsError) throw existingChatsError;
      const directChat = (existingChats || []).find(
        (chat: any) =>
          Array.isArray(chat.participants) &&
          chat.participants.length === 2 &&
          chat.participants.some((p: any) => p.user_id === userId) &&
          chat.participants.some((p: any) => p.user_id === selectedUserId)
      );
      if (directChat) {
        setOpen(false);
        router.push(`/messages/${directChat.id}`);
        return;
      }
      // Create new direct chat
      const { data: newChat, error: newChatError } = await supabase
        .from('chats')
        .insert({ is_group: false })
        .select('id')
        .single();
      if (newChatError) throw newChatError;
      const newChatId = newChat.id;
      // Add both participants
      const { error: participantsError } = await supabase
        .from('chat_participants')
        .insert([
          { chat_id: newChatId, user_id: userId },
          { chat_id: newChatId, user_id: selectedUserId }
        ]);
      if (participantsError) throw participantsError;
      setOpen(false);
      router.push(`/messages/${newChatId}`);
    } catch (error) {
      setError('Failed to start chat.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || <Button>New Message</Button>}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Message</DialogTitle>
        </DialogHeader>

        <div className="relative mt-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-8"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="mt-4 max-h-[300px] overflow-y-auto">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading users...</p>
          ) : filteredUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No users found</p>
          ) : (
            <div className="space-y-1">
              {filteredUsers.map(user => (
                <div
                  key={user.id}
                  className="flex items-center p-2 hover:bg-accent rounded-md cursor-pointer"
                  onClick={() => handleStartChat(user.id)}
                >
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage src={user.avatar_url} />
                    <AvatarFallback>{user.full_name?.[0] || user.username?.[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user.full_name || user.username}</p>
                    {user.username && user.full_name && (
                      <p className="text-xs text-muted-foreground">@{user.username}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
