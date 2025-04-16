// Supabase Edge Function: notify-milestone.ts
// Purpose: Notify team members when a milestone is reached (JWT auth, RLS, extensible)
// Author: Cascade AI
// Date: 2025-04-15

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

serve(async (req) => {
  const { team_id, milestone_level, message } = await req.json();
  const supabase = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"), {
    global: { headers: { Authorization: req.headers.get("Authorization")! } },
  });

  // Auth check
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  // Fetch team members
  const { data: members, error: memberError } = await supabase
    .from("team_memberships")
    .select("user_id")
    .eq("team_id", team_id)
    .is("exited_at", null);

  if (memberError) {
    return new Response(JSON.stringify({ error: memberError.message }), { status: 400 });
  }

  // Here you could trigger notifications (email, push, in-app) for each member
  // For now, just return the member list and message
  return new Response(JSON.stringify({ notified: members, message }), { status: 200 });
});
