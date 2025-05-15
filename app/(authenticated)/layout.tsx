import type React from "react"
import { UnifiedNavigation } from "@/components/unified-navigation"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { WelcomeModal } from "@/components/tour/welcome-modal"

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <UnifiedNavigation />
      <main className="pb-16 md:pb-0">{children}</main>
      <MobileBottomNav />
      <WelcomeModal />
    </div>
  )
}
