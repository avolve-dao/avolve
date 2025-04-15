"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient, Session } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface SuperhumanProfile {
  id: string;
  user_id: string;
  academy_progress: string;
  university_progress: string;
  institute_progress: string;
  updated_at?: string;
}

export default function Superhuman() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<SuperhumanProfile | null>(null);
  const [fields, setFields] = useState({ academy_progress: "", university_progress: "", institute_progress: "" });
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
      fetchSuperhuman(data.session.user.id);
    };
    getSession();
    // eslint-disable-next-line
  }, []);

  const fetchSuperhuman = async (userId: string) => {
    setLoading(true);
    const { data } = await supabase
      .from("superhuman_enhancements")
      .select("*")
      .eq("user_id", userId)
      .single();
    if (data) {
      setProfile({
        id: data.id,
        user_id: data.user_id,
        academy_progress: data.academy_progress || "",
        university_progress: data.university_progress || "",
        institute_progress: data.institute_progress || "",
        updated_at: data.updated_at,
      });
      setFields({
        academy_progress: data.academy_progress || "",
        university_progress: data.university_progress || "",
        institute_progress: data.institute_progress || "",
      });
      setShowOnboarding(false);
    } else {
      setProfile(null);
      setFields({ academy_progress: "", university_progress: "", institute_progress: "" });
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
        .from("superhuman_enhancements")
        .update({
          academy_progress: fields.academy_progress,
          university_progress: fields.university_progress,
          institute_progress: fields.institute_progress,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id);
    } else {
      await supabase
        .from("superhuman_enhancements")
        .insert({
          user_id: userId,
          academy_progress: fields.academy_progress,
          university_progress: fields.university_progress,
          institute_progress: fields.institute_progress,
        });
    }
    setEdit(false);
    fetchSuperhuman(userId);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="max-w-xl mx-auto py-10 px-6">
      <h1 className="text-3xl font-bold text-rose-400 mb-6">Superhuman Enhancements</h1>
      {showOnboarding && (
        <div className="mb-6 p-4 bg-rose-100 border-l-4 border-rose-400 text-rose-800 rounded">
          Welcome! Start your journey by entering your superhuman progress below. <span className="font-bold">Tip:</span> Hover over the <span className="underline">info</span> icons for guidance.
        </div>
      )}
      {edit ? (
        <div className="space-y-4">
          <div>
            <label className="block text-zinc-300">Academy Progress <span title="How do you rate your progress in the academy?" className="ml-1 cursor-help">ℹ️</span></label>
            <input
              type="text"
              name="academy_progress"
              value={fields.academy_progress}
              onChange={handleChange}
              className="mt-1 block w-full rounded bg-zinc-800 border border-zinc-700 p-2 text-zinc-100"
            />
          </div>
          <div>
            <label className="block text-zinc-300">University Progress <span title="How do you rate your progress at university?" className="ml-1 cursor-help">ℹ️</span></label>
            <input
              type="text"
              name="university_progress"
              value={fields.university_progress}
              onChange={handleChange}
              className="mt-1 block w-full rounded bg-zinc-800 border border-zinc-700 p-2 text-zinc-100"
            />
          </div>
          <div>
            <label className="block text-zinc-300">Institute Progress <span title="How do you rate your progress at the institute?" className="ml-1 cursor-help">ℹ️</span></label>
            <input
              type="text"
              name="institute_progress"
              value={fields.institute_progress}
              onChange={handleChange}
              className="mt-1 block w-full rounded bg-zinc-800 border border-zinc-700 p-2 text-zinc-100"
            />
          </div>
          <button
            onClick={handleSave}
            className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded font-bold"
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
            <span className="text-zinc-300">Academy Progress:</span>
            <span className="text-zinc-100 font-bold">{fields.academy_progress || "-"}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-300">University Progress:</span>
            <span className="text-zinc-100 font-bold">{fields.university_progress || "-"}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-300">Institute Progress:</span>
            <span className="text-zinc-100 font-bold">{fields.institute_progress || "-"}</span>
          </div>
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => setEdit(true)}
              className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded font-bold"
            >
              Edit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
