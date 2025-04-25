'use client';
import { createClient } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ArrowRight, Lock } from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function SignUp() {
  if (!supabaseUrl || !supabaseKey) {
    return <div className="text-red-600">Supabase environment variables are missing.</div>;
  }
  
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [invitationCode, setInvitationCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (status === 'success') {
      // Start fade out animation
      setFadeOut(true);
      
      // Navigate after animation completes
      const timer = setTimeout(() => {
        router.push('/onboarding');
      }, 600); // Match this with the CSS transition duration
      
      return () => clearTimeout(timer);
    }
  }, [status, router]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setError(null);
    
    try {
      // First validate the invitation code
      const { data: invitationData, error: invitationError } = await supabase
        .from('invitations')
        .select('*')
        .eq('code', invitationCode)
        .single();
        
      if (invitationError || !invitationData) {
        setStatus('error');
        setError('Invalid invitation code. Please check and try again.');
        return;
      }
      
      // Check if invitation is valid
      const now = new Date();
      const expiresAt = new Date(invitationData.expires_at);
      const isExpired = expiresAt < now;
      const isFullyUsed = invitationData.current_uses >= invitationData.max_uses;
      
      if (isExpired) {
        setStatus('error');
        setError('This invitation code has expired.');
        return;
      }
      
      if (isFullyUsed) {
        setStatus('error');
        setError('This invitation code has reached its maximum number of uses.');
        return;
      }
      
      // If invitation is valid, proceed with sign up
      const { error: signUpError } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            name,
            invitation_code: invitationCode
          }
        }
      });
      
      if (signUpError) {
        setStatus('error');
        setError(signUpError.message);
      } else {
        // Update invitation usage count
        await supabase
          .from('invitations')
          .update({ current_uses: invitationData.current_uses + 1 })
          .eq('code', invitationCode);
          
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
          <h1 className="text-2xl font-bold">Join Avolve</h1>
          <p className="text-sm text-gray-500 mt-1">Invitation-only community for extraordinary individuals</p>
        </div>
        
        <form onSubmit={handleSignUp} className="space-y-4 bg-white p-6 rounded-lg shadow-lg border border-gray-100">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              required
              placeholder="Your name"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={status === 'loading' || status === 'success'}
            />
          </div>
          
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
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
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
            <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters</p>
          </div>
          
          <div>
            <label htmlFor="invitation-code" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <Lock className="h-3 w-3 mr-1" />
              Invitation Code
            </label>
            <input
              id="invitation-code"
              type="text"
              required
              placeholder="Enter your invitation code"
              value={invitationCode}
              onChange={e => setInvitationCode(e.target.value)}
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
                Creating Account...
              </>
            ) : status === 'success' ? (
              <>
                Success!
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            ) : (
              'Create Account'
            )}
          </button>
          
          {status === 'error' && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}
          
          {status === 'success' && (
            <div className="text-green-600 text-sm text-center animate-pulse">
              Account created! Redirecting to onboarding...
            </div>
          )}
        </form>
        
        <div className="text-center mt-4 text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/signin" className="text-indigo-600 hover:text-indigo-800">
            Sign in
          </Link>
        </div>
        
        <div className="text-center mt-8 text-xs text-gray-500">
          <p>By signing up, you agree to our Terms of Service and Privacy Policy.</p>
          <p className="mt-1">Avolve is an invitation-only platform for building a supercivilization.</p>
        </div>
      </div>
    </div>
  );
}
