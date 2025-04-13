'use client';

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Puzzle } from 'lucide-react'

interface CommunityPuzzleProps {
  onComplete: (points: number, data: any) => void
  isLoading?: boolean
}

// Community puzzles are questions about Avolve's values and structure
// These help verify that users understand the platform's purpose
const puzzles = [
  {
    id: 'pillars',
    question: 'What are the three main pillars of Avolve?',
    options: [
      { value: 'a', label: 'Technology, Community, Finance' },
      { value: 'b', label: 'Superachiever, Superachievers, Supercivilization' },
      { value: 'c', label: 'Education, Innovation, Collaboration' },
      { value: 'd', label: 'Tokens, NFTs, Cryptocurrencies' }
    ],
    correctAnswer: 'b',
    points: 25
  },
  {
    id: 'tokens',
    question: 'What is the primary token in the Avolve ecosystem?',
    options: [
      { value: 'a', label: 'SAP Token' },
      { value: 'b', label: 'SCQ Token' },
      { value: 'c', label: 'GEN Token' },
      { value: 'd', label: 'SMS Token' }
    ],
    correctAnswer: 'c',
    points: 25
  },
  {
    id: 'journey',
    question: 'What is the correct progression in the member journey?',
    options: [
      { value: 'a', label: 'Invited → Vouched → Contributor → Full Member' },
      { value: 'b', label: 'Registered → Verified → Premium → Admin' },
      { value: 'c', label: 'Visitor → User → Member → Leader' },
      { value: 'd', label: 'Beginner → Intermediate → Advanced → Expert' }
    ],
    correctAnswer: 'a',
    points: 25
  },
  {
    id: 'superachiever',
    question: 'Which of these is part of the Superachiever pillar?',
    options: [
      { value: 'a', label: 'Supersociety Advancements' },
      { value: 'b', label: 'Superpuzzle Developments' },
      { value: 'c', label: 'Personal Success Puzzle' },
      { value: 'd', label: 'Supergenius Breakthroughs' }
    ],
    correctAnswer: 'c',
    points: 25
  },
  {
    id: 'purpose',
    question: 'What is the primary purpose of Avolve\'s token system?',
    options: [
      { value: 'a', label: 'To create a cryptocurrency for external trading' },
      { value: 'b', label: 'To integrate with Network State concepts and provide access control' },
      { value: 'c', label: 'To replace traditional payment methods' },
      { value: 'd', label: 'To compete with other blockchain platforms' }
    ],
    correctAnswer: 'b',
    points: 25
  }
]

export function CommunityPuzzle({ onComplete, isLoading = false }: CommunityPuzzleProps) {
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  
  const currentPuzzle = puzzles[currentPuzzleIndex]
  
  const handleSubmit = () => {
    if (!selectedOption) return
    
    setIsSubmitting(true)
    
    // Check if answer is correct
    const correct = selectedOption === currentPuzzle.correctAnswer
    setIsCorrect(correct)
    
    if (correct) {
      // If correct, award points and move to next puzzle
      setTimeout(() => {
        onComplete(currentPuzzle.points, {
          puzzleId: currentPuzzle.id,
          attempts: attempts + 1,
          correct: true
        })
        
        // Move to next puzzle or reset if all puzzles completed
        if (currentPuzzleIndex < puzzles.length - 1) {
          setCurrentPuzzleIndex(currentPuzzleIndex + 1)
        } else {
          setCurrentPuzzleIndex(0)
        }
        
        // Reset state
        setSelectedOption(null)
        setAttempts(0)
        setIsCorrect(null)
        setIsSubmitting(false)
      }, 1500)
    } else {
      // If incorrect, increment attempts and allow retry
      setTimeout(() => {
        setAttempts(attempts + 1)
        setIsSubmitting(false)
      }, 1500)
    }
  }
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
        <CardFooter>
          <Skeleton className="h-10 w-full" />
        </CardFooter>
      </Card>
    )
  }
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold">Community Puzzle</CardTitle>
          <Puzzle className="h-5 w-5 text-primary" />
        </div>
        <CardDescription>
          Answer correctly to earn verification points
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="font-medium">{currentPuzzle.question}</div>
          
          <RadioGroup 
            value={selectedOption || ''} 
            onValueChange={setSelectedOption}
            className="space-y-2"
            disabled={isSubmitting}
          >
            {currentPuzzle.options.map((option) => (
              <div 
                key={option.value} 
                className={`flex items-center space-x-2 rounded-md border p-3 ${
                  isCorrect !== null && option.value === currentPuzzle.correctAnswer 
                    ? 'border-green-500 bg-green-50' 
                    : isCorrect === false && option.value === selectedOption
                    ? 'border-red-500 bg-red-50'
                    : 'border-input'
                }`}
              >
                <RadioGroupItem 
                  value={option.value} 
                  id={`option-${option.value}`} 
                  disabled={isSubmitting}
                />
                <Label 
                  htmlFor={`option-${option.value}`}
                  className="flex-1 cursor-pointer"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
          
          {isCorrect === false && (
            <p className="text-sm text-red-500">
              Incorrect answer. Please try again.
            </p>
          )}
          
          {isCorrect === true && (
            <p className="text-sm text-green-500">
              Correct! You earned {currentPuzzle.points} verification points.
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={handleSubmit}
          disabled={!selectedOption || isSubmitting}
        >
          {isSubmitting ? 'Checking...' : 'Submit Answer'}
        </Button>
      </CardFooter>
    </Card>
  )
}
