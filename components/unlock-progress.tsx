import { CheckCircle, Circle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface UnlockProgressProps {
  hasGeniusId: boolean
  hasGenTokens: boolean
  hasGenieAi: boolean
}

export function UnlockProgress({ hasGeniusId, hasGenTokens, hasGenieAi }: UnlockProgressProps) {
  // Determine next unlock step
  let nextUnlockPath = ""
  let nextUnlockName = ""

  if (!hasGeniusId) {
    nextUnlockPath = "/unlock/genius-id"
    nextUnlockName = "Genius ID"
  } else if (!hasGenTokens) {
    nextUnlockPath = "/unlock/gen-token"
    nextUnlockName = "GEN Tokens"
  } else if (!hasGenieAi) {
    nextUnlockPath = "/unlock/genie-ai"
    nextUnlockName = "Genie AI"
  }

  const allUnlocked = hasGeniusId && hasGenTokens && hasGenieAi

  return (
    <div className="w-full p-6 border rounded-lg bg-gradient-to-r from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800 border-zinc-200 dark:border-zinc-700">
      <h2 className="text-xl font-medium mb-4">Your Supercivilization Unlocking Progress</h2>

      <div className="space-y-4 mb-6">
        <div className="flex items-center gap-3">
          {hasGeniusId ? (
            <CheckCircle className="h-6 w-6 text-green-500 shrink-0" />
          ) : (
            <Circle className="h-6 w-6 text-muted-foreground shrink-0" />
          )}
          <div>
            <p className={`font-medium ${hasGeniusId ? "text-green-600 dark:text-green-400" : ""}`}>Genius ID</p>
            <p className="text-sm text-muted-foreground">Your unique identifier in the Supercivilization</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {hasGenTokens ? (
            <CheckCircle className="h-6 w-6 text-green-500 shrink-0" />
          ) : (
            <Circle className="h-6 w-6 text-muted-foreground shrink-0" />
          )}
          <div>
            <p className={`font-medium ${hasGenTokens ? "text-green-600 dark:text-green-400" : ""}`}>GEN Tokens</p>
            <p className="text-sm text-muted-foreground">The currency of the Supercivilization</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {hasGenieAi ? (
            <CheckCircle className="h-6 w-6 text-green-500 shrink-0" />
          ) : (
            <Circle className="h-6 w-6 text-muted-foreground shrink-0" />
          )}
          <div>
            <p className={`font-medium ${hasGenieAi ? "text-green-600 dark:text-green-400" : ""}`}>Genie AI</p>
            <p className="text-sm text-muted-foreground">Your guide on the journey from Degen to Regen</p>
          </div>
        </div>
      </div>

      {!allUnlocked && (
        <Button asChild className="w-full">
          <Link href={nextUnlockPath}>Unlock {nextUnlockName} Next</Link>
        </Button>
      )}

      {allUnlocked && (
        <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg border border-green-200 dark:border-green-800">
          <p className="text-green-700 dark:text-green-400 text-center font-medium">
            Congratulations! You've unlocked all Supercivilization components.
          </p>
        </div>
      )}
    </div>
  )
}
