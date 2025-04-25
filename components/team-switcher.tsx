'use client';

import * as React from 'react';
import { ChevronsUpDown, Plus } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

export function TeamSwitcher({
  teams,
}: {
  teams: {
    name: string;
    logo: React.ElementType;
    plan: string;
  }[];
}) {
  const { isMobile } = useSidebar();
  const [activeTeam, setActiveTeam] = React.useState(teams[0]);

  if (!activeTeam) {
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="rounded-lg transition-all duration-200 ease-out data-[state=open]:bg-zinc-100 dark:data-[state=open]:bg-zinc-800"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900">
                <activeTeam.logo className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{activeTeam.name}</span>
                <span className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                  {activeTeam.plan}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 text-zinc-500 dark:text-zinc-400" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl p-1 apple-card"
            align="start"
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuLabel className="px-2 py-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Teams
            </DropdownMenuLabel>
            {teams.map((team, index) => (
              <DropdownMenuItem
                key={team.name}
                onClick={() => setActiveTeam(team)}
                className="gap-2 p-2 rounded-lg apple-menu-item"
              >
                <div className="flex size-6 items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800">
                  <team.logo className="size-4 shrink-0 text-zinc-700 dark:text-zinc-300" />
                </div>
                <span className="text-sm">{team.name}</span>
                <DropdownMenuShortcut className="text-xs text-zinc-500 dark:text-zinc-400">
                  ⌘{index + 1}
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator className="my-1 bg-zinc-200/70 dark:bg-zinc-700/70" />
            <DropdownMenuItem className="gap-2 p-2 rounded-lg apple-menu-item">
              <div className="flex size-6 items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800">
                <Plus className="size-4 text-zinc-700 dark:text-zinc-300" />
              </div>
              <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Add team</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
