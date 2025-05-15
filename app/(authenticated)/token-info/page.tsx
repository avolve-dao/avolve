import { TokenHierarchy } from "@/components/token-hierarchy"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowRight, Calendar, Info } from "lucide-react"

export default function TokenInfoPage() {
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-2">Token Information</h1>
      <p className="text-muted-foreground mb-6">
        Understand the Avolve token ecosystem and how it powers your transformation journey.
      </p>

      <div className="mb-8">
        <TokenHierarchy />
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="schedule">Weekly Schedule</TabsTrigger>
          <TabsTrigger value="earning">Earning Tokens</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Token System Overview
              </CardTitle>
              <CardDescription>
                The Avolve token system is designed to guide your transformation from Degen to Regen thinking
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>The token system represents your progress in different areas of transformation:</p>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">GEN Token (Supercivilization)</h3>
                  <p className="text-sm text-muted-foreground">
                    The primary token representing your overall transformation from Degen to Regen thinking. GEN tokens
                    unlock access to advanced features and represent your status in the Supercivilization.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium">SAP Token (Superachiever)</h3>
                  <p className="text-sm text-muted-foreground">
                    Represents your individual journey and personal transformation. SAP tokens are earned by completing
                    personal development activities and challenges.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium">SCQ Token (Superachievers)</h3>
                  <p className="text-sm text-muted-foreground">
                    Represents your contribution to collective transformation. SCQ tokens are earned by participating in
                    community activities and helping others on their journey.
                  </p>
                </div>

                <div className="pt-2">
                  <p className="text-sm">
                    Each token type has specific sub-tokens that focus on different aspects of transformation. Explore
                    the token hierarchy above to learn more about each token type.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Weekly Token Schedule
              </CardTitle>
              <CardDescription>Each day of the week focuses on a different token type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>
                  The Avolve platform follows a weekly schedule, with each day dedicated to a specific token type. On
                  these days, you'll receive bonus rewards for activities related to that token.
                </p>

                <div className="grid gap-2">
                  <div className="flex items-center p-2 rounded-lg hover:bg-muted">
                    <div className="w-24 font-medium">Sunday</div>
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-6 w-6 rounded-full bg-gradient-to-r from-red-500 via-green-500 to-blue-500 text-white text-xs font-bold flex items-center justify-center">
                        SPD
                      </span>
                      <span>Superpuzzle Developments</span>
                    </div>
                  </div>

                  <div className="flex items-center p-2 rounded-lg hover:bg-muted">
                    <div className="w-24 font-medium">Monday</div>
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-6 w-6 rounded-full bg-gradient-to-r from-rose-500 via-red-500 to-orange-500 text-white text-xs font-bold flex items-center justify-center">
                        SHE
                      </span>
                      <span>Superhuman Enhancements</span>
                    </div>
                  </div>

                  <div className="flex items-center p-2 rounded-lg hover:bg-muted">
                    <div className="w-24 font-medium">Tuesday</div>
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-6 w-6 rounded-full bg-gradient-to-r from-amber-300 to-yellow-500 text-white text-xs font-bold flex items-center justify-center">
                        PSP
                      </span>
                      <span>Personal Success Puzzle</span>
                    </div>
                  </div>

                  <div className="flex items-center p-2 rounded-lg hover:bg-muted">
                    <div className="w-24 font-medium">Wednesday</div>
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-6 w-6 rounded-full bg-gradient-to-r from-lime-500 via-green-500 to-emerald-500 text-white text-xs font-bold flex items-center justify-center">
                        SSA
                      </span>
                      <span>Supersociety Advancements</span>
                    </div>
                  </div>

                  <div className="flex items-center p-2 rounded-lg hover:bg-muted">
                    <div className="w-24 font-medium">Thursday</div>
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-6 w-6 rounded-full bg-gradient-to-r from-teal-400 to-cyan-500 text-white text-xs font-bold flex items-center justify-center">
                        BSP
                      </span>
                      <span>Business Success Puzzle</span>
                    </div>
                  </div>

                  <div className="flex items-center p-2 rounded-lg hover:bg-muted">
                    <div className="w-24 font-medium">Friday</div>
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-6 w-6 rounded-full bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 text-white text-xs font-bold flex items-center justify-center">
                        SGB
                      </span>
                      <span>Supergenius Breakthroughs</span>
                    </div>
                  </div>

                  <div className="flex items-center p-2 rounded-lg hover:bg-muted">
                    <div className="w-24 font-medium">Saturday</div>
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-6 w-6 rounded-full bg-gradient-to-r from-violet-400 via-purple-500 to-fuchsia-500 text-white text-xs font-bold flex items-center justify-center">
                        SMS
                      </span>
                      <span>Supermind Superpowers</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="earning" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRight className="h-5 w-5" />
                Earning Tokens
              </CardTitle>
              <CardDescription>Learn how to earn different types of tokens</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>There are multiple ways to earn tokens in the Avolve ecosystem:</p>

              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Completing Challenges</h3>
                  <p className="text-sm text-muted-foreground">
                    Daily and weekly challenges are available for each token type. Completing these challenges will earn
                    you tokens of the corresponding type.
                  </p>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Learning Activities</h3>
                  <p className="text-sm text-muted-foreground">
                    Completing learning modules and courses in the Learning Center will earn you tokens based on the
                    subject matter.
                  </p>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Community Participation</h3>
                  <p className="text-sm text-muted-foreground">
                    Engaging with the community through chat, forums, and collaborative activities will earn you SCQ
                    tokens and its sub-tokens.
                  </p>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Daily Bonuses</h3>
                  <p className="text-sm text-muted-foreground">
                    Each day of the week offers bonus rewards for activities related to that day's token. For example,
                    completing PSP challenges on Tuesday will earn you bonus PSP tokens.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
