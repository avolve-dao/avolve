// Supabase Edge Function: propose.ts
// Purpose: Create a new DAO proposal for a team (with JWT auth and RLS)
// Author: Cascade AI
// Date: 2025-04-15

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

serve(async (req) => {
  const { team_id, title, description } = await req.json();
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

  // Insert proposal
  const { data, error } = await supabase.from("proposals").insert({
    team_id,
    proposer_id: user.id,
    title,
    description,
    status: "open",
  }).select().single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  }

  return new Response(JSON.stringify({ proposal: data }), { status: 201 });
});
