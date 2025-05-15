"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"

interface User {
  id: string
  full_name: string
  avatar_url: string | null
}

export function UserSearch({ currentUserId }: { currentUserId: string }) {
  const supabase = createClient()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (searchQuery.length < 2) {
      setUsers([])
      return
    }

    const fetchUsers = async () => {
      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .neq("id", currentUserId)
          .ilike("full_name", `%${searchQuery}%`)
          .limit(5)

        if (error) {
          console.error("Error searching users:", error)
          return
        }

        setUsers(data || [])
      } catch (error) {
        console.error("Error searching users:", error)
      } finally {
        setIsLoading(false)
      }
    }

    const timer = setTimeout(() => {
      fetchUsers()
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, currentUserId, supabase])

  const handleStartChat = (userId: string) => {
    router.push(`/messages/${userId}`)
  }

  return (
    <div className="w-full">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search users..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {searchQuery.length >= 2 && (
        <div className="mt-2 rounded-md border bg-card shadow-sm">
          {isLoading ? (
            <div className="p-2 space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-2 p-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
          ) : users.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground text-center">No users found</p>
          ) : (
            <div className="p-2">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-2 hover:bg-accent rounded-md cursor-pointer"
                  onClick={() => handleStartChat(user.id)}
                >
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar_url || undefined} />
                      <AvatarFallback>
                        {user.full_name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{user.full_name}</span>
                  </div>
                  <Button size="sm" variant="ghost">
                    Message
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
