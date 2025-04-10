"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { TokenService } from "@/lib/token/token-service";

interface LockedFeaturesProps {
  userId: string;
}

interface LockedFeature {
  id: string;
  title: string;
  description: string;
  requirement: string;
  requiredTokens: number;
  tokenType: string;
  isUnlocked: boolean;
}

interface UserToken {
  token_id: string;
  token_type: string;
  balance: number;
  last_updated: string;
}

export function LockedFeatures({ userId }: LockedFeaturesProps) {
  const supabase = createClient();
  const tokenService = new TokenService(supabase);
  const [features, setFeatures] = useState<LockedFeature[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLockedFeatures = async () => {
      if (!userId) return;
      
      setIsLoading(true);
      try {
        // Define the locked features
        const lockedFeaturesList: LockedFeature[] = [
          {
            id: "governance",
            title: "Endgame Governance",
            description: "Participate in advanced governance mechanisms for the Avolve ecosystem.",
            requirement: "Community Unlock",
            requiredTokens: 100,
            tokenType: "GEN",
            isUnlocked: false
          },
          {
            id: "analytics",
            title: "Advanced Analytics",
            description: "Access detailed analytics about your journey and the entire Avolve ecosystem.",
            requirement: "100 GEN Tokens",
            requiredTokens: 100,
            tokenType: "GEN",
            isUnlocked: false
          },
          {
            id: "teams",
            title: "Team Collaboration",
            description: "Create and join teams to collaborate on projects and earn team rewards.",
            requirement: "50 SCQ Tokens",
            requiredTokens: 50,
            tokenType: "SCQ",
            isUnlocked: false
          }
        ];
        
        // Check if the user has enough tokens to unlock each feature
        const userTokens = await tokenService.getUserTokens(userId);
        
        // Update the isUnlocked status based on token balances
        const updatedFeatures = lockedFeaturesList.map(feature => {
          const tokenBalance = userTokens.find((t: UserToken) => t.token_type === feature.tokenType)?.balance || 0;
          return {
            ...feature,
            isUnlocked: tokenBalance >= feature.requiredTokens
          };
        });
        
        setFeatures(updatedFeatures);
      } catch (error) {
        console.error('Error fetching locked features:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLockedFeatures();
  }, [userId, tokenService]);

  if (isLoading) {
    return null; // Handled by Suspense
  }

  return (
    <>
      {features.map(feature => (
        <Card 
          key={feature.id}
          className={`overflow-hidden ${
            feature.isUnlocked 
              ? 'border-emerald-800 bg-emerald-950/20 text-emerald-400 hover:bg-emerald-900/30' 
              : 'border-zinc-800 bg-zinc-950/50 text-zinc-400 hover:bg-zinc-900/50'
          } transition-colors duration-200 group`}
        >
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base">{feature.title}</CardTitle>
              {feature.isUnlocked ? (
                <div className="bg-emerald-500 rounded-full p-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              ) : (
                <Lock className="h-4 w-4 group-hover:text-white transition-colors duration-200" />
              )}
            </div>
            <CardDescription>{feature.isUnlocked ? "Feature Unlocked" : "Feature Locked"}</CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <p className="text-sm">{feature.description}</p>
          </CardContent>
          <CardFooter>
            <Button 
              variant={feature.isUnlocked ? "default" : "outline"} 
              className={`w-full ${
                feature.isUnlocked 
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
                  : 'group-hover:border-white/20 transition-colors duration-200'
              }`}
              disabled={!feature.isUnlocked}
            >
              {feature.isUnlocked ? (
                "Access Feature"
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Requires {feature.requirement}
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </>
  );
}
