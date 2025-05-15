import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    )

    // Get the request body
    const { action, userId, notificationId } = await req.json()

    // Process different notification actions
    switch (action) {
      case "mark_read":
        await markNotificationRead(supabaseClient, userId, notificationId)
        break
      case "mark_all_read":
        await markAllNotificationsRead(supabaseClient, userId)
        break
      case "delete":
        await deleteNotification(supabaseClient, userId, notificationId)
        break
      case "get_unread_count":
        const count = await getUnreadCount(supabaseClient, userId)
        return new Response(JSON.stringify({ count }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
      default:
        return new Response(JSON.stringify({ error: "Unknown action" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})

async function markNotificationRead(supabaseClient, userId, notificationId) {
  await supabaseClient.from("notifications").update({ is_read: true }).eq("id", notificationId).eq("user_id", userId)
}

async function markAllNotificationsRead(supabaseClient, userId) {
  await supabaseClient.from("notifications").update({ is_read: true }).eq("user_id", userId).eq("is_read", false)
}

async function deleteNotification(supabaseClient, userId, notificationId) {
  await supabaseClient.from("notifications").delete().eq("id", notificationId).eq("user_id", userId)
}

async function getUnreadCount(supabaseClient, userId) {
  const { count } = await supabaseClient
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false)

  return count
}
