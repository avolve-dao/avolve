'use client';

/**
 * Feature Preview Client Component
 *
 * Client-side interactive component for displaying upcoming features
 * Copyright © 2025 Avolve DAO. All rights reserved.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, ChevronRight, Sparkles, Clock } from 'lucide-react';
import Image from 'next/image';

// UI components
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Types
import type { FeatureWithStatus } from '@/types/features';

interface FeaturePreviewClientProps {
  features: FeatureWithStatus[];
  predictedNextUnlocks: string[];
}

export function FeaturePreviewClient({
  features,
  predictedNextUnlocks,
}: FeaturePreviewClientProps) {
  const [selectedFeature, setSelectedFeature] = useState<string | null>(
    features.length > 0 ? features[0].id : null
  );

  // Separate unlocked and locked features
  const unlockedFeatures = features.filter(f => f.unlocked);
  const lockedFeatures = features.filter(f => !f.unlocked);

  // Get the selected feature details
  const featureDetails = features.find(f => f.id === selectedFeature);

  return (
    <div className="space-y-4">
      <Tabs defaultValue="locked" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="locked">
            Locked{' '}
            <Badge variant="outline" className="ml-2">
              {lockedFeatures.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="unlocked">
            Unlocked{' '}
            <Badge variant="outline" className="ml-2">
              {unlockedFeatures.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="locked" className="space-y-4 pt-2">
          {/* Feature list */}
          <div className="grid grid-cols-1 gap-2">
            {lockedFeatures.map(feature => (
              <Button
                key={feature.id}
                variant="outline"
                className={`justify-start h-auto py-2 px-3 ${
                  feature.id === selectedFeature ? 'border-primary' : ''
                } ${
                  predictedNextUnlocks.includes(feature.id) ? 'border-amber-300 bg-amber-50' : ''
                }`}
                onClick={() => setSelectedFeature(feature.id)}
              >
                <div className="flex items-center w-full">
                  <Lock className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span className="text-sm font-medium">{feature.name}</span>
                  {predictedNextUnlocks.includes(feature.id) && (
                    <Badge variant="outline" className="ml-auto border-amber-300 text-amber-700">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Coming soon
                    </Badge>
                  )}
                </div>
              </Button>
            ))}
          </div>

          {/* Selected feature details */}
          {featureDetails && !featureDetails.unlocked && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                    {featureDetails.icon && (
                      <Image
                        src={`/icons/${featureDetails.icon}`}
                        alt={featureDetails.name}
                        width={24}
                        height={24}
                      />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">{featureDetails.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Available in {featureDetails.phase} phase
                    </p>
                  </div>
                </div>

                <p className="text-sm mb-4">{featureDetails.description}</p>

                <div className="space-y-4">
                  {/* Token requirements */}
                  {featureDetails.tokenRequirements.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Token Requirements</h4>
                      <div className="space-y-2">
                        {featureDetails.tokenRequirements.map((req, i) => {
                          const current =
                            featureDetails.missingTokens.find(t => t.tokenId === req.tokenId)
                              ?.current || 0;
                          const progress = Math.min((current / req.amount) * 100, 100);

                          return (
                            <div key={i} className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span>{req.tokenId} Tokens</span>
                                <span>
                                  {current}/{req.amount}
                                </span>
                              </div>
                              <Progress value={progress} className="h-1" />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Milestone requirements */}
                  {featureDetails.milestoneRequirements.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Milestone Requirements</h4>
                      <div className="space-y-1">
                        {featureDetails.milestoneRequirements.map((milestone, i) => {
                          const isMissing = featureDetails.missingMilestones.includes(milestone);

                          return (
                            <div
                              key={i}
                              className={`flex items-center text-sm ${
                                isMissing ? 'text-muted-foreground' : 'text-green-600'
                              }`}
                            >
                              {isMissing ? (
                                <Clock className="w-4 h-4 mr-2" />
                              ) : (
                                <Unlock className="w-4 h-4 mr-2" />
                              )}
                              <span>
                                {milestone.replace('_', ' ').replace(/^\w/, c => c.toUpperCase())}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>

              <CardFooter className="bg-muted/50 flex-col items-start pt-4">
                <h4 className="text-sm font-medium mb-2">Recommendations</h4>
                <div className="space-y-1 w-full">
                  {featureDetails.unlockRecommendations.map((rec, i) => (
                    <div key={i} className="flex items-start text-sm">
                      <ChevronRight className="w-4 h-4 mr-1 mt-0.5 text-primary" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </CardFooter>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="unlocked" className="space-y-4 pt-2">
          {unlockedFeatures.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {unlockedFeatures.map(feature => (
                <Card key={feature.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-4">
                      <div className="flex items-center mb-2">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                          <Unlock className="w-4 h-4 text-green-600" />
                        </div>
                        <h3 className="text-lg font-medium">{feature.name}</h3>
                      </div>
                      <p className="text-sm">{feature.description}</p>
                    </div>
                    <div className="bg-green-50 p-3 border-t border-green-100">
                      <p className="text-sm text-green-700 flex items-center">
                        <Sparkles className="w-4 h-4 mr-2" />
                        Unlocked in {feature.phase} phase
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No features unlocked yet</p>
              <p className="text-sm">Complete milestones to unlock new features</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
