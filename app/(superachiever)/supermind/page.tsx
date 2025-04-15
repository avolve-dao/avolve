"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient, Session } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface SupermindProfile {
  id: string;
  user_id: string;
  current_state: string;
  desired_state: string;
  action_plan: string;
  results: string;
  updated_at?: string;
}

export default function Supermind() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<SupermindProfile | null>(null);
  const [fields, setFields] = useState({ current_state: "", desired_state: "", action_plan: "", results: "" });
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
      fetchSupermind(data.session.user.id);
    };
    getSession();
    // eslint-disable-next-line
  }, []);

  const fetchSupermind = async (userId: string) => {
    setLoading(true);
    const { data } = await supabase
      .from("supermind_superpowers")
      .select("*")
      .eq("user_id", userId)
      .single();
    if (data) {
      setProfile({
        id: data.id,
        user_id: data.user_id,
        current_state: data.current_state || "",
        desired_state: data.desired_state || "",
        action_plan: data.action_plan || "",
        results: data.results || "",
        updated_at: data.updated_at,
      });
      setFields({
        current_state: data.current_state || "",
        desired_state: data.desired_state || "",
        action_plan: data.action_plan || "",
        results: data.results || "",
      });
      setShowOnboarding(false);
    } else {
      setProfile(null);
      setFields({ current_state: "", desired_state: "", action_plan: "", results: "" });
      setShowOnboarding(true);
    }
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFields({ ...fields, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!session) return;
    setLoading(true);
    const userId = session.user.id;
    if (profile) {
      await supabase
        .from("supermind_superpowers")
        .update({
          current_state: fields.current_state,
          desired_state: fields.desired_state,
          action_plan: fields.action_plan,
          results: fields.results,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id);
    } else {
      await supabase
        .from("supermind_superpowers")
        .insert({
          user_id: userId,
          current_state: fields.current_state,
          desired_state: fields.desired_state,
          action_plan: fields.action_plan,
          results: fields.results,
        });
    }
    setEdit(false);
    fetchSupermind(userId);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="max-w-xl mx-auto py-10 px-6">
      <h1 className="text-3xl font-bold text-violet-400 mb-6">Supermind Superpowers</h1>
      {showOnboarding && (
        <div className="mb-6 p-4 bg-violet-100 border-l-4 border-violet-400 text-violet-800 rounded">
          Welcome! Start your journey by entering your supermind states below. <span className="font-bold">Tip:</span> Hover over the <span className="underline">info</span> icons for guidance.
        </div>
      )}
      {edit ? (
        <div className="space-y-4">
          <div>
            <label className="block text-zinc-300">Current State <span title="Describe your current mindset or situation." className="ml-1 cursor-help">ℹ️</span></label>
            <input
              type="text"
              name="current_state"
              value={fields.current_state}
              onChange={handleChange}
              className="mt-1 block w-full rounded bg-zinc-800 border border-zinc-700 p-2 text-zinc-100"
            />
          </div>
          <div>
            <label className="block text-zinc-300">Desired State <span title="What is your desired outcome or state?" className="ml-1 cursor-help">ℹ️</span></label>
            <input
              type="text"
              name="desired_state"
              value={fields.desired_state}
              onChange={handleChange}
              className="mt-1 block w-full rounded bg-zinc-800 border border-zinc-700 p-2 text-zinc-100"
            />
          </div>
          <div>
            <label className="block text-zinc-300">Action Plan <span title="What actions will you take to reach your desired state?" className="ml-1 cursor-help">ℹ️</span></label>
            <textarea
              name="action_plan"
              value={fields.action_plan}
              onChange={handleChange}
              className="mt-1 block w-full rounded bg-zinc-800 border border-zinc-700 p-2 text-zinc-100"
              rows={2}
            />
          </div>
          <div>
            <label className="block text-zinc-300">Results <span title="What results have you achieved so far?" className="ml-1 cursor-help">ℹ️</span></label>
            <textarea
              name="results"
              value={fields.results}
              onChange={handleChange}
              className="mt-1 block w-full rounded bg-zinc-800 border border-zinc-700 p-2 text-zinc-100"
              rows={2}
            />
          </div>
          <button
            onClick={handleSave}
            className="bg-violet-500 hover:bg-violet-600 text-white px-4 py-2 rounded font-bold"
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
          <div>
            <span className="text-zinc-300">Current State:</span>
            <span className="text-zinc-100 font-bold ml-2">{fields.current_state || "-"}</span>
          </div>
          <div>
            <span className="text-zinc-300">Desired State:</span>
            <span className="text-zinc-100 font-bold ml-2">{fields.desired_state || "-"}</span>
          </div>
          <div>
            <span className="text-zinc-300">Action Plan:</span>
            <span className="text-zinc-100 font-bold ml-2">{fields.action_plan || "-"}</span>
          </div>
          <div>
            <span className="text-zinc-300">Results:</span>
            <span className="text-zinc-100 font-bold ml-2">{fields.results || "-"}</span>
          </div>
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => setEdit(true)}
              className="bg-violet-500 hover:bg-violet-600 text-white px-4 py-2 rounded font-bold"
            >
              Edit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
