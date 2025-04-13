"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SidebarInsetProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function SidebarInset({ children, className, ...props }: SidebarInsetProps) {
  return (
    <div
      className={cn(
        "flex min-h-screen w-full flex-col transition-all duration-300",
        "ml-0 md:ml-[var(--sidebar-width)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
