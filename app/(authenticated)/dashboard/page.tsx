'use client';

import { useEffect, useState } from 'react';
import { useSupabase } from '@/lib/supabase/use-supabase';
import DashboardTour from '@/components/DashboardTour';
import Tooltip from '@/components/Tooltip';
import { RecognitionForm } from '@/components/recognition/RecognitionForm';
import RecognitionFeed from '@/components/recognition/RecognitionFeed';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Award,
  Bell,
  Heart,
  LineChart,
  MessageSquare,
  Plus,
  ThumbsUp,
  Trophy,
  Users,
  Info
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import ThankPeerModal from '@/app/components/ThankPeerModal';

/**
 * Dashboard Page
 *
 * Main hub for users to view their progress, interact with peers,
 * and access key platform features.
 */
export default function DashboardPage() {
  const { user } = useSupabase();
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [userStats, setUserStats] = useState<{
    tokens: { [key: string]: number };
    recognitionsSent: number;
    recognitionsReceived: number;
    milestones: number;
    lastActive: string | null;
  }>({
    tokens: {},
    recognitionsSent: 0,
    recognitionsReceived: 0,
    milestones: 0,
    lastActive: null,
  });
  const [loading, setLoading] = useState(true);

  // Check if this is the user's first visit
  useEffect(() => {
    const isFirstVisit = localStorage.getItem('avolve_dashboard_visited') === null;
    if (isFirstVisit && user) {
      localStorage.setItem('avolve_dashboard_visited', 'true');
      setShowTour(true);
    }
  }, [user]);

  // Fetch user stats
  useEffect(() => {
    if (!user) return;

    async function fetchUserStats() {
      try {
        const response = await fetch('/api/user/dashboard-stats');
        const data = await response.json();

        if (data.error) {
          console.error('Error fetching user stats:', data.error);
          return;
        }

        setUserStats({
          tokens: data.tokens || {},
          recognitionsSent: data.recognitionsSent || 0,
          recognitionsReceived: data.recognitionsReceived || 0,
          milestones: data.milestones || 0,
          lastActive: data.lastActive,
        });
      } catch (error) {
        console.error('Error fetching user stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserStats();
  }, [user]);

  // Handle recognition sent
  const handleRecognitionSent = () => {
    setModalOpen(false);
    toast({
      title: 'Recognition Sent!',
      description: 'Your peer will be notified of your appreciation.',
      variant: 'default',
    });

    // Update local stats
    setUserStats(prev => ({
      ...prev,
      recognitionsSent: prev.recognitionsSent + 1,
    }));
  };

  // Token display component
  const TokenDisplay = ({ type, amount }: { type: string; amount: number }) => {
    const tokenColors: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
      GEN: {
        bg: 'bg-zinc-100',
        text: 'text-zinc-800',
        icon: <Trophy className="h-4 w-4" />,
      },
      SAP: {
        bg: 'bg-stone-100',
        text: 'text-stone-800',
        icon: <Award className="h-4 w-4" />,
      },
      SCQ: {
        bg: 'bg-slate-100',
        text: 'text-slate-800',
        icon: <Users className="h-4 w-4" />,
      },
      PSP: {
        bg: 'bg-amber-100',
        text: 'text-amber-800',
        icon: <ThumbsUp className="h-4 w-4" />,
      },
      BSP: {
        bg: 'bg-cyan-100',
        text: 'text-cyan-800',
        icon: <LineChart className="h-4 w-4" />,
      },
      SPD: {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        icon: <MessageSquare className="h-4 w-4" />,
      },
      SHE: {
        bg: 'bg-rose-100',
        text: 'text-rose-800',
        icon: <Heart className="h-4 w-4" />,
      },
    };

    const { bg, text, icon } = tokenColors[type] || {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      icon: <Bell className="h-4 w-4" />,
    };

    return (
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${bg} ${text}`}>
        {icon}
        <span className="text-sm font-medium">
          {amount} {type}
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="h-96 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div>
            <div className="h-64 bg-gray-200 rounded animate-pulse mb-6"></div>
            <div className="h-28 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white mb-8 shadow-md">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">Welcome to Avolve</h1>
            <p className="text-indigo-100">
              Your journey to building a supercivilization starts here. Track your progress, connect with peers, and unlock new features.
            </p>
          </div>
          <Button 
            variant="secondary" 
            className="whitespace-nowrap"
            onClick={() => setShowTour(true)}
          >
            <Info className="mr-2 h-4 w-4" />
            Take Tour
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tokens Earned</p>
                <h3 className="text-2xl font-bold mt-1">
                  {Object.values(userStats.tokens).reduce((sum, val) => sum + val, 0)}
                </h3>
              </div>
              <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                <Trophy className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Recognitions Received</p>
                <h3 className="text-2xl font-bold mt-1">{userStats.recognitionsReceived}</h3>
              </div>
              <div className="p-2 bg-green-100 rounded-full text-green-600">
                <Award className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Recognitions Sent</p>
                <h3 className="text-2xl font-bold mt-1">{userStats.recognitionsSent}</h3>
              </div>
              <div className="p-2 bg-amber-100 rounded-full text-amber-600">
                <ThumbsUp className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Milestones</p>
                <h3 className="text-2xl font-bold mt-1">{userStats.milestones}</h3>
              </div>
              <div className="p-2 bg-purple-100 rounded-full text-purple-600">
                <LayersIcon className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Token Overview */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Your Tokens</h2>
        <div className="flex flex-wrap gap-2">
          {Object.entries(userStats.tokens).map(([type, amount]) => (
            <TokenDisplay key={type} type={type} amount={amount} />
          ))}
        </div>
      </div>

      {/* Next Actions */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Next Actions</CardTitle>
          <CardDescription>Complete these to progress on your journey</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            <li className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Completed
              </Badge>
              <span>Create your profile</span>
            </li>
            <li className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                In Progress
              </Badge>
              <span>Earn 10 SAP tokens</span>
            </li>
            <li className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                In Progress
              </Badge>
              <span>Reach phase 2</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="feed" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="feed">Recognition Feed</TabsTrigger>
          <TabsTrigger value="personal">Personal Progress</TabsTrigger>
          <TabsTrigger value="community">Community</TabsTrigger>
        </TabsList>

        <TabsContent value="feed" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <RecognitionFeed />
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Send Recognition</CardTitle>
                  <CardDescription>
                    Appreciate someone who helped you or did great work
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {user ? (
                    <RecognitionForm recipientId="" onRecognitionSent={handleRecognitionSent} />
                  ) : (
                    <p className="text-muted-foreground">Please sign in to send recognition</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Contributors</CardTitle>
                  <CardDescription>Most active community members</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-center justify-between">
                      <span>Alex Thompson</span>
                      <Badge>23 recognitions</Badge>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Jamie Rivera</span>
                      <Badge>19 recognitions</Badge>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Sam Wilson</span>
                      <Badge>15 recognitions</Badge>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle>Personal Progress</CardTitle>
              <CardDescription>Track your journey and achievements</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Your personal progress dashboard is coming soon! Here you'll be able to track your
                achievements, token earnings, and journey through the platform.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="community">
          <Card>
            <CardHeader>
              <CardTitle>Community Progress</CardTitle>
              <CardDescription>See how the community is growing together</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                The community dashboard is coming soon! Here you'll be able to see collective
                milestones, community challenges, and how everyone is contributing to building the
                supercivilization.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Thank Peer Modal */}
      <ThankPeerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleRecognitionSent}
      />
      
      {/* Dashboard Tour */}
      {showTour && (
        <DashboardTour 
          onComplete={() => setShowTour(false)}
          onSkip={() => setShowTour(false)}
        />
      )}
    </div>
  );
}
