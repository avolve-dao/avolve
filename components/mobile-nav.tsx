"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { mobileNavItems, isRouteActive } from "@/lib/navigation"
import { Badge } from "@/components/ui/badge"
import { Compass } from "lucide-react"
import Image from "next/image"
import * as React from "react"

export function MobileNav() {
  const pathname = usePathname()
  const [showAreaSelector, setShowAreaSelector] = React.useState(false)

  // Extract the current context from the pathname
  const getContextFromPathname = () => {
    if (pathname.startsWith('/personal')) return 'Personal';
    if (pathname.startsWith('/business')) return 'Business';
    if (pathname.startsWith('/supermind')) return 'Supermind';
    if (pathname.startsWith('/superachiever')) return 'Superachiever';
    if (pathname.startsWith('/superachievers')) return 'Superachievers';
    if (pathname.startsWith('/supercivilization')) return 'Supercivilization';
    return 'Dashboard';
  }

  const currentContext = getContextFromPathname();

  return (
    <>
      {/* Area selector overlay */}
      {showAreaSelector && (
        <div className="md:hidden fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm" onClick={() => setShowAreaSelector(false)}>
          <div className="absolute bottom-16 left-0 right-0 p-4" onClick={(e) => e.stopPropagation()}>
            <div className="bg-card rounded-lg border shadow-lg">
              <div className="p-3 border-b">
                <h3 className="font-semibold">Switch Area</h3>
                <p className="text-xs text-muted-foreground">Current: {currentContext}</p>
              </div>
              <div className="p-2 grid grid-cols-2 gap-2">
                <Link 
                  href="/superachiever" 
                  className={`p-3 rounded-md flex flex-col items-center text-center ${pathname.startsWith('/superachiever') ? 'bg-primary/10 text-primary' : 'hover:bg-accent'}`}
                  onClick={() => setShowAreaSelector(false)}
                >
                  <div className="h-8 w-8 mb-1 flex items-center justify-center">
                    <Image src="/icons/icon-superachiever.svg" alt="Superachiever" width={24} height={24} />
                  </div>
                  <span className="text-xs">Superachiever</span>
                </Link>
                <Link 
                  href="/personal" 
                  className={`p-3 rounded-md flex flex-col items-center text-center ${pathname.startsWith('/personal') ? 'bg-primary/10 text-primary' : 'hover:bg-accent'}`}
                  onClick={() => setShowAreaSelector(false)}
                >
                  <div className="h-8 w-8 mb-1 flex items-center justify-center">
                    <Image src="/icons/icon-personal-success-puzzle.svg" alt="Personal" width={24} height={24} />
                  </div>
                  <span className="text-xs">Personal</span>
                </Link>
                <Link 
                  href="/business" 
                  className={`p-3 rounded-md flex flex-col items-center text-center ${pathname.startsWith('/business') ? 'bg-primary/10 text-primary' : 'hover:bg-accent'}`}
                  onClick={() => setShowAreaSelector(false)}
                >
                  <div className="h-8 w-8 mb-1 flex items-center justify-center">
                    <Image src="/icons/icon-business-success-puzzle.svg" alt="Business" width={24} height={24} />
                  </div>
                  <span className="text-xs">Business</span>
                </Link>
                <Link 
                  href="/superachievers" 
                  className={`p-3 rounded-md flex flex-col items-center text-center ${pathname.startsWith('/superachievers') ? 'bg-primary/10 text-primary' : 'hover:bg-accent'}`}
                  onClick={() => setShowAreaSelector(false)}
                >
                  <div className="h-8 w-8 mb-1 flex items-center justify-center">
                    <Image src="/icons/icon-superachievers.svg" alt="Superachievers" width={24} height={24} />
                  </div>
                  <span className="text-xs">Superachievers</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom navigation bar */}
      <div className="md:hidden fixed bottom-0 left-0 z-50 w-full h-16 border-t bg-background">
        <div className="grid h-full grid-cols-5">
          {mobileNavItems.map((item, index) => {
            const isActive = isRouteActive(pathname, item.href)
            const Icon = item.icon

            // Use the middle slot for the area selector button
            if (index === 2) {
              return (
                <button
                  key="area-selector"
                  className="flex flex-col items-center justify-center text-xs font-medium transition-colors text-muted-foreground hover:text-foreground"
                  onClick={() => setShowAreaSelector(true)}
                >
                  <div className="relative">
                    <Compass className="h-5 w-5 mb-1" />
                  </div>
                  <span>{currentContext}</span>
                </button>
              )
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center text-xs font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <div className="relative">
                  <Icon className="h-5 w-5 mb-1" />
                  {item.badge && (
                    <Badge
                      className="absolute -top-1.5 -right-1.5 h-4 min-w-4 px-1 text-[10px] flex items-center justify-center"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </div>
                <span>{item.title}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}
