'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient, Session } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface SupergeniusProfile {
  id: string;
  user_id: string;
  innovation_score: string;
  research_score: string;
  impact_score: string;
  updated_at?: string;
}

export default function Supergenius() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<SupergeniusProfile | null>(null);
  const [fields, setFields] = useState({
    innovation_score: '',
    research_score: '',
    impact_score: '',
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
      fetchSupergenius(data.session.user.id);
    };
    getSession();
    // eslint-disable-next-line
  }, []);

  const fetchSupergenius = async (userId: string) => {
    setLoading(true);
    const { data } = await supabase
      .from('supergenius_breakthroughs')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (data) {
      setProfile({
        id: data.id,
        user_id: data.user_id,
        innovation_score: data.innovation_score || '',
        research_score: data.research_score || '',
        impact_score: data.impact_score || '',
        updated_at: data.updated_at,
      });
      setFields({
        innovation_score: data.innovation_score || '',
        research_score: data.research_score || '',
        impact_score: data.impact_score || '',
      });
      setShowOnboarding(false);
    } else {
      setProfile(null);
      setFields({ innovation_score: '', research_score: '', impact_score: '' });
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
        .from('supergenius_breakthroughs')
        .update({
          innovation_score: fields.innovation_score,
          research_score: fields.research_score,
          impact_score: fields.impact_score,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);
    } else {
      await supabase.from('supergenius_breakthroughs').insert({
        user_id: userId,
        innovation_score: fields.innovation_score,
        research_score: fields.research_score,
        impact_score: fields.impact_score,
      });
    }
    setEdit(false);
    fetchSupergenius(userId);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="max-w-xl mx-auto py-10 px-6">
      <h1 className="text-3xl font-bold text-sky-400 mb-6">Supergenius Breakthroughs</h1>
      {showOnboarding && (
        <div className="mb-6 p-4 bg-sky-100 border-l-4 border-sky-400 text-sky-800 rounded">
          Welcome! Start your journey by entering your supergenius scores below.{' '}
          <span className="font-bold">Tip:</span> Hover over the{' '}
          <span className="underline">info</span> icons for guidance.
        </div>
      )}
      {edit ? (
        <div className="space-y-4">
          <div>
            <label className="block text-zinc-300">
              Innovation Score{' '}
              <span title="How do you rate your innovation progress?" className="ml-1 cursor-help">
                ℹ️
              </span>
            </label>
            <input
              type="text"
              name="innovation_score"
              value={fields.innovation_score}
              onChange={handleChange}
              className="mt-1 block w-full rounded bg-zinc-800 border border-zinc-700 p-2 text-zinc-100"
            />
          </div>
          <div>
            <label className="block text-zinc-300">
              Research Score{' '}
              <span title="How do you rate your research progress?" className="ml-1 cursor-help">
                ℹ️
              </span>
            </label>
            <input
              type="text"
              name="research_score"
              value={fields.research_score}
              onChange={handleChange}
              className="mt-1 block w-full rounded bg-zinc-800 border border-zinc-700 p-2 text-zinc-100"
            />
          </div>
          <div>
            <label className="block text-zinc-300">
              Impact Score{' '}
              <span title="How do you rate your impact progress?" className="ml-1 cursor-help">
                ℹ️
              </span>
            </label>
            <input
              type="text"
              name="impact_score"
              value={fields.impact_score}
              onChange={handleChange}
              className="mt-1 block w-full rounded bg-zinc-800 border border-zinc-700 p-2 text-zinc-100"
            />
          </div>
          <button
            onClick={handleSave}
            className="bg-sky-400 hover:bg-sky-500 text-white px-4 py-2 rounded font-bold"
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
            <span className="text-zinc-300">Innovation Score:</span>
            <span className="text-zinc-100 font-bold">{fields.innovation_score || '-'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-300">Research Score:</span>
            <span className="text-zinc-100 font-bold">{fields.research_score || '-'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-300">Impact Score:</span>
            <span className="text-zinc-100 font-bold">{fields.impact_score || '-'}</span>
          </div>
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => setEdit(true)}
              className="bg-sky-400 hover:bg-sky-500 text-white px-4 py-2 rounded font-bold"
            >
              Edit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
