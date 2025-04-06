"use client"

import { ChevronRight, LayoutDashboard, type LucideIcon } from 'lucide-react'

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    isDashboard?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  // Separate dashboard items from regular items
  const dashboardItems = items.filter(item => item.title === "Dashboard");
  const regularItems = items.filter(item => item.title !== "Dashboard");

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:!p-0">
      <SidebarGroupLabel className="text-xs font-medium text-zinc-500 dark:text-zinc-400 px-3 py-1.5 group-data-[collapsible=icon]:hidden">
        Platform
      </SidebarGroupLabel>
      
      {/* Dashboard Items - No dropdown */}
      <SidebarMenu>
        {dashboardItems.map((item) => (
          <SidebarMenuItem key={item.url}>
            <SidebarMenuButton
              asChild
              isActive={item.isActive}
              tooltip={item.title}
              className="w-full justify-start gap-2"
            >
              <a href={item.url}>
                <LayoutDashboard className="h-4 w-4" />
                <span>{item.title}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
      
      {/* Regular Items - With dropdowns if they have subitems */}
      <SidebarMenu>
        {regularItems.map((item) => (
          <Collapsible key={item.url} asChild>
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton
                  asChild
                  isActive={item.isActive}
                  tooltip={item.title}
                  className="w-full justify-start gap-2"
                >
                  <a href={item.url}>
                    {item.icon && <item.icon className="h-4 w-4" />}
                    <span>{item.title}</span>
                    {item.items && item.items.length > 0 && (
                      <ChevronRight className="ml-auto h-4 w-4 text-zinc-400 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                    )}
                  </a>
                </SidebarMenuButton>
              </CollapsibleTrigger>
              {item.items && item.items.length > 0 && (
                <CollapsibleContent asChild>
                  <SidebarMenuSub>
                    {item.items.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.url}>
                        <SidebarMenuSubButton
                          asChild
                          className="rounded-md text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors duration-200"
                        >
                          <a href={subItem.url}>
                            <span>{subItem.title}</span>
                          </a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              )}
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
