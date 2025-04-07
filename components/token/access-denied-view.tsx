import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToken } from '@/lib/token/useToken';
import { TokenType, UserToken } from '@/lib/token/useToken';
import { LockIcon, UnlockIcon, ArrowRightIcon, TrophyIcon, BookOpenIcon, MapIcon } from 'lucide-react';

interface AccessDeniedViewProps {
  requiredToken?: string;
  resourceType?: string;
  resourceId?: string;
  userPhase?: string;
}

export default function AccessDeniedView({
  requiredToken,
  resourceType,
  resourceId,
  userPhase = 'discovery'
}: AccessDeniedViewProps) {
  const { 
    getTokenDetails, 
    getUserTokens, 
    getResourceDetails,
    getNextRecommendedActions,
    isLoading 
  } = useToken();
  
  const [tokenDetails, setTokenDetails] = useState<TokenType | null>(null);
  const [userTokens, setUserTokens] = useState<UserToken[]>([]);
  const [resourceDetails, setResourceDetails] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get token details if a token is required
        if (requiredToken) {
          const details = await getTokenDetails(requiredToken);
          if (details) {
            setTokenDetails(details);
          }
        }
        
        // Get user tokens to calculate progress
        const tokensResult = await getUserTokens();
        if (tokensResult.data) {
          setUserTokens(tokensResult.data);
        }
        
        // Get resource details if available
        if (resourceType && resourceId && 
            (resourceType === 'pillar' || resourceType === 'section' || resourceType === 'component')) {
          const details = await getResourceDetails(
            resourceType as 'pillar' | 'section' | 'component', 
            resourceId
          );
          if (details) {
            setResourceDetails(details);
          }
        }
        
        // Get recommended next actions
        const recommendationsResult = await getNextRecommendedActions();
        if (recommendationsResult.data) {
          setRecommendations(recommendationsResult.data.slice(0, 3)); // Show top 3 recommendations
        }
        
        // Calculate progress
        calculateProgress();
      } catch (error) {
        console.error('Error fetching data for access denied view:', error);
      }
    };
    
    // Calculate progress toward earning the required token
    const calculateProgress = () => {
      if (!requiredToken || userTokens.length === 0) {
        setProgress(0);
        return;
      }
      
      // Different progress calculations based on token type
      if (['GEN', 'SAP', 'SCQ'].includes(requiredToken)) {
        // For primary tokens, progress is based on number of child tokens owned
        const totalChildTokens = requiredToken === 'SAP' ? 3 : 
                                requiredToken === 'SCQ' ? 4 : 2;
        const ownedChildTokens = userTokens.filter(t => 
          (requiredToken === 'SAP' && ['PSP', 'BSP', 'SMS'].includes(t.symbol)) ||
          (requiredToken === 'SCQ' && ['SPD', 'SHE', 'SSA', 'SGB'].includes(t.symbol)) ||
          (requiredToken === 'GEN' && ['SAP', 'SCQ'].includes(t.symbol))
        ).length;
        
        setProgress(Math.min(100, Math.round((ownedChildTokens / totalChildTokens) * 100)));
      } else {
        // For other tokens, progress is based on completed content
        // This would require additional data from the backend
        // For now, set a placeholder progress
        setProgress(Math.min(100, Math.round(Math.random() * 60))); // Random progress for demo
      }
    };

    fetchData();
  }, [requiredToken, resourceType, resourceId, getTokenDetails, getUserTokens, getResourceDetails, getNextRecommendedActions]);

  // Get title and description based on the resource or token
  const getTitle = () => {
    if (resourceDetails?.title || resourceDetails?.name) {
      return resourceDetails.title || resourceDetails.name;
    }
    
    if (tokenDetails?.name) {
      return tokenDetails.name;
    }
    
    return 'This Content';
  };
  
  const getDescription = () => {
    if (resourceDetails?.description) {
      return resourceDetails.description;
    }
    
    if (tokenDetails?.description) {
      return tokenDetails.description;
    }
    
    return 'You need to unlock more tokens to access this content.';
  };
  
  // Get gradient class for styling
  const getGradientClass = () => {
    if (tokenDetails?.gradient_class) {
      return tokenDetails.gradient_class;
    }
    
    // Default gradients based on resource type
    if (resourceType === 'pillar') return 'from-zinc-500 to-zinc-900';
    if (resourceType === 'section') return 'from-stone-500 to-stone-900';
    if (resourceType === 'component') return 'from-slate-500 to-slate-900';
    
    return 'from-gray-500 to-gray-900';
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="w-full max-w-4xl mx-auto overflow-hidden">
        <div className={`bg-gradient-to-r ${getGradientClass()} p-6 text-white`}>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-full">
              <LockIcon className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Access Required</h2>
              <p className="text-white/80">
                {requiredToken ? `${tokenDetails?.name || requiredToken} token required` : 'Additional tokens needed'}
              </p>
            </div>
          </div>
        </div>
        
        <CardHeader>
          <CardTitle>{getTitle()}</CardTitle>
          <CardDescription>{getDescription()}</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Progress indicator */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Your progress toward unlocking this content</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          {/* Phase-specific message */}
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-semibold flex items-center gap-2 mb-2">
              <MapIcon className="h-4 w-4" />
              {userPhase === 'discovery' ? 'Discovery Phase' : 
               userPhase === 'onboarding' ? 'Onboarding Phase' :
               userPhase === 'scaffolding' ? 'Scaffolding Phase' : 'Endgame Phase'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {userPhase === 'discovery' ? 
                'Welcome to Avolve! Start by exploring the platform and completing introductory content to earn your first tokens.' : 
               userPhase === 'onboarding' ? 
                'You\'re making progress! Complete more sections to earn tokens and unlock additional content.' :
               userPhase === 'scaffolding' ? 
                'You\'re well on your way! Continue building your token collection to access advanced content.' : 
                'You\'re almost there! Just a few more achievements to unlock all content.'}
            </p>
          </div>
          
          {/* Next steps */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <ArrowRightIcon className="h-4 w-4" />
              Next Steps
            </h3>
            <div className="grid gap-3">
              {recommendations.length > 0 ? (
                recommendations.map((rec, index) => (
                  <Link href={rec.url} key={index}>
                    <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg hover:bg-accent transition-colors">
                      <div>
                        <h4 className="font-medium">{rec.title}</h4>
                        <p className="text-sm text-muted-foreground">{rec.description}</p>
                      </div>
                      <Button variant="ghost" size="sm" className="gap-1">
                        {rec.action} <ArrowRightIcon className="h-3 w-3" />
                      </Button>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                  <div>
                    <h4 className="font-medium">Explore the Platform</h4>
                    <p className="text-sm text-muted-foreground">Discover the three main pillars of Avolve</p>
                  </div>
                  <Link href="/">
                    <Button variant="ghost" size="sm" className="gap-1">
                      Start <ArrowRightIcon className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
          
          {/* Token information */}
          {requiredToken && tokenDetails && (
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <TrophyIcon className="h-4 w-4" />
                About the {tokenDetails.name}
              </h3>
              <p className="text-sm mb-3">{tokenDetails.description}</p>
              <div className="flex gap-2">
                <Link href="/dashboard/tokens">
                  <Button variant="outline" size="sm">
                    View All Tokens
                  </Button>
                </Link>
                <Link href="/dashboard/journey">
                  <Button variant="outline" size="sm">
                    Journey Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between bg-muted/50 border-t p-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <BookOpenIcon className="h-4 w-4 mr-2" />
            <span>Need help? Check out our <Link href="/help" className="underline">help guide</Link></span>
          </div>
          <Link href="/">
            <Button variant="default">
              Return Home
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
