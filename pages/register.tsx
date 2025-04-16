import { useState } from 'react';
import OnboardingWizard from '../components/OnboardingWizard';

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
      return;
    }
    setSuccess(data.message);
    setShowOnboarding(true);
  };

  if (showOnboarding) {
    return <OnboardingWizard onComplete={() => window.location.href = '/dashboard'} />;
  }

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded shadow-md mt-12 animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">Register for Avolve</h1>
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
        <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded font-semibold">Register</button>
        {error && <div className="text-red-600 mt-2">{error}</div>}
        {success && <div className="text-green-600 mt-2">{success}</div>}
      </form>
    </div>
  );
}
