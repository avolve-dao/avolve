"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface BusinessProfile {
  id: string;
  user_id: string;
  front_stage_score: string;
  back_stage_score: string;
  bottom_line_score: string;
  updated_at?: string;
}

export default function Business() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [session, setSession] = useState<any | null>(null);
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [scores, setScores] = useState({ front_stage_score: "", back_stage_score: "", bottom_line_score: "" });
  const [edit, setEdit] = useState(false);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace("/auth/signin");
        return;
      }
      setSession(data.session);
      fetchBusinessPuzzle(data.session.user.id);
    };
    getSession();
  }, [router]);

  const fetchBusinessPuzzle = async (userId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("business_success_puzzle")
      .select("*")
      .eq("user_id", userId)
      .single();
    if (data) {
      setProfile({
        id: data.id,
        user_id: data.user_id,
        front_stage_score: data.front_stage_score || "",
        back_stage_score: data.back_stage_score || "",
        bottom_line_score: data.bottom_line_score || "",
        updated_at: data.updated_at,
      });
      setScores({
        front_stage_score: data.front_stage_score || "",
        back_stage_score: data.back_stage_score || "",
        bottom_line_score: data.bottom_line_score || "",
      });
    } else {
      setProfile(null);
      setScores({ front_stage_score: "", back_stage_score: "", bottom_line_score: "" });
    }
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setScores({ ...scores, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    const userId = session?.user.id;
    if (profile) {
      await supabase
        .from("business_success_puzzle")
        .update({
          front_stage_score: scores.front_stage_score,
          back_stage_score: scores.back_stage_score,
          bottom_line_score: scores.bottom_line_score,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id);
    } else {
      await supabase
        .from("business_success_puzzle")
        .insert({
          user_id: userId,
          front_stage_score: scores.front_stage_score,
          back_stage_score: scores.back_stage_score,
          bottom_line_score: scores.bottom_line_score,
        });
    }
    setEdit(false);
    fetchBusinessPuzzle(userId!);
  };

  if (loading) {
    return <div className="p-6 text-zinc-400">Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-teal-300">Business Success Puzzle</h1>
      <p className="text-zinc-400 mt-2 mb-4">Enjoy Greater Business Successes</p>
      {edit ? (
        <div className="space-y-4">
          <div>
            <label className="block text-zinc-300">Front Stage Score</label>
            <input
              name="front_stage_score"
              type="number"
              value={scores.front_stage_score}
              onChange={handleChange}
              className="mt-1 block w-full rounded bg-zinc-800 border border-zinc-700 p-2 text-zinc-100"
            />
          </div>
          <div>
            <label className="block text-zinc-300">Back Stage Score</label>
            <input
              name="back_stage_score"
              type="number"
              value={scores.back_stage_score}
              onChange={handleChange}
              className="mt-1 block w-full rounded bg-zinc-800 border border-zinc-700 p-2 text-zinc-100"
            />
          </div>
          <div>
            <label className="block text-zinc-300">Bottom Line Score</label>
            <input
              name="bottom_line_score"
              type="number"
              value={scores.bottom_line_score}
              onChange={handleChange}
              className="mt-1 block w-full rounded bg-zinc-800 border border-zinc-700 p-2 text-zinc-100"
            />
          </div>
          <button
            onClick={handleSave}
            className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded font-bold"
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
            <span className="text-zinc-300">Front Stage Score:</span>
            <span className="text-zinc-100 font-bold">{scores.front_stage_score || "-"}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-300">Back Stage Score:</span>
            <span className="text-zinc-100 font-bold">{scores.back_stage_score || "-"}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-300">Bottom Line Score:</span>
            <span className="text-zinc-100 font-bold">{scores.bottom_line_score || "-"}</span>
          </div>
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => setEdit(true)}
              className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded font-bold"
            >
              {profile ? "Edit" : "Start"}
            </button>
            {profile && profile.updated_at && (
              <span className="text-xs text-zinc-500">Last updated: {new Date(profile.updated_at).toLocaleString()}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
