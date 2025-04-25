'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { createClient } from '../../lib/supabase/client';
import {
  Coins,
  CheckCircle,
  Sparkles,
  Trophy,
  Bell,
  Clock,
  ArrowRight,
  Calendar,
} from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface ProgressionCenterProps {
  userId: string;
}

interface ProgressionItem {
  id: string;
  type: 'token' | 'completion' | 'feature' | 'milestone';
  title: string;
  description: string;
  created_at: string;
  read: boolean;
  data?: any;
  link?: string;
}

export function ProgressionCenter({ userId }: ProgressionCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [items, setItems] = useState<ProgressionItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const supabase = createClient();

  useEffect(() => {
    async function fetchItems() {
      // Fetch milestones
      const { data: milestones } = await supabase
        .from('user_milestones')
        .select('*')
        .eq('user_id', userId);

      // Fetch tokens
      const { data: tokens } = await supabase
        .from('token_transactions')
        .select('*')
        .eq('user_id', userId);

      // Fetch completions
      const { data: completions } = await supabase
        .from('component_progress')
        .select('*')
        .eq('user_id', userId);

      // Fetch features
      const { data: features } = await supabase
        .from('user_features')
        .select('*')
        .eq('user_id', userId);

      // Combine and map all items to unified structure
      const processedItems: ProgressionItem[] = [
        ...(milestones || []).map(m => ({
          id: m.id,
          type: 'milestone' as const,
          title: m.milestone_name || 'Milestone Reached',
          description: m.milestone_description || '',
          created_at: m.created_at,
          read: m.read,
          data: m,
          link: '/dashboard/journey',
        })),
        ...(tokens || []).map(t => ({
          id: t.id,
          type: 'token' as const,
          title: `${t.amount} ${t.token_type} Tokens Earned`,
          description: t.reason || `You've earned ${t.amount} ${t.token_type} tokens.`,
          created_at: t.created_at,
          read: t.read,
          data: t,
          link: '/tokens',
        })),
        ...(completions || []).map(c => ({
          id: c.id,
          type: 'completion' as const,
          title: c.component_name
            ? `Component Completed: ${c.component_name}`
            : 'Component Completed',
          description: c.component_description || '',
          created_at: c.updated_at || c.created_at,
          read: c.read,
          data: c,
          link: '/dashboard/journey',
        })),
        ...(features || []).map(f => ({
          id: f.id,
          type: 'feature' as const,
          title: f.feature_name ? `New Feature Unlocked: ${f.feature_name}` : 'Feature Unlocked',
          description: f.feature_description || '',
          created_at: f.created_at,
          read: f.read,
          data: f,
          link: f.feature_path || '/dashboard/features',
        })),
      ];
      processedItems.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setItems(processedItems);
      setUnreadCount(processedItems.filter(item => !item.read).length);
    }
    fetchItems();
  }, [userId, supabase]);

  const markAsRead = async (itemId: string, itemType: string) => {
    let table = '';
    const idColumn = 'id';
    switch (itemType) {
      case 'token':
        table = 'token_transactions';
        break;
      case 'completion':
        table = 'component_progress';
        break;
      case 'feature':
        table = 'user_features';
        break;
      case 'milestone':
        table = 'user_milestones';
        break;
    }
    if (table) {
      await supabase.from(table).update({ read: true }).eq(idColumn, itemId);
      setItems(items.map(item => (item.id === itemId ? { ...item, read: true } : item)));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const markAllAsRead = async () => {
    const itemsByType: Record<string, string[]> = {};
    items.forEach(item => {
      if (!item.read) {
        if (!itemsByType[item.type]) itemsByType[item.type] = [];
        itemsByType[item.type].push(item.id);
      }
    });
    const updatePromises = Object.entries(itemsByType).map(([type, ids]) => {
      let table = '';
      switch (type) {
        case 'token':
          table = 'token_transactions';
          break;
        case 'completion':
          table = 'component_progress';
          break;
        case 'feature':
          table = 'user_features';
          break;
        case 'milestone':
          table = 'user_milestones';
          break;
      }
      if (table && ids.length > 0) {
        return supabase.from(table).update({ read: true }).in('id', ids);
      }
      return Promise.resolve();
    });
    await Promise.all(updatePromises);
    setItems(items.map(item => ({ ...item, read: true })));
    setUnreadCount(0);
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'token':
        return <Coins className="h-5 w-5 text-blue-500" />;
      case 'completion':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'feature':
        return <Sparkles className="h-5 w-5 text-orange-500" />;
      case 'milestone':
        return <Trophy className="h-5 w-5 text-purple-500" />;
      default:
        return <div className="h-5 w-5 text-zinc-500" />;
    }
  };

  const filteredItems = activeTab === 'all' ? items : items.filter(item => item.type === activeTab);

  return (
    <div className="relative">
      <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} className="relative">
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-medium text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <Card className="absolute right-0 top-10 w-96 z-50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle>Your Progress</CardTitle>
              {unreadCount > 0 && (
                <Button variant="outline" size="sm" onClick={markAllAsRead}>
                  Mark all as read
                </Button>
              )}
            </div>
            <CardDescription>Track your milestones and progress</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-5 w-full">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="token" className="flex items-center">
                  <Coins className="h-3 w-3 mr-1" />
                  <span className="sr-only sm:not-sr-only sm:inline">Tokens</span>
                </TabsTrigger>
                <TabsTrigger value="completion" className="flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  <span className="sr-only sm:not-sr-only sm:inline">Completions</span>
                </TabsTrigger>
                <TabsTrigger value="feature" className="flex items-center">
                  <Sparkles className="h-3 w-3 mr-1" />
                  <span className="sr-only sm:not-sr-only sm:inline">Features</span>
                </TabsTrigger>
                <TabsTrigger value="milestone" className="flex items-center">
                  <Trophy className="h-3 w-3 mr-1" />
                  <span className="sr-only sm:not-sr-only sm:inline">Milestones</span>
                </TabsTrigger>
              </TabsList>
              <TabsContent value={activeTab} className="p-0">
                <ScrollArea className="h-80">
                  {filteredItems.length === 0 ? (
                    <div className="text-center py-8 text-zinc-400">No notifications yet.</div>
                  ) : (
                    <ul className="divide-y divide-zinc-100">
                      {filteredItems.map(item => (
                        <li
                          key={item.id}
                          className={`flex items-start gap-3 px-4 py-3 group ${!item.read ? 'bg-zinc-50' : ''}`}
                        >
                          <div className="pt-1">{getItemIcon(item.type)}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm text-zinc-900 line-clamp-1">
                                {item.title}
                              </span>
                              {!item.read && (
                                <Badge variant="outline" className="text-xs">
                                  New
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-zinc-600 line-clamp-2 mb-1">
                              {item.description}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-zinc-400">
                              <Calendar className="h-3 w-3" />
                              {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {item.link && (
                              <Link
                                href={item.link}
                                className="text-blue-600 hover:underline text-xs flex items-center gap-1"
                              >
                                View <ArrowRight className="h-3 w-3" />
                              </Link>
                            )}
                            {!item.read && (
                              <Button
                                variant="link"
                                size="sm"
                                onClick={() => markAsRead(item.id, item.type)}
                              >
                                Mark as read
                              </Button>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between border-t border-zinc-800 py-3">
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
              Close
            </Button>
            <Link href="/dashboard/achievements">
              <Button variant="outline" size="sm">
                View All Progress
              </Button>
            </Link>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
