"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import { Sparkles, Shield, Users, Brain, Lightbulb, Briefcase, MessageSquare } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export function CompactAwareGenieAI() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Welcome to Genie AI, your guide on the journey from Degen to Regen thinking. How can I assist you today in alignment with the Supercivilization Compact?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("chat")
  const [trustLevel, setTrustLevel] = useState("Newcomer")
  const [profile, setProfile] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    async function loadProfile() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single()

          if (profileData) {
            setProfile(profileData)

            // Calculate trust level
            const genTokens = profileData.gen_tokens || 0

            if (genTokens >= 500) {
              setTrustLevel("Architect")
            } else if (genTokens >= 250) {
              setTrustLevel("Builder")
            } else if (genTokens >= 100) {
              setTrustLevel("Contributor")
            } else if (genTokens >= 50) {
              setTrustLevel("Participant")
            } else {
              setTrustLevel("Newcomer")
            }
          }
        }
      } catch (error) {
        console.error("Error loading profile:", error)
      }
    }

    loadProfile()
  }, [supabase])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  async function sendMessage() {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Generate response based on the Compact principles
      const response = await generateCompactAwareResponse(input, trustLevel)

      // Record the interaction
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        await supabase.from("ai_interactions").insert({
          user_id: user.id,
          query: input,
          response: response,
          trust_level: trustLevel,
          created_at: new Date().toISOString(),
        })
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error generating response:", error)
      toast({
        title: "Error",
        description: "Failed to generate a response. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function generateCompactAwareResponse(query: string, trustLevel: string): Promise<string> {
    // Simulate AI response generation with Compact awareness
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const lowerQuery = query.toLowerCase()

    // Responses based on Compact principles
    if (lowerQuery.includes("degen") || lowerQuery.includes("regen")) {
      return "The journey from Degen to Regen thinking is central to the Supercivilization Compact. Degen thinking is extractive, creating zero-sum or negative-sum outcomes where value is usurped or destroyed. Regen thinking is regenerative, creating positive-sum outcomes where value is produced or created. The Compact guides us to transform from value usurpers/destroyers to value producers/creators through both virtuously selfish and virtuously selfless behaviors."
    }

    if (lowerQuery.includes("virtuously selfish") || lowerQuery.includes("personal success")) {
      return "Virtuously selfish behavior, as defined in the Supercivilization Compact, means constantly improving yourself by creating your Success Puzzle faster. This includes developing your Personal Success Puzzle (health, wealth, peace), Business Success Puzzle (users, admin, profit), and Supermind Superpowers (solving conflicts, creating plans, implementing actions). This self-improvement is virtuous because it increases your capacity to create value for others."
    }

    if (lowerQuery.includes("virtuously selfless") || lowerQuery.includes("superpuzzle")) {
      return "Virtuously selfless behavior, as defined in the Supercivilization Compact, means constantly improving society by co-creating the Superpuzzle faster with other Superachievers. This includes contributing to Superpuzzle Developments, Superhuman Enhancements, Supersociety Advancements, and Supergenius Breakthroughs. These contributions create value for the collective while still honoring your individual journey."
    }

    if (lowerQuery.includes("trust level") || lowerQuery.includes("graduated trust")) {
      return `The Supercivilization operates on a graduated trust architecture where access to community resources increases with demonstrated value creation. Your current trust level is ${trustLevel}, which grants you specific privileges and responsibilities. As you create more value and earn more GEN tokens, you'll advance to higher trust levels with expanded access and influence in the community.`
    }

    if (lowerQuery.includes("token") || lowerQuery.includes("gen")) {
      return "The Supercivilization uses a multi-token ecosystem aligned with the Compact principles. GEN is the primary token representing your contribution to the Supercivilization. Specialized tokens include PSP (Personal Success Puzzle), BSP (Business Success Puzzle), SMS (Supermind Superpowers), and others aligned with the four cores of the Compact. Tokens are earned through demonstrated value creation and enable participation in governance."
    }

    if (lowerQuery.includes("value creation") || lowerQuery.includes("value producer")) {
      return "The Supercivilization Compact distinguishes between value producers/creators and value usurpers/destroyers. Value producers improve existing values, while value creators generate new values. Both are welcome in the Supercivilization, as they contribute to positive-sum outcomes. The Compact guides us to behave as value producers and creators rather than as value usurpers or destroyers, who engage in zero-sum or negative-sum games."
    }

    if (lowerQuery.includes("positive sum") || lowerQuery.includes("zero sum") || lowerQuery.includes("negative sum")) {
      return "The Supercivilization Compact is founded on positive-sum game theory, where interactions create more total value than they consume. This contrasts with zero-sum games (where one's gain equals another's loss) and negative-sum games (where interactions destroy value). By focusing on positive-sum outcomes, we create abundance rather than scarcity, allowing all participants to benefit from interactions."
    }

    if (lowerQuery.includes("compact") || lowerQuery.includes("agreement")) {
      return "The Supercivilization Compact is our governing agreement that outlines the principles of regenerative thinking and value creation. It's structured around One Focus (Supercivilization), Two Views (Superachiever & Superachievers), Three Keys (Personal Success, Business Success, Supermind), and Four Cores (Developments, Enhancements, Advancements, Breakthroughs). The Compact balances virtuously selfish behavior with virtuously selfless behavior to create a community of value creators."
    }

    // Default responses based on trust level
    if (trustLevel === "Newcomer") {
      return "As a Newcomer to the Supercivilization, I recommend focusing on understanding the Compact principles and beginning your journey from Degen to Regen thinking. Start by developing your Personal Success Puzzle and exploring how you can create value for yourself and others. Complete daily challenges to earn GEN tokens and advance to the Participant trust level."
    }

    if (trustLevel === "Participant") {
      return "As a Participant in the Supercivilization, you're making good progress on your journey from Degen to Regen thinking. Continue developing your Success Puzzle while beginning to contribute to the collective Superpuzzle. Your growing token balance reflects your value creation, and you now have access to more advanced features and resources."
    }

    if (trustLevel === "Contributor" || trustLevel === "Builder" || trustLevel === "Architect") {
      return "As an advanced member of the Supercivilization, you're well-positioned to create significant value both for yourself and the community. Consider mentoring newcomers, participating in governance, and leading initiatives that advance the Superpuzzle. Your demonstrated value creation has earned you substantial influence in shaping the future of the Supercivilization."
    }

    // Generic response
    return "The Supercivilization Compact guides us to balance virtuously selfish behavior (improving ourselves) with virtuously selfless behavior (improving society). By creating positive-sum outcomes and demonstrating value creation, we advance through the graduated trust architecture and contribute to the evolution from Degen to Regen thinking. How can I help you further your journey in alignment with these principles?"
  }

  return (
    <Card className="w-full max-w-4xl mx-auto h-[600px] flex flex-col">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-2xl">Genie AI</CardTitle>
            <CardDescription>
              Your guide on the journey from Degen to Regen thinking, aligned with the Supercivilization Compact
            </CardDescription>
          </div>
          <Badge className="self-start md:self-auto">Compact-Aware</Badge>
        </div>
      </CardHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="px-6">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="compact">Compact Guide</TabsTrigger>
            <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="chat" className="flex-1 flex flex-col px-6 pb-6 space-y-4">
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`flex gap-3 max-w-[80%] ${
                      message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                    } p-3 rounded-lg`}
                  >
                    {message.role === "assistant" && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/placeholder.svg?key=jlxfa" alt="Genie AI" />
                        <AvatarFallback>AI</AvatarFallback>
                      </Avatar>
                    )}
                    <div>
                      <p className={`text-sm ${message.role === "user" ? "text-primary-foreground" : ""}`}>
                        {message.content}
                      </p>
                      <p
                        className={`text-xs mt-1 ${
                          message.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className="flex gap-2">
            <Input
              placeholder="Ask about the Supercivilization Compact..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage()
                }
              }}
              disabled={isLoading}
            />
            <Button onClick={sendMessage} disabled={!input.trim() || isLoading}>
              {isLoading ? "Thinking..." : "Send"}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="compact" className="flex-1 px-6 pb-6">
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                  The Supercivilization Compact
                </h3>

                <p className="text-xs text-muted-foreground mb-4">
                  The Compact is the governing agreement of the Supercivilization, guiding our evolution from Degen to
                  Regen thinking.
                </p>

                <div className="space-y-3">
                  <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700">
                    <h4 className="text-sm font-medium">One Focus: Supercivilization</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      The Supercivilization is our central organizing concept - a community of value creators committed
                      to regenerative thinking.
                    </p>
                  </div>

                  <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700">
                    <h4 className="text-sm font-medium">Two Views: Superachiever & Superachievers</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      We balance individual achievement (Superachiever) with collective advancement (Superachievers).
                    </p>
                  </div>

                  <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700">
                    <h4 className="text-sm font-medium">Three Keys: Personal Success, Business Success, Supermind</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      We focus on developing personal success, business success, and supermind capabilities.
                    </p>
                  </div>

                  <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700">
                    <h4 className="text-sm font-medium">
                      Four Cores: Developments, Enhancements, Advancements, Breakthroughs
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      We work on superpuzzle developments, superhuman enhancements, supersociety advancements, and
                      supergenius breakthroughs.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                  Dual Virtuous Behaviors
                </h3>

                <div className="space-y-3">
                  <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700">
                    <h4 className="text-sm font-medium">Virtuously Selfish Behavior</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Constantly improving yourself via creating your Success Puzzle faster as a Superachiever.
                    </p>
                  </div>

                  <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700">
                    <h4 className="text-sm font-medium">Virtuously Selfless Behavior</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Constantly improving society via co-creating the Superpuzzle faster with other Superachievers.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                  Graduated Trust Architecture
                </h3>

                <p className="text-xs text-muted-foreground mb-4">
                  The Supercivilization operates on a graduated trust architecture where access to community resources
                  increases with demonstrated value creation.
                </p>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs">Newcomer</span>
                    <Badge variant="outline">0-49 GEN</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs">Participant</span>
                    <Badge variant="outline">50-99 GEN</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs">Contributor</span>
                    <Badge variant="outline">100-249 GEN</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs">Builder</span>
                    <Badge variant="outline">250-499 GEN</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs">Architect</span>
                    <Badge variant="outline">500+ GEN</Badge>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Brain className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                  Value Creation Principles
                </h3>

                <div className="space-y-3">
                  <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700">
                    <h4 className="text-sm font-medium">Positive-Sum Game Theory</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      We focus on creating positive-sum outcomes where interactions create more total value than they
                      consume.
                    </p>
                  </div>

                  <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700">
                    <h4 className="text-sm font-medium">Value Producers & Creators</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      We behave as value producers (improving existing values) and value creators (creating new values).
                    </p>
                  </div>

                  <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700">
                    <h4 className="text-sm font-medium">Regenerative Thinking</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      We practice regenerative thinking that creates sustainable value rather than extractive thinking.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="suggestions" className="flex-1 px-6 pb-6">
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  Personal Success Puzzle Suggestions
                </h3>

                <div className="space-y-3">
                  {trustLevel === "Newcomer" && (
                    <>
                      <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium">Create a Personal Health Plan</h4>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setActiveTab("chat")
                              setInput("Help me create a personal health plan aligned with the Compact")
                            }}
                          >
                            Ask
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Develop a plan to improve your health and energy in alignment with virtuously selfish
                          behavior.
                        </p>
                      </div>

                      <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium">Identify Your Core Values</h4>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setActiveTab("chat")
                              setInput("Help me identify my core values aligned with the Compact")
                            }}
                          >
                            Ask
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Clarify your core values to guide your personal development in the Supercivilization.
                        </p>
                      </div>
                    </>
                  )}

                  {(trustLevel === "Participant" || trustLevel === "Contributor") && (
                    <>
                      <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium">Develop a Wealth Building Strategy</h4>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setActiveTab("chat")
                              setInput("Help me develop a wealth building strategy aligned with the Compact")
                            }}
                          >
                            Ask
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Create a strategy for building wealth that aligns with regenerative thinking.
                        </p>
                      </div>

                      <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium">Enhance Your Relationship Skills</h4>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setActiveTab("chat")
                              setInput("Help me enhance my relationship skills in alignment with the Compact")
                            }}
                          >
                            Ask
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Develop skills for creating positive-sum relationships in your personal life.
                        </p>
                      </div>
                    </>
                  )}

                  {(trustLevel === "Builder" || trustLevel === "Architect") && (
                    <>
                      <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium">Create a Legacy Plan</h4>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setActiveTab("chat")
                              setInput("Help me create a legacy plan aligned with the Compact")
                            }}
                          >
                            Ask
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Develop a plan for creating lasting value that extends beyond your lifetime.
                        </p>
                      </div>

                      <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium">Optimize Your Personal Systems</h4>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setActiveTab("chat")
                              setInput("Help me optimize my personal systems for maximum value creation")
                            }}
                          >
                            Ask
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Create systems that maximize your value creation capacity and well-being.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  Business Success Puzzle Suggestions
                </h3>

                <div className="space-y-3">
                  {trustLevel === "Newcomer" && (
                    <>
                      <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium">Identify Your Value Proposition</h4>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setActiveTab("chat")
                              setInput("Help me identify my value proposition aligned with the Compact")
                            }}
                          >
                            Ask
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Clarify the unique value you can create for others in your professional life.
                        </p>
                      </div>

                      <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium">Develop a Networking Strategy</h4>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setActiveTab("chat")
                              setInput("Help me develop a networking strategy aligned with the Compact")
                            }}
                          >
                            Ask
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Create a strategy for building a network based on mutual value creation.
                        </p>
                      </div>
                    </>
                  )}

                  {(trustLevel === "Participant" || trustLevel === "Contributor") && (
                    <>
                      <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium">Create a Business Model Canvas</h4>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setActiveTab("chat")
                              setInput("Help me create a regenerative business model canvas")
                            }}
                          >
                            Ask
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Develop a business model that creates positive-sum outcomes for all stakeholders.
                        </p>
                      </div>

                      <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium">Optimize Your Professional Systems</h4>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setActiveTab("chat")
                              setInput("Help me optimize my professional systems for value creation")
                            }}
                          >
                            Ask
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Create systems that maximize your professional value creation capacity.
                        </p>
                      </div>
                    </>
                  )}

                  {(trustLevel === "Builder" || trustLevel === "Architect") && (
                    <>
                      <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium">Develop a Regenerative Business Strategy</h4>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setActiveTab("chat")
                              setInput("Help me develop a regenerative business strategy")
                            }}
                          >
                            Ask
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Create a comprehensive business strategy based on regenerative principles.
                        </p>
                      </div>

                      <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium">Build a Value-Aligned Team</h4>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setActiveTab("chat")
                              setInput("Help me build a team aligned with Compact values")
                            }}
                          >
                            Ask
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Develop strategies for building and leading a team aligned with regenerative principles.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Brain className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                  Supermind Superpowers Suggestions
                </h3>

                <div className="space-y-3">
                  <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">Develop Conflict Resolution Skills</h4>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setActiveTab("chat")
                          setInput("Help me develop conflict resolution skills aligned with the Compact")
                        }}
                      >
                        Ask
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Learn techniques for resolving conflicts in ways that create positive-sum outcomes.
                    </p>
                  </div>

                  <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">Enhance Strategic Planning Abilities</h4>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setActiveTab("chat")
                          setInput("Help me enhance my strategic planning abilities")
                        }}
                      >
                        Ask
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Develop your ability to create effective plans for the future aligned with regenerative
                      principles.
                    </p>
                  </div>

                  <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">Improve Implementation Effectiveness</h4>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setActiveTab("chat")
                          setInput("Help me improve my implementation effectiveness")
                        }}
                      >
                        Ask
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Enhance your ability to effectively implement action plans and achieve results.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                  Superpuzzle Contribution Suggestions
                </h3>

                <div className="space-y-3">
                  <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">Identify Contribution Opportunities</h4>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setActiveTab("chat")
                          setInput("Help me identify opportunities to contribute to the Superpuzzle")
                        }}
                      >
                        Ask
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Discover ways you can contribute to the collective Superpuzzle based on your unique skills and
                      interests.
                    </p>
                  </div>

                  <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">Develop a Collaboration Strategy</h4>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setActiveTab("chat")
                          setInput("Help me develop a strategy for collaborating with other Superachievers")
                        }}
                      >
                        Ask
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Create a strategy for effective collaboration with other Superachievers on collective projects.
                    </p>
                  </div>

                  <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">Balance Individual and Collective Focus</h4>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setActiveTab("chat")
                          setInput("Help me balance my individual success with collective contribution")
                        }}
                      >
                        Ask
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Develop strategies for balancing your focus on personal success with your contribution to
                      collective advancement.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      <CardFooter className="flex justify-between border-t border-zinc-200 dark:border-zinc-800 pt-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            Genie AI is trained on the Supercivilization Compact principles
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Trust Level:</span>
          <Badge>{trustLevel}</Badge>
        </div>
      </CardFooter>
    </Card>
  )
}
