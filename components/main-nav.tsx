import React from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { usePathname } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  PlusCircle,
  Search 
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }> | null;
  title?: string;
  badge?: string | number | null;
}

export const MainNav: React.FC = async () => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isAuthenticated = !!user;

  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showSearch, setShowSearch] = React.useState(false);
  
  // Function to get critical nav items - placeholder for additional items
  const getCriticalNavItems = (): NavItem[] => {
    return [];
  };

  const navItems: NavItem[] = [
    { label: 'Home', href: '/' },
    ...(isAuthenticated 
      ? [
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Superachiever Hub', href: '/super' },
          { label: 'Token-Gated Content', href: '/super/token-gated' },
          { label: 'Developer Portal', href: '/developer-portal' },
          ...getCriticalNavItems()
        ] 
      : []
    ),
  ];

  const authItems: NavItem[] = isAuthenticated 
    ? [
        { label: 'Profile', href: '/profile' },
        { label: 'Logout', href: '/logout' },
      ]
    : [
        { label: 'Login', href: '/login' },
        { label: 'Sign Up', href: '/signup' },
      ];

  // Extract the current context from the pathname
  const getContextFromPathname = () => {
    if (!pathname) return '';
    const parts = pathname.split('/');
    if (parts.length > 1 && parts[1]) {
      return parts[1];
    }
    return '';
  };

  const currentContext = getContextFromPathname();

  // Context-specific quick actions
  const getContextActions = () => {
    switch (currentContext) {
      case 'dashboard':
        return [
          { label: 'Start Quest', href: '/super/quests/new', icon: PlusCircle },
        ];
      case 'super':
        return [
          { label: 'New Individual Goal', href: '/super/individual/new', icon: PlusCircle },
          { label: 'Join Collective', href: '/super/collective/join', icon: PlusCircle },
        ];
      default:
        return [];
    }
  };

  const contextActions = getContextActions();
  const hasContextActions = contextActions.length > 0;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality here
    console.log('Search query:', searchQuery);
  };

  // Toggle search visibility on mobile
  const toggleSearch = () => {
    setShowSearch(!showSearch);
  };

  React.useEffect(() => {
    // Hide search on mobile by default
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setShowSearch(false);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [showSearch]);

  return (
    <nav className="bg-background border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-primary">
              Avolve
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex space-x-4">
              {navItems.map((item, index) => (
                <Link 
                  key={index} 
                  href={item.href} 
                  className="text-foreground hover:text-primary transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>
            
            <div className="flex space-x-4 border-l border-gray-200 pl-4">
              {authItems.map((item, index) => (
                <Link 
                  key={index} 
                  href={item.href} 
                  className={item.label === 'Logout' ? "text-red-500 hover:text-red-700 transition-colors" : "text-foreground hover:text-primary transition-colors"}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            
            {/* Search bar directly in the navbar */}
            <div className="relative flex-1 max-w-md">
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="global-search"
                  type="search"
                  placeholder="Search..."
                  className="w-full pl-9 h-9 bg-background"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
              <kbd className="pointer-events-none absolute right-2 top-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium opacity-100 sm:flex">
                <span className="text-xs">⌘</span>K
              </kbd>
            </div>
          </div>
          
          <div className="md:hidden flex items-center">
            {/* Mobile menu button would go here */}
            <button className="text-foreground focus:outline-none">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu would go here with similar conditional rendering */}
      <div className="hidden md:flex items-center space-x-8">
        {/* Context-specific actions dropdown */}
        {hasContextActions && (
          <div className="hidden md:flex items-center space-x-8">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-md">
                  <PlusCircle className="h-5 w-5" />
                  <span className="sr-only">Quick Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {contextActions.map((action) => (
                  <DropdownMenuItem key={action.href} asChild>
                    <Link href={action.href} className="flex w-full cursor-pointer items-center">
                      <action.icon className="mr-2 h-4 w-4" />
                      <span>{action.label}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </nav>
  );
};
