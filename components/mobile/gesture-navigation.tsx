'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, PanInfo, useAnimation } from 'framer-motion';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { ChevronLeft, ChevronRight, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

interface GestureNavigationProps {
  userId: string;
  currentPath: string;
  children: React.ReactNode;
}

interface NavigationHistory {
  back: string[];
  forward: string[];
  current: string;
}

export function GestureNavigation({ userId, currentPath, children }: GestureNavigationProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const [swipeDistance, setSwipeDistance] = useState(0);
  const [navigationHistory, setNavigationHistory] = useState<NavigationHistory>({
    back: [],
    forward: [],
    current: currentPath
  });
  const [backDestination, setBackDestination] = useState<string | null>(null);
  const [forwardDestination, setForwardDestination] = useState<string | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [isVerticalSwipe, setIsVerticalSwipe] = useState(false);
  const supabase = createClientComponentClient();

  // Update navigation history when path changes
  useEffect(() => {
    if (currentPath !== navigationHistory.current) {
      setNavigationHistory(prev => ({
        back: [...prev.back, prev.current],
        forward: [],
        current: currentPath
      }));
    }
  }, [currentPath, navigationHistory.current]);

  // Fetch user's navigation history
  useEffect(() => {
    async function fetchNavigationData() {
      // Fetch recent navigation paths for back/forward prediction
      const { data: navigationData } = await supabase
        .from('user_navigation')
        .select('from_path, to_path, count')
        .eq('user_id', userId)
        .order('count', { ascending: false });
      
      if (navigationData && navigationData.length > 0) {
        // Find potential back destination
        const backPaths = navigationData
          .filter(item => item.to_path === currentPath)
          .sort((a, b) => b.count - a.count);
        
        if (backPaths.length > 0) {
          setBackDestination(backPaths[0].from_path);
        }
        
        // Find potential forward destination
        const forwardPaths = navigationData
          .filter(item => item.from_path === currentPath)
          .sort((a, b) => b.count - a.count);
        
        if (forwardPaths.length > 0) {
          setForwardDestination(forwardPaths[0].to_path);
        }
      }
    }

    fetchNavigationData();
  }, [userId, currentPath, supabase]);

  // Record navigation for future predictions
  const recordNavigation = async (fromPath: string, toPath: string) => {
    if (fromPath === toPath) return;
    
    try {
      const { data } = await supabase
        .from('user_navigation')
        .select('id, count')
        .eq('user_id', userId)
        .eq('from_path', fromPath)
        .eq('to_path', toPath)
        .single();
      
      if (data) {
        // Update existing record
        await supabase
          .from('user_navigation')
          .update({ 
            count: data.count + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', data.id);
      } else {
        // Create new record
        await supabase
          .from('user_navigation')
          .insert({
            user_id: userId,
            from_path: fromPath,
            to_path: toPath,
            count: 1
          });
      }
    } catch (error) {
      console.error('Error recording navigation:', error);
    }
  };

  // Handle navigation back
  const handleBack = () => {
    if (navigationHistory.back.length > 0) {
      const prevPath = navigationHistory.back[navigationHistory.back.length - 1];
      setNavigationHistory(prev => ({
        back: prev.back.slice(0, -1),
        forward: [prev.current, ...prev.forward],
        current: prevPath
      }));
      
      recordNavigation(navigationHistory.current, prevPath);
      router.push(prevPath);
    } else if (backDestination) {
      recordNavigation(navigationHistory.current, backDestination);
      router.push(backDestination);
    }
  };

  // Handle navigation forward
  const handleForward = () => {
    if (navigationHistory.forward.length > 0) {
      const nextPath = navigationHistory.forward[0];
      setNavigationHistory(prev => ({
        back: [...prev.back, prev.current],
        forward: prev.forward.slice(1),
        current: nextPath
      }));
      
      recordNavigation(navigationHistory.current, nextPath);
      router.push(nextPath);
    } else if (forwardDestination) {
      recordNavigation(navigationHistory.current, forwardDestination);
      router.push(forwardDestination);
    }
  };

  // Handle pan gesture start
  const handlePanStart = (event: TouchEvent | MouseEvent | PointerEvent) => {
    if ('touches' in event) {
      setTouchStartX(event.touches[0].clientX);
      setTouchStartY(event.touches[0].clientY);
    }
    setIsVerticalSwipe(false);
  };

  // Handle pan gesture
  const handlePan = (event: TouchEvent | MouseEvent | PointerEvent, info: PanInfo) => {
    // Detect if this is primarily a vertical swipe
    if (touchStartX !== null && touchStartY !== null && !isVerticalSwipe) {
      if ('touches' in event && event.touches.length > 0) {
        const touchX = event.touches[0].clientX;
        const touchY = event.touches[0].clientY;
        
        const deltaX = Math.abs(touchX - touchStartX);
        const deltaY = Math.abs(touchY - touchStartY);
        
        // If vertical movement is significantly more than horizontal, mark as vertical swipe
        if (deltaY > deltaX * 1.5 && deltaY > 50) {
          setIsVerticalSwipe(true);
          return;
        }
      }
    }
    
    // Only handle horizontal swipes
    if (!isVerticalSwipe) {
      const distance = info.offset.x;
      setSwipeDistance(distance);
      
      // Animate the container to follow the swipe
      controls.start({
        x: distance,
        transition: { type: 'spring', stiffness: 300, damping: 30 }
      });
    }
  };

  // Handle pan gesture end
  const handlePanEnd = (event: TouchEvent | MouseEvent | PointerEvent, info: PanInfo) => {
    if (isVerticalSwipe) {
      // Reset if this was a vertical swipe
      controls.start({ x: 0 });
      setSwipeDistance(0);
      return;
    }
    
    const threshold = 100; // Minimum distance to trigger navigation
    const velocity = 0.5; // Minimum velocity to trigger navigation
    
    if (info.offset.x > threshold && info.velocity.x > velocity) {
      // Swipe right (go back)
      controls.start({
        x: window.innerWidth,
        transition: { duration: 0.2 }
      }).then(() => {
        handleBack();
        controls.start({ x: 0 });
      });
    } else if (info.offset.x < -threshold && info.velocity.x < -velocity) {
      // Swipe left (go forward)
      controls.start({
        x: -window.innerWidth,
        transition: { duration: 0.2 }
      }).then(() => {
        handleForward();
        controls.start({ x: 0 });
      });
    } else {
      // Not enough to trigger navigation, reset position
      controls.start({ x: 0 });
    }
    
    setSwipeDistance(0);
    setTouchStartX(null);
    setTouchStartY(null);
  };

  // Calculate opacity for edge indicators based on swipe distance
  const leftOpacity = Math.min(Math.max(swipeDistance / 50, 0), 1);
  const rightOpacity = Math.min(Math.max(-swipeDistance / 50, 0), 1);

  return (
    <div className="relative overflow-hidden" ref={containerRef}>
      {/* Left edge indicator (back) */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center pointer-events-none z-10"
        style={{ opacity: leftOpacity }}
      >
        <div className="bg-primary/20 rounded-full p-2">
          <ChevronLeft className="h-6 w-6 text-primary" />
        </div>
      </div>
      
      {/* Right edge indicator (forward) */}
      <div 
        className="absolute right-0 top-0 bottom-0 w-12 flex items-center justify-center pointer-events-none z-10"
        style={{ opacity: rightOpacity }}
      >
        <div className="bg-primary/20 rounded-full p-2">
          <ChevronRight className="h-6 w-6 text-primary" />
        </div>
      </div>
      
      {/* Content with gesture detection */}
      <motion.div
        animate={controls}
        initial={{ x: 0 }}
        onPanStart={handlePanStart}
        onPan={handlePan}
        onPanEnd={handlePanEnd}
        className="w-full touch-pan-y"
      >
        {children}
      </motion.div>
      
      {/* Navigation buttons (shown on smaller screens) */}
      <div className="fixed bottom-20 left-0 right-0 flex justify-center space-x-4 z-20 md:hidden">
        <Button
          variant="secondary"
          size="icon"
          className="rounded-full bg-background/80 backdrop-blur-sm"
          onClick={handleBack}
          disabled={navigationHistory.back.length === 0 && !backDestination}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <Button
          variant="secondary"
          size="icon"
          className="rounded-full bg-background/80 backdrop-blur-sm"
          onClick={handleForward}
          disabled={navigationHistory.forward.length === 0 && !forwardDestination}
        >
          <ArrowRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
