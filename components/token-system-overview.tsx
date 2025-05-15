"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Gem, Puzzle, Users, Award, Briefcase, Brain, Globe, Rocket } from "lucide-react"

export function TokenSystemOverview() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Supercivilization Token System</CardTitle>
        <CardDescription>The multi-token ecosystem that powers the Supercivilization</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="superachiever">Superachiever Tokens</TabsTrigger>
            <TabsTrigger value="superachievers">Superachievers Tokens</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="bg-gradient-to-r from-zinc-50 to-zinc-100 dark:from-zinc-900/50 dark:to-zinc-800/30 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Gem className="h-5 w-5 text-zinc-500" />
                <h4 className="font-medium">GEN Token: The Foundation</h4>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                GEN tokens represent your regenerative potential and the value you create in the Supercivilization. They
                are the primary governance token and the foundation of the token ecosystem.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-r from-stone-50 to-stone-100 dark:from-stone-900/50 dark:to-stone-800/30 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <Puzzle className="h-5 w-5 text-stone-500" />
                  <h4 className="font-medium">SAP Token: Superachiever</h4>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  SAP tokens represent your personal success puzzle development and individual achievements as a
                  Superachiever.
                </p>
              </div>

              <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/30 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-slate-500" />
                  <h4 className="font-medium">SCQ Token: Superachievers</h4>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  SCQ tokens represent your contribution to collective quests and the Superpuzzle as part of the
                  Superachievers community.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Token Utility</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <Gem className="h-5 w-5 text-zinc-500 mt-0.5 flex-shrink-0" />
                  <span>Governance participation and voting rights</span>
                </li>
                <li className="flex items-start gap-2">
                  <Gem className="h-5 w-5 text-zinc-500 mt-0.5 flex-shrink-0" />
                  <span>Access to advanced community resources</span>
                </li>
                <li className="flex items-start gap-2">
                  <Gem className="h-5 w-5 text-zinc-500 mt-0.5 flex-shrink-0" />
                  <span>Reputation and trust level advancement</span>
                </li>
                <li className="flex items-start gap-2">
                  <Gem className="h-5 w-5 text-zinc-500 mt-0.5 flex-shrink-0" />
                  <span>Participation in collective value creation</span>
                </li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="superachiever" className="space-y-4">
            <div className="bg-gradient-to-r from-stone-50 to-stone-100 dark:from-stone-900/50 dark:to-stone-800/30 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Puzzle className="h-5 w-5 text-stone-500" />
                <h4 className="font-medium">SAP Token: Superachiever Playbook</h4>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Create your personal & business success puzzles with joy & ease by becoming a greater Superachiever.
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-500" />
                  <h4 className="font-medium">PSP Token: Personal Success Puzzle</h4>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Enjoy greater personal successes faster via boosting your overall health, wealth, and peace in life.
                </p>
              </div>

              <div className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/30 dark:to-cyan-900/30 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-teal-500" />
                  <h4 className="font-medium">BSP Token: Business Success Puzzle</h4>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Enjoy greater business successes faster by enhancing your network and advancing your net worth.
                </p>
              </div>

              <div className="bg-gradient-to-r from-violet-50 via-fuchsia-50 to-pink-50 dark:from-violet-900/30 dark:via-fuchsia-900/30 dark:to-pink-900/30 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-violet-500" />
                  <h4 className="font-medium">SMS Token: Supermind Superpowers</h4>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Improve your ability to solve a conflict, create a plan for the future & implement your action plan.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="superachievers" className="space-y-4">
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/30 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-slate-500" />
                <h4 className="font-medium">SCQ Token: Supercivilization Quests</h4>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Evolve from a Degen in an Anticivilization into a Regen in a Supercivilization within your lifetime.
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-gradient-to-r from-red-50 via-green-50 to-blue-50 dark:from-red-900/30 dark:via-green-900/30 dark:to-blue-900/30 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <Puzzle className="h-5 w-5 text-red-500" />
                  <h4 className="font-medium">SPD Token: Superpuzzle Developments</h4>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Progress our grand Superpuzzle & worldwide drive to ensure wealth, health, & peace in your lifetime.
                </p>
              </div>

              <div className="bg-gradient-to-r from-rose-50 via-red-50 to-orange-50 dark:from-rose-900/30 dark:via-red-900/30 dark:to-orange-900/30 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-rose-500" />
                  <h4 className="font-medium">SHE Token: Superhuman Enhancements</h4>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Free yourself & loved ones via superhuman enhancements that support everyone: child, youth, & adult.
                </p>
              </div>

              <div className="bg-gradient-to-r from-lime-50 via-green-50 to-emerald-50 dark:from-lime-900/30 dark:via-green-900/30 dark:to-emerald-900/30 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-lime-500" />
                  <h4 className="font-medium">SSA Token: Supersociety Advancements</h4>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Free others & everybody via supersociety advancements that help companies, communities, & countries.
                </p>
              </div>

              <div className="bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 dark:from-sky-900/30 dark:via-blue-900/30 dark:to-indigo-900/30 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <Rocket className="h-5 w-5 text-sky-500" />
                  <h4 className="font-medium">SGB Token: Supergenius Breakthroughs</h4>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Solve Superpuzzles via Supergenius Breakthroughs that help grow ventures, enterprises, & industries.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
