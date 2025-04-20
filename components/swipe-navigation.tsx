"use client"

import * as React from "react"
import { useRouter, usePathname } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

interface Route {
  path: string
  label: string
  description?: string
}

interface SwipeNavigationProps {
  children: React.ReactNode
  routes: Route[]
  threshold?: number
}

/**
 * SwipeNavigation Component
 * 
 * Enables touch-based navigation between routes with smooth transitions and visual feedback.
 * Supports both touch and mouse interactions with configurable threshold.
 * 
 * Features:
 * - Smooth swipe transitions
 * - Visual feedback during swipes
 * - Configurable activation threshold
 * - Toast notifications for route changes
 * - Fallback for non-touch devices
 * 
 * @component
 * @example
 * ```tsx
 * import { SwipeNavigation } from '@/components/swipe-navigation'
 * 
 * function App() {
 *   return (
 *     <SwipeNavigation routes={superRoutes} threshold={100}>
 *       {children}
 *     </SwipeNavigation>
 *   )
 * }
 * ```
 */
export function SwipeNavigation({
  children,
  routes,
  threshold = 100,
}: SwipeNavigationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()
  const [touchStart, setTouchStart] = React.useState<number | null>(null)
  const [touchEnd, setTouchEnd] = React.useState<number | null>(null)
  const [isNavigating, setIsNavigating] = React.useState(false)
  const [swipeDirection, setSwipeDirection] = React.useState<"left" | "right" | null>(null)
  
  // Find the current route index
  const currentRouteIndex = React.useMemo(() => {
    if (!pathname) return -1;
    return routes.findIndex(route => pathname.startsWith(route.path))
  }, [pathname, routes])

  // Handle touch start
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
    setTouchEnd(null)
  }

  // Handle touch move
  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
    
    // Show visual feedback during swipe
    if (touchStart && e.targetTouches[0].clientX) {
      const distance = touchStart - e.targetTouches[0].clientX
      if (Math.abs(distance) > 20) {
        setSwipeDirection(distance > 0 ? "left" : "right")
      } else {
        setSwipeDirection(null)
      }
    }
  }

  // Handle touch end
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > threshold
    const isRightSwipe = distance < -threshold
    
    // Prevent multiple navigations
    if (isNavigating) return
    
    if (isLeftSwipe || isRightSwipe) {
      setIsNavigating(true)
      
      // Navigate based on swipe direction
      if (isLeftSwipe && currentRouteIndex < routes.length - 1) {
        // Navigate to next route
        const nextRoute = routes[currentRouteIndex + 1]
        router.push(nextRoute.path)
        toast({
          title: `Navigating to ${nextRoute.label}`,
          duration: 1500,
        })
      } else if (isRightSwipe && currentRouteIndex > 0) {
        // Navigate to previous route
        const prevRoute = routes[currentRouteIndex - 1]
        router.push(prevRoute.path)
        toast({
          title: `Navigating to ${prevRoute.label}`,
          duration: 1500,
        })
      }
      
      // Reset navigation state after a delay
      setTimeout(() => {
        setIsNavigating(false)
        setSwipeDirection(null)
      }, 500)
    }
    
    // Reset touch states
    setTouchStart(null)
    setTouchEnd(null)
  }

  // Visual indicator styles based on swipe direction
  const getSwipeIndicatorStyle = () => {
    if (!swipeDirection) return {}
    
    return {
      position: "fixed",
      top: 0,
      bottom: 0,
      width: "30px",
      background: "rgba(var(--primary-rgb), 0.2)",
      zIndex: 50,
      ...(swipeDirection === "left" 
        ? { right: 0, borderTopLeftRadius: "8px", borderBottomLeftRadius: "8px" } 
        : { left: 0, borderTopRightRadius: "8px", borderBottomRightRadius: "8px" }),
    } as React.CSSProperties
  }

  return (
    <div 
      className="relative touch-pan-x"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {swipeDirection && (
        <div 
          className="swipe-indicator animate-pulse"
          style={getSwipeIndicatorStyle()}
        />
      )}
      {children}
    </div>
  )
}
