'use client';

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { clientDb } from '@/lib/db';
import Link from 'next/link';

interface SuggestedUsersProps {
  suggestedUsers?: any[];
  currentUserId?: string;
}

export function SuggestedUsers({ suggestedUsers = [], currentUserId }: SuggestedUsersProps) {
  const [followingState, setFollowingState] = useState<Record<string, boolean>>({});
  const [users, setUsers] = useState(suggestedUsers);

  // If no suggested users were passed, fetch them client-side
  useEffect(() => {
    if (suggestedUsers.length === 0 && currentUserId) {
      const fetchUsers = async () => {
        const data = await clientDb.getSuggestedUsers(currentUserId, 5);
        setUsers(Array.isArray(data) ? data : []);
      };
      fetchUsers();
    }
  }, [suggestedUsers, currentUserId]);

  const handleFollow = async (userId: string) => {
    if (!currentUserId) return;

    try {
      const isFollowing = await clientDb.followUser(currentUserId, userId);
      setFollowingState(prev => ({
        ...prev,
        [userId]: isFollowing,
      }));
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  if (users.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Suggested for you</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {users.map(user => (
          <div key={user.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={user.avatar_url} alt={user.full_name || user.username} />
                <AvatarFallback>
                  {(user.full_name || user.username)?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="text-sm">
                <Link
                  href={`/dashboard/profile/${user.id}`}
                  className="font-medium hover:underline"
                >
                  {user.full_name || user.username}
                </Link>
                <p className="text-xs text-muted-foreground">@{user.username}</p>
              </div>
            </div>
            <Button
              size="sm"
              variant={followingState[user.id] ? 'outline' : 'default'}
              className="h-8"
              onClick={() => handleFollow(user.id)}
            >
              {followingState[user.id] ? 'Following' : 'Follow'}
            </Button>
          </div>
        ))}
        <Button variant="ghost" size="sm" className="w-full text-xs">
          View More
        </Button>
      </CardContent>
    </Card>
  );
}
