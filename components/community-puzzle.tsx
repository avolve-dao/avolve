"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/lib/hooks/use-user"
import { Brain, Lightbulb, Timer, Trophy, Sparkles } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import confetti from 'canvas-confetti'

type Puzzle = {
  id: string
  title: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  hints: string[]
  answer: string
  points: number
  time_limit_seconds: number
}

export function CommunityPuzzle() {
  const { user } = useUser()
  const { toast } = useToast()
  const supabase = createClient();
  const [puzzles, setPuzzles] = useState<Puzzle[]>([])
  const [activePuzzle, setActivePuzzle] = useState<Puzzle | null>(null)
  const [userAnswer, setUserAnswer] = useState("")
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null)
  const [hintsRevealed, setHintsRevealed] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [completedPuzzles, setCompletedPuzzles] = useState<string[]>([])

  useEffect(() => {
    if (user?.id) {
      fetchPuzzles()
    }
    
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [user?.id])

  const fetchPuzzles = async () => {
    try {
      setLoading(true)
      
      // In a real implementation, these would come from the database
      // For now, we'll use mock data
      const mockPuzzles: Puzzle[] = [
        {
          id: "puzzle1",
          title: "The Avolve Cipher",
          description: "Decode this message to reveal a core value of our community: TVQFSBDIJFWFS",
          difficulty: "easy",
          hints: [
            "Think about shifting letters in the alphabet",
            "The shift is exactly one letter backward",
            "S becomes R, V becomes U, etc."
          ],
          answer: "SUPERACHIEVER",
          points: 15,
          time_limit_seconds: 300
        },
        {
          id: "puzzle2",
          title: "Token Pattern",
          description: "What comes next in this sequence? SAP, PSP, BSP, SMS, SCQ, SPD, SHE, SSA, ???",
          difficulty: "medium",
          hints: [
            "These are tokens in the Avolve ecosystem",
            "Look at the memory about Avolve's structure",
            "The last token for Supergenius Breakthroughs"
          ],
          answer: "SGB",
          points: 25,
          time_limit_seconds: 240
        },
        {
          id: "puzzle3",
          title: "Community Riddle",
          description: "I grow stronger when shared, yet I'm never depleted. I connect minds and hearts, through me communities are completed. What am I?",
          difficulty: "medium",
          hints: [
            "It's something intangible but valuable",
            "It's central to building any community",
            "It starts with the letter K"
          ],
          answer: "KNOWLEDGE",
          points: 20,
          time_limit_seconds: 180
        }
      ]
      
      setPuzzles(mockPuzzles)
      
      // Fetch challenge type IDs for 'community_puzzle'
      const { data: typeIds, error: typeIdError } = await supabase
        .from('verification_challenge_types')
        .select('id')
        .eq('name', 'community_puzzle');
      if (typeIdError) throw typeIdError;
      const challengeTypeIds = Array.isArray(typeIds) ? typeIds.map((t: any) => t.id) : [];

      // Fetch completed puzzles
      let challengeData: any[] = [];
      let challengeError: any = null;
      if (challengeTypeIds.length > 0) {
        const { data, error } = await supabase
          .from('verification_challenges')
          .select(`
            id,
            challenge_type_id,
            status,
            data,
            verification_challenge_types (name)
          `)
          .eq('user_id', user?.id)
          .eq('status', 'pending')
          .in('challenge_type_id', challengeTypeIds);
        challengeData = data || [];
        challengeError = error;
      }
      if (challengeError) throw challengeError
      
      // Find completed puzzles
      const completed = challengeData
        .filter((c: any) => c.verification_challenge_types.name === 'community_puzzle')
        .map((c: any) => c.data.puzzle_id)
      
      setCompletedPuzzles(completed)
      
    } catch (error) {
      console.error('Error fetching puzzles:', error)
      toast({
        title: "Error loading puzzles",
        description: "Please try again later",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const startPuzzle = (puzzle: Puzzle) => {
    setActivePuzzle(puzzle)
    setUserAnswer("")
    setHintsRevealed([])
    setTimeRemaining(puzzle.time_limit_seconds)
    
    // Start the timer
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          handleTimeUp()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    
    setTimer(interval)
  }

  const handleTimeUp = () => {
    toast({
      title: "Time's up!",
      description: "You ran out of time. Try again!",
      variant: "destructive"
    })
    
    resetPuzzle()
  }

  const resetPuzzle = () => {
    if (timer) clearInterval(timer)
    setActivePuzzle(null)
    setUserAnswer("")
    setHintsRevealed([])
  }

  const revealHint = (index: number) => {
    if (!hintsRevealed.includes(index)) {
      setHintsRevealed([...hintsRevealed, index])
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  const submitAnswer = async () => {
    if (!activePuzzle || !userAnswer.trim()) return
    
    try {
      setSubmitting(true)
      
      // Clear the timer
      if (timer) clearInterval(timer)
      
      // Check if the answer is correct (case insensitive)
      const isCorrect = userAnswer.trim().toUpperCase() === activePuzzle.answer.toUpperCase()
      
      if (isCorrect) {
        // Trigger confetti effect
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        })
        
        // Record the completion in the database
        const supabase = createClient()
        
        // First, check if there's a community puzzle challenge
        // Fetch challenge type IDs for 'community_puzzle'
        const { data: typeIds, error: typeIdError } = await supabase
          .from('verification_challenge_types')
          .select('id')
          .eq('name', 'community_puzzle');
        if (typeIdError) throw typeIdError;
        const challengeTypeIds = Array.isArray(typeIds) ? typeIds.map((t: any) => t.id) : [];

        let challengeData: any[] = [];
        let challengeError: any = null;
        if (challengeTypeIds.length > 0) {
          const { data, error } = await supabase
            .from('verification_challenges')
            .select(`
              id,
              challenge_type_id,
              status
            `)
            .eq('user_id', user?.id)
            .eq('status', 'pending')
            .in('challenge_type_id', challengeTypeIds)
            .limit(1);
          challengeData = data || [];
          challengeError = error;
        }
        if (challengeError) throw challengeError
        
        if (challengeData && challengeData.length > 0) {
          // Complete the challenge
          const { data, error } = await supabase.rpc('complete_verification_challenge', {
            p_challenge_id: challengeData[0].id,
            p_response: {
              puzzle_id: activePuzzle.id,
              answer: userAnswer.trim(),
              time_taken: activePuzzle.time_limit_seconds - timeRemaining,
              hints_used: hintsRevealed.length
            },
            p_success: true
          })
          
          if (error) throw error
          
          toast({
            title: "Puzzle solved!",
            description: `Congratulations! You earned ${activePuzzle.points} points`,
          })
          
          // Add to completed puzzles
          setCompletedPuzzles([...completedPuzzles, activePuzzle.id])
        } else {
          // Just record an achievement
          const { data, error } = await supabase
            .from('achievements')
            .insert([{
              user_id: user?.id,
              type: 'puzzle_solved',
              data: {
                puzzle_id: activePuzzle.id,
                title: activePuzzle.title,
                time_taken: activePuzzle.time_limit_seconds - timeRemaining,
                hints_used: hintsRevealed.length
              }
            }])
          
          if (error) throw error
          
          toast({
            title: "Puzzle solved!",
            description: "Great job solving the puzzle!",
          })
          
          // Add to completed puzzles
          setCompletedPuzzles([...completedPuzzles, activePuzzle.id])
        }
      } else {
        toast({
          title: "Incorrect answer",
          description: "Try again or use a hint",
          variant: "destructive"
        })
        
        // Restart the timer
        const interval = setInterval(() => {
          setTimeRemaining(prev => {
            if (prev <= 1) {
              clearInterval(interval)
              handleTimeUp()
              return 0
            }
            return prev - 1
          })
        }, 1000)
        
        setTimer(interval)
      }
    } catch (error) {
      console.error('Error submitting answer:', error)
      toast({
        title: "Error submitting answer",
        description: "Please try again",
        variant: "destructive"
      })
      
      // Restart the timer
      const interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(interval)
            handleTimeUp()
            return 0
          }
          return prev - 1
        })
      }, 1000)
      
      setTimer(interval)
    } finally {
      setSubmitting(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch(difficulty) {
      case 'easy': return 'text-green-500'
      case 'medium': return 'text-amber-500'
      case 'hard': return 'text-red-500'
      default: return 'text-blue-500'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Community Puzzles</CardTitle>
          <CardDescription>Solve puzzles to earn trust points and badges</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Loading puzzles...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (activePuzzle) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg font-medium">{activePuzzle.title}</CardTitle>
              <CardDescription>
                <Badge variant="outline" className={`${getDifficultyColor(activePuzzle.difficulty)} border-current`}>
                  {activePuzzle.difficulty.charAt(0).toUpperCase() + activePuzzle.difficulty.slice(1)}
                </Badge>
                <span className="ml-2">{activePuzzle.points} points</span>
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={resetPuzzle}>
              Exit Puzzle
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Timer */}
          <div className="bg-muted p-3 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center">
                <Timer className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm font-medium">Time Remaining</span>
              </div>
              <span className="font-mono font-medium">{formatTime(timeRemaining)}</span>
            </div>
            <Progress 
              value={(timeRemaining / activePuzzle.time_limit_seconds) * 100} 
              className="h-2"
              indicatorClassName={timeRemaining < 30 ? "bg-red-500" : ""}
            />
          </div>
          
          {/* Puzzle */}
          <div className="space-y-4">
            <div className="bg-primary/5 p-4 rounded-lg">
              <p className="text-lg font-medium mb-2">{activePuzzle.description}</p>
            </div>
            
            {/* Hints */}
            <div className="space-y-2">
              <div className="flex items-center">
                <Lightbulb className="h-4 w-4 mr-2 text-amber-500" />
                <h3 className="text-sm font-medium">Hints</h3>
              </div>
              
              <div className="space-y-2">
                {activePuzzle.hints.map((hint, index) => (
                  <div key={index} className="flex">
                    {hintsRevealed.includes(index) ? (
                      <p className="text-sm">{hint}</p>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => revealHint(index)}
                        className="text-xs"
                      >
                        Reveal Hint {index + 1}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Answer */}
            <div className="space-y-2">
              <Label htmlFor="answer">Your Answer</Label>
              <div className="flex gap-2">
                <Input 
                  id="answer" 
                  value={userAnswer} 
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Enter your answer"
                />
                <Button 
                  onClick={submitAnswer} 
                  disabled={!userAnswer.trim() || submitting}
                >
                  {submitting ? "Checking..." : "Submit"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Community Puzzles</CardTitle>
        <CardDescription>Solve puzzles to earn trust points and badges</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-primary/5 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <Brain className="h-5 w-5 mr-2 text-primary" />
            <h3 className="font-medium">Why Solve Puzzles?</h3>
          </div>
          <p className="text-sm">
            Solving puzzles helps us verify you're human while making the process fun and engaging. 
            Each puzzle you solve earns trust points and brings you closer to unlocking special badges and privileges.
          </p>
        </div>
        
        <Separator />
        
        <div className="space-y-4">
          <h3 className="font-medium">Available Puzzles</h3>
          
          <div className="grid gap-3">
            {puzzles.map((puzzle) => {
              const isCompleted = completedPuzzles.includes(puzzle.id)
              
              return (
                <div 
                  key={puzzle.id} 
                  className={`p-3 border rounded-lg ${isCompleted ? 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800' : 'hover:bg-muted/50'}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium flex items-center">
                        {puzzle.title}
                        {isCompleted && (
                          <Trophy className="h-4 w-4 ml-2 text-amber-500" />
                        )}
                      </div>
                      <div className="flex items-center mt-1">
                        <Badge variant="outline" className={`${getDifficultyColor(puzzle.difficulty)} border-current`}>
                          {puzzle.difficulty.charAt(0).toUpperCase() + puzzle.difficulty.slice(1)}
                        </Badge>
                        <span className="text-xs text-muted-foreground ml-2">{puzzle.points} points</span>
                        <span className="mx-2 text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground flex items-center">
                          <Timer className="h-3 w-3 mr-1" />
                          {formatTime(puzzle.time_limit_seconds)}
                        </span>
                      </div>
                    </div>
                    
                    {isCompleted ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800">
                        Solved
                      </Badge>
                    ) : (
                      <Button size="sm" onClick={() => startPuzzle(puzzle)}>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Solve
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
