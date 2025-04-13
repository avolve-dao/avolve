"use client"

import React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProtectedPage } from "@/components/auth/protected-page"
import { AuditLogViewer } from "@/components/admin/audit-log-viewer"
import { UserRoleManager } from "@/components/admin/user-role-manager"
import { Shield, User, FileText, Lock } from "lucide-react"

/**
 * Admin Security Page
 * 
 * This page provides access to security management features for administrators,
 * including role management and audit logging.
 */
export default function AdminSecurityPage() {
  return (
    <ProtectedPage
      requiredRoles="admin"
      title="Security Management"
      description="Manage roles, permissions, and security settings"
    >
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Security Management</h1>
          <p className="text-muted-foreground">
            Manage roles, permissions, and monitor security activities
          </p>
        </div>
        
        <Tabs defaultValue="roles" className="space-y-4">
          <TabsList>
            <TabsTrigger value="roles" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>User Roles</span>
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>Audit Logs</span>
            </TabsTrigger>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>Security Overview</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="roles" className="space-y-4">
            <UserRoleManager />
          </TabsContent>
          
          <TabsContent value="audit" className="space-y-4">
            <AuditLogViewer />
          </TabsContent>
          
          <TabsContent value="overview" className="space-y-4">
            <SecurityOverview />
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedPage>
  )
}

/**
 * Security Overview Component
 * 
 * Provides a high-level overview of the security features and current status.
 */
function SecurityOverview() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Role-Based Access Control
          </CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">Enabled</div>
          <p className="text-xs text-muted-foreground">
            Fine-grained access control based on user roles and permissions
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Multi-Factor Authentication
          </CardTitle>
          <Lock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">Enabled</div>
          <p className="text-xs text-muted-foreground">
            Additional security layer using TOTP and recovery codes
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Audit Logging
          </CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">Enabled</div>
          <p className="text-xs text-muted-foreground">
            Comprehensive tracking of security-related actions
          </p>
        </CardContent>
      </Card>
      
      <Card className="md:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle>Security Features</CardTitle>
          <CardDescription>
            Overview of security features implemented in the Avolve platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-md">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  Role-Based Access Control
                </h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Fine-grained control over user permissions</li>
                  <li>Hierarchical role system with inheritance</li>
                  <li>Granular permission management</li>
                  <li>Route-level and component-level protection</li>
                </ul>
              </div>
              
              <div className="p-4 border rounded-md">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-primary" />
                  Multi-Factor Authentication
                </h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Time-based One-Time Password (TOTP) support</li>
                  <li>Recovery codes for backup access</li>
                  <li>User-friendly setup process</li>
                  <li>Integration with authentication workflow</li>
                </ul>
              </div>
              
              <div className="p-4 border rounded-md">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Audit Logging
                </h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Comprehensive tracking of security events</li>
                  <li>Detailed information about each action</li>
                  <li>Filtering and search capabilities</li>
                  <li>Export functionality for compliance</li>
                </ul>
              </div>
              
              <div className="p-4 border rounded-md">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  Session Management
                </h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Secure session handling</li>
                  <li>Session timeout and renewal</li>
                  <li>Device tracking and management</li>
                  <li>Forced logout capabilities</li>
                </ul>
              </div>
            </div>
            
            <div className="p-4 border rounded-md bg-muted">
              <h3 className="font-medium mb-2">Security Documentation</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Comprehensive security documentation is available to help understand and extend the security features of the Avolve platform.
              </p>
              <p className="text-sm">
                <a href="/docs/security" className="text-primary hover:underline">
                  View Security Documentation
                </a>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
