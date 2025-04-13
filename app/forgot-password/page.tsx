import React from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md bg-card rounded-lg shadow-md p-6 border border-border">
        <h1 className="text-3xl font-bold mb-6 text-center">Reset Password</h1>
        <p className="text-muted-foreground mb-6 text-center">Enter your email to receive a password reset link.</p>
        
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
          <button 
            type="submit" 
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Send Reset Link
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm text-muted-foreground">
          Remember your password? <Link href="/login" className="text-primary hover:underline">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
