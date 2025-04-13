"use client"

import React from "react"
import { AuthProvider as AuthContextProvider } from "@/lib/hooks/use-auth"

interface AuthProviderProps {
  children: React.ReactNode
}

/**
 * Authentication Provider Component
 * 
 * This component wraps the application and provides authentication context
 * to all child components. It should be used at the root level of the application.
 * 
 * @example
 * ```tsx
 * // In app/layout.tsx
 * import { AuthProvider } from "@/components/providers/auth-provider"
 * 
 * export default function RootLayout({ children }: { children: React.ReactNode }) {
 *   return (
 *     <html lang="en">
 *       <body>
 *         <AuthProvider>
 *           {children}
 *         </AuthProvider>
 *       </body>
 *     </html>
 *   )
 * }
 * ```
 */
export function AuthProvider({ children }: AuthProviderProps) {
  return <AuthContextProvider>{children}</AuthContextProvider>
}
