'use client';

import { CreatePostWrapper } from "@/components/create-post-wrapper"
import type { User } from "@supabase/supabase-js"

interface CreateClientPageProps {
  user: User;
}

export default function CreateClientPage({ user }: CreateClientPageProps) {
  return (
    <div className="container max-w-2xl py-6">
      <h1 className="text-2xl font-bold mb-6">Create Post</h1>
      <CreatePostWrapper serverUser={user} />
    </div>
  )
}
