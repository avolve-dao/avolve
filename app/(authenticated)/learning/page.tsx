import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Video, FileText, Lightbulb, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DailyFocus } from "@/components/daily-focus"

export default function LearningPage() {
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-2">Learning Center</h1>
      <p className="text-muted-foreground mb-6">
        Explore resources to accelerate your journey from Degen to Regen thinking.
      </p>

      <div className="mb-6">
        <DailyFocus />
      </div>

      <Tabs defaultValue="all" className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Resources</TabsTrigger>
          <TabsTrigger value="articles">Articles</TabsTrigger>
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <ResourceCard
              title="Introduction to Regenerative Thinking"
              description="Learn the fundamentals of regenerative thinking and how it differs from extractive models."
              type="article"
              category="GEN"
              readTime="5 min read"
              link="/learning/articles/intro-to-regen"
            />

            <ResourceCard
              title="Building Your Personal Success Puzzle"
              description="Discover how to create a personal success puzzle that aligns with regenerative principles."
              type="video"
              category="PSP"
              readTime="12 min watch"
              link="/learning/videos/personal-success-puzzle"
            />

            <ResourceCard
              title="Business Models for the Supercivilization"
              description="Explore business models that create value for all stakeholders in the regenerative economy."
              type="article"
              category="BSP"
              readTime="8 min read"
              link="/learning/articles/business-models"
            />

            <ResourceCard
              title="Supermind Activation Techniques"
              description="Learn practical techniques to activate your supermind and enhance your cognitive abilities."
              type="video"
              category="SMS"
              readTime="15 min watch"
              link="/learning/videos/supermind-activation"
            />

            <ResourceCard
              title="Collaborative Value Creation"
              description="Understand how to create value collaboratively in a positive-sum environment."
              type="article"
              category="SCQ"
              readTime="6 min read"
              link="/learning/articles/collaborative-value"
            />

            <ResourceCard
              title="From Degen to Regen: Complete Course"
              description="A comprehensive course on transforming your thinking from extractive to regenerative."
              type="course"
              category="GEN"
              readTime="3 hour course"
              link="/learning/courses/degen-to-regen"
            />
          </div>
        </TabsContent>

        <TabsContent value="articles" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <ResourceCard
              title="Introduction to Regenerative Thinking"
              description="Learn the fundamentals of regenerative thinking and how it differs from extractive models."
              type="article"
              category="GEN"
              readTime="5 min read"
              link="/learning/articles/intro-to-regen"
            />

            <ResourceCard
              title="Business Models for the Supercivilization"
              description="Explore business models that create value for all stakeholders in the regenerative economy."
              type="article"
              category="BSP"
              readTime="8 min read"
              link="/learning/articles/business-models"
            />

            <ResourceCard
              title="Collaborative Value Creation"
              description="Understand how to create value collaboratively in a positive-sum environment."
              type="article"
              category="SCQ"
              readTime="6 min read"
              link="/learning/articles/collaborative-value"
            />
          </div>
        </TabsContent>

        <TabsContent value="videos" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <ResourceCard
              title="Building Your Personal Success Puzzle"
              description="Discover how to create a personal success puzzle that aligns with regenerative principles."
              type="video"
              category="PSP"
              readTime="12 min watch"
              link="/learning/videos/personal-success-puzzle"
            />

            <ResourceCard
              title="Supermind Activation Techniques"
              description="Learn practical techniques to activate your supermind and enhance your cognitive abilities."
              type="video"
              category="SMS"
              readTime="15 min watch"
              link="/learning/videos/supermind-activation"
            />
          </div>
        </TabsContent>

        <TabsContent value="courses" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <ResourceCard
              title="From Degen to Regen: Complete Course"
              description="A comprehensive course on transforming your thinking from extractive to regenerative."
              type="course"
              category="GEN"
              readTime="3 hour course"
              link="/learning/courses/degen-to-regen"
            />
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Featured Learning Paths</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Beginner's Path: Degen to Regen Fundamentals</CardTitle>
              <CardDescription>Perfect for those just starting their transformation journey</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xs">
                    1
                  </div>
                  <span>Introduction to Regenerative Thinking</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xs">
                    2
                  </div>
                  <span>Building Your Personal Success Puzzle</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xs">
                    3
                  </div>
                  <span>Collaborative Value Creation</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xs">
                    4
                  </div>
                  <span>From Degen to Regen: Complete Course</span>
                </li>
              </ul>
              <Button className="mt-4" asChild>
                <Link href="/learning/paths/beginner">
                  Start Learning Path <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Advanced Path: Supercivilization Builder</CardTitle>
              <CardDescription>For those ready to contribute to building the Supercivilization</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xs">
                    1
                  </div>
                  <span>Business Models for the Supercivilization</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xs">
                    2
                  </div>
                  <span>Supermind Activation Techniques</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xs">
                    3
                  </div>
                  <span>Advanced Regenerative Systems Design</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xs">
                    4
                  </div>
                  <span>Supercivilization Leadership Principles</span>
                </li>
              </ul>
              <Button className="mt-4" asChild>
                <Link href="/learning/paths/advanced">
                  Start Learning Path <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

interface ResourceCardProps {
  title: string
  description: string
  type: "article" | "video" | "course"
  category: string
  readTime: string
  link: string
}

function ResourceCard({ title, description, type, category, readTime, link }: ResourceCardProps) {
  const getIcon = () => {
    switch (type) {
      case "article":
        return <FileText className="h-5 w-5" />
      case "video":
        return <Video className="h-5 w-5" />
      case "course":
        return <BookOpen className="h-5 w-5" />
      default:
        return <Lightbulb className="h-5 w-5" />
    }
  }

  const getCategoryColor = () => {
    switch (category) {
      case "GEN":
        return "bg-gradient-to-r from-zinc-400 to-zinc-600"
      case "SAP":
        return "bg-gradient-to-r from-stone-400 to-stone-600"
      case "PSP":
        return "bg-gradient-to-r from-amber-300 to-yellow-500"
      case "BSP":
        return "bg-gradient-to-r from-teal-400 to-cyan-500"
      case "SMS":
        return "bg-gradient-to-r from-violet-400 via-purple-500 to-fuchsia-500"
      case "SCQ":
        return "bg-gradient-to-r from-slate-400 to-slate-600"
      case "SPD":
        return "bg-gradient-to-r from-red-500 via-green-500 to-blue-500"
      case "SHE":
        return "bg-gradient-to-r from-rose-500 via-red-500 to-orange-500"
      case "SSA":
        return "bg-gradient-to-r from-lime-500 via-green-500 to-emerald-500"
      case "SGB":
        return "bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500"
      default:
        return "bg-gradient-to-r from-zinc-400 to-zinc-600"
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className={`h-2 ${getCategoryColor()}`} />
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{title}</CardTitle>
          <div
            className={`h-8 w-8 rounded-full ${getCategoryColor()} flex items-center justify-center text-white text-xs font-bold`}
          >
            {category}
          </div>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {getIcon()}
            <span className="capitalize">{type}</span>
            <span>•</span>
            <span>{readTime}</span>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href={link}>
              View <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
