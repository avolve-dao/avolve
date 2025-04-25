'use client';
import { createClient } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ArrowRight } from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function SignIn() {
  if (!supabaseUrl || !supabaseKey) {
    return <div className="text-red-600">Supabase environment variables are missing.</div>;
  }
  
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (status === 'success') {
      // Start fade out animation
      setFadeOut(true);
      
      // Navigate after animation completes
      const timer = setTimeout(() => {
        router.push('/dashboard');
      }, 600); // Match this with the CSS transition duration
      
      return () => clearTimeout(timer);
    }
  }, [status, router]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setError(null);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setStatus('error');
        setError(error.message);
      } else {
        setStatus('success');
      }
    } catch (err) {
      setStatus('error');
      setError('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className={`flex min-h-screen flex-col items-center justify-center py-2 transition-opacity duration-600 ease-in-out ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 mb-4">
            <span className="text-xl font-bold text-white">A</span>
          </div>
          <h1 className="text-2xl font-bold">Welcome to Avolve</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to continue your journey</p>
        </div>
        
        <form onSubmit={handleSignIn} className="space-y-4 bg-white p-6 rounded-lg shadow-lg border border-gray-100">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-md font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={status === 'loading' || status === 'success'}
            />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <Link href="/reset-password" className="text-xs text-indigo-600 hover:text-indigo-800">
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-md font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={status === 'loading' || status === 'success'}
            />
          </div>
          
          <button
            type="submit"
            className="w-full py-2 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-md font-sans flex items-center justify-center disabled:opacity-70 hover:from-indigo-600 hover:to-purple-700 transition-all duration-200"
            disabled={status === 'loading' || status === 'success'}
          >
            {status === 'loading' ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : status === 'success' ? (
              <>
                Success!
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            ) : (
              'Sign In'
            )}
          </button>
          
          {status === 'error' && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}
          
          {status === 'success' && (
            <div className="text-green-600 text-sm text-center animate-pulse">
              Signed in successfully! Redirecting to dashboard...
            </div>
          )}
        </form>
        
        <div className="text-center mt-4 text-sm text-gray-600">
          Don't have an account?{' '}
          <Link href="/signup" className="text-indigo-600 hover:text-indigo-800">
            Sign up
          </Link>
        </div>
        
        <div className="text-center mt-8 text-xs text-gray-500">
          <p>By signing in, you agree to our Terms of Service and Privacy Policy.</p>
          <p className="mt-1">This is an invitation-only platform for extraordinary individuals.</p>
        </div>
      </div>
    </div>
  );
}
