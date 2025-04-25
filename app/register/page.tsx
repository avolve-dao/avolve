"use client";
import { useState } from 'react';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, inviteCode }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Registration failed');
    } else {
      setSuccess('Registration successful! Check your email.');
      setShowOnboarding(true);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Register</h1>
      <form onSubmit={handleRegister} className="space-y-4">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          placeholder="Email"
          className="w-full p-2 border rounded"
        />
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          placeholder="Password"
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          value={inviteCode}
          onChange={e => setInviteCode(e.target.value)}
          required
          placeholder="Invitation Code"
          className="w-full p-2 border rounded"
        />
        <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded font-semibold">
          Register
        </button>
        {error && <div className="text-red-600 mt-2">{error}</div>}
        {success && <div className="text-green-600 mt-2">{success}</div>}
      </form>
      {showOnboarding && (
        <div className="mt-6 p-4 bg-blue-50 rounded">
          <h2 className="font-semibold mb-2">Next Steps</h2>
          <ul className="list-disc ml-5 text-sm">
            <li>Check your inbox for a confirmation email.</li>
            <li>Complete your onboarding checklist for rewards!</li>
          </ul>
        </div>
      )}
    </div>
  );
}
