"use client";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Users, MessageCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Explicit post type
interface Post {
  id: string;
  user: string;
  avatar: string;
  content: string;
  reactions: number;
  badge: string;
  time: string;
  type: string;
  isNew?: boolean;
}

// Placeholder for seeded content
const seededPosts: Post[] = [
  {
    id: "founder1",
    user: "Founder",
    avatar: "F",
    content: "Welcome to Supercivilization! Share your intention for today and help us build the future.",
    reactions: 5,
    badge: "Founding Member",
    time: "just now",
    type: "intention",
  },
  {
    id: "ai1",
    user: "AvolveAI",
    avatar: "A",
    content: "Prompt: What is one regenerative action you’ll take this week?",
    reactions: 3,
    badge: "AI",
    time: "2m ago",
    type: "reflection",
  },
  {
    id: "future1",
    user: "Future",
    avatar: "F",
    content: "This is a future post type.",
    reactions: 0,
    badge: "Future",
    time: "1m ago",
    type: "future",
  },
];

// Helper function to get week number
function getWeek(d: Date) {
  const oneJan = new Date(d.getFullYear(), 0, 1);
  return Math.ceil((((d.getTime() - oneJan.getTime()) / 86400000) + oneJan.getDay() + 1) / 7);
}

// Logic for weekly rotation of seeded posts (timestamp/admin toggle)
const getSeededPosts = () => {
  const now = new Date();
  const weekNumber = getWeek(now);
  const adminToggle = false; // Replace with actual admin toggle logic

  if (adminToggle || weekNumber % 2 === 0) {
    return seededPosts;
  } else {
    return seededPosts.map(post => ({ ...post, content: `Rotated ${post.content}` }));
  }
};

export default function SupercivilizationFeed() {
  const [realPosts, setRealPosts] = useState<Post[]>([]);
  const [posts, setPosts] = useState<Post[]>(getSeededPosts());
  const [input, setInput] = useState("");
  const [posting, setPosting] = useState(false);

  // --- MVP LAUNCH POLISH: FEED ---
  // Only show MVP feed features. Hide or gray out future feed/post types, filters, or actions.

  const MVP_POST_TYPES = ['intention', 'reflection', 'reward'];

  const filteredPosts = posts.filter(post => MVP_POST_TYPES.includes(post.type));

  // Add user post
  const handlePost = () => {
    if (!input.trim()) return;
    setPosting(true);
    setTimeout(() => {
      const newPost: Post = {
        id: `user-${Date.now()}`,
        user: "You",
        avatar: "Y",
        content: input,
        reactions: 0,
        badge: "Superachiever",
        time: "just now",
        type: "intention",
        isNew: true,
      };
      setRealPosts([newPost, ...realPosts]);
      setInput("");
      setPosting(false);
    }, 500);
  };

  useEffect(() => {
    if (realPosts.length > 0) {
      setPosts(realPosts);
    } else {
      setPosts(getSeededPosts());
    }
  }, [realPosts]);

  return (
    <section className="max-w-3xl mx-auto p-4 md:p-6 lg:p-8">
      <Card className="mb-8 bg-gradient-to-br from-fuchsia-950/80 to-zinc-900/80 border-fuchsia-900">
        <CardHeader className="flex flex-row items-center gap-3 pb-2">
          <Sparkles className="text-fuchsia-400 w-6 h-6" aria-label="Supercivilization Feed" role="img" />
          <span className="text-xl font-bold text-fuchsia-200">Supercivilization Feed</span>
          <Badge className="ml-auto bg-fuchsia-700/80 text-xs" aria-label="Live feed">Live</Badge>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              className="flex-1 rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-2 text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-400 focus-visible:ring-2 focus-visible:ring-fuchsia-400"
              placeholder={realPosts.length > 0 ? "Share your intention, win, or question..." : "Be the first to post!"}
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={posting}
              maxLength={180}
              aria-label="Post input"
              role="textbox"
            />
            <Button
              onClick={handlePost}
              disabled={posting || !input.trim()}
              className="ml-2 bg-fuchsia-500 hover:bg-fuchsia-600 focus-visible:ring-2 focus-visible:ring-fuchsia-400"
              aria-label="Post button"
              role="button"
            >
              {posting ? "Posting..." : "Post"}
            </Button>
          </div>
          <div className="space-y-4">
            {filteredPosts.map(post => (
              <Card key={post.id} className="bg-zinc-900/80 border-zinc-800" role="article" aria-label={`Post by ${post.user}`}>
                <CardHeader className="flex flex-row items-center gap-3 pb-1">
                  <Avatar className="w-8 h-8" aria-label={post.user} role="img">
                    <AvatarFallback>{post.avatar}</AvatarFallback>
                  </Avatar>
                  <span className="font-semibold text-fuchsia-300">{post.user}</span>
                  <Badge className="ml-2 bg-fuchsia-800/70 text-xs" aria-label={post.badge}>{post.badge}</Badge>
                  {post.isNew && <Badge className="ml-2 bg-fuchsia-500 text-xs" aria-label="New post">New!</Badge>}
                  <span className="ml-auto text-xs text-zinc-400">{post.time}</span>
                </CardHeader>
                <CardContent className="text-zinc-100 pb-2">{post.content}</CardContent>
                <div className="flex items-center gap-2 px-4 pb-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-fuchsia-400 hover:bg-fuchsia-950 focus-visible:ring-2 focus-visible:ring-fuchsia-400"
                    aria-label="React button"
                    role="button"
                  >
                    <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
                  </Button>
                  <span className="text-xs text-zinc-400">{post.reactions} Cheers</span>
                </div>
              </Card>
            ))}
            {posts.some(post => !MVP_POST_TYPES.includes(post.type)) && (
              <div className="opacity-50 text-xs text-gray-400 mt-4">More post types coming soon…</div>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
