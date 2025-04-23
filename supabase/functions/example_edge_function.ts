// Example Supabase Edge Function (Deno)
// Purpose: Validate and transform new Supercivilization Feed posts before insert
// Follows best practices from https://supabase.com/blog/supabase-edge-functions-deploy-dashboard-deno-2-1
//
// To deploy: supabase functions deploy example_edge_function

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { content } = await req.json();
  if (!content || typeof content !== "string" || content.length < 3) {
    return new Response(JSON.stringify({ error: "Content too short" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Optionally transform content (e.g., sanitize, add hashtags)
  const sanitized = content.trim().replace(/\s+/g, " ");

  // Return the sanitized content for insertion
  return new Response(JSON.stringify({ content: sanitized }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
