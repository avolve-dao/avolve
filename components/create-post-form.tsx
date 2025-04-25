'use client';

import * as React from 'react';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { clientDb } from '@/lib/db';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Image, Video, Smile, MapPin, Users, X, Sparkles, Bot } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { logActivity } from '@/lib/activity-logger';
import { GrokPostEnhancer } from '@/components/grok/grok-post-enhancer';
import { GrokWidget } from '@/components/grok/grok-widget';

interface CreatePostFormProps {
  user: User;
}

export function CreatePostForm({ user }: CreatePostFormProps) {
  const [content, setContent] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGrokEnhancer, setShowGrokEnhancer] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    setSelectedFiles(prev => [...prev, ...newFiles]);

    // Create previews
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));

    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(previews[index]);
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim() && selectedFiles.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add some content or media to your post',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload files to Supabase Storage
      const mediaUrls: string[] = [];

      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
          const filePath = `${user.id}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('posts')
            .upload(filePath, file);

          if (uploadError) {
            throw uploadError;
          }

          const { data } = supabase.storage.from('posts').getPublicUrl(filePath);

          mediaUrls.push(data.publicUrl);
        }
      }

      // Create post in database
      const post = await clientDb.createPost(user.id, content, mediaUrls);

      // Log the activity
      await logActivity({
        userId: user.id,
        action: 'post_create',
        entityType: 'post',
        entityId: post.id,
        metadata: {
          content: content.substring(0, 100),
          has_media: mediaUrls.length > 0,
          enhanced_by_grok: showGrokEnhancer,
        },
      });

      toast({
        title: 'Success',
        description: 'Your post has been created',
      });

      // Redirect to dashboard
      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: 'Error',
        description: 'Failed to create post. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGrokEnhancement = (enhancedContent: string) => {
    setContent(enhancedContent);
  };

  const userAvatar = user.user_metadata?.avatar_url || null;
  const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';

  return (
    <>
      <Card>
        <form onSubmit={handleSubmit}>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10 border">
                <AvatarImage src={userAvatar} alt={userName} />
                <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  placeholder="What's on your mind?"
                  className="resize-none border-none shadow-none focus-visible:ring-0 p-0"
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  rows={3}
                />

                {content.trim().length > 0 && !showGrokEnhancer && (
                  <div className="mt-3 p-3 border border-dashed border-primary/30 rounded-md bg-primary/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Sparkles className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Enhance with Grok AI</p>
                          <p className="text-xs text-muted-foreground">
                            Get suggestions to improve your post
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowGrokEnhancer(true)}
                      >
                        Enhance
                      </Button>
                    </div>
                  </div>
                )}

                {showGrokEnhancer && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Bot className="h-4 w-4 text-primary" />
                        <span className="font-medium">Grok Post Enhancement</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowGrokEnhancer(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <GrokPostEnhancer
                      userId={user.id}
                      originalContent={content}
                      onSelectEnhancement={handleGrokEnhancement}
                    />
                  </div>
                )}
              </div>
            </div>

            {previews.length > 0 && (
              <div className={`grid gap-2 ${previews.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                {previews.map((preview, index) => (
                  <div key={index} className="relative rounded-md overflow-hidden">
                    <img
                      src={preview || '/placeholder.svg'}
                      alt={`Preview ${index}`}
                      className="w-full h-auto object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6 rounded-full"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <Tabs defaultValue="media" className="w-full">
              <TabsList className="w-full grid grid-cols-4">
                <TabsTrigger value="media" className="text-xs">
                  <Image className="h-4 w-4 mr-2" />
                  Media
                </TabsTrigger>
                <TabsTrigger value="video" className="text-xs">
                  <Video className="h-4 w-4 mr-2" />
                  Video
                </TabsTrigger>
                <TabsTrigger value="feeling" className="text-xs">
                  <Smile className="h-4 w-4 mr-2" />
                  Feeling
                </TabsTrigger>
                <TabsTrigger value="tag" className="text-xs">
                  <Users className="h-4 w-4 mr-2" />
                  Tag
                </TabsTrigger>
              </TabsList>
              <TabsContent value="media" className="pt-4">
                <div className="flex items-center justify-center border-2 border-dashed rounded-md p-4">
                  <label className="flex flex-col items-center gap-2 cursor-pointer">
                    <Image className="h-6 w-6 text-muted-foreground" />
                    <span className="text-sm font-medium">Add Photos</span>
                    <span className="text-xs text-muted-foreground">or drag and drop</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
              </TabsContent>
              <TabsContent value="video" className="pt-4">
                <div className="flex items-center justify-center border-2 border-dashed rounded-md p-4">
                  <label className="flex flex-col items-center gap-2 cursor-pointer">
                    <Video className="h-6 w-6 text-muted-foreground" />
                    <span className="text-sm font-medium">Add Video</span>
                    <span className="text-xs text-muted-foreground">MP4 or WebM</span>
                    <input
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
              </TabsContent>
              <TabsContent value="feeling" className="pt-4">
                <div className="grid grid-cols-4 gap-2">
                  {['😊', '😂', '😍', '😎', '🥳', '😢', '😡', '🤔'].map(emoji => (
                    <Button
                      key={emoji}
                      type="button"
                      variant="outline"
                      className="h-12 text-2xl"
                      onClick={() => setContent(prev => `${prev} ${emoji}`)}
                    >
                      {emoji}
                    </Button>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="tag" className="pt-4">
                <div className="flex items-center justify-center border-2 border-dashed rounded-md p-4">
                  <div className="flex flex-col items-center gap-2">
                    <Users className="h-6 w-6 text-muted-foreground" />
                    <span className="text-sm font-medium">Tag Friends</span>
                    <span className="text-xs text-muted-foreground">Coming soon</span>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between border-t p-4">
            <Button type="button" variant="outline" size="sm" className="gap-1">
              <MapPin className="h-4 w-4" />
              <span>Add Location</span>
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting ? 'Posting...' : 'Post'}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <GrokWidget userId={user.id} position="bottom-right" />
    </>
  );
}
