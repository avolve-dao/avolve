"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient, Session } from "@supabase/supabase-js";

// Initialize Supabase client (client-side)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface PersonalProfile {
  id: string;
  user_id: string;
  health_score: string;
  wealth_score: string;
  peace_score: string;
  updated_at?: string;
}

export default function Personal() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<PersonalProfile | null>(null);
  const [scores, setScores] = useState({ health_score: "", wealth_score: "", peace_score: "" });
  const [edit, setEdit] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace("/auth/signin");
        return;
      }
      setSession(data.session);
      fetchPersonalPuzzle(data.session.user.id);
    };
    getSession();
    // eslint-disable-next-line
  }, []);

  const fetchPersonalPuzzle = async (userId: string) => {
    setLoading(true);
    const { data } = await supabase
      .from("personal_success_puzzle")
      .select("*")
      .eq("user_id", userId)
      .single();
    if (data) {
      setProfile({
        id: data.id,
        user_id: data.user_id,
        health_score: data.health_score || "",
        wealth_score: data.wealth_score || "",
        peace_score: data.peace_score || "",
        updated_at: data.updated_at,
      });
      setScores({
        health_score: data.health_score || "",
        wealth_score: data.wealth_score || "",
        peace_score: data.peace_score || "",
      });
      setShowOnboarding(false);
    } else {
      setProfile(null);
      setScores({ health_score: "", wealth_score: "", peace_score: "" });
      setShowOnboarding(true);
    }
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setScores({ ...scores, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!session) return;
    setLoading(true);
    const userId = session.user.id;
    if (profile) {
      await supabase
        .from("personal_success_puzzle")
        .update({
          health_score: scores.health_score,
          wealth_score: scores.wealth_score,
          peace_score: scores.peace_score,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id);
    } else {
      await supabase
        .from("personal_success_puzzle")
        .insert({
          user_id: userId,
          health_score: scores.health_score,
          wealth_score: scores.wealth_score,
          peace_score: scores.peace_score,
        });
    }
    setEdit(false);
    fetchPersonalPuzzle(userId);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="max-w-xl mx-auto py-10 px-6">
      <h1 className="text-3xl font-bold text-amber-400 mb-6">Personal Success Puzzle</h1>
      {showOnboarding && (
        <div className="mb-6 p-4 bg-amber-100 border-l-4 border-amber-400 text-amber-800 rounded">
          Welcome! Start your journey by entering your personal scores below. <span className="font-bold">Tip:</span> Hover over the <span className="underline">info</span> icons for guidance.
        </div>
      )}
      {edit ? (
        <div className="space-y-4">
          <div>
            <label className="block text-zinc-300">Health Score <span title="How do you rate your current health?" className="ml-1 cursor-help">ℹ️</span></label>
            <input
              type="text"
              name="health_score"
              value={scores.health_score}
              onChange={handleChange}
              className="mt-1 block w-full rounded bg-zinc-800 border border-zinc-700 p-2 text-zinc-100"
            />
          </div>
          <div>
            <label className="block text-zinc-300">Wealth Score <span title="How do you rate your current financial situation?" className="ml-1 cursor-help">ℹ️</span></label>
            <input
              type="text"
              name="wealth_score"
              value={scores.wealth_score}
              onChange={handleChange}
              className="mt-1 block w-full rounded bg-zinc-800 border border-zinc-700 p-2 text-zinc-100"
            />
          </div>
          <div>
            <label className="block text-zinc-300">Peace Score <span title="How do you rate your current level of peace and well-being?" className="ml-1 cursor-help">ℹ️</span></label>
            <input
              type="text"
              name="peace_score"
              value={scores.peace_score}
              onChange={handleChange}
              className="mt-1 block w-full rounded bg-zinc-800 border border-zinc-700 p-2 text-zinc-100"
            />
          </div>
          <button
            onClick={handleSave}
            className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded font-bold"
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
            <span className="text-zinc-300">Health Score:</span>
            <span className="text-zinc-100 font-bold">{scores.health_score || "-"}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-300">Wealth Score:</span>
            <span className="text-zinc-100 font-bold">{scores.wealth_score || "-"}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-300">Peace Score:</span>
            <span className="text-zinc-100 font-bold">{scores.peace_score || "-"}</span>
          </div>
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => setEdit(true)}
              className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded font-bold"
            >
              Edit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
