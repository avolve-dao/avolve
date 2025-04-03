"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Paintbrush } from "lucide-react"
import { useTheme } from "@/contexts/theme-context"

export function ThemeSelector() {
  const { theme, setTheme } = useTheme()

  const themes = [
    { id: "default", name: "Default" },
    { id: "dark", name: "Dark" },
    { id: "light", name: "Light" },
    { id: "blue", name: "Blue" },
    { id: "purple", name: "Purple" },
    { id: "green", name: "Green" },
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Paintbrush className="h-5 w-5" />
          <span className="sr-only">Change theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {themes.map((t) => (
          <DropdownMenuItem
            key={t.id}
            onClick={() => setTheme(t.id as any)}
            className={theme === t.id ? "bg-accent" : ""}
          >
            <div className="flex items-center">
              <div
                className={`w-4 h-4 rounded-full mr-2 ${
                  t.id === "default"
                    ? "bg-primary"
                    : t.id === "dark"
                      ? "bg-slate-800"
                      : t.id === "light"
                        ? "bg-slate-200"
                        : t.id === "blue"
                          ? "bg-blue-600"
                          : t.id === "purple"
                            ? "bg-purple-600"
                            : "bg-emerald-600"
                }`}
              />
              {t.name}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

