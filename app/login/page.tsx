import React from 'react';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md bg-card rounded-lg shadow-md p-6 border border-border">
        <h1 className="text-3xl font-bold mb-6 text-center">Welcome to Avolve</h1>
        <p className="text-muted-foreground mb-6 text-center">Sign in to access your transformative journey.</p>
        
        <form className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">Email</label>
            <input 
              id="email" 
              type="email" 
              className="w-full px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-input text-foreground" 
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">Password</label>
            <input 
              id="password" 
              type="password" 
              className="w-full px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-input text-foreground" 
              placeholder="Enter your password"
            />
            <div className="mt-1 text-right">
              <Link href="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
            </div>
          </div>
          <button 
            type="submit" 
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Sign In
          </button>
          <button 
            type="button" 
            className="w-full flex justify-center py-2 px-4 border border-border rounded-md shadow-sm text-sm font-medium text-foreground bg-transparent hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Sign In with Magic Link
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm text-muted-foreground">
          Don't have an account? <Link href="/signup" className="text-primary hover:underline">Sign up</Link>
        </div>
      </div>
    </div>
  );
}
