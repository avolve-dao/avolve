"use client"

import { ChevronRight, TypeIcon as type, type LucideIcon } from 'lucide-react'

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
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:!p-0">
      <SidebarGroupLabel className="text-xs font-medium text-zinc-500 dark:text-zinc-400 px-3 py-1.5 group-data-[collapsible=icon]:hidden">
        Platform
      </SidebarGroupLabel>
      <SidebarMenu className="group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:items-center">
        {items.map((item) => (
          <Collapsible key={item.title} asChild defaultOpen={item.isActive} className="group/collapsible group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
            <SidebarMenuItem className="group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:!m-0 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:mx-auto">
              <CollapsibleTrigger asChild>
                <SidebarMenuButton
                  tooltip={item.title}
                  className="rounded-lg transition-all duration-200 ease-out data-[active=true]:bg-zinc-100 dark:data-[active=true]:bg-zinc-800 data-[active=true]:text-zinc-900 dark:data-[active=true]:text-zinc-50 group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center"
                >
                  {item.icon && (
                    <item.icon className="h-4 w-4 text-zinc-500 dark:text-zinc-400 group-data-[collapsible=icon]:h-5 group-data-[collapsible=icon]:w-5" />
                  )}
                  <span className="text-sm font-medium group-data-[collapsible=icon]:hidden">{item.title}</span>
                  <ChevronRight className="ml-auto h-4 w-4 text-zinc-400 dark:text-zinc-500 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub className="ml-4 border-l border-zinc-200 dark:border-zinc-700 pl-2">
                  {item.items?.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.title}>
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
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
