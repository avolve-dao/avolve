"use client"
import { createClient } from '@supabase/supabase-js'
import { useState } from 'react'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export default function SignUp() {
  if (!supabaseUrl || !supabaseKey) {
    return <div className="text-red-600">Supabase environment variables are missing.</div>
  }
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setError(null)
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setStatus('error')
      setError(error.message)
    } else {
      setStatus('success')
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <div className="w-full max-w-md">
        <form onSubmit={handleSignUp} className="space-y-4 bg-white/10 p-6 rounded shadow">
          <h2 className="text-xl font-bold mb-2">Sign Up</h2>
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
          <input
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded disabled:opacity-50"
            disabled={status === 'loading'}
          >
            {status === 'loading' ? 'Signing up...' : 'Sign Up'}
          </button>
          {status === 'success' && <div className="text-green-600">Signed up! Check your email for confirmation.</div>}
          {status === 'error' && <div className="text-red-600">{error}</div>}
        </form>
      </div>
    </div>
  )
}
