import React, { useState, useEffect } from 'react';
import Confetti from 'react-confetti';
import { toast } from 'sonner';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Native window size hook replacement
function useWindowSize() {
  const isClient = typeof window === 'object';
  function getSize() {
    return {
      width: isClient ? window.innerWidth : undefined,
      height: isClient ? window.innerHeight : undefined
    };
  }
  const [windowSize, setWindowSize] = React.useState(getSize);
  useEffect(() => {
    if (!isClient) return;
    function handleResize() {
      setWindowSize(getSize());
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isClient]);
  return windowSize;
}

export function PhaseManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const { width, height } = useWindowSize();
  const supabase = createClientComponentClient();

  // Fetch users and their phases (simplified)
  React.useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, phase');
      if (data) setUsers(data);
      setLoading(false);
    }
    fetchUsers();
  }, []);

  async function handlePromoteAll() {
    setLoading(true);
    // Example: promote all users to next phase (simplified logic)
    const updates = users.map(u => ({ id: u.id, phase: (u.phase || 0) + 1 }));
    const { error } = await supabase
      .from('profiles')
      .upsert(updates, { onConflict: 'id' });
    setLoading(false);
    if (!error) {
      setCelebrate(true);
      toast.success('🎉 All users promoted to next phase!');
      // Refresh users
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, phase');
      if (data) setUsers(data);
      setTimeout(() => setCelebrate(false), 2000);
    } else {
      toast.error('Failed to promote users: ' + error.message);
    }
  }

  return (
    <div className="phase-management bg-white rounded shadow p-4 mt-6 relative">
      <h2 className="text-xl font-semibold mb-2">Phase Management</h2>
      <p className="mb-2">View and manage user phases. Promote users to the next phase and celebrate progress!</p>
      <button
        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded"
        onClick={handlePromoteAll}
        disabled={loading}
      >
        {loading ? 'Promoting...' : 'Promote All to Next Phase'}
      </button>
      <ul className="mt-4">
        {users.map(u => (
          <li key={u.id} className="flex justify-between py-1 border-b last:border-b-0">
            <span>{u.full_name || u.id}</span>
            <span className="text-sm text-gray-500">Phase: {u.phase ?? 'N/A'}</span>
          </li>
        ))}
      </ul>
      {celebrate && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
          <Confetti width={width} height={height} numberOfPieces={350} recycle={false} />
          <span className="text-4xl font-bold mt-8 animate-bounce">🎉</span>
        </div>
      )}
    </div>
  );
}
