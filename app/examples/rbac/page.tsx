"use client"

import React, { useState } from "react"
import { ProtectedPage } from "@/components/auth/protected-page"
import { Authorized } from "@/components/auth/authorized"
import { useRBAC } from "@/lib/hooks/use-rbac"
import { withAuthorization } from "@/components/auth/with-authorization"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { InfoIcon, ShieldCheck, ShieldAlert, UserCheck, Settings, FileText, Edit, Trash } from "lucide-react"

/**
 * RBAC Example Page
 * 
 * This page demonstrates different ways to implement role-based access control
 * in the Avolve platform. It showcases the various RBAC components and hooks
 * available for developers.
 */
export default function RbacExamplePage() {
  return (
    <ProtectedPage
      title="RBAC Examples"
      description="This page demonstrates role-based access control features."
    >
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Role-Based Access Control Examples</h1>
          <p className="text-muted-foreground">
            This page demonstrates different ways to implement access control in the Avolve platform.
          </p>
        </div>
        
        <Tabs defaultValue="components">
          <TabsList className="mb-4">
            <TabsTrigger value="components">Component Examples</TabsTrigger>
            <TabsTrigger value="hook">Hook Example</TabsTrigger>
            <TabsTrigger value="hoc">HOC Example</TabsTrigger>
          </TabsList>
          
          <TabsContent value="components">
            <ComponentExamples />
          </TabsContent>
          
          <TabsContent value="hook">
            <HookExample />
          </TabsContent>
          
          <TabsContent value="hoc">
            <HocExample />
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedPage>
  )
}

/**
 * Component Examples
 * 
 * Demonstrates using the Authorized component for UI-level access control.
 */
function ComponentExamples() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Admin Panel Example */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <CardTitle>Admin Panel</CardTitle>
          </div>
          <CardDescription>
            Only visible to users with the "admin" role
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Authorized 
            requiredRoles="admin"
            fallback={
              <Alert>
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>Access Denied</AlertTitle>
                <AlertDescription>
                  You need admin privileges to view this content.
                </AlertDescription>
              </Alert>
            }
          >
            <div className="p-4 bg-muted rounded-md">
              <h3 className="font-medium mb-2">Admin Controls</h3>
              <p className="text-sm text-muted-foreground mb-4">
                This content is only visible to administrators.
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <UserCheck className="h-4 w-4 mr-2" />
                  Manage Users
                </Button>
                <Button size="sm" variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  System Settings
                </Button>
              </div>
            </div>
          </Authorized>
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground">
          <InfoIcon className="h-4 w-4 mr-2" />
          Uses the Authorized component with requiredRoles="admin"
        </CardFooter>
      </Card>
      
      {/* Content Editor Example */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle>Content Editor</CardTitle>
          </div>
          <CardDescription>
            Only visible to users with "content:edit" permission
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Authorized 
            requiredPermissions="content:edit"
            fallback={
              <Alert>
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>Access Denied</AlertTitle>
                <AlertDescription>
                  You need content editing permissions to use this feature.
                </AlertDescription>
              </Alert>
            }
          >
            <div className="p-4 bg-muted rounded-md">
              <h3 className="font-medium mb-2">Content Editor</h3>
              <p className="text-sm text-muted-foreground mb-4">
                This editor is only visible to users with content editing permissions.
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Content
                </Button>
                <Button size="sm" variant="outline" variant="destructive">
                  <Trash className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </Authorized>
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground">
          <InfoIcon className="h-4 w-4 mr-2" />
          Uses the Authorized component with requiredPermissions="content:edit"
        </CardFooter>
      </Card>
      
      {/* Moderator Tools Example */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <CardTitle>Moderator Tools</CardTitle>
          </div>
          <CardDescription>
            Visible to users with "admin" OR "moderator" role
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Authorized 
            requiredRoles={["admin", "moderator"]}
            fallback={
              <Alert>
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>Access Denied</AlertTitle>
                <AlertDescription>
                  You need admin or moderator privileges to view this content.
                </AlertDescription>
              </Alert>
            }
          >
            <div className="p-4 bg-muted rounded-md">
              <h3 className="font-medium mb-2">Moderation Queue</h3>
              <p className="text-sm text-muted-foreground mb-4">
                This content is visible to both admins and moderators.
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <UserCheck className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button size="sm" variant="outline" variant="destructive">
                  <Trash className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </div>
            </div>
          </Authorized>
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground">
          <InfoIcon className="h-4 w-4 mr-2" />
          Uses the Authorized component with requiredRoles={["admin", "moderator"]}
        </CardFooter>
      </Card>
      
      {/* Advanced Example */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            <CardTitle>Advanced Settings</CardTitle>
          </div>
          <CardDescription>
            Requires "admin" role AND "settings:manage" permission
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Authorized 
            requiredRoles="admin"
            requiredPermissions="settings:manage"
            fallback={
              <Alert>
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>Access Denied</AlertTitle>
                <AlertDescription>
                  You need admin role and settings management permissions.
                </AlertDescription>
              </Alert>
            }
          >
            <div className="p-4 bg-muted rounded-md">
              <h3 className="font-medium mb-2">Advanced System Settings</h3>
              <p className="text-sm text-muted-foreground mb-4">
                This content requires both admin role and settings management permission.
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Configure
                </Button>
              </div>
            </div>
          </Authorized>
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground">
          <InfoIcon className="h-4 w-4 mr-2" />
          Uses the Authorized component with both requiredRoles and requiredPermissions
        </CardFooter>
      </Card>
    </div>
  )
}

/**
 * Hook Example
 * 
 * Demonstrates using the useRBAC hook for programmatic access control.
 */
function HookExample() {
  const { hasRole, hasPermission, can, isLoading } = useRBAC()
  const [roleChecks, setRoleChecks] = useState<Record<string, boolean | null>>({
    admin: null,
    user: null,
    moderator: null
  })
  const [permissionChecks, setPermissionChecks] = useState<Record<string, boolean | null>>({
    'users:view': null,
    'content:edit': null,
    'settings:manage': null
  })
  
  // Check roles and permissions
  React.useEffect(() => {
    const checkAccess = async () => {
      // Check roles
      const adminCheck = await hasRole('admin')
      const userCheck = await hasRole('user')
      const moderatorCheck = await hasRole('moderator')
      
      setRoleChecks({
        admin: adminCheck,
        user: userCheck,
        moderator: moderatorCheck
      })
      
      // Check permissions
      const viewUsersCheck = await hasPermission('users', 'view')
      const editContentCheck = await hasPermission('content', 'edit')
      const manageSettingsCheck = await hasPermission('settings', 'manage')
      
      setPermissionChecks({
        'users:view': viewUsersCheck,
        'content:edit': editContentCheck,
        'settings:manage': manageSettingsCheck
      })
    }
    
    if (!isLoading) {
      checkAccess()
    }
  }, [isLoading, hasRole, hasPermission])
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Spinner size="lg" />
      </div>
    )
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>useRBAC Hook Example</CardTitle>
        <CardDescription>
          Demonstrates programmatic access control using the useRBAC hook
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Role Checks */}
          <div>
            <h3 className="font-medium mb-4">Your Roles</h3>
            <ul className="space-y-2">
              {Object.entries(roleChecks).map(([role, hasRole]) => (
                <li key={role} className="flex items-center justify-between p-2 border rounded-md">
                  <span className="font-medium">{role}</span>
                  {hasRole === null ? (
                    <Spinner size="sm" />
                  ) : (
                    <Badge variant={hasRole ? "default" : "outline"}>
                      {hasRole ? "Granted" : "Not Granted"}
                    </Badge>
                  )}
                </li>
              ))}
            </ul>
          </div>
          
          {/* Permission Checks */}
          <div>
            <h3 className="font-medium mb-4">Your Permissions</h3>
            <ul className="space-y-2">
              {Object.entries(permissionChecks).map(([permission, hasPermission]) => (
                <li key={permission} className="flex items-center justify-between p-2 border rounded-md">
                  <span className="font-medium">{permission}</span>
                  {hasPermission === null ? (
                    <Spinner size="sm" />
                  ) : (
                    <Badge variant={hasPermission ? "default" : "outline"}>
                      {hasPermission ? "Granted" : "Not Granted"}
                    </Badge>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-muted rounded-md">
          <h3 className="font-medium mb-2">Code Example</h3>
          <pre className="text-sm bg-background p-4 rounded-md overflow-x-auto">
            {`
const { hasRole, hasPermission, can } = useRBAC();

// Check if user has admin role
const isAdmin = await hasRole('admin');

// Check if user can edit content
const canEditContent = await hasPermission('content', 'edit');
// or using the more intuitive 'can' method
const canEditContent = await can('edit', 'content');
            `.trim()}
          </pre>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Example components for HOC demonstration
 */
const AdminOnlyComponent = () => (
  <div className="p-4 bg-muted rounded-md">
    <h3 className="font-medium mb-2">Admin Only Component</h3>
    <p className="text-sm text-muted-foreground">
      This component is only visible to administrators.
    </p>
  </div>
)

const ContentEditorComponent = () => (
  <div className="p-4 bg-muted rounded-md">
    <h3 className="font-medium mb-2">Content Editor Component</h3>
    <p className="text-sm text-muted-foreground">
      This component is only visible to users with content editing permissions.
    </p>
  </div>
)

// Apply HOC to components
const ProtectedAdminComponent = withAuthorization(AdminOnlyComponent, {
  requiredRoles: "admin",
  redirectUnauthorized: false,
  UnauthorizedComponent: () => (
    <Alert>
      <ShieldAlert className="h-4 w-4" />
      <AlertTitle>Access Denied</AlertTitle>
      <AlertDescription>
        You need admin privileges to view this component.
      </AlertDescription>
    </Alert>
  )
})

const ProtectedEditorComponent = withAuthorization(ContentEditorComponent, {
  requiredPermissions: "content:edit",
  redirectUnauthorized: false,
  UnauthorizedComponent: () => (
    <Alert>
      <ShieldAlert className="h-4 w-4" />
      <AlertTitle>Access Denied</AlertTitle>
      <AlertDescription>
        You need content editing permissions to view this component.
      </AlertDescription>
    </Alert>
  )
})

/**
 * HOC Example
 * 
 * Demonstrates using the withAuthorization HOC for component-level access control.
 */
function HocExample() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>withAuthorization HOC Example</CardTitle>
        <CardDescription>
          Demonstrates using the Higher-Order Component pattern for access control
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Admin Component */}
          <div>
            <h3 className="font-medium mb-2">Admin Component</h3>
            <ProtectedAdminComponent />
          </div>
          
          {/* Editor Component */}
          <div>
            <h3 className="font-medium mb-2">Editor Component</h3>
            <ProtectedEditorComponent />
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-muted rounded-md">
          <h3 className="font-medium mb-2">Code Example</h3>
          <pre className="text-sm bg-background p-4 rounded-md overflow-x-auto">
            {`
// Only allow users with the "admin" role to access the component
const ProtectedAdminPanel = withAuthorization(AdminPanel, { 
  requiredRoles: "admin" 
});

// Only allow users who can edit content to access the component
const ProtectedEditor = withAuthorization(Editor, { 
  requiredPermissions: "content:edit" 
});

// Show a custom unauthorized component instead of redirecting
const ProtectedContent = withAuthorization(Content, { 
  requiredRoles: "premium",
  redirectUnauthorized: false,
  UnauthorizedComponent: PremiumUpsell
});
            `.trim()}
          </pre>
        </div>
      </CardContent>
    </Card>
  )
}
