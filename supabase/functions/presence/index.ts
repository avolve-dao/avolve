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
    const { action, userId, roomId, status } = await req.json()

    // Process different presence actions
    switch (action) {
      case "join":
        await joinRoom(supabaseClient, userId, roomId)
        break
      case "leave":
        await leaveRoom(supabaseClient, userId, roomId)
        break
      case "update_status":
        await updateStatus(supabaseClient, userId, roomId, status)
        break
      case "get_online_users":
        const users = await getOnlineUsers(supabaseClient, roomId)
        return new Response(JSON.stringify({ users }), {
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

async function joinRoom(supabaseClient, userId, roomId) {
  // Check if user already has a presence record for this room
  const { data } = await supabaseClient.from("presence").select("id").eq("user_id", userId).eq("room", roomId).single()

  if (data) {
    // Update existing record
    await supabaseClient
      .from("presence")
      .update({
        status: "online",
        last_seen_at: new Date().toISOString(),
      })
      .eq("id", data.id)
  } else {
    // Create new record
    await supabaseClient.from("presence").insert({
      user_id: userId,
      room: roomId,
      status: "online",
      last_seen_at: new Date().toISOString(),
    })
  }

  // Broadcast to channel
  await supabaseClient.channel(roomId).send({
    type: "broadcast",
    event: "presence",
    payload: {
      userId,
      status: "online",
      action: "join",
    },
  })
}

async function leaveRoom(supabaseClient, userId, roomId) {
  // Update presence record
  await supabaseClient
    .from("presence")
    .update({
      status: "offline",
      last_seen_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .eq("room", roomId)

  // Broadcast to channel
  await supabaseClient.channel(roomId).send({
    type: "broadcast",
    event: "presence",
    payload: {
      userId,
      status: "offline",
      action: "leave",
    },
  })
}

async function updateStatus(supabaseClient, userId, roomId, status) {
  // Update presence record
  await supabaseClient
    .from("presence")
    .update({
      status,
      last_seen_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .eq("room", roomId)

  // Broadcast to channel
  await supabaseClient.channel(roomId).send({
    type: "broadcast",
    event: "presence",
    payload: {
      userId,
      status,
      action: "update",
    },
  })
}

async function getOnlineUsers(supabaseClient, roomId) {
  // Get online users in the room
  const { data } = await supabaseClient
    .from("presence")
    .select("*, profiles(id, full_name, avatar_url)")
    .eq("room", roomId)
    .in("status", ["online", "away"])
    .order("last_seen_at", { ascending: false })

  return data.map((presence) => ({
    id: presence.user_id,
    name: presence.profiles?.full_name || "Unknown",
    avatarUrl: presence.profiles?.avatar_url,
    status: presence.status,
    lastSeen: presence.last_seen_at,
  }))
}
