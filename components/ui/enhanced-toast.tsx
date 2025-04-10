'use client';

import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Coins, CheckCircle, Star, Sparkles, Trophy } from 'lucide-react';
import Link from 'next/link';
import { ContextualTooltip } from '@/components/ui/contextual-tooltip';

// Define toast types and their configurations
const toastConfigs = {
  achievement: {
    icon: <Award className="h-5 w-5 text-yellow-500" />,
    title: 'Achievement Unlocked!',
    actionText: 'View Achievements',
    actionLink: '/dashboard/achievements',
    duration: 5000,
    className: 'border-yellow-600 bg-yellow-950/20',
  },
  token: {
    icon: <Coins className="h-5 w-5 text-blue-500" />,
    title: 'Tokens Earned!',
    actionText: 'View Tokens',
    actionLink: '/tokens',
    duration: 4000,
    className: 'border-blue-600 bg-blue-950/20',
  },
  milestone: {
    icon: <Trophy className="h-5 w-5 text-purple-500" />,
    title: 'Milestone Reached!',
    actionText: 'View Journey',
    actionLink: '/dashboard/journey',
    duration: 6000,
    className: 'border-purple-600 bg-purple-950/20',
  },
  feature: {
    icon: <Sparkles className="h-5 w-5 text-green-500" />,
    title: 'New Feature Unlocked!',
    actionText: 'Explore Now',
    actionLink: '/dashboard',
    duration: 6000,
    className: 'border-green-600 bg-green-950/20',
  },
  completion: {
    icon: <CheckCircle className="h-5 w-5 text-emerald-500" />,
    title: 'Component Completed!',
    actionText: 'Continue Journey',
    actionLink: '/dashboard/journey',
    duration: 5000,
    className: 'border-emerald-600 bg-emerald-950/20',
  },
};

export type ToastType = keyof typeof toastConfigs;

interface EnhancedToastProps {
  type: ToastType;
  title?: string;
  description: string;
  actionText?: string;
  actionLink?: string;
  tooltipType?: string;
  userId?: string;
}

// Function to show enhanced toast notifications
export function showEnhancedToast({
  type,
  title,
  description,
  actionText,
  actionLink,
  tooltipType,
  userId,
}: EnhancedToastProps) {
  const config = toastConfigs[type];
  
  toast({
    title: title || config.title,
    description: (
      <div className="mt-2 space-y-3">
        <p>{description}</p>
        {actionLink && (
          <Link href={actionLink || config.actionLink} className="inline-block">
            <Button variant="outline" size="sm">
              {actionText || config.actionText}
            </Button>
          </Link>
        )}
        {tooltipType && userId && (
          <div className="text-xs text-muted-foreground">
            <ContextualTooltip 
              type={tooltipType as any} 
              userId={userId}
              showIcon={false}
              className="underline cursor-help"
            >
              Learn more about this feature
            </ContextualTooltip>
          </div>
        )}
      </div>
    ),
    duration: config.duration,
    className: config.className,
    icon: config.icon,
  });
}

// Component to listen for realtime events and show toasts
export function ToastListener({ userId }: { userId: string }) {
  const supabase = createClientComponentClient();
  
  useEffect(() => {
    if (!userId) return;
    
    // Subscribe to achievements channel
    const achievementsChannel = supabase
      .channel('achievements')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_achievements',
          filter: `user_id=eq.${userId}`,
        },
        async (payload) => {
          // Fetch achievement details
          const { data: achievement } = await supabase
            .from('achievements')
            .select('*')
            .eq('id', payload.new.achievement_id)
            .single();
            
          if (achievement) {
            showEnhancedToast({
              type: 'achievement',
              description: `You've earned the "${achievement.name}" achievement!`,
              userId,
            });
          }
        }
      )
      .subscribe();
      
    // Subscribe to token transactions channel
    const tokensChannel = supabase
      .channel('tokens')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'token_transactions',
          filter: `recipient_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.new.amount > 0) {
            showEnhancedToast({
              type: 'token',
              description: `You've received ${payload.new.amount} ${payload.new.token_type} tokens!`,
              tooltipType: payload.new.token_type === 'GEN' ? 'gen_token' : 'utility_tokens',
              userId,
            });
          }
        }
      )
      .subscribe();
      
    // Subscribe to component completions channel
    const componentsChannel = supabase
      .channel('components')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'component_progress',
          filter: `user_id=eq.${userId} AND status=eq.completed`,
        },
        async (payload) => {
          // Fetch component details
          const { data: component } = await supabase
            .from('components')
            .select('name, pillar:pillar_id(name)')
            .eq('id', payload.new.component_id)
            .single();
            
          if (component) {
            showEnhancedToast({
              type: 'completion',
              description: `You've completed "${component.name}" in the ${component.pillar.name} pillar!`,
              userId,
            });
          }
        }
      )
      .subscribe();
      
    // Subscribe to feature unlocks channel
    const featuresChannel = supabase
      .channel('features')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_features',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          showEnhancedToast({
            type: 'feature',
            description: `You've unlocked the ${payload.new.feature_name} feature!`,
            actionLink: payload.new.feature_path,
            userId,
          });
        }
      )
      .subscribe();
      
    // Subscribe to milestone completions channel
    const milestonesChannel = supabase
      .channel('milestones')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_milestones',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          showEnhancedToast({
            type: 'milestone',
            description: `You've reached the "${payload.new.milestone_name}" milestone!`,
            userId,
          });
        }
      )
      .subscribe();
    
    // Cleanup function
    return () => {
      supabase.removeChannel(achievementsChannel);
      supabase.removeChannel(tokensChannel);
      supabase.removeChannel(componentsChannel);
      supabase.removeChannel(featuresChannel);
      supabase.removeChannel(milestonesChannel);
    };
  }, [userId, supabase]);
  
  return null;
}

// Animation component for token acquisition
export function TokenAnimation({ 
  amount, 
  tokenType = 'GEN',
  onComplete 
}: { 
  amount: number; 
  tokenType?: string;
  onComplete?: () => void;
}) {
  const [visible, setVisible] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onComplete) onComplete();
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [onComplete]);
  
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="flex items-center bg-black/80 px-4 py-2 rounded-full"
            initial={{ scale: 0.5, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 1.5, y: -50 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <motion.div
              className="mr-2"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: 1 }}
            >
              <img 
                src={`/tokens/${tokenType.toLowerCase()}.svg`} 
                alt={tokenType} 
                className="h-6 w-6"
              />
            </motion.div>
            <motion.div
              className="text-lg font-bold text-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              +{amount} {tokenType}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
