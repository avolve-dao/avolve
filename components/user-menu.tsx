"use client"

import { useUser } from "@/contexts/user-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { User, Settings, Wallet, LogOut } from "lucide-react"
import { ROUTES } from "@/constants"

export function UserMenu() {
  const { user, profile, isLoading } = useUser()
  const router = useRouter()
  const supabase = createClient()

  if (isLoading) {
    return (
      <Avatar className="h-8 w-8">
        <AvatarFallback>...</AvatarFallback>
      </Avatar>
    )
  }

  if (!user || !profile) {
    return null
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push(ROUTES.LOGIN)
  }

  const getInitials = () => {
    if (profile.full_name) {
      return profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
    }

    return profile.username.substring(0, 2).toUpperCase()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile.avatar_url || ""} alt={profile.username} />
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{profile.full_name || profile.username}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push(ROUTES.PROFILE)}>
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push(ROUTES.WALLET)}>
          <Wallet className="mr-2 h-4 w-4" />
          <span>Wallet</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/settings")}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
