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
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Search, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface NewChatDialogProps {
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

export function NewChatDialog({ userId, trigger }: NewChatDialogProps) {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isGroup, setIsGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [creating, setCreating] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
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
        console.error('Error loading users:', error);
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

  const handleUserSelect = (userId: string) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleCreateChat = async () => {
    if (selectedUsers.length === 0) return;
    try {
      setCreating(true);
      const supabase = createClient();
      let newChatId = null;
      // For 1-on-1 chats, check if a chat already exists
      if (!isGroup && selectedUsers.length === 1) {
        const { data: existingChats, error: existingChatsError } = await supabase
          .from('chats')
          .select('id, is_group, participants:chat_participants(user_id)')
          .eq('is_group', false)
          .contains('chat_participants', [{ user_id }, { user_id: selectedUsers[0] }]);
        if (existingChatsError) throw existingChatsError;
        const directChat = (existingChats || []).find(
          (chat: any) =>
            Array.isArray(chat.participants) &&
            chat.participants.length === 2 &&
            chat.participants.some((p: any) => p.user_id === userId) &&
            chat.participants.some((p: any) => p.user_id === selectedUsers[0])
        );
        if (directChat) {
          setOpen(false);
          router.push(`/messages/${directChat.id}`);
          return;
        }
        // Create a new direct chat
        const { data: newChat, error: newChatError } = await supabase
          .from('chats')
          .insert({ is_group: false })
          .select('id')
          .single();
        if (newChatError) throw newChatError;
        newChatId = newChat.id;
        // Add both participants
        const { error: participantsError } = await supabase
          .from('chat_participants')
          .insert([
            { chat_id: newChatId, user_id },
            { chat_id: newChatId, user_id: selectedUsers[0] }
          ]);
        if (participantsError) throw participantsError;
      } else {
        // Create group chat
        const { data: newGroupChat, error: groupChatError } = await supabase
          .from('chats')
          .insert({ is_group: true, name: groupName })
          .select('id')
          .single();
        if (groupChatError) throw groupChatError;
        newChatId = newGroupChat.id;
        // Add all participants
        const participants = [userId, ...selectedUsers].map(id => ({
          chat_id: newChatId,
          user_id: id,
        }));
        const { error: participantsError } = await supabase
          .from('chat_participants')
          .insert(participants);
        if (participantsError) throw participantsError;
      }
      setOpen(false);
      router.push(`/messages/${newChatId}`);
    } catch (error) {
      console.error('Error creating chat:', error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Chat
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Conversation</DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-2 mt-4">
          <Checkbox
            id="is-group"
            checked={isGroup}
            onCheckedChange={checked => setIsGroup(checked === true)}
          />
          <Label htmlFor="is-group" className="cursor-pointer">
            Create a group chat
          </Label>
        </div>

        {isGroup && (
          <Input
            placeholder="Group name"
            value={groupName}
            onChange={e => setGroupName(e.target.value)}
            className="mt-2"
          />
        )}

        <div className="relative mt-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-8"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Selected ({selectedUsers.length})</h4>
          {selectedUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No users selected</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map(id => {
                const user = users.find(u => u.id === id);
                return (
                  <div
                    key={id}
                    className="flex items-center gap-1 bg-accent rounded-full px-2 py-1"
                  >
                    <span className="text-xs">{user?.full_name || user?.username}</span>
                    <button
                      onClick={() => handleUserSelect(id)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-4 max-h-[200px] overflow-y-auto">
          <h4 className="text-sm font-medium mb-2">Suggested</h4>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading users...</p>
          ) : filteredUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No users found</p>
          ) : (
            <div className="space-y-2">
              {filteredUsers.map(user => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-2 hover:bg-accent rounded-md cursor-pointer"
                  onClick={() => handleUserSelect(user.id)}
                >
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar_url} />
                      <AvatarFallback>{user.full_name?.[0] || user.username?.[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{user.full_name || user.username}</p>
                      {user.username && user.full_name && (
                        <p className="text-xs text-muted-foreground">@{user.username}</p>
                      )}
                    </div>
                  </div>
                  <Checkbox
                    checked={selectedUsers.includes(user.id)}
                    onCheckedChange={() => {}}
                    className="pointer-events-none"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreateChat} disabled={selectedUsers.length === 0 || creating}>
            {creating ? 'Creating...' : 'Start Chat'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
