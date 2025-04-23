"use client";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Users, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Simulate collective progress for MVP
const TOTAL_GOAL = 100;
const INITIAL_PROGRESS = 37;

export default function CollectiveProgressBar() {
  const [progress, setProgress] = useState(INITIAL_PROGRESS);

  // Simulate real-time growth
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => (prev < TOTAL_GOAL ? prev + Math.floor(Math.random() * 2) : prev));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const percent = Math.min(100, Math.round((progress / TOTAL_GOAL) * 100));

  return (
    <Card className="mb-8 bg-gradient-to-r from-fuchsia-900/80 to-zinc-900/80 border-fuchsia-900">
      <CardHeader className="flex flex-row items-center gap-3 pb-2">
        <Users className="text-fuchsia-400 w-5 h-5" />
        <span className="text-lg font-bold text-fuchsia-200">Collective Progress</span>
        <Badge className="ml-auto bg-fuchsia-700/80 text-xs">{progress} / {TOTAL_GOAL}</Badge>
      </CardHeader>
      <CardContent>
        <div className="w-full bg-zinc-800 rounded-full h-4 overflow-hidden relative">
          <div
            className={cn(
              "h-4 rounded-full transition-all duration-700",
              percent === 100 ? "bg-gradient-to-r from-fuchsia-400 to-yellow-300" : "bg-fuchsia-500/80"
            )}
            style={{ width: `${percent}%` }}
          />
          {percent === 100 && (
            <Trophy className="absolute right-2 top-1/2 -translate-y-1/2 text-yellow-300 w-6 h-6 animate-bounce" />
          )}
        </div>
        <div className="mt-2 text-xs text-zinc-400">
          Together, we've completed <span className="text-fuchsia-300 font-bold">{progress}</span> actions toward Supercivilization this week!
        </div>
      </CardContent>
    </Card>
  );
}
