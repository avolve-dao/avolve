import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Database } from "@/types/supabase";

// POST /api/admin/onboarding-assign-support
// Body: { userId: string, supportAdminId?: string }
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { userId, supportAdminId } = await req.json();

  // Auth: Only admins can assign support
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
    .eq("user_id", user.id); // TODO: Review type safety
  if (!Array.isArray(roles) || !roles.some(r => r && typeof r === 'object' && 'role' in r && r.role === "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Assign support_admin_id
  const adminId = supportAdminId || user.id;
  // TODO: Restore type safety for user_onboarding update when types are in sync
  const { error: updateError } = await (supabase as any)
    .from("user_onboarding")
    .update({ support_admin_id: adminId })
    .eq("user_id", userId);
  if (updateError) {
    return NextResponse.json({ error: "Failed to assign support admin." }, { status: 500 });
  }

  // Log admin action
  await (supabase as any).from("admin_actions").insert([
    {
      user_id: userId,
      action_type: "assign_support",
      performed_by: user.id,
      details: { support_admin_id: adminId },
    },
  ]); // TODO: Review type safety

  return NextResponse.json({ success: true });
}
