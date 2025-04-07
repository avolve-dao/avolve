'use client';

import React, { useState } from "react";
import { ProtectedPage } from "@/components/auth/protected-page";
import { Authorized } from "@/components/auth/authorized";
import { useRBAC } from "@/lib/hooks/use-rbac";
import { withAuthorization } from "@/components/auth/with-authorization";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { InfoIcon, ShieldCheck, ShieldAlert, UserCheck, Settings, FileText, Edit, Trash } from "lucide-react";

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
          Uses the <code>{'<Authorized>'}</code> component with <code>requiredRoles</code> prop
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
                  You need content editing permissions to view this content.
                </AlertDescription>
              </Alert>
            }
          >
            <div className="p-4 bg-muted rounded-md">
              <h3 className="font-medium mb-2">Content Editor</h3>
              <p className="text-sm text-muted-foreground mb-4">
                This content is only visible to users with content editing permissions.
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Content
                </Button>
                <Button size="sm" variant="outline">
                  <Trash className="h-4 w-4 mr-2" />
                  Delete Content
                </Button>
              </div>
            </div>
          </Authorized>
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground">
          <InfoIcon className="h-4 w-4 mr-2" />
          Uses the <code>{'<Authorized>'}</code> component with <code>requiredPermissions</code> prop
        </CardFooter>
      </Card>
      
      {/* Multiple Roles Example */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <CardTitle>Multiple Roles</CardTitle>
          </div>
          <CardDescription>
            Visible to users with either "admin" or "moderator" roles
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
              <h3 className="font-medium mb-2">Moderation Controls</h3>
              <p className="text-sm text-muted-foreground mb-4">
                This content is visible to both administrators and moderators.
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <UserCheck className="h-4 w-4 mr-2" />
                  Approve Users
                </Button>
                <Button size="sm" variant="outline">
                  <Trash className="h-4 w-4 mr-2" />
                  Remove Content
                </Button>
              </div>
            </div>
          </Authorized>
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground">
          <InfoIcon className="h-4 w-4 mr-2" />
          Uses <code>requiredRoles</code> with an array
        </CardFooter>
      </Card>
      
      {/* Multiple Permissions Example */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <CardTitle>Multiple Permissions</CardTitle>
          </div>
          <CardDescription>
            Requires both "content:read" and "content:edit" permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Authorized 
            requiredPermissions={["content:read", "content:edit"]}
            fallback={
              <Alert>
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>Access Denied</AlertTitle>
                <AlertDescription>
                  You need both read and edit permissions to view this content.
                </AlertDescription>
              </Alert>
            }
          >
            <div className="p-4 bg-muted rounded-md">
              <h3 className="font-medium mb-2">Advanced Editor</h3>
              <p className="text-sm text-muted-foreground mb-4">
                This content requires both read and edit permissions.
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Advanced Content
                </Button>
              </div>
            </div>
          </Authorized>
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground">
          <InfoIcon className="h-4 w-4 mr-2" />
          Uses <code>requiredPermissions</code> with an array
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
  const { hasRole, hasPermission, isLoading } = useRBAC();
  const [roleChecks, setRoleChecks] = useState<Record<string, boolean | null>>({
    admin: null,
    editor: null,
    moderator: null,
  });
  const [permissionChecks, setPermissionChecks] = useState<Record<string, boolean | null>>({
    "content:read": null,
    "content:edit": null,
    "users:manage": null,
  });
  
  const checkAccess = async () => {
    // Check roles
    const adminCheck = await hasRole("admin");
    const editorCheck = await hasRole("editor");
    const moderatorCheck = await hasRole("moderator");
    
    setRoleChecks({
      admin: adminCheck,
      editor: editorCheck,
      moderator: moderatorCheck,
    });
    
    // Check permissions
    const readCheck = await hasPermission("content", "read");
    const editCheck = await hasPermission("content", "edit");
    const usersCheck = await hasPermission("users", "manage");
    
    setPermissionChecks({
      "content:read": readCheck,
      "content:edit": editCheck,
      "users:manage": usersCheck,
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>useRBAC Hook Example</CardTitle>
        <CardDescription>
          Demonstrates using the RBAC hook for programmatic access control
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Button onClick={checkAccess} disabled={isLoading}>
            {isLoading ? (
              <>
                <Spinner className="mr-2" />
                Checking...
              </>
            ) : (
              "Check Access"
            )}
          </Button>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          {/* Role Checks */}
          <div>
            <h3 className="font-medium mb-2">Role Checks</h3>
            <ul className="space-y-2">
              {Object.entries(roleChecks).map(([role, hasRole]) => (
                <li key={role} className="flex justify-between items-center p-2 bg-muted rounded-md">
                  <span className="font-medium">{role}</span>
                  {hasRole === null ? (
                    <Badge variant="outline">Not checked</Badge>
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
            <h3 className="font-medium mb-2">Permission Checks</h3>
            <ul className="space-y-2">
              {Object.entries(permissionChecks).map(([permission, hasPermission]) => (
                <li key={permission} className="flex justify-between items-center p-2 bg-muted rounded-md">
                  <span className="font-medium">{permission}</span>
                  {hasPermission === null ? (
                    <Badge variant="outline">Not checked</Badge>
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
