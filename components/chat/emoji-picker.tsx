"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Common emoji sets
const EMOJI_SETS = {
  smileys: ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘"],
  gestures: ["👍", "👎", "👌", "✌️", "🤞", "🤟", "🤘", "👏", "🙌", "👐", "🤲", "🤝", "🙏"],
  symbols: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "💔", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟"],
  objects: ["🎁", "🎈", "🎉", "🎊", "🎂", "🍰", "☕", "🍺", "🍷", "🍴", "🍕", "🍔", "🍟", "🌮", "🌯", "🍣", "🍦"],
}

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void
}

export function EmojiPicker({ onEmojiSelect }: EmojiPickerProps) {
  const [activeTab, setActiveTab] = useState("smileys")

  return (
    <Card className="w-64 p-2">
      <Tabs defaultValue="smileys" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="smileys">😀</TabsTrigger>
          <TabsTrigger value="gestures">👍</TabsTrigger>
          <TabsTrigger value="symbols">❤️</TabsTrigger>
          <TabsTrigger value="objects">🎁</TabsTrigger>
        </TabsList>
        {Object.entries(EMOJI_SETS).map(([category, emojis]) => (
          <TabsContent key={category} value={category} className="mt-2">
            <div className="grid grid-cols-7 gap-1">
              {emojis.map((emoji, index) => (
                <button
                  key={index}
                  className="h-8 w-8 flex items-center justify-center hover:bg-accent rounded-md"
                  onClick={() => onEmojiSelect(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </Card>
  )
}

