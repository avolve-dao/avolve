import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Users, 
  Zap, 
  Calendar, 
  BarChart3, 
  Globe, 
  Lightbulb,
  Building,
  Brain,
  Puzzle,
  Heart,
  Network
} from 'lucide-react';

/**
 * GenGovernanceOverview - Displays an overview of the GEN-centric governance system
 * 
 * This component visualizes the three main value pillars of Avolve:
 * 1. Supercivilization (GEN) - Ecosystem journey
 * 2. Superachiever (SAP) - Individual journey
 * 3. Superachievers (SCQ) - Collective journey
 * 
 * Each pillar has specific tokens that contribute to different metrics
 * and unlock features based on user participation and engagement.
 */
export const GenGovernanceOverview: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-zinc-500" />
            GEN-Centric Regenerative System
          </CardTitle>
          <CardDescription>
            A metrics-driven gamified approach to governance and engagement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            The Avolve platform implements a regenerative system centered around the GEN token,
            with daily claims and metrics-driven feature unlocks that encourage regular participation
            and contribution to the ecosystem.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <MetricCard 
              title="Daily Active Users"
              description="Increased through daily token claims"
              icon={<Calendar className="h-5 w-5" />}
              value="↑ 27%"
              color="text-green-500"
            />
            <MetricCard 
              title="Retention Rate"
              description="Improved via streak rewards"
              icon={<TrendingUp className="h-5 w-5" />}
              value="↑ 42%"
              color="text-blue-500"
            />
            <MetricCard 
              title="Feature Unlocks"
              description="Driven by token accumulation"
              icon={<Zap className="h-5 w-5" />}
              value="↑ 18%"
              color="text-amber-500"
            />
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="structure">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="structure">Token Structure</TabsTrigger>
          <TabsTrigger value="schedule">Weekly Schedule</TabsTrigger>
          <TabsTrigger value="metrics">Metrics Impact</TabsTrigger>
        </TabsList>
        
        <TabsContent value="structure" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Globe className="h-5 w-5 text-zinc-500" />
                Supercivilization
                <Badge variant="outline" className="ml-2">GEN</Badge>
              </CardTitle>
              <CardDescription>
                Ecosystem journey of transformation
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <p className="text-sm text-muted-foreground">
                The GEN token represents the entire ecosystem, encompassing both individual 
                and collective journeys. It's the primary token that drives governance and 
                feature unlocks.
              </p>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="h-5 w-5 text-amber-500" />
                  Superachiever
                  <Badge variant="outline" className="ml-2">SAP</Badge>
                </CardTitle>
                <CardDescription>
                  Individual journey of transformation
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-sm text-muted-foreground mb-4">
                  The SAP token represents your personal journey, focusing on individual growth
                  and achievement.
                </p>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">PSP</Badge>
                    <span className="text-sm">Personal Success Puzzle</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-teal-100 text-teal-800 hover:bg-teal-200">BSP</Badge>
                    <span className="text-sm">Business Success Puzzle</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">SMS</Badge>
                    <span className="text-sm">Supermind Superpowers</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  Superachievers
                  <Badge variant="outline" className="ml-2">SCQ</Badge>
                </CardTitle>
                <CardDescription>
                  Collective journey of transformation
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-sm text-muted-foreground mb-4">
                  The SCQ token represents the collective journey, focusing on community growth
                  and collaborative achievements.
                </p>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-red-100 text-red-800 hover:bg-red-200">SPD</Badge>
                    <span className="text-sm">Superpuzzle Developments</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-200">SHE</Badge>
                    <span className="text-sm">Superhuman Enhancements</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-200">SSA</Badge>
                    <span className="text-sm">Supersociety Advancements</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">SGB</Badge>
                    <span className="text-sm">Supergenius Breakthroughs</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="schedule" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Weekly Token Claim Schedule</CardTitle>
              <CardDescription>
                Each day of the week has a specific token that can be claimed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
                  <DayCard 
                    day="Sunday" 
                    token="SPD"
                    tokenName="Superpuzzle Developments"
                    gradient="from-red-500 via-green-500 to-blue-500"
                    icon={<Puzzle className="h-4 w-4" />}
                  />
                  <DayCard 
                    day="Monday" 
                    token="SHE"
                    tokenName="Superhuman Enhancements"
                    gradient="from-rose-500 via-red-500 to-orange-500"
                    icon={<Heart className="h-4 w-4" />}
                  />
                  <DayCard 
                    day="Tuesday" 
                    token="PSP"
                    tokenName="Personal Success Puzzle"
                    gradient="from-amber-500 to-yellow-500"
                    icon={<Zap className="h-4 w-4" />}
                  />
                  <DayCard 
                    day="Wednesday" 
                    token="SSA"
                    tokenName="Supersociety Advancements"
                    gradient="from-lime-500 via-green-500 to-emerald-500"
                    icon={<Network className="h-4 w-4" />}
                  />
                  <DayCard 
                    day="Thursday" 
                    token="BSP"
                    tokenName="Business Success Puzzle"
                    gradient="from-teal-500 to-cyan-500"
                    icon={<Building className="h-4 w-4" />}
                  />
                  <DayCard 
                    day="Friday" 
                    token="SGB"
                    tokenName="Supergenius Breakthroughs"
                    gradient="from-sky-500 via-blue-500 to-indigo-500"
                    icon={<Lightbulb className="h-4 w-4" />}
                  />
                  <DayCard 
                    day="Saturday" 
                    token="SMS"
                    tokenName="Supermind Superpowers"
                    gradient="from-violet-500 via-purple-500 to-fuchsia-500"
                    icon={<Brain className="h-4 w-4" />}
                  />
                </div>
                
                <p className="text-sm text-muted-foreground mt-4">
                  Claiming tokens consistently builds your streak multiplier, increasing the rewards you receive:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>3-day streak: 1.2x multiplier</li>
                    <li>5-day streak: 1.5x multiplier</li>
                    <li>7-day streak: 2.0x multiplier</li>
                  </ul>
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="metrics" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Metrics-Driven Regenerative System</CardTitle>
              <CardDescription>
                Each token contributes to specific metrics that drive platform growth
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  The GEN-centric governance system is designed to improve key metrics through
                  regular engagement and token accumulation:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <MetricImpactCard 
                    metric="Daily Active Users (DAU)"
                    tokens={["PSP", "SMS"]}
                    description="Increased through regular token claims and streak building"
                    icon={<Calendar className="h-5 w-5" />}
                  />
                  <MetricImpactCard 
                    metric="Retention (D1, D7, D30)"
                    tokens={["SHE", "SSA"]}
                    description="Improved through streak rewards and community engagement"
                    icon={<TrendingUp className="h-5 w-5" />}
                  />
                  <MetricImpactCard 
                    metric="Average Revenue Per User (ARPU)"
                    tokens={["BSP", "GEN"]}
                    description="Enhanced through business success and ecosystem participation"
                    icon={<BarChart3 className="h-5 w-5" />}
                  />
                  <MetricImpactCard 
                    metric="Net Promoter Score (NPS)"
                    tokens={["SPD", "SGB"]}
                    description="Boosted through community contributions and innovation"
                    icon={<Users className="h-5 w-5" />}
                  />
                </div>
                
                <p className="text-sm text-muted-foreground mt-6">
                  Feature unlocks are tied to specific metrics thresholds:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Teams: Unlocked after claiming 3 different day tokens</li>
                    <li>Governance: Unlocked after accumulating 100 GEN tokens</li>
                    <li>Marketplace: Unlocked after achieving 0.3 DAU/MAU ratio</li>
                    <li>Advanced Features: Unlocked through continued participation and contribution</li>
                  </ul>
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface MetricCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  value: string;
  color: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, description, icon, value, color }) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <CardDescription>{description}</CardDescription>
          <span className={`text-lg font-bold ${color}`}>{value}</span>
        </div>
      </CardContent>
    </Card>
  );
};

interface DayCardProps {
  day: string;
  token: string;
  tokenName: string;
  gradient: string;
  icon: React.ReactNode;
}

const DayCard: React.FC<DayCardProps> = ({ day, token, tokenName, gradient, icon }) => {
  return (
    <Card className="overflow-hidden">
      <div className={`h-1.5 w-full bg-gradient-to-r ${gradient}`}></div>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{day}</CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-r flex items-center justify-center text-white font-bold text-xs" 
            style={{ backgroundImage: `linear-gradient(to right, ${gradient.replace('from-', '').replace('to-', '').replace('via-', '')})` }}>
            {icon}
          </div>
          <div>
            <div className="font-semibold text-sm">{token}</div>
            <div className="text-xs text-muted-foreground">{tokenName}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface MetricImpactCardProps {
  metric: string;
  tokens: string[];
  description: string;
  icon: React.ReactNode;
}

const MetricImpactCard: React.FC<MetricImpactCardProps> = ({ metric, tokens, description, icon }) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {icon}
          {metric}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-2">{description}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs text-muted-foreground">Primary tokens:</span>
          {tokens.map((token) => (
            <Badge key={token} variant="outline">{token}</Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default GenGovernanceOverview;
