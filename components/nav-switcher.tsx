import {
  Building2,
  ChevronDown,
  LayoutDashboard,
  Lightbulb,
  Target,
  Users,
  Wind,
  type LucideIcon,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { superRoutes } from "@/lib/navigation";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

interface NavSwitcherProps {
  activeTeam?: string;
  onTeamChange?: (team: string) => void;
}

type SuperRoute = {
  path: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
};

/**
 * NavSwitcher Component
 * 
 * A navigation component that provides a dropdown menu for switching between routes.
 * Displays the current route with its icon and supports keyboard navigation.
 * 
 * @component
 * @example
 * ```tsx
 * import { NavSwitcher } from '@/components/nav-switcher'
 * 
 * function App() {
 *   return <NavSwitcher routes={superRoutes} />
 * }
 * ```
 */
export function NavSwitcher({ activeTeam, onTeamChange }: NavSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Get the active route based on the pathname or activeTeam prop
  const getActiveRoute = () => {
    const path = activeTeam || (pathname ? getPathFromPathname(pathname) : undefined);
    return superRoutes.find((route) => route.path === path) || superRoutes[0];
  };

  // Extract path from pathname
  const getPathFromPathname = (pathname: string) => {
    const segments = pathname.split('/');
    if (segments.length >= 3 && segments[1] === 'super') {
      return `/super/${segments[2]}`;
    }
    return '/super/personal';
  };

  // Handle route change
  const handleRouteChange = (route: SuperRoute) => {
    // Prevent multiple rapid navigations
    if (isNavigating) return;
    
    setIsNavigating(true);
    setIsOpen(false);
    
    if (onTeamChange) {
      onTeamChange(route.path);
    }
    
    router.push(route.path);
    
    // Reset navigation state after a delay
    setTimeout(() => {
      setIsNavigating(false);
    }, 500);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const activeRoute = getActiveRoute();

  return (
    <div ref={menuRef} className="relative">
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger
              onClick={() => setIsOpen(!isOpen)}
              className={cn(
                "flex h-9 w-full items-center gap-2 rounded-md px-3 text-sm font-medium",
                "bg-background hover:bg-accent hover:text-accent-foreground",
                "data-[state=open]:bg-accent/50"
              )}
            >
              <div className="flex items-center gap-2">
                {activeRoute && (
                  <activeRoute.icon className="h-4 w-4" />
                )}
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">{activeRoute?.label}</span>
                  <span className="text-xs text-muted-foreground">{activeRoute?.description}</span>
                </div>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="grid w-[280px] gap-1 p-2">
                {superRoutes.map((route) => (
                  <button
                    key={route.path}
                    onClick={() => handleRouteChange(route)}
                    disabled={isNavigating}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-3 py-2 text-sm",
                      "transition-colors duration-200 ease-in-out",
                      "hover:bg-accent hover:text-accent-foreground",
                      route.path === activeRoute?.path
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground"
                    )}
                  >
                    <route.icon className="h-4 w-4" />
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium">{route.label}</span>
                      <span className="text-xs text-muted-foreground">{route.description}</span>
                    </div>
                  </button>
                ))}
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}
