"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient, Session } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface SupersocietyProfile {
  id: string;
  user_id: string;
  community_score: string;
  governance_score: string;
  culture_score: string;
  updated_at?: string;
}

export default function Supersociety() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<SupersocietyProfile | null>(null);
  const [fields, setFields] = useState({ community_score: "", governance_score: "", culture_score: "" });
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
      fetchSupersociety(data.session.user.id);
    };
    getSession();
    // eslint-disable-next-line
  }, []);

  const fetchSupersociety = async (userId: string) => {
    setLoading(true);
    const { data } = await supabase
      .from("supersociety_advancements")
      .select("*")
      .eq("user_id", userId)
      .single();
    if (data) {
      setProfile({
        id: data.id,
        user_id: data.user_id,
        community_score: data.community_score || "",
        governance_score: data.governance_score || "",
        culture_score: data.culture_score || "",
        updated_at: data.updated_at,
      });
      setFields({
        community_score: data.community_score || "",
        governance_score: data.governance_score || "",
        culture_score: data.culture_score || "",
      });
      setShowOnboarding(false);
    } else {
      setProfile(null);
      setFields({ community_score: "", governance_score: "", culture_score: "" });
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
        .from("supersociety_advancements")
        .update({
          community_score: fields.community_score,
          governance_score: fields.governance_score,
          culture_score: fields.culture_score,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id);
    } else {
      await supabase
        .from("supersociety_advancements")
        .insert({
          user_id: userId,
          community_score: fields.community_score,
          governance_score: fields.governance_score,
          culture_score: fields.culture_score,
        });
    }
    setEdit(false);
    fetchSupersociety(userId);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="max-w-xl mx-auto py-10 px-6">
      <h1 className="text-3xl font-bold text-lime-400 mb-6">Supersociety Advancements</h1>
      {showOnboarding && (
        <div className="mb-6 p-4 bg-lime-100 border-l-4 border-lime-400 text-lime-800 rounded">
          Welcome! Start your journey by entering your supersociety scores below. <span className="font-bold">Tip:</span> Hover over the <span className="underline">info</span> icons for guidance.
        </div>
      )}
      {edit ? (
        <div className="space-y-4">
          <div>
            <label className="block text-zinc-300">Community Score <span title="How do you rate your community's progress?" className="ml-1 cursor-help">ℹ️</span></label>
            <input
              type="text"
              name="community_score"
              value={fields.community_score}
              onChange={handleChange}
              className="mt-1 block w-full rounded bg-zinc-800 border border-zinc-700 p-2 text-zinc-100"
            />
          </div>
          <div>
            <label className="block text-zinc-300">Governance Score <span title="How do you rate your governance progress?" className="ml-1 cursor-help">ℹ️</span></label>
            <input
              type="text"
              name="governance_score"
              value={fields.governance_score}
              onChange={handleChange}
              className="mt-1 block w-full rounded bg-zinc-800 border border-zinc-700 p-2 text-zinc-100"
            />
          </div>
          <div>
            <label className="block text-zinc-300">Culture Score <span title="How do you rate your culture's progress?" className="ml-1 cursor-help">ℹ️</span></label>
            <input
              type="text"
              name="culture_score"
              value={fields.culture_score}
              onChange={handleChange}
              className="mt-1 block w-full rounded bg-zinc-800 border border-zinc-700 p-2 text-zinc-100"
            />
          </div>
          <button
            onClick={handleSave}
            className="bg-lime-400 hover:bg-lime-500 text-white px-4 py-2 rounded font-bold"
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
            <span className="text-zinc-300">Community Score:</span>
            <span className="text-zinc-100 font-bold">{fields.community_score || "-"}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-300">Governance Score:</span>
            <span className="text-zinc-100 font-bold">{fields.governance_score || "-"}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-300">Culture Score:</span>
            <span className="text-zinc-100 font-bold">{fields.culture_score || "-"}</span>
          </div>
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => setEdit(true)}
              className="bg-lime-400 hover:bg-lime-500 text-white px-4 py-2 rounded font-bold"
            >
              Edit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
