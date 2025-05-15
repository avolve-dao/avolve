"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Coins, ArrowRight, CheckCircle, XCircle } from "lucide-react"
import { unlockGenTokens } from "@/app/actions/gen-token-actions"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

// Quiz questions about Regen principles
const questions = [
  {
    id: 1,
    question: "Which statement best describes the Regen mindset?",
    options: [
      { id: "a", text: "Maximizing personal gain regardless of impact on others", isRegen: false },
      { id: "b", text: "Creating systems that generate value for all stakeholders", isRegen: true },
      { id: "c", text: "Competing aggressively to secure limited resources", isRegen: false },
      { id: "d", text: "Focusing exclusively on short-term financial returns", isRegen: false },
    ],
  },
  {
    id: 2,
    question: "What distinguishes the Supercivilization from the Anticivilization?",
    options: [
      { id: "a", text: "The Supercivilization operates on zero-sum principles", isRegen: false },
      { id: "b", text: "The Supercivilization extracts value from systems", isRegen: false },
      { id: "c", text: "The Supercivilization creates positive-sum outcomes", isRegen: true },
      {
        id: "d",
        text: "The Supercivilization prioritizes individual achievement over collective wellbeing",
        isRegen: false,
      },
    ],
  },
  {
    id: 3,
    question: "As a value creator in the Supercivilization, your primary aim is to:",
    options: [
      { id: "a", text: "Extract maximum value from existing systems", isRegen: false },
      { id: "b", text: "Compete against others for limited resources", isRegen: false },
      { id: "c", text: "Generate regenerative value that benefits all stakeholders", isRegen: true },
      { id: "d", text: "Maximize personal gain at the expense of others", isRegen: false },
    ],
  },
]

export function GenTokenUnlockForm() {
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({})
  const [quizResults, setQuizResults] = useState<{
    correct: number
    total: number
    tokenAmount: number
    answers: Array<{
      question: string
      selectedAnswer: string
      isCorrect: boolean
    }>
  } | null>(null)

  const { toast } = useToast()
  const router = useRouter()

  const handleSelectAnswer = (answerId: string) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questions[currentQuestion].id]: answerId,
    })
  }

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      completeQuiz()
    }
  }

  const completeQuiz = async () => {
    setIsSubmitting(true)

    // Calculate correct answers
    let correctAnswers = 0
    const answerDetails = []

    for (const question of questions) {
      const selectedOptionId = selectedAnswers[question.id]
      const selectedOption = question.options.find((option) => option.id === selectedOptionId)
      const isCorrect = selectedOption?.isRegen || false

      if (isCorrect) {
        correctAnswers++
      }

      answerDetails.push({
        question: question.question,
        selectedAnswer: selectedOption?.text || "No answer",
        isCorrect,
      })
    }

    const result = await unlockGenTokens({
      correct: correctAnswers,
      total: questions.length,
    })

    setIsSubmitting(false)

    if (result.success) {
      setQuizResults({
        correct: correctAnswers,
        total: questions.length,
        tokenAmount: result.tokenAmount || 0,
        answers: answerDetails,
      })
      setIsUnlocked(true)
      toast({
        title: "GEN Tokens Unlocked",
        description: result.message,
      })
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto border-zinc-300 dark:border-zinc-700">
      <CardHeader className="bg-gradient-to-r from-zinc-100 to-zinc-50 dark:from-zinc-900 dark:to-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-zinc-500" />
            <CardTitle className="text-2xl">Unlock GEN Tokens</CardTitle>
          </div>
          <Badge variant="outline" className="bg-zinc-100 dark:bg-zinc-800">
            Step 2/3
          </Badge>
        </div>
        <CardDescription>
          GEN Tokens are the currency of the Supercivilization, representing your regenerative potential.
        </CardDescription>
      </CardHeader>

      {!isUnlocked ? (
        <>
          <CardContent className="pt-6">
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Demonstrate Your Understanding</h3>
              <p className="text-muted-foreground mb-4">
                To unlock GEN Tokens, show your understanding of Regen principles by answering these questions.
              </p>

              <div className="p-4 border rounded-lg bg-muted/30">
                <h4 className="font-medium mb-4">{questions[currentQuestion].question}</h4>

                <RadioGroup value={selectedAnswers[questions[currentQuestion].id]} onValueChange={handleSelectAnswer}>
                  {questions[currentQuestion].options.map((option) => (
                    <div
                      key={option.id}
                      className="flex items-center space-x-2 p-3 border rounded-md mb-2 hover:bg-muted cursor-pointer"
                      onClick={() => handleSelectAnswer(option.id)}
                    >
                      <RadioGroupItem value={option.id} id={option.id} />
                      <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                        {option.text}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-muted-foreground">
                  Question {currentQuestion + 1} of {questions.length}
                </div>
                <div className="flex gap-2">
                  {currentQuestion > 0 && (
                    <Button
                      variant="outline"
                      onClick={() => setCurrentQuestion(currentQuestion - 1)}
                      disabled={isSubmitting}
                    >
                      Previous
                    </Button>
                  )}
                  <Button
                    onClick={handleNextQuestion}
                    disabled={isSubmitting || !selectedAnswers[questions[currentQuestion].id]}
                  >
                    {currentQuestion < questions.length - 1 ? "Next Question" : "Complete Quiz"}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </>
      ) : (
        <>
          <CardContent className="pt-6">
            <div className="text-center py-6">
              <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-r from-zinc-400 to-zinc-600 flex items-center justify-center mb-4">
                <Coins className="h-8 w-8 text-white" />
              </div>

              <div>
                <h3 className="text-2xl font-semibold mb-2">GEN Tokens Unlocked!</h3>
                <div className="flex items-center justify-center mb-6">
                  <Badge className="text-lg py-1 px-3 bg-gradient-to-r from-zinc-200 to-zinc-300 dark:from-zinc-800 dark:to-zinc-700 text-foreground">
                    +{quizResults?.tokenAmount} GEN
                  </Badge>
                </div>
                <p className="text-muted-foreground mb-6">
                  You've unlocked GEN Tokens, the currency of the Supercivilization. Use them to access resources and
                  tools.
                </p>
              </div>

              <div className="bg-gradient-to-r from-zinc-100 to-zinc-50 dark:from-zinc-900 dark:to-zinc-800 p-6 rounded-lg border border-zinc-200 dark:border-zinc-700 mb-6">
                <h4 className="font-medium mb-2">What's Next:</h4>
                <p className="text-sm text-muted-foreground">
                  Now that you have GEN Tokens, you can unlock Genie AI - your guide on the journey from Degen to Regen.
                </p>
              </div>

              <div>
                <h4 className="font-medium text-left mb-3">
                  Quiz Results: {quizResults?.correct}/{quizResults?.total} correct
                </h4>
                <div className="grid grid-cols-1 gap-4 text-left">
                  {quizResults?.answers.map((answer, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        {answer.isCorrect ? (
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                        )}
                        <div>
                          <p className="font-medium">{questions[index].question}</p>
                          <p
                            className={`text-sm mt-1 ${answer.isCorrect ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                          >
                            Your answer: {answer.selectedAnswer}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => router.push("/unlock/genie-ai")}>
              Continue to Unlock Genie AI <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </>
      )}
    </Card>
  )
}
