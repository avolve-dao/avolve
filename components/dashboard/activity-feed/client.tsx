'use client';

/**
 * Activity Feed Client Component
 *
 * Client-side interactive component for displaying user activities
 * Copyright 2025 Avolve DAO. All rights reserved.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Bell,
  Calendar,
  Coins,
  ArrowRight,
  ArrowLeft,
  Check,
  MessageSquare,
  ThumbsUp,
  Award,
  Eye,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// UI components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Local token definitions
// These were previously imported from '@/app/dashboard/dashboard-page'
const TOKEN_GRADIENTS = {
  SAP: 'from-blue-500 to-indigo-600',
  PSP: 'from-green-500 to-emerald-600',
  BSP: 'from-purple-500 to-violet-600',
  SMS: 'from-red-500 to-rose-600',
  SCQ: 'from-amber-500 to-yellow-600',
  SPD: 'from-cyan-500 to-sky-600',
  SHE: 'from-pink-500 to-fuchsia-600',
  SSA: 'from-teal-500 to-green-600',
  SGB: 'from-indigo-500 to-blue-600',
};

const TOKEN_NAMES = {
  SAP: 'Superachiever Personal',
  PSP: 'Personal Success Puzzle',
  BSP: 'Business Success Puzzle',
  SMS: 'Supermind Superpowers',
  SCQ: 'Superpuzzle Developments',
  SPD: 'Superhuman Enhancements',
  SHE: 'Supersociety Advancements',
  SSA: 'Superachievers',
  SGB: 'Supergenius Breakthroughs',
};

export interface ActivityItem {
  type: 'activity' | 'notification' | 'event_completion' | 'token_transaction';
  id: string;
  timestamp: string;
  data: any;
}

interface ActivityFeedClientProps {
  activities: ActivityItem[];
  userId: string;
}

export function ActivityFeedClient({ activities, userId }: ActivityFeedClientProps) {
  const [activeTab, setActiveTab] = useState<string>('all');

  // Filter activities based on active tab
  const filteredActivities =
    activeTab === 'all' ? activities : activities.filter(activity => activity.type === activeTab);

  // Get icon for activity type
  const getActivityIcon = (activity: ActivityItem) => {
    switch (activity.type) {
      case 'activity':
        const actionType = activity.data.action_type;
        if (actionType === 'login') return <Activity className="w-4 h-4 text-blue-500" />;
        if (actionType === 'view') return <Eye className="w-4 h-4 text-purple-500" />;
        if (actionType === 'click') return <Check className="w-4 h-4 text-green-500" />;
        if (actionType === 'comment') return <MessageSquare className="w-4 h-4 text-orange-500" />;
        if (actionType === 'react') return <ThumbsUp className="w-4 h-4 text-pink-500" />;
        return <Activity className="w-4 h-4 text-blue-500" />;

      case 'notification':
        return <Bell className="w-4 h-4 text-red-500" />;

      case 'event_completion':
        return <Calendar className="w-4 h-4 text-green-500" />;

      case 'token_transaction':
        return <Coins className="w-4 h-4 text-amber-500" />;

      default:
        return <Activity className="w-4 h-4 text-blue-500" />;
    }
  };

  // Get title for activity
  const getActivityTitle = (activity: ActivityItem) => {
    switch (activity.type) {
      case 'activity':
        const actionType = activity.data.action_type;
        if (actionType === 'login') return 'Logged in';
        if (actionType === 'view') return `Viewed ${activity.data.resource_type}`;
        if (actionType === 'click') return `Clicked ${activity.data.resource_type}`;
        if (actionType === 'comment') return 'Posted a comment';
        if (actionType === 'react') return 'Reacted to content';
        return 'Performed an action';

      case 'notification':
        return activity.data.title;

      case 'event_completion':
        return `Completed ${activity.data.events.name}`;

      case 'token_transaction':
        const isReceiving = activity.data.to_user_id === userId;
        const tokenSymbol = activity.data.token?.symbol || 'tokens';

        return isReceiving
          ? `Received ${activity.data.amount} ${tokenSymbol}`
          : `Sent ${activity.data.amount} ${tokenSymbol}`;

      default:
        return 'Activity';
    }
  };

  // Get description for activity
  const getActivityDescription = (activity: ActivityItem) => {
    switch (activity.type) {
      case 'activity':
        return activity.data.details?.description || '';

      case 'notification':
        return activity.data.message;

      case 'event_completion':
        return (
          activity.data.events?.description ||
          `You completed ${activity.data.events?.name || 'an event'}`
        );

      case 'token_transaction':
        const isReceiving = activity.data.to_user_id === userId;
        const tokenSymbol = (activity.data.token?.symbol as string) || '';
        const tokenName =
          (tokenSymbol && TOKEN_NAMES[tokenSymbol as keyof typeof TOKEN_NAMES]) || 'tokens';

        return isReceiving
          ? `You received ${activity.data.amount} ${tokenName} from a ${activity.data.transaction_type}`
          : `You sent ${activity.data.amount} ${tokenName} in a ${activity.data.transaction_type}`;

      default:
        return '';
    }
  };

  // Get gradient for token transactions
  const getTokenGradient = (activity: ActivityItem) => {
    if (activity.type !== 'token_transaction') return '';

    const tokenSymbol = (activity.data.token?.symbol as string) || '';
    return tokenSymbol && TOKEN_GRADIENTS[tokenSymbol as keyof typeof TOKEN_GRADIENTS]
      ? TOKEN_GRADIENTS[tokenSymbol as keyof typeof TOKEN_GRADIENTS]
      : 'from-gray-500 to-gray-600';
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return 'recently';
    }
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="notification">Notifications</TabsTrigger>
          <TabsTrigger value="event_completion">Events</TabsTrigger>
          <TabsTrigger value="token_transaction">Tokens</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4 space-y-4">
          {filteredActivities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No activities to display</p>
              <p className="text-sm">Complete actions to see your activity feed</p>
            </div>
          ) : (
            filteredActivities.map(activity => (
              <motion.div
                key={`${activity.type}-${activity.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex items-start space-x-4 p-3 rounded-lg border ${
                  activity.type === 'token_transaction'
                    ? 'border-amber-200 dark:border-amber-800'
                    : ''
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    activity.type === 'token_transaction'
                      ? `bg-gradient-to-r ${getTokenGradient(activity)} text-white`
                      : 'bg-muted'
                  }`}
                >
                  {getActivityIcon(activity)}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{getActivityTitle(activity)}</h4>
                    <span className="text-xs text-muted-foreground">
                      {formatTimestamp(activity.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {getActivityDescription(activity)}
                  </p>

                  {activity.type === 'event_completion' && activity.data.events.token_rewards && (
                    <div className="flex items-center mt-1">
                      <Badge
                        variant="outline"
                        className="bg-amber-50 text-amber-700 border-amber-200"
                      >
                        +{activity.data.events.token_rewards.amount}{' '}
                        {activity.data.events.token_rewards.token_symbol}
                      </Badge>
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </TabsContent>
      </Tabs>

      {filteredActivities.length > 0 && (
        <div className="flex justify-center pt-2">
          <Button variant="outline" size="sm">
            View All Activities
          </Button>
        </div>
      )}
    </div>
  );
}
