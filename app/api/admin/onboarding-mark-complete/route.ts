import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Database } from "@/types/supabase";

// POST /api/admin/onboarding-mark-complete
// Body: { userId: string }
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { userId } = await req.json();

  // Auth: Only admins can mark complete
  const {
    data: { user },
    error: authError,
  } = await (supabase as any).auth.getUser(); // TODO: Review type safety
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // Check admin role
  const { data: roles } = await (supabase as any)
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id);
  if (!Array.isArray(roles) || !roles.some(r => r && typeof r === 'object' && 'role' in r && r.role === "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Mark onboarding as complete
  // TODO: Restore type safety for user_onboarding update when types are in sync
  const { error: updateError } = await (supabase as any)
    .from("user_onboarding")
    .update({
      stage: "complete",
      marked_complete_by_admin_id: user.id as string,
      completed_at: new Date().toISOString(),
    })
    .eq("user_id", userId as string);
  if (updateError) {
    return NextResponse.json({ error: "Failed to mark onboarding complete." }, { status: 500 });
  }

  // Log admin action
  // TODO: Restore type safety for admin_actions insert when types are in sync
  await (supabase as any).from("admin_actions").insert([
    {
      user_id: userId as string,
      action_type: "mark_complete",
      performed_by: user.id as string,
      details: {},
    }
  ]);

  // Log gratitude event for admin recognition
  // TODO: Restore type safety for gratitude_events insert when types are in sync
  await (supabase as any).from("gratitude_events").insert([
    {
      recipient_id: user.id as string, // The admin being recognized
      giver_id: userId as string,      // The user whose onboarding was completed
      onboarding_id: null,             // Optionally, link to onboarding record if available
      reason: "onboarding_support",
      details: { action: "marked_complete", by_admin: user.id, for_user: userId },
    }
  ]);

  return NextResponse.json({ success: true });
}
