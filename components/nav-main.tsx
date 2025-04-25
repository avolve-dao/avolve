import { ChevronDown, ChevronRight, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useTokenRBAC } from '@/lib/token/use-token-rbac';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { superRoutes } from '@/lib/navigation';

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
  isDashboard?: boolean;
  items?: NavItem[];
}

interface NavMainProps {
  items: NavItem[];
}

/**
 * NavMain Component
 *
 * Primary navigation grid for desktop views. Displays routes in a responsive grid layout
 * with icons and labels. Supports both collapsed and expanded states.
 *
 * @component
 * @example
 * ```tsx
 * import { NavMain } from '@/components/nav-main'
 *
 * function App() {
 *   return <NavMain items={superRoutes} />
 * }
 * ```
 */
export function NavMain({ items }: NavMainProps) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-4">
        <nav className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {superRoutes.map(route => (
            <Link
              key={route.path}
              href={route.path}
              className={cn(
                'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
                pathname === route.path && 'bg-accent text-accent-foreground'
              )}
            >
              <route.icon className="h-4 w-4" />
              {route.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
