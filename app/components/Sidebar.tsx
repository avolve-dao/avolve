'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode, useState } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';

const routes = [
  { label: 'Dashboard', path: '/dashboard', color: 'bg-blue-500' },
  { label: 'Profile', path: '/profile', color: 'bg-violet-500' },
  { label: 'Teams', path: '/teams', color: 'bg-emerald-500' },
  { label: 'Tokens', path: '/tokens', color: 'bg-yellow-500' },
  { label: 'Subscription', path: '/subscription', color: 'bg-orange-500' },
  { label: 'Participation', path: '/participation', color: 'bg-pink-400' },
  { label: 'Admin Users', path: '/admin/users', color: 'bg-rose-500' },
  { label: 'Admin Analytics', path: '/admin/analytics', color: 'bg-red-500' },
  { label: 'Admin Content', path: '/admin/content', color: 'bg-green-500' },
  { label: 'Admin Security', path: '/admin/security', color: 'bg-zinc-500' },
  { label: 'Developer Portal', path: '/developer-portal', color: 'bg-cyan-500' },
  { label: 'Welcome', path: '/welcome', color: 'bg-indigo-400' },
  { label: 'Onboarding', path: '/onboarding', color: 'bg-indigo-300' },
];

export default function Sidebar({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="flex h-screen">
      {/* Mobile menu toggle button */}
      <button
        className="md:hidden fixed top-4 left-4 z-30 p-2 rounded-md bg-zinc-800 text-white"
        onClick={toggleMobileMenu}
        aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
      >
        {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Sidebar - hidden on mobile, shown when toggled or on larger screens */}
      <aside 
        className={`${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 fixed md:static top-0 left-0 z-20 w-64 h-full bg-zinc-950 border-r border-zinc-800 flex flex-col py-8 px-4 transition-transform duration-300 ease-in-out`}
      >
        <div className="mb-8">
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Avolve</h2>
          <div className="text-xs text-zinc-400 mt-1">Invitation Only</div>
        </div>
        <nav className="flex flex-col gap-2">
          {routes.map(route => (
            <Link
              key={route.path}
              href={route.path}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors duration-150 ${
                pathname === route.path 
                  ? route.color + ' text-white' 
                  : 'text-zinc-300 hover:bg-zinc-800'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className={`w-2 h-2 rounded-full ${route.color} mr-2`}></span>
              {route.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto pt-8 text-xs text-zinc-600">
          <span> {new Date().getFullYear()} Avolve</span>
        </div>
      </aside>

      {/* Overlay for mobile - only shown when mobile menu is open */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-10"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-zinc-950 pt-14 md:pt-0">
        {children}
      </main>
    </div>
  );
}
