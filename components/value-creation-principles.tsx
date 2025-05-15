"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Lightbulb, Zap, ArrowRight } from "lucide-react"

export function ValueCreationPrinciples() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Value Creation Principles</CardTitle>
        <CardDescription>The foundation of regenerative thinking and the Supercivilization</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="personal">Personal Growth</TabsTrigger>
            <TabsTrigger value="societal">Societal Impact</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-amber-600 dark:text-amber-400">The Essence of Value Creation</h3>
                  <p className="text-sm text-amber-600/80 dark:text-amber-400/80">
                    Value creation is the process of generating new or improved resources, products, services, or
                    experiences that enhance human life and prosperity.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
                <h4 className="font-medium text-blue-600 dark:text-blue-400 flex items-center gap-2">
                  <ArrowRight className="h-4 w-4" /> Value Production
                </h4>
                <p className="text-sm text-blue-600/80 dark:text-blue-400/80 mt-2">
                  Improving existing values through refinement, optimization, and enhancement. Value producers take what
                  exists and make it better, more efficient, or more accessible.
                </p>
              </div>

              <div className="bg-purple-50 dark:bg-purple-950/30 p-4 rounded-lg">
                <h4 className="font-medium text-purple-600 dark:text-purple-400 flex items-center gap-2">
                  <ArrowRight className="h-4 w-4" /> Value Creation
                </h4>
                <p className="text-sm text-purple-600/80 dark:text-purple-400/80 mt-2">
                  Generating entirely new values that didn't previously exist. Value creators innovate, invent, and
                  bring novel solutions to human challenges and opportunities.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Positive-Sum Interactions</h3>
              <p className="text-muted-foreground mb-3">
                The Supercivilization is committed to positive-sum interactions, where all parties benefit from
                exchanges and collaborations.
              </p>

              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <Zap className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <span>Voluntary exchanges occur without coercion or deception</span>
                </li>
                <li className="flex items-start gap-2">
                  <Zap className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <span>Collaboration amplifies individual capabilities</span>
                </li>
                <li className="flex items-start gap-2">
                  <Zap className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <span>Knowledge and resources are shared to accelerate collective advancement</span>
                </li>
                <li className="flex items-start gap-2">
                  <Zap className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <span>Competition drives innovation rather than destruction</span>
                </li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="personal" className="space-y-4">
            <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Lightbulb className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-purple-600 dark:text-purple-400">
                    The Prime Pledge: Personal Growth
                  </h3>
                  <p className="text-sm text-purple-600/80 dark:text-purple-400/80">
                    I commit to constantly improving myself in a virtuously selfish way, recognizing that my own growth
                    and prosperity are essential to my ability to create value.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Virtuous Selfishness</h3>
              <p className="text-muted-foreground mb-3">
                Virtuous selfishness means pursuing your own growth and prosperity in ways that create value rather than
                extract or destroy it. It recognizes that your flourishing is not opposed to others' flourishing but
                complementary to it.
              </p>
            </div>

            <div className="space-y-3">
              <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg">
                <h4 className="font-medium">Honest Effort</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Consistently exerting effort in your endeavors, recognizing that value creation requires energy and
                  persistence. Removing laziness as a barrier to living in harmony with your essence.
                </p>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg">
                <h4 className="font-medium">Personal Value Creation</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Producing and creating values that enhance your life and prosperity, developing your unique talents
                  and capabilities to their fullest potential.
                </p>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg">
                <h4 className="font-medium">Personal Responsibility</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Taking full responsibility for your actions, growth, and contributions, recognizing that your
                  advancement depends on your own choices and efforts.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="societal" className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-blue-600 dark:text-blue-400">The Prime Pledge: Societal Impact</h3>
                  <p className="text-sm text-blue-600/80 dark:text-blue-400/80">
                    I commit to constantly improving society in a virtuously selfless way, recognizing that my
                    contributions to the collective advance us all further, faster, forever, together.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Virtuous Selflessness</h3>
              <p className="text-muted-foreground mb-3">
                Virtuous selflessness means contributing to collective advancement in ways that create value for others
                while respecting their autonomy. It recognizes that collective flourishing enhances individual
                flourishing.
              </p>
            </div>

            <div className="space-y-3">
              <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg">
                <h4 className="font-medium">Non-Initiation</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Never initiating force, threat of force, or fraud against any individual's self, property, or
                  contracts. Understanding that force is justified only for protection from those who violate this
                  principle.
                </p>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg">
                <h4 className="font-medium">Community Contribution</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Contributing to the Supercivilization community by sharing insights, supporting fellow members, and
                  participating in collective advancement.
                </p>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg">
                <h4 className="font-medium">Collective Advancement</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Recognizing that by uniting value creators in a supportive ecosystem, we can go further, faster,
                  forever, together.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
