'use client';
import { usePathname, notFound } from 'next/navigation';
import FeedbackWidget from '@/components/public/FeedbackWidget';
import React from 'react';

// MVP routes only
const MVP_ROUTES = [
  '/app/(supercivilization)/supercivilization',
  '/app/(superachiever)/superachiever',
  '/app/(superachievers)/superachievers',
  '/app/(authenticated)/profile',
  '/app/(authenticated)/settings',
];

// TODO: Replace with real admin check
const isAdmin = false;

function isMvpRoute(path: string) {
  return MVP_ROUTES.includes(path) || isAdmin;
}

export default function ClientRootGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (!pathname || !isMvpRoute(pathname)) return notFound();

  // TODO: Replace with real user ID from auth context for production
  const userId = typeof window !== 'undefined' ? localStorage.getItem('user_id') || 'anon' : 'anon';

  return (
    <>
      {children}
      <div className="fixed bottom-4 right-4 z-50">
        <FeedbackWidget context="global" userId={userId} />
      </div>
    </>
  );
}
