"use client";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const milestones = [
  { label: "Joined Supercivilization", achieved: true },
  { label: "Posted First Intention", achieved: false },
  { label: "Unlocked Superachiever", achieved: false },
  { label: "Completed Profile", achieved: false },
  { label: "Invited a Friend", achieved: false },
];

export default function PersonalProgressTracker() {
  const [userMilestones, setUserMilestones] = useState(milestones);

  // Simulate progress for MVP demo
  useEffect(() => {
    // TODO: Replace with real user data fetch
    setTimeout(() => {
      setUserMilestones((prev) => prev.map((m, i) => ({ ...m, achieved: i < 2 })));
    }, 1500);
  }, []);

  return (
    <Card className="mb-8 bg-zinc-900/80 border-fuchsia-900">
      <CardHeader className="flex flex-row items-center gap-3 pb-2">
        <Sparkles className="text-fuchsia-400 w-5 h-5" />
        <span className="text-lg font-bold text-fuchsia-200">Your Journey</span>
        <Badge className="ml-auto bg-fuchsia-700/80 text-xs">Progress</Badge>
      </CardHeader>
      <CardContent>
        <ol className="space-y-2">
          {userMilestones.map((m, idx) => (
            <li key={m.label} className="flex items-center gap-3">
              <span className={cn("w-6 h-6 flex items-center justify-center rounded-full border-2", m.achieved ? "bg-fuchsia-500 border-fuchsia-500 text-white" : "bg-zinc-800 border-zinc-700 text-zinc-400")}>{m.achieved ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}</span>
              <span className={cn("font-medium", m.achieved ? "text-fuchsia-100" : "text-zinc-400")}>{m.label}</span>
              {m.achieved && <Badge className="ml-2 bg-fuchsia-800/70 text-xs">Achieved</Badge>}
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
