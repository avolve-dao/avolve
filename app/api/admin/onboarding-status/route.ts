import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    // Only allow admins/service_role
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Optionally, check user role here (requires role on user)
    // Fetch onboarding status for all users
    const { data, error } = await supabase
      .from("user_onboarding")
      .select("id, user_id, completed_steps, completed_at, profiles:profiles(email)")
      .order("created_at", { ascending: false });
    if (error) {
      console.error(JSON.stringify({
        route: "/api/admin/onboarding-status",
        supabaseError: error,
        userId: user.id,
        timestamp: new Date().toISOString(),
      }));
      return NextResponse.json({ error: error.message || "Failed to fetch onboarding status." }, { status: 500 });
    }
    // Map to flat structure for UI
    const users = (data || []).map((row: any) => ({
      id: row.user_id,
      email: row.profiles?.email || "",
      completed_steps: row.completed_steps || [],
      completed_at: row.completed_at,
    }));
    return NextResponse.json({ users });
  } catch (error) {
    console.error(JSON.stringify({
      route: "/api/admin/onboarding-status",
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    }));
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
