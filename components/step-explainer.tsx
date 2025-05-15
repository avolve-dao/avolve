import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Lightbulb, Coins, Sparkles } from "lucide-react"

interface StepExplainerProps {
  step: 1 | 2 | 3 | 4
  className?: string
}

export function StepExplainer({ step, className }: StepExplainerProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {step === 1 && <CheckCircle className="h-5 w-5" />}
          {step === 2 && <Lightbulb className="h-5 w-5" />}
          {step === 3 && <Coins className="h-5 w-5" />}
          {step === 4 && <Sparkles className="h-5 w-5" />}

          {step === 1 && "Establish Your Identity"}
          {step === 2 && "Define Your Unique Potential"}
          {step === 3 && "Gain Resources for Growth"}
          {step === 4 && "Access Your Personal Guide"}
        </CardTitle>
        <CardDescription>
          {step === 1 && "What this means for your transformation journey"}
          {step === 2 && "How this helps you create more value"}
          {step === 3 && "Why these resources matter for your growth"}
          {step === 4 && "How your guide accelerates your progress"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-medium">What You'll Gain:</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
                <span>A clear foundation for your transformation journey</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
                <span>Alignment with value-creating principles</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
                <span>Access to the community of value creators</span>
              </li>
            </ul>

            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mt-4">
              <p className="text-sm text-amber-600/80 dark:text-amber-400/80">
                "Establishing my identity gave me clarity about my values and direction. It was the foundation for
                everything that followed." — Alex, Community Member
              </p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-medium">What You'll Gain:</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
                <span>Recognition of your unique strengths and abilities</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
                <span>A personalized path for your transformation</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
                <span>Clarity about how you can create unique value</span>
              </li>
            </ul>

            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mt-4">
              <p className="text-sm text-amber-600/80 dark:text-amber-400/80">
                "Defining my unique potential helped me focus on where I could create the most value, rather than trying
                to do everything." — Jamie, Community Member
              </p>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-medium">What You'll Gain:</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
                <span>Tools and resources to implement your transformation</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
                <span>Recognition for your contributions and growth</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
                <span>Access to advanced features and opportunities</span>
              </li>
            </ul>

            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mt-4">
              <p className="text-sm text-amber-600/80 dark:text-amber-400/80">
                "The resources I gained opened doors to new opportunities and connections I wouldn't have had
                otherwise." — Taylor, Community Member
              </p>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h3 className="font-medium">What You'll Gain:</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
                <span>Personalized guidance for your specific challenges</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
                <span>Faster progress through expert recommendations</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
                <span>Continuous learning and adaptation to your needs</span>
              </li>
            </ul>

            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mt-4">
              <p className="text-sm text-amber-600/80 dark:text-amber-400/80">
                "My personal guide helped me overcome obstacles that would have taken months to figure out on my own." —
                Jordan, Community Member
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
