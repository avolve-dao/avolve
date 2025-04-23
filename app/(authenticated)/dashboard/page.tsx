"use client";

// Minimal placeholder page for future implementation
import DashboardTour from '../../../components/DashboardTour';
import Tooltip from '../../../components/Tooltip';
import ThankPeerModal from '../../components/ThankPeerModal';
import ConfirmDialog from '../../components/ConfirmDialog';
import Toast from '../../components/Toast';
import { useEffect, useState, useRef } from 'react';
import { createClientComponentClient, User } from '@supabase/auth-helpers-nextjs';
import { realtimeClient } from '../../lib/supabase/realtimeClient';

function PeerRecognitionFeed({ key }: { key: number }) {
  const [recognitions, setRecognitions] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<string, { full_name: string; avatar_url?: string }>>({});
  const [loading, setLoading] = useState(true);
  const subscriptionRef = useRef<any>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ open: boolean; message: string; type?: 'success' | 'error' } | null>(null);

  useEffect(() => {
    // Get current user id
    const supabase = createClientComponentClient();
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data?.user?.id || null);
    });
  }, []);

  const handleDelete = (id: string) => {
    setToDeleteId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!toDeleteId) return;
    setDeleting(true);
    setError("");
    try {
      const res = await fetch('/api/peer-recognition', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: toDeleteId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to delete recognition.');
        setToast({ open: true, message: data.error || 'Failed to delete recognition.', type: 'error' });
      } else {
        setToast({ open: true, message: 'Recognition deleted.', type: 'success' });
      }
    } catch {
      setError('Unexpected error.');
      setToast({ open: true, message: 'Unexpected error.', type: 'error' });
    }
    setDeleting(false);
    setConfirmOpen(false);
    setToDeleteId(null);
  };

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      const [recRes, profRes] = await Promise.all([
        fetch('/api/peer-recognition'),
        fetch('/api/user/profiles'),
      ]);
      const recData = await recRes.json();
      const profData = await profRes.json();
      setRecognitions(recData.recognitions || []);
      const profileMap: Record<string, { full_name: string; avatar_url?: string }> = {};
      (profData.profiles || []).forEach((p: any) => {
        profileMap[p.id] = { full_name: p.full_name || 'Unknown', avatar_url: p.avatar_url };
      });
      setProfiles(profileMap);
      setLoading(false);
    }
    fetchAll();

    // Subscribe to realtime peer_recognition inserts and deletes
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
    }
    subscriptionRef.current = realtimeClient
      .channel('public:peer_recognition')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'peer_recognition' }, (_payload: any) => {
        fetchAll();
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'peer_recognition' }, (_payload: any) => {
        fetchAll();
      })
      .subscribe();
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [key]);

  if (loading) return <div className="text-gray-500">Loading recognitions...</div>;
  if (!recognitions.length) return <div className="text-gray-400">No recognitions yet. Start by thanking a peer!</div>;
  return (
    <div className="space-y-3 mt-6">
      <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
        Recent Recognitions
        <Tooltip label="This feed updates in real-time. Recognize your peers to help build a culture of gratitude and collaboration!">
          <span className="ml-1" aria-label="Info" tabIndex={0} role="img">ℹ️</span>
        </Tooltip>
      </h2>
      {recognitions.map((rec) => (
        <div
          key={rec.id}
          className="bg-white rounded shadow p-3 flex items-center gap-3 group relative animate-fade-in-fast transition-all duration-300"
          tabIndex={0}
          aria-label={`Recognition from ${profiles[rec.sender_id]?.full_name || rec.sender_id} to ${profiles[rec.recipient_id]?.full_name || rec.recipient_id}: ${rec.message}`}
        >
          <span className="text-blue-600 font-bold" aria-hidden="true">{rec.badge ? `🏅 ${rec.badge}` : '👏'}</span>
          {profiles[rec.sender_id]?.avatar_url && (
            <img src={profiles[rec.sender_id].avatar_url} alt={profiles[rec.sender_id].full_name} className="w-7 h-7 rounded-full" />
          )}
          <span className="font-semibold">{profiles[rec.sender_id]?.full_name || rec.sender_id}</span>
          <span>thanked</span>
          {profiles[rec.recipient_id]?.avatar_url && (
            <img src={profiles[rec.recipient_id].avatar_url} alt={profiles[rec.recipient_id].full_name} className="w-7 h-7 rounded-full" />
          )}
          <span className="font-semibold">{profiles[rec.recipient_id]?.full_name || rec.recipient_id}</span>
          <span>: {rec.message}</span>
          <span className="ml-auto text-xs text-gray-400">{new Date(rec.created_at).toLocaleString()}</span>
          {/* Only show delete button if current user is sender */}
          {currentUserId === rec.sender_id && (
            <button
              className="ml-2 opacity-0 group-hover:opacity-100 transition text-red-500 hover:text-red-700 focus:opacity-100 focus:outline-none"
              aria-label="Delete recognition"
              onClick={() => handleDelete(rec.id)}
              tabIndex={0}
            >
              🗑️
            </button>
          )}
        </div>
      ))}
      <ConfirmDialog
        open={confirmOpen}
        title="Delete Recognition?"
        message="Are you sure you want to delete this recognition? This cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => { setConfirmOpen(false); setToDeleteId(null); }}
        loading={deleting}
      />
      {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
      <Toast
        open={!!toast?.open}
        message={toast?.message || ''}
        type={toast?.type}
        onClose={() => setToast(null)}
      />
    </div>
  );
}

export default function PlaceholderPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [feedKey, setFeedKey] = useState(0); // for refreshing feed
  return (
    <div className="p-6">
      <DashboardTour />
      <div className="flex items-center gap-2 mb-4">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Tooltip label="This is your main hub for tracking progress, recognizing peers, and accessing analytics.">{null}</Tooltip>
      </div>
      <div className="mb-6 flex items-center gap-2">
        <button
          className="py-2 px-4 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition font-semibold"
          onClick={() => setModalOpen(true)}
        >
          Thank a Peer
        </button>
        <Tooltip label="Show appreciation to a peer by sending them recognition. This boosts morale and builds community!">{null}</Tooltip>
      </div>
      <ThankPeerModal open={modalOpen} onClose={() => setModalOpen(false)} onSuccess={() => setFeedKey(k => k + 1)} />
      <PeerRecognitionFeed key={feedKey} />
      <div className="text-gray-600">Coming soon: analytics, recognitions, and more ways to engage!</div>
    </div>
  );
}
