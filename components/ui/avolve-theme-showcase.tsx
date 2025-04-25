'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

/**
 * AvolveThemeShowcase Component
 *
 * This component showcases the Avolve conceptual framework color system
 * and provides examples of how to use the different color schemes in your application.
 */
export function AvolveThemeShowcase(): React.ReactNode {
  return (
    <div className="w-full space-y-6">
      <h2 className="text-2xl font-bold">Avolve Conceptual Framework</h2>
      <p className="text-muted-foreground">
        Explore the color system that represents the Avolve platform's core values and structure.
      </p>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="superachiever">Superachiever</TabsTrigger>
          <TabsTrigger value="superachievers">Superachievers</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Supercivilization</CardTitle>
              <CardDescription>
                The ecosystem journey for transformation (Zinc gradient)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4">
                <div className="h-20 rounded-md bg-supercivilization-gradient flex items-center justify-center">
                  <span className="font-bold text-white">Supercivilization Gradient</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <div className="h-16 bg-supercivilization-light rounded-md flex items-center justify-center">
                    <span className="text-xs font-medium">Light</span>
                  </div>
                  <div className="h-16 bg-supercivilization rounded-md flex items-center justify-center">
                    <span className="text-xs font-medium text-white">Default</span>
                  </div>
                  <div className="h-16 bg-supercivilization-dark rounded-md flex items-center justify-center">
                    <span className="text-xs font-medium text-white">Dark</span>
                  </div>
                  <div className="h-16 bg-gen-token rounded-md flex items-center justify-center">
                    <span className="text-xs font-medium text-white">GEN Token</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Superachiever</CardTitle>
                <CardDescription>
                  The individual journey of transformation (Stone gradient)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-20 rounded-md bg-superachiever-gradient flex items-center justify-center">
                  <span className="font-bold text-white">Superachiever Gradient</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Superachievers</CardTitle>
                <CardDescription>
                  The collective journey of transformation (Slate gradient)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-20 rounded-md bg-superachievers-gradient flex items-center justify-center">
                  <span className="font-bold text-white">Superachievers Gradient</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="superachiever" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personal Success Puzzle</CardTitle>
              <CardDescription>Greater Personal Successes (Amber-Yellow gradient)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4">
                <div className="h-20 rounded-md bg-personal-success-gradient flex items-center justify-center">
                  <span className="font-bold text-white">Personal Success Gradient</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-4 border rounded-md border-psp-token">
                    <h3 className="font-medium text-psp-token">Health & Energy</h3>
                    <p className="text-sm text-muted-foreground">Physical and mental wellbeing</p>
                  </div>
                  <div className="p-4 border rounded-md border-psp-token">
                    <h3 className="font-medium text-psp-token">Wealth & Career</h3>
                    <p className="text-sm text-muted-foreground">
                      Financial growth and career development
                    </p>
                  </div>
                  <div className="p-4 border rounded-md border-psp-token">
                    <h3 className="font-medium text-psp-token">Peace & People</h3>
                    <p className="text-sm text-muted-foreground">Relationships and inner peace</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Business Success Puzzle</CardTitle>
              <CardDescription>Greater Business Successes (Teal-Cyan gradient)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4">
                <div className="h-20 rounded-md bg-business-success-gradient flex items-center justify-center">
                  <span className="font-bold text-white">Business Success Gradient</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-4 border rounded-md border-bsp-token">
                    <h3 className="font-medium text-bsp-token">Front-Stage Users</h3>
                    <p className="text-sm text-muted-foreground">Customer-facing operations</p>
                  </div>
                  <div className="p-4 border rounded-md border-bsp-token">
                    <h3 className="font-medium text-bsp-token">Back-Stage Admin</h3>
                    <p className="text-sm text-muted-foreground">
                      Internal operations and management
                    </p>
                  </div>
                  <div className="p-4 border rounded-md border-bsp-token">
                    <h3 className="font-medium text-bsp-token">Bottom-Line Profit</h3>
                    <p className="text-sm text-muted-foreground">
                      Financial performance and growth
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Supermind Superpowers</CardTitle>
              <CardDescription>
                Go Further, Faster, & Forever (Violet-Purple-Fuchsia-Pink gradient)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4">
                <div className="h-20 rounded-md bg-supermind-gradient flex items-center justify-center">
                  <span className="font-bold text-white">Supermind Gradient</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-4 border rounded-md border-sms-token">
                    <h3 className="font-medium text-sms-token">Current → Desired</h3>
                    <p className="text-sm text-muted-foreground">Starting your journey</p>
                  </div>
                  <div className="p-4 border rounded-md border-sms-token">
                    <h3 className="font-medium text-sms-token">Desired → Actions</h3>
                    <p className="text-sm text-muted-foreground">Focusing on your plan</p>
                  </div>
                  <div className="p-4 border rounded-md border-sms-token">
                    <h3 className="font-medium text-sms-token">Actions → Results</h3>
                    <p className="text-sm text-muted-foreground">Finishing with success</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="superachievers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Superpuzzle Developments</CardTitle>
              <CardDescription>
                Conceive, Believe, & Achieve (Red-Green-Blue gradient)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4">
                <div className="h-20 rounded-md bg-superpuzzle-gradient flex items-center justify-center">
                  <span className="font-bold text-white">Superpuzzle Gradient</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Superhuman Enhancements</CardTitle>
                <CardDescription>
                  Super Enhanced Individuals (Rose-Red-Orange gradient)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-20 rounded-md bg-superhuman-gradient flex items-center justify-center">
                  <span className="font-bold text-white">Superhuman Gradient</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Supersociety Advancements</CardTitle>
                <CardDescription>
                  Super Advanced Collectives (Lime-Green-Emerald gradient)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-20 rounded-md bg-supersociety-gradient flex items-center justify-center">
                  <span className="font-bold text-white">Supersociety Gradient</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Supergenius Breakthroughs</CardTitle>
              <CardDescription>
                Super Balanced Ecosystems (Sky-Blue-Indigo gradient)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4">
                <div className="h-20 rounded-md bg-supergenius-gradient flex items-center justify-center">
                  <span className="font-bold text-white">Supergenius Gradient</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Token Colors</CardTitle>
          <CardDescription>
            The token colors associated with each section of the Avolve framework
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-2">
            <div className="p-3 border rounded-md">
              <div className="h-8 rounded bg-gen-token mb-2"></div>
              <span className="text-xs font-medium">GEN Token</span>
            </div>
            <div className="p-3 border rounded-md">
              <div className="h-8 rounded bg-sap-token mb-2"></div>
              <span className="text-xs font-medium">SAP Token</span>
            </div>
            <div className="p-3 border rounded-md">
              <div className="h-8 rounded bg-psp-token mb-2"></div>
              <span className="text-xs font-medium">PSP Token</span>
            </div>
            <div className="p-3 border rounded-md">
              <div className="h-8 rounded bg-bsp-token mb-2"></div>
              <span className="text-xs font-medium">BSP Token</span>
            </div>
            <div className="p-3 border rounded-md">
              <div className="h-8 rounded bg-sms-token mb-2"></div>
              <span className="text-xs font-medium">SMS Token</span>
            </div>
            <div className="p-3 border rounded-md">
              <div className="h-8 rounded bg-scq-token mb-2"></div>
              <span className="text-xs font-medium">SCQ Token</span>
            </div>
            <div className="p-3 border rounded-md">
              <div className="h-8 rounded bg-spd-token mb-2"></div>
              <span className="text-xs font-medium">SPD Token</span>
            </div>
            <div className="p-3 border rounded-md">
              <div className="h-8 rounded bg-she-token mb-2"></div>
              <span className="text-xs font-medium">SHE Token</span>
            </div>
            <div className="p-3 border rounded-md">
              <div className="h-8 rounded bg-ssa-token mb-2"></div>
              <span className="text-xs font-medium">SSA Token</span>
            </div>
            <div className="p-3 border rounded-md">
              <div className="h-8 rounded bg-sbg-token mb-2"></div>
              <span className="text-xs font-medium">SBG Token</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
