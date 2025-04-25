'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient, Session } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface SuperpuzzleProfile {
  id: string;
  user_id: string;
  academy_score: string;
  company_score: string;
  ecosystem_score: string;
  updated_at?: string;
}

export default function Superpuzzle() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<SuperpuzzleProfile | null>(null);
  const [fields, setFields] = useState({
    academy_score: '',
    company_score: '',
    ecosystem_score: '',
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
      fetchSuperpuzzle(data.session.user.id);
    };
    getSession();
    // eslint-disable-next-line
  }, []);

  const fetchSuperpuzzle = async (userId: string) => {
    setLoading(true);
    const { data } = await supabase
      .from('superpuzzle_developments')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (data) {
      setProfile({
        id: data.id,
        user_id: data.user_id,
        academy_score: data.academy_score || '',
        company_score: data.company_score || '',
        ecosystem_score: data.ecosystem_score || '',
        updated_at: data.updated_at,
      });
      setFields({
        academy_score: data.academy_score || '',
        company_score: data.company_score || '',
        ecosystem_score: data.ecosystem_score || '',
      });
      setShowOnboarding(false);
    } else {
      setProfile(null);
      setFields({ academy_score: '', company_score: '', ecosystem_score: '' });
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
        .from('superpuzzle_developments')
        .update({
          academy_score: fields.academy_score,
          company_score: fields.company_score,
          ecosystem_score: fields.ecosystem_score,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);
    } else {
      await supabase.from('superpuzzle_developments').insert({
        user_id: userId,
        academy_score: fields.academy_score,
        company_score: fields.company_score,
        ecosystem_score: fields.ecosystem_score,
      });
    }
    setEdit(false);
    fetchSuperpuzzle(userId);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="max-w-xl mx-auto py-10 px-6">
      <h1 className="text-3xl font-bold text-red-400 mb-6">Superpuzzle Developments</h1>
      {showOnboarding && (
        <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-400 text-red-800 rounded">
          Welcome! Start your journey by entering your superpuzzle scores below.{' '}
          <span className="font-bold">Tip:</span> Hover over the{' '}
          <span className="underline">info</span> icons for guidance.
        </div>
      )}
      {edit ? (
        <div className="space-y-4">
          <div>
            <label className="block text-zinc-300">
              Academy Score{' '}
              <span title="How do you rate your academy's progress?" className="ml-1 cursor-help">
                ℹ️
              </span>
            </label>
            <input
              type="text"
              name="academy_score"
              value={fields.academy_score}
              onChange={handleChange}
              className="mt-1 block w-full rounded bg-zinc-800 border border-zinc-700 p-2 text-zinc-100"
            />
          </div>
          <div>
            <label className="block text-zinc-300">
              Company Score{' '}
              <span title="How do you rate your company's progress?" className="ml-1 cursor-help">
                ℹ️
              </span>
            </label>
            <input
              type="text"
              name="company_score"
              value={fields.company_score}
              onChange={handleChange}
              className="mt-1 block w-full rounded bg-zinc-800 border border-zinc-700 p-2 text-zinc-100"
            />
          </div>
          <div>
            <label className="block text-zinc-300">
              Ecosystem Score{' '}
              <span title="How do you rate your ecosystem's progress?" className="ml-1 cursor-help">
                ℹ️
              </span>
            </label>
            <input
              type="text"
              name="ecosystem_score"
              value={fields.ecosystem_score}
              onChange={handleChange}
              className="mt-1 block w-full rounded bg-zinc-800 border border-zinc-700 p-2 text-zinc-100"
            />
          </div>
          <button
            onClick={handleSave}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-bold"
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
            <span className="text-zinc-300">Academy Score:</span>
            <span className="text-zinc-100 font-bold">{fields.academy_score || '-'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-300">Company Score:</span>
            <span className="text-zinc-100 font-bold">{fields.company_score || '-'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-300">Ecosystem Score:</span>
            <span className="text-zinc-100 font-bold">{fields.ecosystem_score || '-'}</span>
          </div>
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => setEdit(true)}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-bold"
            >
              Edit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
