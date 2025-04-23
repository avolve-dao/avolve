import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    // Only allow admins/service_role
    const { data: { user }, error: authError } = await (supabase as any).auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Optionally, check user role here (requires role on user)
    // Fetch user roles for all users
    const { data: rolesData, error: rolesError } = await (supabase as any)
      .from("user_roles")
      .select("user_id, role");
    if (rolesError) {
      return NextResponse.json({ error: rolesError.message || "Failed to fetch user roles." }, { status: 500 });
    }
    // Fetch onboarding status for all users, joining profiles and admin profiles
    const { data, error } = await (supabase as any)
      .from("user_onboarding")
      .select(`
        id,
        user_id,
        completed_steps,
        completed_at,
        support_admin_id,
        marked_complete_by_admin_id,
        profiles:profiles(email, full_name, created_at),
        support_admin:profiles!user_onboarding_support_admin_id_fkey(email, full_name),
        marked_complete_admin:profiles!user_onboarding_marked_complete_by_admin_id_fkey(email, full_name)
      `)
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
    // Map to flat structure for UI, merge roles
    const users = (data || []).map((row: any) => {
      const userRole = rolesData?.find((r: any) => r.user_id === row.user_id)?.role || "user";
      const currentStep = Array.isArray(row.completed_steps) && row.completed_steps.length > 0
        ? row.completed_steps[row.completed_steps.length - 1]
        : null;
      return {
        id: row.user_id,
        email: row.profiles?.email || "",
        name: row.profiles?.full_name || "",
        role: userRole,
        date_joined: row.profiles?.created_at || null,
        completed_steps: row.completed_steps || [],
        current_step: currentStep,
        completed_at: row.completed_at,
        support_admin_id: row.support_admin_id || null,
        support_admin_name: row.support_admin?.full_name || row.support_admin?.email || null,
        marked_complete_by_admin_id: row.marked_complete_by_admin_id || null,
        marked_complete_admin_name: row.marked_complete_admin?.full_name || row.marked_complete_admin?.email || null,
      };
    });
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
