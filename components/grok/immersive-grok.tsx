'use client';

import * as React from 'react';

import { useState, useRef, useEffect } from 'react';
import { nanoid } from 'nanoid';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from 'ai/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Bot,
  Send,
  Sparkles,
  Zap,
  Share2,
  Bookmark,
  MessageSquare,
  Bell,
  HelpCircle,
  BookOpen,
  ArrowLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImmersiveGrokProps {
  userId: string;
  userName: string;
  userAvatar?: string;
}

export function ImmersiveGrok({ userId, userName, userAvatar }: ImmersiveGrokProps) {
  const [activeMode, setActiveMode] = useState<'chat' | 'create' | 'explore'>('chat');
  const [input, setInput] = useState('');
  const [creationPrompt, setCreationPrompt] = useState('');
  const [creations, setCreations] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [userContext, setUserContext] = useState<any>(null);
  const [showContext, setShowContext] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  useEffect(() => {
    // Fetch user context when component mounts
    async function fetchUserContext() {
      try {
        const response = await fetch(`/api/grok/context?userId=${userId}`);
        const data = await response.json();
        if (data.success) {
          setUserContext(data.context);
        }
      } catch (error) {
        console.error('Error fetching user context:', error);
      }
    }

    fetchUserContext();
  }, [userId]);

  const {
    messages,
    isLoading,
    handleSubmit,
    setInput: setChatInput,
  } = useChat({
    api: '/api/grok/chat',
    body: {
      userId,
    },
    onFinish: () => {
      // Log activity when chat completes via API instead of direct client import
      fetch('/api/grok/log-activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'post_create',
          entityType: 'message',
          content: input.substring(0, 100),
        }),
      }).catch(error => {
        console.error('Error logging activity:', error);
      });
    },
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    if (activeMode === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeMode]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || isLoading) return;

    setChatInput(input);
    setInput('');
  };

  const handleCreateContent = async () => {
    if (!creationPrompt.trim() || isGenerating) return;

    setIsGenerating(true);

    try {
      const response = await fetch('/api/grok/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: creationPrompt,
          userId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setCreations(prev => [data.content, ...prev]);
        setCreationPrompt('');
        setSelectedTemplate(null);

        // Log activity via API instead of direct client import
        fetch('/api/grok/log-activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'post_create',
            entityType: 'post',
            content: creationPrompt.substring(0, 100),
          }),
        }).catch(error => {
          console.error('Error logging activity:', error);
        });
      }
    } catch (error) {
      console.error('Error creating content:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Tabs value={activeMode} onValueChange={v => setActiveMode(v as any)} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Create
          </TabsTrigger>
          <TabsTrigger value="explore" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Explore
          </TabsTrigger>
        </TabsList>

        <div className="flex justify-end mb-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowContext(!showContext)}
            className="text-xs gap-1"
          >
            <Bot className="h-3 w-3" />
            {showContext ? 'Hide Context' : 'Show What Grok Knows'}
          </Button>
        </div>

        {showContext && userContext && (
          <Card className="mb-4 bg-muted/50">
            <CardContent className="p-4">
              <h3 className="text-sm font-medium mb-2">Grok's Understanding of Your Context</h3>
              <div className="text-xs space-y-2">
                <div>
                  <span className="font-medium">Interests:</span>{' '}
                  {userContext.interests || 'None detected yet'}
                </div>
                <div>
                  <span className="font-medium">Recent Activity:</span>{' '}
                  {userContext.recentActivity || 'No recent activity'}
                </div>
                <div>
                  <span className="font-medium">Platform Trends:</span>{' '}
                  {userContext.trends || 'No trends available'}
                </div>
                <div className="text-muted-foreground italic">
                  This context helps Grok provide more relevant and personalized responses
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <TabsContent value="chat" className="space-y-4">
          <Card className="h-[500px] overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Bot className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-title mb-2">Chat with Grok</h3>
                  <p className="text-caption-large text-muted-foreground max-w-md">
                    Your AI assistant that understands your social context and can help with
                    anything from answering questions to generating content.
                  </p>
                </div>
              ) : (
                <>
                  {messages.map(message => (
                    <div
                      key={message.id}
                      className={cn(
                        'flex items-start gap-3',
                        message.role === 'user' ? 'justify-end' : ''
                      )}
                    >
                      {message.role !== 'user' && (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="/grok-avatar.png" alt="Grok" />
                          <AvatarFallback className="bg-primary/10">
                            <Bot className="h-4 w-4 text-primary" />
                          </AvatarFallback>
                        </Avatar>
                      )}

                      <div
                        className={cn(
                          'rounded-lg px-4 py-2 max-w-[80%]',
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        )}
                      >
                        <div className="prose prose-sm dark:prose-invert">{message.content}</div>
                      </div>

                      {message.role === 'user' && (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={userAvatar} alt={userName} />
                          <AvatarFallback>{userName[0]}</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            <div className="p-4 border-t">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Message Grok..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button type="submit" disabled={!input.trim() || isLoading}>
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </Button>
              </form>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">Create with Grok</h3>
                <p className="text-muted-foreground">
                  Generate engaging social content with AI assistance
                </p>
              </div>

              <div className="space-y-2">
                <div className="space-y-4">
                  {!selectedTemplate ? (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { id: 'post', name: 'Social Post', icon: MessageSquare },
                          { id: 'announcement', name: 'Announcement', icon: Bell },
                          { id: 'question', name: 'Ask a Question', icon: HelpCircle },
                          { id: 'story', name: 'Share a Story', icon: BookOpen },
                        ].map(template => (
                          <Button
                            key={template.id}
                            variant="outline"
                            className="h-auto p-4 flex flex-col gap-2 items-center justify-center"
                            onClick={() => {
                              setSelectedTemplate(template.id);
                              setCreationPrompt(
                                template.id === 'post'
                                  ? 'Write a thoughtful post about '
                                  : template.id === 'announcement'
                                    ? 'I want to announce that '
                                    : template.id === 'question'
                                      ? "I'm curious about "
                                      : 'Let me share a story about '
                              );
                            }}
                          >
                            <template.icon className="h-5 w-5" />
                            <span>{template.name}</span>
                          </Button>
                        ))}
                      </div>
                      <p className="text-sm text-center text-muted-foreground">
                        Select a template to get started
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedTemplate(null)}
                          className="gap-1"
                        >
                          <ArrowLeft className="h-3 w-3" />
                          Back to templates
                        </Button>
                        <span className="text-sm font-medium">
                          {selectedTemplate === 'post'
                            ? 'Create a Social Post'
                            : selectedTemplate === 'announcement'
                              ? 'Make an Announcement'
                              : selectedTemplate === 'question'
                                ? 'Ask a Question'
                                : 'Share a Story'}
                        </span>
                      </div>
                      <textarea
                        value={creationPrompt}
                        onChange={e => setCreationPrompt(e.target.value)}
                        placeholder="Describe what you want to create..."
                        className="w-full h-32 p-3 rounded-md border resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </>
                  )}
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handleCreateContent}
                    disabled={!creationPrompt.trim() || isGenerating}
                    className="gap-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    {isGenerating ? 'Creating...' : 'Create'}
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          <div className="space-y-4">
            <h3 className="font-medium">Your Creations</h3>

            <AnimatePresence>
              {creations.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  Your creations will appear here
                </div>
              ) : (
                <div className="space-y-4">
                  {creations.map((creation, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="p-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={userAvatar} alt={userName} />
                            <AvatarFallback>{userName[0]}</AvatarFallback>
                          </Avatar>

                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{userName}</span>
                              <span className="text-xs text-muted-foreground">Just now</span>
                              <div className="ml-auto flex items-center gap-1 text-xs text-primary">
                                <Sparkles className="h-3 w-3" />
                                <span>Grok-assisted</span>
                              </div>
                            </div>

                            <div className="mt-2 whitespace-pre-wrap">{creation}</div>

                            <div className="mt-4 flex items-center gap-4">
                              <Button variant="ghost" size="sm" className="h-8 gap-1">
                                <Share2 className="h-4 w-4" />
                                Share
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 gap-1">
                                <Bookmark className="h-4 w-4" />
                                Save
                              </Button>
                              <Button variant="default" size="sm" className="h-8 gap-1 ml-auto">
                                Post
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>
        </TabsContent>

        <TabsContent value="explore" className="space-y-4">
          <GrokExplore userId={userId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Grok Explore component for discovering AI-powered content
function GrokExplore({ userId }: { userId: string }) {
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInsights() {
      try {
        const response = await fetch(`/api/grok/insights?userId=${userId}`);
        const data = await response.json();

        if (data.success) {
          setInsights(data.insights);
        }
      } catch (error) {
        console.error('Error loading insights:', error);
      } finally {
        setLoading(false);
      }
    }

    loadInsights();
  }, [userId]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-5/6"></div>
              <div className="h-4 bg-muted rounded w-4/6"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">Grok Insights</h3>
        <p className="text-muted-foreground">
          Discover AI-powered insights based on your interests and network
        </p>
      </div>

      {insights.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No insights available at the moment
        </div>
      ) : (
        <div className="space-y-6">
          {insights.map((insight, index) => (
            <Card key={index} className="overflow-hidden">
              <div className="p-6">
                <h4 className="text-lg font-semibold mb-2">{insight.title}</h4>
                <p className="text-muted-foreground mb-4">{insight.description}</p>

                <div className="space-y-4">
                  {insight.items.map((item: any, i: number) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Zap className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{item.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-muted/50 p-4 flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  Generated by Grok based on your activity
                </div>
                <Button variant="outline" size="sm" className="gap-1">
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
