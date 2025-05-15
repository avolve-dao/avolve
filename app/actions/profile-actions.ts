"use server"

import { z } from "zod"
import { createAction } from "@/lib/actions"
import { requireAuth } from "@/lib/auth/server-auth"

// Profile update schema
const profileUpdateSchema = z.object({
  id: z.string().uuid(),
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  bio: z.string().max(160, "Bio must be less than 160 characters").optional(),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
})

export const updateProfile = await createAction(
  async (data, supabase) => {
    // Ensure user is authenticated
    const session = await requireAuth()

    // Ensure user can only update their own profile
    if (data.id !== session.user.id) {
      throw new Error("You can only update your own profile")
    }

    // Update profile
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: data.full_name,
        username: data.username,
        bio: data.bio || null,
        website: data.website || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.id)

    if (error) {
      throw error
    }

    return { message: "Profile updated successfully" }
  },
  {
    schema: profileUpdateSchema,
    revalidatePaths: ["/profile"],
  },
)
