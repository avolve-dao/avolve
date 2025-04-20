// app/api/user/profile/route.ts
"use server"

import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { getCachedData, setCachedData, generateCacheKey } from "@/lib/cache"

/**
 * GET /api/user/profile
 * Get profile information for the authenticated user
 */
export async function GET(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Generate a cache key based on the user ID
    const cacheKey = generateCacheKey('api/user/profile', { userId: user.id });
    
    // Check if data is in cache
    const cachedProfile = await getCachedData(cacheKey);
    if (cachedProfile) {
      return NextResponse.json({ data: cachedProfile });
    }

    // Get profile data from the profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError)
      return NextResponse.json(
        { error: "Failed to fetch profile" },
        { status: 500 }
      )
    }

    // Store the result in cache with a TTL of 10 minutes (600 seconds)
    await setCachedData(cacheKey, profile, 600);
    
    return NextResponse.json({ data: profile })
  } catch (error) {
    console.error(JSON.stringify({
      route: '/api/user/profile',
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    }));
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}

/**
 * POST /api/user/profile
 * Update profile information for the authenticated user
 */
export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    const updates: Record<string, any> = {};
    if (typeof body.name === "string" && body.name.trim().length > 0) {
      updates.full_name = body.name.trim();
    }
    if (Array.isArray(body.interests)) {
      updates.interests = body.interests;
    }
    if (typeof body.group === "string" && body.group.trim().length > 0) {
      updates.group = body.group.trim();
    }
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid fields provided." }, { status: 400 });
    }
    const { error: updateError } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id);
    if (updateError) {
      console.error(JSON.stringify({
        route: "/api/user/profile",
        supabaseError: updateError,
        userId: user.id,
        input: body,
        timestamp: new Date().toISOString(),
      }));
      return NextResponse.json({ error: updateError.message || "Failed to update profile." }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(JSON.stringify({
      route: "/api/user/profile",
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    }));
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
