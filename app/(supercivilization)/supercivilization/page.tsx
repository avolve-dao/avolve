'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient, Session } from '@supabase/supabase-js';
import SupercivilizationFeed from '@/components/SupercivilizationFeed';
import PersonalProgressTracker from '@/components/PersonalProgressTracker';
import CollectiveProgressBar from '@/components/CollectiveProgressBar';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface SupercivilizationProfile {
  id: string;
  user_id: string;
  mentality_score: string;
  regeneration_score: string;
  future_score: string;
  updated_at?: string;
}

export default function Supercivilization() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<SupercivilizationProfile | null>(null);
  const [fields, setFields] = useState({
    mentality_score: '',
    regeneration_score: '',
    future_score: '',
  });
  const [edit, setEdit] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace('/auth/signin');
        return;
      }
      setSession(data.session);
      fetchSupercivilization(data.session.user.id);
    };
    getSession();
    // eslint-disable-next-line
  }, []);

  const fetchSupercivilization = async (userId: string) => {
    setLoading(true);
    const { data } = await supabase
      .from('supercivilization_scores')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (data) {
      setProfile({
        id: data.id,
        user_id: data.user_id,
        mentality_score: data.mentality_score || '',
        regeneration_score: data.regeneration_score || '',
        future_score: data.future_score || '',
        updated_at: data.updated_at,
      });
      setFields({
        mentality_score: data.mentality_score || '',
        regeneration_score: data.regeneration_score || '',
        future_score: data.future_score || '',
      });
      setShowOnboarding(false);
    } else {
      setProfile(null);
      setFields({ mentality_score: '', regeneration_score: '', future_score: '' });
      setShowOnboarding(true);
    }
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFields({ ...fields, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!session) return;
    setLoading(true);
    const userId = session.user.id;
    if (profile) {
      await supabase
        .from('supercivilization_scores')
        .update({
          mentality_score: fields.mentality_score,
          regeneration_score: fields.regeneration_score,
          future_score: fields.future_score,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);
    } else {
      await supabase.from('supercivilization_scores').insert({
        user_id: userId,
        mentality_score: fields.mentality_score,
        regeneration_score: fields.regeneration_score,
        future_score: fields.future_score,
      });
    }
    setEdit(false);
    fetchSupercivilization(userId);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-6">
      <h1 className="text-3xl font-bold text-fuchsia-400 mb-6">Supercivilization</h1>
      {/* Feed section for intentions, wins, and collective progress */}
      <SupercivilizationFeed />
      {/* Personal progress tracker for user journey */}
      <PersonalProgressTracker />
      {/* Collective progress bar for community achievements */}
      <CollectiveProgressBar />
      {showOnboarding && (
        <div className="mb-6 p-4 bg-fuchsia-100 border-l-4 border-fuchsia-400 text-fuchsia-800 rounded">
          Welcome! Start your journey by entering your supercivilization scores below.{' '}
          <span className="font-bold">Tip:</span> Hover over the{' '}
          <span className="underline">info</span> icons for guidance.
        </div>
      )}
      {edit ? (
        <div className="space-y-4">
          <div>
            <label className="block text-zinc-300">
              Mentality Score{' '}
              <span
                title="How do you rate your mentality's transformation?"
                className="ml-1 cursor-help"
              >
                ℹ️
              </span>
            </label>
            <input
              type="text"
              name="mentality_score"
              value={fields.mentality_score}
              onChange={handleChange}
              className="mt-1 block w-full rounded bg-zinc-800 border border-zinc-700 p-2 text-zinc-100"
            />
          </div>
          <div>
            <label className="block text-zinc-300">
              Regeneration Score{' '}
              <span
                title="How do you rate your regeneration awakening?"
                className="ml-1 cursor-help"
              >
                ℹ️
              </span>
            </label>
            <input
              type="text"
              name="regeneration_score"
              value={fields.regeneration_score}
              onChange={handleChange}
              className="mt-1 block w-full rounded bg-zinc-800 border border-zinc-700 p-2 text-zinc-100"
            />
          </div>
          <div>
            <label className="block text-zinc-300">
              Future Score{' '}
              <span
                title="How do you rate your vision for the future?"
                className="ml-1 cursor-help"
              >
                ℹ️
              </span>
            </label>
            <input
              type="text"
              name="future_score"
              value={fields.future_score}
              onChange={handleChange}
              className="mt-1 block w-full rounded bg-zinc-800 border border-zinc-700 p-2 text-zinc-100"
            />
          </div>
          <button
            onClick={handleSave}
            className="bg-fuchsia-400 hover:bg-fuchsia-500 text-white px-4 py-2 rounded font-bold"
          >
            Save
          </button>
          <button
            onClick={() => setEdit(false)}
            className="ml-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-100 px-4 py-2 rounded"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-zinc-300">Mentality Score:</span>
            <span className="text-zinc-100 font-bold">{fields.mentality_score || '-'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-300">Regeneration Score:</span>
            <span className="text-zinc-100 font-bold">{fields.regeneration_score || '-'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-300">Future Score:</span>
            <span className="text-zinc-100 font-bold">{fields.future_score || '-'}</span>
          </div>
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => setEdit(true)}
              className="bg-fuchsia-400 hover:bg-fuchsia-500 text-white px-4 py-2 rounded font-bold"
            >
              Edit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
