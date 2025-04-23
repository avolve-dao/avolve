"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { featureFlags } from "./featureFlags";
import { cn } from "@/lib/utils";
import { Lock, Sparkles, Loader2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState } from "react";

const navItems = [
  {
    label: "Supercivilization",
    href: "/supercivilization",
    unlocked: true,
    icon: <Sparkles className="w-5 h-5" />,
    tooltip: "Your journey begins here!",
  },
  {
    label: "Superachiever",
    href: "/superachiever",
    unlocked: featureFlags.superachieverRoute,
    icon: <Lock className="w-5 h-5" />,
    tooltip: "Unlock by completing onboarding.",
    comingSoon: false,
    unlockCriteria: "Complete onboarding",
    progress: 0,
    required: 100,
  },
  {
    label: "Superachievers",
    href: "/superachievers",
    unlocked: featureFlags.superachieversRoute,
    icon: <Lock className="w-5 h-5" />,
    tooltip: "Unlock by posting your first intention.",
    comingSoon: false,
    unlockCriteria: "Post your first intention",
    progress: 0,
    required: 100,
  },
  {
    label: "Supermind",
    href: "#",
    unlocked: featureFlags.supermindRoute,
    icon: <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />,
    tooltip: "Coming soon!",
    comingSoon: true,
  },
  {
    label: "Superpuzzle",
    href: "#",
    unlocked: featureFlags.superpuzzleRoute,
    icon: <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />,
    tooltip: "Coming soon!",
    comingSoon: true,
  },
  {
    label: "Admin",
    href: "/app/(authenticated)/admin",
    unlocked: true,
    icon: <Lock className="w-5 h-5 text-orange-400" />,
    tooltip: "Admin Dashboard",
    comingSoon: false,
    adminOnly: true,
  },
];

type Feature = typeof navItems[number];

export default function Sidebar() {
  const pathname = usePathname();
  const [earlyAccessModalOpen, setEarlyAccessModalOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);

  const openEarlyAccessModal = (feature: Feature) => {
    setSelectedFeature(feature);
    setEarlyAccessModalOpen(true);
  };

  // --- MVP LAUNCH POLISH ---
  // 1. Only show MVP features in sidebar.
  // 2. Hide non-MVP features for regular users; show as 'Coming Soon' if desired.
  // 3. Only show admin/moderator links for users with admin role.

  // Filter navItems for MVP features only
  const MVP_FEATURES = ['Supercivilization', 'Superachiever', 'Superachievers'];
  const isAdmin = /* logic to determine admin role, e.g. from user context */ false;

  const filteredNavItems = navItems.filter(item =>
    MVP_FEATURES.includes(item.label) || (item.adminOnly && isAdmin)
  );

  return (
    <aside
      className="h-full w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col py-8 px-4 md:w-full md:border-0 md:py-4 md:px-2"
      aria-label="Sidebar navigation"
    >
      <div className="mb-10 text-2xl font-extrabold text-fuchsia-400 tracking-wide">
        Avolve
      </div>
      <nav
        className="flex flex-col gap-2"
        aria-label="Main navigation"
        role="navigation"
      >
        <TooltipProvider>
          {filteredNavItems.map((item) => (
            <Tooltip key={item.label}>
              <TooltipTrigger asChild>
                <div>
                  {item.unlocked ? (
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-4 py-2 rounded-lg text-lg font-semibold transition-all focus-visible:ring-2 focus-visible:ring-fuchsia-500",
                        pathname === item.href
                          ? "bg-fuchsia-900 text-fuchsia-200 shadow"
                          : "text-zinc-100 hover:bg-zinc-900 hover:text-fuchsia-300"
                      )}
                      tabIndex={0}
                      aria-disabled={false}
                      aria-label={item.label}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                      {item.comingSoon && (
                        <span className="ml-2 text-xs bg-zinc-700 text-zinc-200 rounded px-2 py-0.5">Coming Soon</span>
                      )}
                    </Link>
                  ) : (
                    <div className="locked-feature">
                      <h3>{item.label}</h3>
                      <p>Coming Soon</p>
                    </div>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                {item.tooltip}
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </nav>
      {earlyAccessModalOpen && selectedFeature && (
        <div
          className="early-access-modal fixed top-0 left-0 w-full h-full bg-zinc-900 bg-opacity-50 flex justify-center items-center"
          aria-modal="true"
          aria-labelledby="early-access-modal-title"
          role="dialog"
        >
          <div className="bg-zinc-950 p-8 rounded-lg w-full max-w-md">
            <h2 id="early-access-modal-title" className="text-2xl font-bold mb-4">
              Request Early Access for {selectedFeature.label}
            </h2>
            <p>
              We are currently working on {selectedFeature.label}. If you would like to request early access, please fill out the form below.
            </p>
            {/* Add form here */}
            <button
              onClick={() => setEarlyAccessModalOpen(false)}
              aria-label="Close early access modal"
              className="focus-visible:ring-2 focus-visible:ring-fuchsia-500"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
