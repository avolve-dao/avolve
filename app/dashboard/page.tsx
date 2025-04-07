import { AppNavbar } from "../../components/app-navbar"
import { AppSidebar } from "../../components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { ThemeProvider } from "@/components/theme-provider"
import { 
  CommunityWidget, 
  EconomyWidget, 
  IdentityWidget, 
  GovernanceWidget, 
  NetworkWidget,
  MembershipWidget
} from "@/components/dashboard"

export default function Page() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="bg-zinc-50 dark:bg-zinc-900">
          <AppNavbar />
          <div className="flex flex-1 flex-col gap-4 p-4">
            <div className="grid auto-rows-min gap-4 md:grid-cols-3">
              <IdentityWidget />
              <MembershipWidget />
              <EconomyWidget />
            </div>
            <div className="grid auto-rows-min gap-4 md:grid-cols-3">
              <CommunityWidget />
              <GovernanceWidget />
              <NetworkWidget />
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ThemeProvider>
  )
}
