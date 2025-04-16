// Supabase Edge Function: vote.ts
// Purpose: Submit a vote for a DAO proposal (with JWT auth and RLS)
// Author: Cascade AI
// Date: 2025-04-15

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

serve(async (req) => {
  const { proposal_id, vote } = await req.json(); // vote: "yes", "no", "abstain"
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

  // Insert vote
  const { data, error } = await supabase.from("votes").insert({
    proposal_id,
    voter_id: user.id,
    vote,
  }).select().single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  }

  return new Response(JSON.stringify({ vote: data }), { status: 201 });
});
