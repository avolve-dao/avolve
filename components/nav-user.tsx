'use client';

import { BadgeCheck, Bell, ChevronsUpDown, CreditCard, LogOut, Sparkles } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}) {
  const { isMobile, state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <SidebarMenu>
      <SidebarMenuItem className={isCollapsed ? 'w-10 mx-auto' : ''}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="rounded-lg transition-all duration-200 ease-out data-[state=open]:bg-zinc-100 dark:data-[state=open]:bg-zinc-800"
            >
              <Avatar className="h-8 w-8 rounded-full border border-zinc-200 dark:border-zinc-700">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-full text-xs font-medium">CN</AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <>
                  <div className="grid flex-1 text-left">
                    <span className="truncate font-medium text-sm">{user.name}</span>
                    <span className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                      {user.email}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                </>
              )}
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl p-1 apple-card"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-2 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-full border border-zinc-200 dark:border-zinc-700">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-full text-xs font-medium">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="my-1 bg-zinc-200/70 dark:bg-zinc-700/70" />
            <DropdownMenuGroup>
              <DropdownMenuItem className="rounded-lg apple-menu-item">
                <Sparkles className="mr-2 h-4 w-4 text-amber-500" />
                <span className="text-sm">Upgrade to Pro</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="my-1 bg-zinc-200/70 dark:bg-zinc-700/70" />
            <DropdownMenuGroup>
              <DropdownMenuItem className="rounded-lg apple-menu-item">
                <BadgeCheck className="mr-2 h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                <span className="text-sm">Account</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg apple-menu-item">
                <CreditCard className="mr-2 h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                <span className="text-sm">Billing</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg apple-menu-item">
                <Bell className="mr-2 h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                <span className="text-sm">Notifications</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="my-1 bg-zinc-200/70 dark:bg-zinc-700/70" />
            <DropdownMenuItem className="rounded-lg apple-menu-item text-red-500 dark:text-red-400">
              <LogOut className="mr-2 h-4 w-4" />
              <span className="text-sm">Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
