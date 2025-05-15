"use client"

import { useTheme as useNextTheme } from "next-themes"
import { useEffect, useState } from "react"

export function useTheme() {
  const { theme, setTheme, systemTheme } = useNextTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Get the current theme, accounting for system preference
  const currentTheme = mounted ? (theme === "system" ? systemTheme : theme) : undefined

  // Toggle between light and dark
  const toggleTheme = () => {
    if (currentTheme === "dark") {
      setTheme("light")
    } else {
      setTheme("dark")
    }
  }

  return {
    theme,
    setTheme,
    currentTheme,
    toggleTheme,
    isDark: currentTheme === "dark",
    isLight: currentTheme === "light",
    isSystem: theme === "system",
    mounted,
  }
}
