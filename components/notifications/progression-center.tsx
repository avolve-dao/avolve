'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  Award, 
  Coins, 
  CheckCircle, 
  Star, 
  Sparkles, 
  Trophy, 
  Bell, 
  Clock,
  ArrowRight,
  Calendar
} from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface ProgressionCenterProps {
  userId: string;
}

interface ProgressionItem {
  id: string;
  type: 'achievement' | 'token' | 'milestone' | 'feature' | 'completion';
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
  const supabase = createClientComponentClient();

  // Fetch progression items
  useEffect(() => {
    async function fetchItems() {
      // Fetch achievements
      const { data: achievements } = await supabase
        .from('user_achievements')
        .select(`
          id,
          created_at,
          read,
          achievement:achievement_id(name, description, icon)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      // Fetch token transactions
      const { data: tokens } = await supabase
        .from('token_transactions')
        .select(`
          id,
          created_at,
          amount,
          token_type,
          read,
          reason
        `)
        .eq('recipient_id', userId)
        .gt('amount', 0)
        .order('created_at', { ascending: false })
        .limit(20);

      // Fetch component completions
      const { data: completions } = await supabase
        .from('component_progress')
        .select(`
          id,
          updated_at,
          read,
          component:component_id(name, description, pillar:pillar_id(name))
        `)
        .eq('user_id', userId)
        .eq('status', 'completed')
        .order('updated_at', { ascending: false })
        .limit(20);

      // Fetch feature unlocks
      const { data: features } = await supabase
        .from('user_features')
        .select(`
          id,
          created_at,
          read,
          feature_name,
          feature_description,
          feature_path
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      // Fetch milestones
      const { data: milestones } = await supabase
        .from('user_milestones')
        .select(`
          id,
          created_at,
          read,
          milestone_name,
          milestone_description
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      // Process and combine all items
      const processedItems: ProgressionItem[] = [
        ...(achievements?.map(item => ({
          id: item.id,
          type: 'achievement' as const,
          title: `Achievement Unlocked: ${item.achievement.name}`,
          description: item.achievement.description,
          created_at: item.created_at,
          read: item.read,
          data: {
            icon: item.achievement.icon
          },
          link: '/dashboard/achievements'
        })) || []),
        
        ...(tokens?.map(item => ({
          id: item.id,
          type: 'token' as const,
          title: `${item.amount} ${item.token_type} Tokens Earned`,
          description: item.reason || `You've earned ${item.amount} ${item.token_type} tokens.`,
          created_at: item.created_at,
          read: item.read,
          data: {
            amount: item.amount,
            tokenType: item.token_type
          },
          link: '/tokens'
        })) || []),
        
        ...(completions?.map(item => ({
          id: item.id,
          type: 'completion' as const,
          title: `Component Completed: ${item.component.name}`,
          description: `You've completed the ${item.component.name} component in the ${item.component.pillar.name} pillar.`,
          created_at: item.updated_at,
          read: item.read,
          link: '/dashboard/journey'
        })) || []),
        
        ...(features?.map(item => ({
          id: item.id,
          type: 'feature' as const,
          title: `New Feature Unlocked: ${item.feature_name}`,
          description: item.feature_description,
          created_at: item.created_at,
          read: item.read,
          link: item.feature_path
        })) || []),
        
        ...(milestones?.map(item => ({
          id: item.id,
          type: 'milestone' as const,
          title: `Milestone Reached: ${item.milestone_name}`,
          description: item.milestone_description,
          created_at: item.created_at,
          read: item.read,
          link: '/dashboard/journey'
        })) || [])
      ];

      // Sort by date
      processedItems.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setItems(processedItems);
      setUnreadCount(processedItems.filter(item => !item.read).length);
    }

    fetchItems();

    // Set up realtime subscriptions
    const achievementsChannel = supabase
      .channel('progression-achievements')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_achievements',
          filter: `user_id=eq.${userId}`,
        },
        () => fetchItems()
      )
      .subscribe();

    const tokensChannel = supabase
      .channel('progression-tokens')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'token_transactions',
          filter: `recipient_id=eq.${userId}`,
        },
        () => fetchItems()
      )
      .subscribe();

    const componentsChannel = supabase
      .channel('progression-components')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'component_progress',
          filter: `user_id=eq.${userId} AND status=eq.completed`,
        },
        () => fetchItems()
      )
      .subscribe();

    const featuresChannel = supabase
      .channel('progression-features')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_features',
          filter: `user_id=eq.${userId}`,
        },
        () => fetchItems()
      )
      .subscribe();

    const milestonesChannel = supabase
      .channel('progression-milestones')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_milestones',
          filter: `user_id=eq.${userId}`,
        },
        () => fetchItems()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(achievementsChannel);
      supabase.removeChannel(tokensChannel);
      supabase.removeChannel(componentsChannel);
      supabase.removeChannel(featuresChannel);
      supabase.removeChannel(milestonesChannel);
    };
  }, [userId, supabase]);

  // Mark items as read
  const markAsRead = async (itemId: string, itemType: string) => {
    let table = '';
    let idColumn = 'id';
    
    switch (itemType) {
      case 'achievement':
        table = 'user_achievements';
        break;
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
      await supabase
        .from(table)
        .update({ read: true })
        .eq(idColumn, itemId);
        
      // Update local state
      setItems(items.map(item => 
        item.id === itemId ? { ...item, read: true } : item
      ));
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    // Group items by type
    const itemsByType: Record<string, string[]> = {};
    items.forEach(item => {
      if (!item.read) {
        if (!itemsByType[item.type]) {
          itemsByType[item.type] = [];
        }
        itemsByType[item.type].push(item.id);
      }
    });
    
    // Update each table
    const updatePromises = Object.entries(itemsByType).map(([type, ids]) => {
      let table = '';
      switch (type) {
        case 'achievement':
          table = 'user_achievements';
          break;
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
        return supabase
          .from(table)
          .update({ read: true })
          .in('id', ids);
      }
      
      return Promise.resolve();
    });
    
    await Promise.all(updatePromises);
    
    // Update local state
    setItems(items.map(item => ({ ...item, read: true })));
    setUnreadCount(0);
  };

  // Get icon for item type
  const getItemIcon = (type: string) => {
    switch (type) {
      case 'achievement':
        return <Award className="h-5 w-5 text-yellow-500" />;
      case 'token':
        return <Coins className="h-5 w-5 text-blue-500" />;
      case 'completion':
        return <CheckCircle className="h-5 w-5 text-emerald-500" />;
      case 'feature':
        return <Sparkles className="h-5 w-5 text-green-500" />;
      case 'milestone':
        return <Trophy className="h-5 w-5 text-purple-500" />;
      default:
        return <Star className="h-5 w-5 text-zinc-500" />;
    }
  };

  // Filter items based on active tab
  const filteredItems = activeTab === 'all' 
    ? items 
    : items.filter(item => item.type === activeTab);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
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
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={markAllAsRead}
                  className="text-xs h-8"
                >
                  Mark all as read
                </Button>
              )}
            </div>
            <CardDescription>
              Track your achievements and milestones
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs defaultValue="all" onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-6 w-full">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="achievement" className="flex items-center">
                  <Award className="h-3 w-3 mr-1" />
                  <span className="sr-only sm:not-sr-only sm:inline">Awards</span>
                </TabsTrigger>
                <TabsTrigger value="token" className="flex items-center">
                  <Coins className="h-3 w-3 mr-1" />
                  <span className="sr-only sm:not-sr-only sm:inline">Tokens</span>
                </TabsTrigger>
                <TabsTrigger value="completion" className="flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  <span className="sr-only sm:not-sr-only sm:inline">Tasks</span>
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
              
              <ScrollArea className="h-[300px]">
                <TabsContent value={activeTab} className="m-0">
                  {filteredItems.length > 0 ? (
                    <div className="divide-y divide-zinc-800">
                      {filteredItems.map(item => (
                        <div 
                          key={`${item.type}-${item.id}`}
                          className={`p-3 ${!item.read ? 'bg-zinc-900/50' : ''}`}
                          onClick={() => markAsRead(item.id, item.type)}
                        >
                          <div className="flex items-start">
                            <div className="mr-3 mt-0.5">
                              {getItemIcon(item.type)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-medium">{item.title}</h4>
                                {!item.read && (
                                  <Badge variant="secondary" className="ml-2 h-5 px-1.5">New</Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {item.description}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                                </div>
                                {item.link && (
                                  <Link href={item.link}>
                                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                                      View
                                      <ArrowRight className="h-3 w-3 ml-1" />
                                    </Button>
                                  </Link>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                      <Calendar className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        No {activeTab === 'all' ? 'progress items' : activeTab + 's'} to display
                      </p>
                    </div>
                  )}
                </TabsContent>
              </ScrollArea>
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
