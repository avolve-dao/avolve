'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Compass,
  MessageSquare,
  Bell,
  Menu,
  X,
  ChevronRight,
  ArrowLeft,
  User,
  Settings,
  LogOut,
  Layers,
  Users,
  Award,
  Puzzle,
  Coins,
} from 'lucide-react';
import { createClient } from '../../lib/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface TouchNavigationProps {
  userId: string;
}

export function TouchNavigation({ userId }: TouchNavigationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const supabase = createClient();

  // Fetch user data
  useEffect(() => {
    async function fetchUserData() {
      // Fetch user profile
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profile) {
        setUserProfile(profile);
      }

      // Fetch unread messages count
      const { count: messageCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', userId)
        .eq('read', false);

      setUnreadMessages(messageCount || 0);

      // Fetch unread notifications count
      const { count: notificationCount } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false);

      setUnreadNotifications(notificationCount || 0);
    }

    fetchUserData();

    // Set up realtime subscriptions for messages and notifications
    const messagesChannel = supabase
      .channel('mobile-messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${userId}`,
        },
        () => {
          fetchUserData();
        }
      )
      .subscribe();

    const notificationsChannel = supabase
      .channel('mobile-notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchUserData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(notificationsChannel);
    };
  }, [userId, supabase]);

  // Define main navigation items
  const mainNavItems = [
    {
      icon: <Home className="h-6 w-6" />,
      label: 'Home',
      path: '/dashboard',
    },
    {
      icon: <Compass className="h-6 w-6" />,
      label: 'Discover',
      path: '/dashboard/discover',
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      label: 'Messages',
      path: '/messages',
      badge: unreadMessages > 0 ? unreadMessages : undefined,
    },
    {
      icon: <Bell className="h-6 w-6" />,
      label: 'Notifications',
      path: '/notifications',
      badge: unreadNotifications > 0 ? unreadNotifications : undefined,
    },
    {
      icon: <Menu className="h-6 w-6" />,
      label: 'Menu',
      action: () => setIsMenuOpen(true),
    },
  ];

  // Define menu sections
  const menuSections = {
    journey: {
      title: 'Your Journey',
      items: [
        {
          icon: <Layers className="h-5 w-5" />,
          label: 'Journey Map',
          path: '/dashboard/journey',
        },
        {
          icon: <Award className="h-5 w-5" />,
          label: 'Achievements',
          path: '/dashboard/achievements',
        },
        {
          icon: <Coins className="h-5 w-5" />,
          label: 'Tokens',
          path: '/tokens',
        },
      ],
    },
    community: {
      title: 'Community',
      items: [
        {
          icon: <Users className="h-5 w-5" />,
          label: 'Teams',
          path: '/teams',
        },
        {
          icon: <Puzzle className="h-5 w-5" />,
          label: 'Superpuzzles',
          path: '/superpuzzles',
        },
      ],
    },
    account: {
      title: 'Account',
      items: [
        {
          icon: <User className="h-5 w-5" />,
          label: 'Profile',
          path: '/dashboard/profile',
        },
        {
          icon: <Settings className="h-5 w-5" />,
          label: 'Settings',
          path: '/settings',
        },
        {
          icon: <LogOut className="h-5 w-5" />,
          label: 'Logout',
          path: '/auth/logout',
        },
      ],
    },
  };

  // Check if a path is active
  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`);
  };

  // Handle navigation
  const handleNavigation = (item: any) => {
    if (item.action) {
      item.action();
    } else if (item.path) {
      router.push(item.path);
      setIsMenuOpen(false);
      setActiveSection(null);
    }
  };

  return (
    <>
      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-zinc-950 border-t border-zinc-800 z-50 md:hidden">
        <div className="flex items-center justify-around">
          {mainNavItems.map((item, index) => (
            <button
              key={index}
              className={`flex flex-col items-center justify-center py-3 px-4 relative ${
                isActive(item.path || '') ? 'text-primary' : 'text-muted-foreground'
              }`}
              onClick={() => handleNavigation(item)}
            >
              {item.icon}
              <span className="text-xs mt-1">{item.label}</span>
              {item.badge && (
                <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-medium text-white">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Full Screen Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="fixed inset-0 bg-background z-50 md:hidden"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                <div className="flex items-center">
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage src={userProfile?.avatar_url} />
                    <AvatarFallback>{userProfile?.display_name?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-medium">
                      {userProfile?.display_name || userProfile?.full_name || 'User'}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {userProfile?.experience_phase?.charAt(0).toUpperCase() +
                        userProfile?.experience_phase?.slice(1) || 'Discovery'}{' '}
                      Phase
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setActiveSection(null);
                  }}
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>

              <div className="flex-1 overflow-auto">
                {activeSection ? (
                  <div className="p-4">
                    <button
                      className="flex items-center text-muted-foreground mb-4"
                      onClick={() => setActiveSection(null)}
                    >
                      <ArrowLeft className="h-5 w-5 mr-2" />
                      Back to Menu
                    </button>

                    <h2 className="text-xl font-bold mb-4">
                      {menuSections[activeSection as keyof typeof menuSections].title}
                    </h2>

                    <div className="space-y-2">
                      {menuSections[activeSection as keyof typeof menuSections].items.map(
                        (item, index) => (
                          <button
                            key={index}
                            className={`flex items-center justify-between w-full p-4 rounded-md ${
                              isActive(item.path)
                                ? 'bg-primary/10 text-primary'
                                : 'hover:bg-zinc-900'
                            }`}
                            onClick={() => handleNavigation(item)}
                          >
                            <div className="flex items-center">
                              {item.icon}
                              <span className="ml-3">{item.label}</span>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          </button>
                        )
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 space-y-6">
                    {Object.entries(menuSections).map(([key, section]) => (
                      <div key={key}>
                        <h2 className="text-lg font-bold mb-2">{section.title}</h2>
                        <button
                          className="flex items-center justify-between w-full p-4 rounded-md hover:bg-zinc-900"
                          onClick={() => setActiveSection(key)}
                        >
                          <div className="flex items-center">
                            <span>View all {section.title.toLowerCase()}</span>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </button>
                      </div>
                    ))}

                    <div>
                      <h2 className="text-lg font-bold mb-2">Quick Access</h2>
                      <div className="grid grid-cols-3 gap-2">
                        <Link
                          href="/dashboard"
                          className="flex flex-col items-center justify-center p-4 rounded-md border border-zinc-800 hover:bg-zinc-900"
                          onClick={() => {
                            setIsMenuOpen(false);
                            setActiveSection(null);
                          }}
                        >
                          <Home className="h-6 w-6 mb-2" />
                          <span className="text-xs text-center">Dashboard</span>
                        </Link>
                        <Link
                          href="/tokens"
                          className="flex flex-col items-center justify-center p-4 rounded-md border border-zinc-800 hover:bg-zinc-900"
                          onClick={() => {
                            setIsMenuOpen(false);
                            setActiveSection(null);
                          }}
                        >
                          <Coins className="h-6 w-6 mb-2" />
                          <span className="text-xs text-center">Tokens</span>
                        </Link>
                        <Link
                          href="/dashboard/journey"
                          className="flex flex-col items-center justify-center p-4 rounded-md border border-zinc-800 hover:bg-zinc-900"
                          onClick={() => {
                            setIsMenuOpen(false);
                            setActiveSection(null);
                          }}
                        >
                          <Layers className="h-6 w-6 mb-2" />
                          <span className="text-xs text-center">Journey</span>
                        </Link>
                      </div>
                    </div>

                    <div>
                      <h2 className="text-lg font-bold mb-2">Your Stats</h2>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-4 rounded-md border border-zinc-800">
                          <h3 className="text-sm text-muted-foreground">GEN Tokens</h3>
                          <p className="text-xl font-bold">{userProfile?.gen_tokens || 0}</p>
                        </div>
                        <div className="p-4 rounded-md border border-zinc-800">
                          <h3 className="text-sm text-muted-foreground">Achievements</h3>
                          <p className="text-xl font-bold">
                            {userProfile?.achievements_count || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer for bottom navigation */}
      <div className="h-16 md:hidden" />
    </>
  );
}
