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

export function NavSwitcher({ activeTeam, onTeamChange }: NavSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Define all routes with their icons and subtitles
  const allRoutes = [
    {
      id: "superachiever",
      title: "Superachiever",
      subtitle: "Create Your Success Puzzle",
      href: "/superachiever",
      icon: Target,
      gradientClass: "from-stone-500 to-stone-700",
    },
    {
      id: "superachievers",
      title: "Superachievers",
      subtitle: "Co-Create Our Super Puzzle",
      href: "/superachievers",
      icon: Users,
      gradientClass: "from-slate-500 to-slate-700",
    },
    {
      id: "supercivilization",
      title: "Supercivilization",
      subtitle: "Avolve from Degen to Regen",
      href: "/supercivilization",
      icon: Wind,
      gradientClass: "from-zinc-500 to-zinc-700",
    },
    {
      id: "personal",
      title: "Personal Success Puzzle",
      subtitle: "Greater Personal Successes",
      href: "/personal",
      icon: LayoutDashboard,
      gradientClass: "from-amber-500 to-yellow-500",
    },
    {
      id: "business",
      title: "Business Success Puzzle",
      subtitle: "Greater Business Successes",
      href: "/business",
      icon: Building2,
      gradientClass: "from-teal-500 to-cyan-500",
    },
    {
      id: "superpuzzle",
      title: "Superpuzzle Developments",
      subtitle: "Conceive, Believe, & Achieve",
      href: "/superpuzzle",
      icon: Lightbulb,
      gradientClass: "from-red-500 via-green-500 to-blue-500",
    },
  ];

  // Get the active route based on the pathname or activeTeam prop
  const getActiveRoute = () => {
    const teamId = activeTeam || getTeamIdFromPath(pathname);
    return allRoutes.find((route) => route.id === teamId) || allRoutes[0];
  };

  // Extract team ID from pathname
  const getTeamIdFromPath = (path: string) => {
    const segment = path.split('/')[1];
    const validSegments = allRoutes.map(route => route.id);
    
    return validSegments.includes(segment) ? segment : 'superachiever';
  };

  // Handle team change
  const handleTeamChange = (team: (typeof allRoutes)[0]) => {
    // Prevent multiple rapid navigations
    if (isNavigating) return;
    
    setIsNavigating(true);
    setIsOpen(false);
    
    if (onTeamChange) {
      onTeamChange(team.id);
    }
    
    router.push(team.href);
    
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
                {activeRoute.icon && (
                  <activeRoute.icon className="h-4 w-4" />
                )}
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">{activeRoute.title}</span>
                  <span className="text-xs text-muted-foreground">{activeRoute.subtitle}</span>
                </div>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="grid w-[280px] gap-1 p-2">
                {allRoutes.map((route) => (
                  <button
                    key={route.id}
                    onClick={() => handleTeamChange(route)}
                    disabled={isNavigating}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-3 py-2 text-sm",
                      "transition-colors duration-200 ease-in-out",
                      "hover:bg-accent hover:text-accent-foreground",
                      route.id === activeRoute.id
                        ? "bg-gradient-to-r text-primary-foreground " + route.gradientClass
                        : "text-foreground"
                    )}
                  >
                    {route.icon && <route.icon className="h-4 w-4" />}
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium">{route.title}</span>
                      <span className="text-xs text-muted-foreground">{route.subtitle}</span>
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
