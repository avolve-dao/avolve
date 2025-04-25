'use client';

import React, { useState } from 'react';
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
import { Image, Check, X } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface ImageVerificationProps {
  onComplete: (points: number, data: any) => void;
  isLoading?: boolean;
}

// Mock image verification challenges
const challenges = [
  {
    id: 'nature',
    title: 'Select all nature images',
    description: 'Choose all images that contain natural landscapes',
    images: [
      { id: 1, src: '/images/verification/nature1.jpg', isTarget: true },
      { id: 2, src: '/images/verification/building1.jpg', isTarget: false },
      { id: 3, src: '/images/verification/nature2.jpg', isTarget: true },
      { id: 4, src: '/images/verification/building2.jpg', isTarget: false },
      { id: 5, src: '/images/verification/nature3.jpg', isTarget: true },
      { id: 6, src: '/images/verification/building3.jpg', isTarget: false },
      { id: 7, src: '/images/verification/nature4.jpg', isTarget: true },
      { id: 8, src: '/images/verification/building4.jpg', isTarget: false },
      { id: 9, src: '/images/verification/mixed1.jpg', isTarget: true },
    ],
    points: 30,
  },
  {
    id: 'symbols',
    title: 'Select all symbols',
    description: 'Choose all images that contain abstract symbols',
    images: [
      { id: 1, src: '/images/verification/symbol1.jpg', isTarget: true },
      { id: 2, src: '/images/verification/letter1.jpg', isTarget: false },
      { id: 3, src: '/images/verification/symbol2.jpg', isTarget: true },
      { id: 4, src: '/images/verification/letter2.jpg', isTarget: false },
      { id: 5, src: '/images/verification/symbol3.jpg', isTarget: true },
      { id: 6, src: '/images/verification/letter3.jpg', isTarget: false },
      { id: 7, src: '/images/verification/symbol4.jpg', isTarget: true },
      { id: 8, src: '/images/verification/letter4.jpg', isTarget: false },
      { id: 9, src: '/images/verification/mixed2.jpg', isTarget: false },
    ],
    points: 30,
  },
  {
    id: 'patterns',
    title: 'Select all patterns',
    description: 'Choose all images that contain geometric patterns',
    images: [
      { id: 1, src: '/images/verification/pattern1.jpg', isTarget: true },
      { id: 2, src: '/images/verification/random1.jpg', isTarget: false },
      { id: 3, src: '/images/verification/pattern2.jpg', isTarget: true },
      { id: 4, src: '/images/verification/random2.jpg', isTarget: false },
      { id: 5, src: '/images/verification/pattern3.jpg', isTarget: true },
      { id: 6, src: '/images/verification/random3.jpg', isTarget: false },
      { id: 7, src: '/images/verification/pattern4.jpg', isTarget: true },
      { id: 8, src: '/images/verification/random4.jpg', isTarget: false },
      { id: 9, src: '/images/verification/mixed3.jpg', isTarget: false },
    ],
    points: 30,
  },
];

export function ImageVerification({ onComplete, isLoading = false }: ImageVerificationProps) {
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [selectedImages, setSelectedImages] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<'success' | 'failure' | null>(null);
  const [attempts, setAttempts] = useState(0);

  const currentChallenge = challenges[currentChallengeIndex];

  // Toggle image selection
  const toggleImageSelection = (imageId: number) => {
    if (isSubmitting || result !== null) return;

    setSelectedImages(prev => {
      if (prev.includes(imageId)) {
        return prev.filter(id => id !== imageId);
      } else {
        return [...prev, imageId];
      }
    });
  };

  // Submit the user's selections for verification
  const handleSubmit = () => {
    if (selectedImages.length === 0 || isSubmitting) return;

    setIsSubmitting(true);

    // Get correct target images
    const targetImageIds = currentChallenge.images.filter(img => img.isTarget).map(img => img.id);

    // Check if user selected all and only the target images
    const correctSelections = selectedImages.filter(id => targetImageIds.includes(id));
    const incorrectSelections = selectedImages.filter(id => !targetImageIds.includes(id));
    const missedTargets = targetImageIds.filter(id => !selectedImages.includes(id));

    // Calculate accuracy (perfect score = 1.0)
    const totalImages = currentChallenge.images.length;
    const accuracy =
      (totalImages - (incorrectSelections.length + missedTargets.length)) / totalImages;

    // Determine result
    const isSuccessful = accuracy >= 0.8; // 80% accuracy threshold

    setTimeout(() => {
      setResult(isSuccessful ? 'success' : 'failure');

      if (isSuccessful) {
        // Award points based on accuracy
        const earnedPoints = Math.round(currentChallenge.points * accuracy);

        setTimeout(() => {
          onComplete(earnedPoints, {
            challengeId: currentChallenge.id,
            accuracy,
            attempts: attempts + 1,
          });

          // Move to next challenge
          setCurrentChallengeIndex(prev => (prev + 1) % challenges.length);
          setSelectedImages([]);
          setResult(null);
          setIsSubmitting(false);
          setAttempts(0);
        }, 1500);
      } else {
        // Allow retry
        setAttempts(attempts + 1);

        setTimeout(() => {
          setSelectedImages([]);
          setResult(null);
          setIsSubmitting(false);
        }, 1500);
      }
    }, 1000);
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
          <CardTitle className="text-lg font-bold">{currentChallenge.title}</CardTitle>
          <Image className="h-5 w-5 text-primary" />
        </div>
        <CardDescription>{currentChallenge.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {currentChallenge.images.map(image => (
            <div
              key={image.id}
              className={`relative aspect-square rounded-md overflow-hidden cursor-pointer border-2 ${
                selectedImages.includes(image.id) ? 'border-primary' : 'border-transparent'
              }`}
              onClick={() => toggleImageSelection(image.id)}
            >
              {/* In a real implementation, these would be actual images */}
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <span className="text-xs text-muted-foreground">Image {image.id}</span>
              </div>

              {selectedImages.includes(image.id) && (
                <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-0.5">
                  <Check className="h-3 w-3" />
                </div>
              )}

              {result !== null && (
                <div
                  className={`absolute inset-0 bg-black/30 flex items-center justify-center ${
                    result === 'success' && image.isTarget && selectedImages.includes(image.id)
                      ? 'bg-green-500/30'
                      : result === 'failure' &&
                          ((image.isTarget && !selectedImages.includes(image.id)) ||
                            (!image.isTarget && selectedImages.includes(image.id)))
                        ? 'bg-red-500/30'
                        : 'bg-black/10'
                  }`}
                >
                  {result === 'success' && image.isTarget && selectedImages.includes(image.id) && (
                    <Check className="h-6 w-6 text-white" />
                  )}
                  {result === 'failure' &&
                    ((image.isTarget && !selectedImages.includes(image.id)) ||
                      (!image.isTarget && selectedImages.includes(image.id))) && (
                      <X className="h-6 w-6 text-white" />
                    )}
                </div>
              )}
            </div>
          ))}
        </div>

        {result === 'success' && (
          <p className="text-sm text-green-600 text-center">
            Correct! You earned verification points.
          </p>
        )}

        {result === 'failure' && (
          <p className="text-sm text-red-500 text-center">Incorrect selections. Try again.</p>
        )}
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={handleSubmit}
          disabled={selectedImages.length === 0 || isSubmitting || result !== null}
        >
          {isSubmitting ? 'Verifying...' : 'Submit Selection'}
        </Button>
      </CardFooter>
    </Card>
  );
}
