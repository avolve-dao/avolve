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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FeatureUnlockProgress } from '@/components/feature-flags/FeatureUnlockProgress';
import { useFeatureFlagContext } from '@/components/providers/FeatureFlagProvider';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { Loader2, Lock, CheckCircle, Star, Gift, Trophy, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

interface FeatureCategory {
  id: string;
  name: string;
  description: string;
  features: string[];
}

export default function FeaturesPage() {
  const { features, isEnabled, loading: featuresLoading } = useFeatureFlagContext();
  const supabase = createClientComponentClient<Database>();
  const [categories, setCategories] = useState<FeatureCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [showConfetti, setShowConfetti] = useState(false);

  // Fetch feature categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase.from('feature_categories').select('*').order('name');

        if (error) throw error;

        setCategories((data as FeatureCategory[]) || []);
      } catch (error) {
        console.error('Error fetching feature categories:', error);
        toast.error('Failed to load feature categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [supabase]);

  // Show confetti when a feature is unlocked
  useEffect(() => {
    if (showConfetti) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  // Group features by category
  const getFeaturesByCategory = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return [];

    return category.features.map(featureKey => ({
      key: featureKey,
      ...features[featureKey],
      isEnabled: isEnabled(featureKey),
    }));
  };

  // Get all features
  const getAllFeatures = () => {
    return Object.keys(features).map(key => ({
      key,
      ...features[key],
      isEnabled: isEnabled(key),
    }));
  };

  // Count unlocked features
  const countUnlockedFeatures = () => {
    return Object.keys(features).filter(key => isEnabled(key)).length;
  };

  // Count total features
  const countTotalFeatures = () => {
    return Object.keys(features).length;
  };

  // Calculate progress percentage
  const calculateProgress = () => {
    const unlocked = countUnlockedFeatures();
    const total = countTotalFeatures();
    return total > 0 ? Math.round((unlocked / total) * 100) : 0;
  };

  if (loading || featuresLoading) {
    return (
      <div className="container py-10">
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Your Features</h1>
          <p className="text-muted-foreground">Track your progress and unlock new features</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-base py-1.5 px-3">
            <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
            <span className="font-medium">{countUnlockedFeatures()}</span>
            <span className="mx-1 text-muted-foreground">/</span>
            <span>{countTotalFeatures()}</span>
            <span className="ml-1">Unlocked</span>
          </Badge>
          <Badge variant="outline" className="text-base py-1.5 px-3 bg-blue-50">
            <Trophy className="h-4 w-4 mr-1 text-blue-500" />
            <span>{calculateProgress()}% Complete</span>
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Feature Explorer</CardTitle>
              <CardDescription>
                Discover available features and what you need to unlock them
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-1">
              <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All Features</TabsTrigger>
                  {categories.map(category => (
                    <TabsTrigger key={category.id} value={category.id}>
                      {category.name}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value="all" className="space-y-4">
                  {getAllFeatures().map(feature => (
                    <FeatureCard
                      key={feature.key}
                      feature={feature}
                      onUnlock={() => setShowConfetti(true)}
                    />
                  ))}
                </TabsContent>

                {categories.map(category => (
                  <TabsContent key={category.id} value={category.id} className="space-y-4">
                    <div className="mb-4">
                      <h3 className="font-medium text-lg">{category.name}</h3>
                      <p className="text-muted-foreground text-sm">{category.description}</p>
                    </div>
                    {getFeaturesByCategory(category.id).map(feature => (
                      <FeatureCard
                        key={feature.key}
                        feature={feature}
                        onUnlock={() => setShowConfetti(true)}
                      />
                    ))}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div>
          <FeatureUnlockProgress />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-amber-500" />
              Coming Soon
            </CardTitle>
            <CardDescription>Exciting new features on the horizon</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ComingSoonFeatureCard
                title="Advanced Analytics"
                description="Gain deeper insights with advanced analytics and visualization tools."
                icon={<Star className="h-8 w-8 text-purple-500" />}
                timeframe="Summer 2025"
              />
              <ComingSoonFeatureCard
                title="Community Challenges"
                description="Participate in community-wide challenges and earn exclusive rewards."
                icon={<Trophy className="h-8 w-8 text-amber-500" />}
                timeframe="Fall 2025"
              />
              <ComingSoonFeatureCard
                title="Personalized Recommendations"
                description="Get AI-powered recommendations tailored to your interests and goals."
                icon={<Gift className="h-8 w-8 text-blue-500" />}
                timeframe="Winter 2025"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface FeatureCardProps {
  feature: {
    key: string;
    description?: string;
    isEnabled: boolean;
    tokenRequirements?: Record<string, number>;
  };
  onUnlock?: () => void;
}

function FeatureCard({ feature, onUnlock }: FeatureCardProps) {
  const formatFeatureName = (key: string) => {
    return key.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
  };

  const getTokenRequirements = () => {
    if (!feature.tokenRequirements) return null;

    return (
      <div className="space-y-1 mt-2">
        <p className="text-sm font-medium">Required to unlock:</p>
        <div className="space-y-1">
          {Object.entries(feature.tokenRequirements).map(([token, amount]) => (
            <div key={token} className="flex justify-between text-sm">
              <span>{token} Tokens:</span>
              <span className="font-medium">{amount}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card
      className={`overflow-hidden transition-all ${
        feature.isEnabled ? 'border-green-200 bg-green-50/30' : 'border-gray-200'
      }`}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h3 className="font-medium flex items-center">
              {feature.isEnabled ? (
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
              ) : (
                <Lock className="h-4 w-4 mr-2 text-muted-foreground" />
              )}
              {formatFeatureName(feature.key)}
            </h3>
            <p className="text-sm text-muted-foreground">
              {feature.description || 'No description available'}
            </p>
          </div>
          <Badge
            variant={feature.isEnabled ? 'default' : 'outline'}
            className={feature.isEnabled ? 'bg-green-500' : ''}
          >
            {feature.isEnabled ? 'Unlocked' : 'Locked'}
          </Badge>
        </div>

        {!feature.isEnabled && getTokenRequirements()}

        {feature.isEnabled && (
          <div className="mt-2">
            <Link href={`/dashboard?feature=${feature.key}`}>
              <Button variant="outline" size="sm" className="w-full">
                Use Feature
              </Button>
            </Link>
          </div>
        )}

        {!feature.isEnabled && (
          <div className="mt-2">
            <Link href="/tokens">
              <Button variant="outline" size="sm" className="w-full">
                Earn Tokens to Unlock
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface ComingSoonFeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  timeframe: string;
}

function ComingSoonFeatureCard({
  title,
  description,
  icon,
  timeframe,
}: ComingSoonFeatureCardProps) {
  return (
    <Card className="bg-gradient-to-br from-gray-50 to-white border-dashed">
      <CardContent className="p-6 flex flex-col items-center text-center">
        <div className="mb-4 p-3 bg-white rounded-full shadow-sm">{icon}</div>
        <h3 className="font-medium text-lg mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm mb-4">{description}</p>
        <Badge variant="outline" className="bg-blue-50">
          Coming {timeframe}
        </Badge>
      </CardContent>
    </Card>
  );
}
