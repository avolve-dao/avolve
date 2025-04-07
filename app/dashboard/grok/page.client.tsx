'use client';

import { ImmersiveGrok } from "@/components/grok/immersive-grok"

interface GrokClientPageProps {
  userId: string;
  userName: string;
  userAvatar?: string;
}

export default function GrokClientPage({ userId, userName, userAvatar }: GrokClientPageProps) {
  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Grok AI Experience</h1>
          <p className="text-muted-foreground">Your personalized AI companion that understands your social context</p>
        </div>

        <ImmersiveGrok
          userId={userId}
          userName={userName}
          userAvatar={userAvatar}
        />
      </div>
    </div>
  )
}
