"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, ShieldAlert } from "lucide-react"
import { useAuth } from "@/lib/hooks/use-auth"
import { Badge } from "@/components/ui/badge"

/**
 * Unauthorized Page
 * 
 * This page is displayed when a user attempts to access a resource they don't have permission for.
 * It provides options to go back or return to the dashboard, along with information about
 * the required permissions or roles.
 */
export default function UnauthorizedPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  
  // Get required roles and permissions from query parameters
  const requiredRoles = searchParams?.get('roles')?.split(',') || []
  const requiredPermissions = searchParams?.get('permissions')?.split(',') || []
  const resource = searchParams?.get('resource') || ''
  
  return (
    <div className="container flex items-center justify-center min-h-screen py-10">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <ShieldAlert className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Access Denied</CardTitle>
          <CardDescription>
            You don't have permission to access this resource.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-4">
            This area requires specific permissions or roles that your account doesn't have.
            {resource && (
              <span> You attempted to access: <strong>{resource}</strong></span>
            )}
          </p>
          
          {(requiredRoles.length > 0 || requiredPermissions.length > 0) && (
            <div className="mt-4 text-left p-4 border rounded-md bg-muted">
              <h3 className="font-medium mb-2">Access Requirements:</h3>
              
              {requiredRoles.length > 0 && (
                <div className="mb-2">
                  <p className="text-sm font-medium mb-1">Required Role{requiredRoles.length > 1 ? 's' : ''}:</p>
                  <div className="flex flex-wrap gap-2">
                    {requiredRoles.map(role => (
                      <Badge key={role} variant="outline" className="bg-background">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {requiredPermissions.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-1">Required Permission{requiredPermissions.length > 1 ? 's' : ''}:</p>
                  <div className="flex flex-wrap gap-2">
                    {requiredPermissions.map(permission => (
                      <Badge key={permission} variant="outline" className="bg-background">
                        {permission}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <p className="mt-4 text-sm text-muted-foreground">
            If you believe this is an error, please contact an administrator.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="outline" onClick={() => router.back()}>
            Go Back
          </Button>
          <Button asChild>
            <Link href="/(authenticated)/dashboard">Return to Dashboard</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
