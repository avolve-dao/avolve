'use client';
import { useEffect, useState, useRef } from 'react';
import Toast from './Toast';

interface Profile {
  id: string;
  full_name: string;
  avatar_url?: string;
}

export default function ThankPeerModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [recipient, setRecipient] = useState<string>('');
  const [message, setMessage] = useState('');
  const [badge, setBadge] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    type?: 'success' | 'error';
  } | null>(null);
  const confettiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    fetch('/api/user/profiles')
      .then(res => res.json())
      .then(data => setProfiles(data.profiles || []));
  }, [open]);

  const filteredProfiles = profiles.filter(
    p => p.full_name.toLowerCase().includes(search.toLowerCase()) && p.id !== recipient
  );

  const triggerConfetti = () => {
    if (!confettiRef.current) return;
    const el = confettiRef.current;
    el.classList.remove('animate-confetti');
    void el.offsetWidth; // trigger reflow
    el.classList.add('animate-confetti');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient || !message.trim()) {
      setError('Recipient and message are required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/peer-recognition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient_id: recipient, message, badge }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to send recognition.');
        setToast({
          open: true,
          message: data.error || 'Failed to send recognition.',
          type: 'error',
        });
        setLoading(false);
        return;
      }
      setSuccess(true);
      setToast({ open: true, message: 'Recognition sent!', type: 'success' });
      triggerConfetti();
      setTimeout(() => {
        setSuccess(false);
        setLoading(false);
        setRecipient('');
        setMessage('');
        setBadge('');
        onSuccess();
        onClose();
      }, 1200);
    } catch (err) {
      setError('Unexpected error. Please try again.');
      setToast({ open: true, message: 'Unexpected error. Please try again.', type: 'error' });
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md animate-fade-in relative"
      >
        <div
          ref={confettiRef}
          className="pointer-events-none absolute inset-0 z-50"
          aria-hidden="true"
        ></div>
        <h2 className="text-xl font-bold mb-4">Thank a Peer</h2>
        <label className="block mb-2">
          <span className="text-gray-700">Recipient</span>
          <input
            className="mt-1 block w-full rounded border border-gray-300 p-2"
            placeholder="Search by name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
            aria-label="Search for recipient by name"
          />
        </label>
        <div className="max-h-32 overflow-y-auto mb-2" role="listbox">
          {filteredProfiles.map(p => (
            <div
              key={p.id}
              className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-blue-50 ${recipient === p.id ? 'bg-blue-100' : ''}`}
              onClick={() => setRecipient(p.id)}
              tabIndex={0}
              aria-selected={recipient === p.id}
              role="option"
            >
              {p.avatar_url && (
                <img src={p.avatar_url} alt={p.full_name} className="w-6 h-6 rounded-full" />
              )}
              <span>{p.full_name}</span>
              {recipient === p.id && <span className="ml-auto text-blue-600 font-bold">✓</span>}
            </div>
          ))}
        </div>
        <label className="block mb-2">
          <span className="text-gray-700">Message</span>
          <textarea
            className="mt-1 block w-full rounded border border-gray-300 p-2"
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={2}
            maxLength={200}
            required
            aria-label="Recognition message"
          />
        </label>
        <label className="block mb-4">
          <span className="text-gray-700">Badge (optional)</span>
          <input
            className="mt-1 block w-full rounded border border-gray-300 p-2"
            value={badge}
            onChange={e => setBadge(e.target.value)}
            placeholder="e.g. Helper, Innovator, Team Player"
            maxLength={32}
            aria-label="Badge (optional)"
          />
        </label>
        {error && (
          <div className="text-red-500 text-sm mb-2" role="alert">
            {error}
          </div>
        )}
        {success && <div className="text-green-600 text-sm mb-2">Recognition sent!</div>}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-4 bg-gray-200 rounded hover:bg-gray-300"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 py-2 px-4 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition disabled:opacity-50"
            disabled={loading || !recipient || !message.trim()}
          >
            {loading ? 'Sending...' : 'Send Recognition'}
          </button>
        </div>
        <Toast
          open={!!toast?.open}
          message={toast?.message || ''}
          type={toast?.type}
          onClose={() => setToast(null)}
        />
        {/* Confetti animation style */}
        <style jsx>{`
          .animate-confetti {
            pointer-events: none;
            background-image:
              repeating-linear-gradient(45deg, #34d399 0 10px, transparent 10px 20px),
              repeating-linear-gradient(-45deg, #fbbf24 0 10px, transparent 10px 20px),
              repeating-linear-gradient(135deg, #60a5fa 0 10px, transparent 10px 20px);
            background-size:
              100% 4px,
              100% 4px,
              100% 4px;
            background-position:
              0 0,
              0 8px,
              0 16px;
            animation: confetti-burst 1s cubic-bezier(0.23, 1, 0.32, 1);
          }
          @keyframes confetti-burst {
            0% {
              opacity: 0;
              transform: scale(0.8) translateY(40px);
            }
            60% {
              opacity: 1;
              transform: scale(1.05) translateY(-10px);
            }
            100% {
              opacity: 0;
              transform: scale(1) translateY(-40px);
            }
          }
        `}</style>
      </form>
    </div>
  );
}
