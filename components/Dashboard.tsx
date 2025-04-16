import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import FeedbackWidget from './FeedbackWidget';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function ProgressBar({ label, value, max }: { label: string; value: number; max: number }) {
  const percent = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1">
        <span className="font-semibold">{label}</span>
        <span>{percent}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div className="bg-gradient-to-r from-blue-400 to-green-400 h-3 rounded-full transition-all" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export default function Dashboard({ userId }: { userId: string }) {
  const [progress, setProgress] = useState({
    personal: 0,
    business: 0,
    supermind: 0,
    superpuzzle: 0,
    superhuman: 0,
    supersociety: 0,
    supergenius: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProgress() {
      // Example: fetch progress from user puzzle tables (customize as needed)
      const [{ data: personal }, { data: business }, { data: supermind }] = await Promise.all([
        supabase.from('personal_success_puzzle').select('health_score').eq('user_id', userId).single(),
        supabase.from('business_success_puzzle').select('front_stage_score').eq('user_id', userId).single(),
        supabase.from('supermind_superpowers').select('current_state').eq('user_id', userId).single(),
      ]);
      setProgress({
        personal: personal?.health_score || 0,
        business: business?.front_stage_score || 0,
        supermind: supermind?.current_state ? 33 : 0, // Example logic
        superpuzzle: 0,
        superhuman: 0,
        supersociety: 0,
        supergenius: 0,
      });
      setLoading(false);
    }
    fetchProgress();
  }, [userId]);

  if (loading) return <div className="p-8 text-center">Loading your dashboard...</div>;

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow-md animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">Your Avolve Dashboard</h1>
      <ProgressBar label="Personal Success" value={progress.personal} max={100} />
      <ProgressBar label="Business Success" value={progress.business} max={100} />
      <ProgressBar label="Supermind Superpowers" value={progress.supermind} max={100} />
      {/* Add more progress bars as you instrument more journeys */}
      <div className="mt-8">
        <FeedbackWidget context="dashboard" />
      </div>
    </div>
  );
}
