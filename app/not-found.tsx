'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold">404</h1>
        <h2 className="text-xl">Page Not Found</h2>
        <p className="text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Button asChild>
          <Link href="/auth/login">Go to Login</Link>
        </Button>
      </div>
    </div>
  );
}
