import Sidebar from "@/components/Sidebar";
import type { ReactNode } from "react";

export default function SupercivilizationLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-zinc-950">
      <Sidebar />
      <main className="flex-1 min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800 px-4 md:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
