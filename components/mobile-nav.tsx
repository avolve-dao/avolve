'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Compass } from 'lucide-react';
import Image from 'next/image';
import * as React from 'react';

interface Route {
  path: string;
  label: string;
  description?: string;
}

interface MobileNavProps {
  routes: Route[];
}

/**
 * MobileNav Component
 *
 * Bottom navigation component for mobile devices. Provides easy access to key routes
 * with touch-friendly targets and smooth transitions.
 *
 * Features:
 * - Fixed bottom positioning
 * - Large touch targets
 * - Visual feedback on interaction
 * - Smooth transitions between routes
 *
 * @component
 * @example
 * ```tsx
 * import { MobileNav } from '@/components/mobile-nav'
 *
 * function App() {
 *   return <MobileNav routes={superRoutes} />
 * }
 * ```
 */
export function MobileNav({ routes }: MobileNavProps) {
  const pathname = usePathname();
  const [showAreaSelector, setShowAreaSelector] = React.useState(false);

  // Extract the current context from the pathname
  const getContextFromPathname = () => {
    if (!pathname) return 'Dashboard';
    const currentRoute = routes.find(route => pathname.startsWith(route.path));
    return currentRoute?.label || 'Dashboard';
  };

  const currentContext = getContextFromPathname();

  return (
    <>
      {/* Area selector overlay */}
      {showAreaSelector && (
        <div
          className="md:hidden fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm"
          onClick={() => setShowAreaSelector(false)}
        >
          <div className="absolute bottom-16 left-0 right-0 p-4" onClick={e => e.stopPropagation()}>
            <div className="bg-card rounded-lg border shadow-lg">
              <div className="p-3 border-b">
                <h3 className="font-semibold">Switch Area</h3>
                <p className="text-xs text-muted-foreground">Current: {currentContext}</p>
              </div>
              <div className="p-2 grid grid-cols-2 gap-2">
                {routes.map(route => (
                  <Link
                    key={route.path}
                    href={route.path}
                    className={cn(
                      'p-3 rounded-md flex flex-col items-center text-center',
                      pathname && pathname.startsWith(route.path)
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-accent'
                    )}
                    onClick={() => setShowAreaSelector(false)}
                  >
                    <div className="h-8 w-8 mb-1 flex items-center justify-center">
                      <Image
                        src={`/icons/icon-${route.label.toLowerCase().replace(/\s+/g, '-')}.svg`}
                        alt={route.label}
                        width={24}
                        height={24}
                      />
                    </div>
                    <span className="text-xs">{route.label}</span>
                    {route.description && (
                      <span className="text-[10px] text-muted-foreground mt-1">
                        {route.description}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom navigation bar */}
      <div className="md:hidden fixed bottom-0 left-0 z-50 w-full h-16 border-t bg-background">
        <div className="grid h-full grid-cols-3">
          {/* Home */}
          <Link
            href="/dashboard"
            className={cn(
              'flex flex-col items-center justify-center text-xs font-medium transition-colors',
              pathname === '/dashboard'
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <div className="relative">
              <Image
                src="/icons/icon-home.svg"
                alt="Home"
                width={20}
                height={20}
                className="mb-1"
              />
            </div>
            <span>Home</span>
          </Link>

          {/* Area Selector */}
          <button
            className="flex flex-col items-center justify-center text-xs font-medium transition-colors text-muted-foreground hover:text-foreground"
            onClick={() => setShowAreaSelector(true)}
          >
            <div className="relative">
              <Compass className="h-5 w-5 mb-1" />
            </div>
            <span>{currentContext}</span>
          </button>

          {/* Profile */}
          <Link
            href="/profile"
            className={cn(
              'flex flex-col items-center justify-center text-xs font-medium transition-colors',
              pathname === '/profile'
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <div className="relative">
              <Image
                src="/icons/icon-profile.svg"
                alt="Profile"
                width={20}
                height={20}
                className="mb-1"
              />
            </div>
            <span>Profile</span>
          </Link>
        </div>
      </div>
    </>
  );
}
