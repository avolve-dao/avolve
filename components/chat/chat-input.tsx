'use client';

import * as React from 'react';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Image, Paperclip, Send, Smile } from 'lucide-react';
import { EmojiPicker } from '@/components/chat/emoji-picker';
import { useMessagingTheme } from '@/contexts/theme-context';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { logActivity } from '@/lib/activity-logger';

// Add haptic feedback to message sending
// Import the haptics utility at the top
import { useHaptics } from '@/lib/haptics';

interface ChatInputProps {
  chatId: string;
  userId: string;
  onMessageSent?: () => void;
  isGroup?: boolean;
  chatName?: string;
}

export function ChatInput({
  chatId,
  userId,
  onMessageSent,
  isGroup = false,
  chatName = 'Chat',
}: ChatInputProps) {
  // Existing state variables
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { isDark } = useMessagingTheme();
  const supabase = createClient();
  const haptics = useHaptics();

  // Set typing indicator when user is typing
  useEffect(() => {
    if (message && !typingTimeoutRef.current) {
      // Send typing indicator via broadcast
      const typingChannel = supabase
        .channel(`chat:${chatId}:typing`, {
          config: { broadcast: { self: false } },
        })
        .subscribe();

      typingChannel.send({
        type: 'broadcast',
        event: 'TYPING',
        payload: { userId, timestamp: new Date().toISOString() },
      });

      typingTimeoutRef.current = setTimeout(() => {
        // Clear typing indicator
        typingChannel.send({
          type: 'broadcast',
          event: 'TYPING_STOPPED',
          payload: { userId },
        });

        supabase.removeChannel(typingChannel);
        typingTimeoutRef.current = null;
      }, 5000);
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    };
  }, [message, chatId, userId, supabase]);

  const handleSendMessage = async () => {
    if (!message.trim() && !isUploading) return;

    // Trigger haptic feedback when sending a message
    haptics.trigger('medium');

    try {
      // Create the message in the database
      const { data: newMessage } = await supabase
        .from('messages')
        .insert({
          chat_id: chatId,
          user_id: userId,
          content: message.trim(),
          type: 'text',
        })
        .select()
        .single();

      // Broadcast the new message
      const messageChannel = supabase
        .channel(`chat:${chatId}:messages`, {
          config: { broadcast: { self: true } },
        })
        .subscribe();

      await messageChannel.send({
        type: 'broadcast',
        event: 'INSERT',
        payload: newMessage,
      });

      // Update the chat's last_message and last_activity
      await supabase
        .from('chats')
        .update({
          last_message: message.trim(),
          last_activity: new Date().toISOString(),
        })
        .eq('id', chatId);

      // Broadcast chat update
      const chatChannel = supabase
        .channel(`chat:${chatId}`, {
          config: { broadcast: { self: true } },
        })
        .subscribe();

      await chatChannel.send({
        type: 'broadcast',
        event: 'UPDATE',
        payload: { chatId },
      });

      // Log the activity
      await logActivity({
        userId,
        action: 'message_send',
        entityType: 'message',
        entityId: newMessage.id,
        metadata: {
          chat_id: chatId,
          is_group: isGroup,
          chat_name: chatName,
          content: message.trim().substring(0, 100),
        },
      });

      setMessage('');
      if (onMessageSent) onMessageSent();

      // Clean up channels
      supabase.removeChannel(messageChannel);
      supabase.removeChannel(chatChannel);
    } catch (error) {
      // Trigger error haptic feedback if message fails
      haptics.trigger('error');
      console.error('Error sending message:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      // Upload file to storage
      const file = files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `chat-attachments/${fileName}`;

      const { data, error } = await supabase.storage.from('media').upload(filePath, file);

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage.from('media').getPublicUrl(filePath);

      // Create message with attachment
      const { data: newMessage } = await supabase
        .from('messages')
        .insert({
          chat_id: chatId,
          user_id: userId,
          content: message.trim(),
          type: file.type.startsWith('image/') ? 'image' : 'file',
          media_url: urlData.publicUrl,
        })
        .select()
        .single();

      // Broadcast the new message
      const messageChannel = supabase
        .channel(`chat:${chatId}:messages`, {
          config: { broadcast: { self: true } },
        })
        .subscribe();

      await messageChannel.send({
        type: 'broadcast',
        event: 'INSERT',
        payload: newMessage,
      });

      // Update the chat's last_message and last_activity
      await supabase
        .from('chats')
        .update({
          last_message: 'Sent an attachment',
          last_activity: new Date().toISOString(),
        })
        .eq('id', chatId);

      // Broadcast chat update
      const chatChannel = supabase
        .channel(`chat:${chatId}`, {
          config: { broadcast: { self: true } },
        })
        .subscribe();

      await chatChannel.send({
        type: 'broadcast',
        event: 'UPDATE',
        payload: { chatId },
      });

      // Log the activity
      await logActivity({
        userId,
        action: 'message_send',
        entityType: 'message',
        entityId: newMessage.id,
        metadata: {
          chat_id: chatId,
          is_group: isGroup,
          chat_name: chatName,
          content: 'Sent an attachment',
        },
      });

      setMessage('');
      if (onMessageSent) onMessageSent();

      // Clean up channels
      supabase.removeChannel(messageChannel);
      supabase.removeChannel(chatChannel);
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div
      className={cn(
        'p-4 border-t',
        isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
      )}
    >
      <div className="flex items-end gap-2">
        <div className="relative flex-1">
          <Textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className={cn(
              'min-h-[80px] resize-none pr-10',
              isDark ? 'bg-zinc-800 border-zinc-700' : ''
            )}
          />
          <div className="absolute bottom-2 right-2">
            <Button
              variant="ghost"
              size="icon"
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <Smile className="h-5 w-5" />
            </Button>
            {showEmojiPicker && (
              <div className="absolute bottom-10 right-0 z-10">
                <EmojiPicker onEmojiSelect={handleEmojiSelect} />
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-1">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.accept = 'image/*';
                fileInputRef.current.click();
              }
            }}
            disabled={isUploading}
          >
            <Image className="h-5 w-5" />
          </Button>
          <Button
            onClick={handleSendMessage}
            disabled={(!message.trim() && !isUploading) || isUploading}
          >
            <Send className="h-5 w-5 mr-2" />
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
