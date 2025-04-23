import { serve } from "std/server";
import { createClient } from "supabase-functions-client";

// Environment variables (set in Supabase dashboard)
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  try {
    const { user } = await req.json();

    // 1. Assign default tokens/roles
    await supabase.from("user_balances").insert([
      { user_id: user.id, token_id: "GEN", balance: 1 }
      // Add other default tokens as needed
    ]);
    await supabase.from("user_roles").insert([
      { user_id: user.id, role_id: "default_onboarded" }
    ]);

    // 2. Initialize onboarding quests/milestones
    await supabase.from("user_phase_milestones").insert([
      { user_id: user.id, phase_id: "onboarding", completed: false }
    ]);

    // 3. Log onboarding action
    await supabase.from("metrics").insert([
      { event: "onboarding_completed", user_id: user.id, timestamp: new Date().toISOString() }
    ]);

    return new Response(JSON.stringify({ status: "success" }), { status: 200 });
  } catch (error) {
    // Error handling and logging
    await supabase.from("metrics").insert([
      { event: "onboarding_error", error: error.message, timestamp: new Date().toISOString() }
    ]);
    return new Response(JSON.stringify({ status: "error", error: error.message }), { status: 500 });
  }
});
