'use client';

import * as React from 'react';

import { useRef, useEffect } from 'react';

interface GestureHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onLongPress?: () => void;
  onDoubleTap?: () => void;
  onPinch?: (scale: number) => void;
  onRotate?: (angle: number) => void;
}

interface GestureOptions {
  swipeThreshold?: number;
  longPressDelay?: number;
  doubleTapDelay?: number;
}

export function useGestures(
  ref: React.RefObject<HTMLElement>,
  handlers: GestureHandlers,
  options: GestureOptions = {}
) {
  const { swipeThreshold = 50, longPressDelay = 500, doubleTapDelay = 300 } = options;

  // Touch tracking state
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const lastTapRef = useRef<number>(0);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Handle touch start
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        touchStartRef.current = {
          x: touch.clientX,
          y: touch.clientY,
          time: Date.now(),
        };

        // Set up long press timer
        if (handlers.onLongPress) {
          longPressTimerRef.current = setTimeout(() => {
            handlers.onLongPress?.();
          }, longPressDelay);
        }

        // Check for double tap
        if (handlers.onDoubleTap) {
          const now = Date.now();
          if (now - lastTapRef.current < doubleTapDelay) {
            handlers.onDoubleTap();
            lastTapRef.current = 0; // Reset to prevent triple tap
          } else {
            lastTapRef.current = now;
          }
        }
      }
    };

    // Handle touch end
    const handleTouchEnd = (e: TouchEvent) => {
      // Clear long press timer
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }

      if (!touchStartRef.current) return;

      const touchStart = touchStartRef.current;
      const touchEnd = e.changedTouches[0];

      // Calculate swipe distance and direction
      const deltaX = touchEnd.clientX - touchStart.x;
      const deltaY = touchEnd.clientY - touchStart.y;
      const time = Date.now() - touchStart.time;

      // Only trigger swipe if it's a quick motion (less than 300ms)
      if (time < 300) {
        if (Math.abs(deltaX) > swipeThreshold && Math.abs(deltaX) > Math.abs(deltaY)) {
          // Horizontal swipe
          if (deltaX > 0) {
            handlers.onSwipeRight?.();
          } else {
            handlers.onSwipeLeft?.();
          }
        } else if (Math.abs(deltaY) > swipeThreshold && Math.abs(deltaY) > Math.abs(deltaX)) {
          // Vertical swipe
          if (deltaY > 0) {
            handlers.onSwipeDown?.();
          } else {
            handlers.onSwipeUp?.();
          }
        }
      }

      touchStartRef.current = null;
    };

    // Handle touch move (to cancel long press if moving)
    const handleTouchMove = (e: TouchEvent) => {
      if (longPressTimerRef.current && touchStartRef.current) {
        const touch = e.touches[0];
        const deltaX = Math.abs(touch.clientX - touchStartRef.current.x);
        const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);

        // If moved more than 10px, cancel long press
        if (deltaX > 10 || deltaY > 10) {
          clearTimeout(longPressTimerRef.current);
          longPressTimerRef.current = null;
        }
      }
    };

    // Add event listeners
    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchend', handleTouchEnd);
    element.addEventListener('touchmove', handleTouchMove);

    // Clean up
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchmove', handleTouchMove);

      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, [ref, handlers, swipeThreshold, longPressDelay, doubleTapDelay]);

  return {
    isGestureSupported: true,
  };
}
