import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle } from "lucide-react"

export function SupercivilizationOverview() {
  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-zinc-100 to-zinc-50 dark:from-zinc-900 dark:to-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
        <CardTitle>The Supercivilization</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-6">
          <p className="text-muted-foreground">
            The Supercivilization is built on Regen principles that transform extractive, zero-sum systems into
            regenerative, positive-sum outcomes.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h3 className="font-medium text-red-600 dark:text-red-400 flex items-center gap-1">
                <XCircle className="h-4 w-4" /> Degen Anticivilization
              </h3>
              <ul className="space-y-1 pl-5 list-disc text-muted-foreground">
                <li>Extracts value from systems and people</li>
                <li>Competes for limited resources</li>
                <li>Measures success by comparison to others</li>
                <li>Remains trapped in biological survival patterns</li>
                <li>Prioritizes individual achievement at others' expense</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium text-green-600 dark:text-green-400 flex items-center gap-1">
                <CheckCircle className="h-4 w-4" /> Regen Supercivilization
              </h3>
              <ul className="space-y-1 pl-5 list-disc text-muted-foreground">
                <li>Creates regenerative value for all stakeholders</li>
                <li>Builds systems that generate abundance</li>
                <li>Measures success by positive impact</li>
                <li>Transcends biological survival patterns</li>
                <li>Collaborates to create emergent solutions</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
