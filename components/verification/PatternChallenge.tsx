'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Grid3X3, Check, X } from 'lucide-react';

interface PatternChallengeProps {
  onComplete: (points: number, data: any) => void;
  isLoading?: boolean;
}

// Generate a random pattern sequence
const generatePattern = (length: number = 5) => {
  const pattern: number[] = [];
  for (let i = 0; i < length; i++) {
    pattern.push(Math.floor(Math.random() * 9));
  }
  return pattern;
};

export function PatternChallenge({ onComplete, isLoading = false }: PatternChallengeProps) {
  const [pattern, setPattern] = useState<number[]>([]);
  const [userPattern, setUserPattern] = useState<number[]>([]);
  const [isShowingPattern, setIsShowingPattern] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [patternLength, setPatternLength] = useState(3);
  const [result, setResult] = useState<'success' | 'failure' | null>(null);
  const [attempts, setAttempts] = useState(0);

  // Initialize or reset the challenge
  const initializeChallenge = () => {
    const newPattern = generatePattern(patternLength);
    setPattern(newPattern);
    setUserPattern([]);
    setIsShowingPattern(true);
    setResult(null);

    // Show the pattern for a few seconds
    setTimeout(
      () => {
        setIsShowingPattern(false);
      },
      2000 + patternLength * 500
    );
  };

  // Start the challenge when component mounts
  useEffect(() => {
    if (!isLoading) {
      initializeChallenge();
    }
  }, [isLoading]);

  // Handle grid cell click
  const handleCellClick = (index: number) => {
    if (isShowingPattern || isVerifying || result !== null) return;

    const newUserPattern = [...userPattern, index];
    setUserPattern(newUserPattern);

    // If user has completed the pattern, verify it
    if (newUserPattern.length === pattern.length) {
      verifyPattern(newUserPattern);
    }
  };

  // Verify the user's pattern against the generated pattern
  const verifyPattern = (userInput: number[]) => {
    setIsVerifying(true);

    // Check if patterns match
    const isCorrect = userInput.every((val, index) => val === pattern[index]);

    setTimeout(() => {
      if (isCorrect) {
        // Success - award points based on pattern length
        setResult('success');
        const points = patternLength * 10;

        setTimeout(() => {
          onComplete(points, {
            patternLength,
            attempts: attempts + 1,
            correct: true,
          });

          // Increase difficulty for next challenge
          setPatternLength(Math.min(patternLength + 1, 7));
          setAttempts(0);
          initializeChallenge();
        }, 1500);
      } else {
        // Failure - allow retry
        setResult('failure');
        setAttempts(attempts + 1);

        setTimeout(() => {
          setUserPattern([]);
          setResult(null);
          setIsVerifying(false);
        }, 1500);
      }
    }, 1000);
  };

  // Restart the challenge
  const handleRestart = () => {
    setIsVerifying(false);
    initializeChallenge();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-md" />
            ))}
          </div>
          <Skeleton className="h-4 w-full" />
        </CardContent>
        <CardFooter>
          <Skeleton className="h-10 w-full" />
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold">Pattern Challenge</CardTitle>
          <Grid3X3 className="h-5 w-5 text-primary" />
        </div>
        <CardDescription>
          Memorize and repeat the pattern to earn verification points
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {Array.from({ length: 9 }).map((_, index) => (
            <div
              key={index}
              onClick={() => handleCellClick(index)}
              className={`aspect-square rounded-md flex items-center justify-center cursor-pointer transition-all ${
                isShowingPattern && pattern.includes(index)
                  ? 'bg-primary text-primary-foreground'
                  : userPattern.includes(index)
                    ? 'bg-secondary text-secondary-foreground'
                    : 'bg-muted hover:bg-muted/80'
              }`}
            >
              {result === 'success' && userPattern.includes(index) && <Check className="h-6 w-6" />}
              {result === 'failure' && userPattern.includes(index) && (
                <X className="h-6 w-6 text-destructive" />
              )}
            </div>
          ))}
        </div>

        <div className="text-center text-sm">
          {isShowingPattern ? (
            <p className="font-medium text-primary">Memorize this pattern!</p>
          ) : result === 'success' ? (
            <p className="font-medium text-green-600">
              Correct! You earned {patternLength * 10} verification points.
            </p>
          ) : result === 'failure' ? (
            <p className="font-medium text-red-500">Incorrect pattern. Try again.</p>
          ) : (
            <p>
              {userPattern.length === 0
                ? 'Repeat the pattern by clicking the cells'
                : `${userPattern.length}/${pattern.length} cells selected`}
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={handleRestart}
          disabled={isShowingPattern || isVerifying}
        >
          {result === null ? 'Restart Challenge' : 'Next Challenge'}
        </Button>
      </CardFooter>
    </Card>
  );
}
