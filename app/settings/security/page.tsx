"use client"

import React from "react"
import { useAuth } from "@/lib/hooks/use-auth"
import { MfaSetup } from "@/components/auth/mfa-setup"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { useToast } from "@/components/ui/use-toast"
import { ProtectedRoute } from "@/components/protected-route"
import { Shield, Lock, Key, AlertTriangle, Clock } from "lucide-react"
import { format } from "date-fns"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

// Password change form schema
const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

/**
 * Security Settings Page
 * 
 * A comprehensive page for managing security settings including:
 * - Password management
 * - Multi-factor authentication
 * - Session management
 * - Account activity
 */
export default function SecuritySettingsPage() {
  const { user, updatePassword, isLoading } = useAuth()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = React.useState("password")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  
  // Password change form
  const form = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })
  
  // Handle password change
  const onSubmit = async (values: z.infer<typeof passwordSchema>) => {
    setIsSubmitting(true)
    
    try {
      const { error } = await updatePassword(values.newPassword)
      
      if (error) {
        toast({
          title: "Error",
          description: error.message || "Failed to update password. Please try again.",
          variant: "destructive",
        })
        return
      }
      
      toast({
        title: "Password Updated",
        description: "Your password has been successfully updated.",
      })
      
      // Reset form
      form.reset()
    } catch (error) {
      console.error("Error updating password:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <ProtectedRoute>
      <div className="container max-w-5xl py-10">
        <div className="flex flex-col space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Security Settings</h1>
            <p className="text-muted-foreground mt-2">
              Manage your account security settings and preferences
            </p>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="password">
                <Lock className="mr-2 h-4 w-4" />
                Password
              </TabsTrigger>
              <TabsTrigger value="mfa">
                <Shield className="mr-2 h-4 w-4" />
                Two-Factor Authentication
              </TabsTrigger>
              <TabsTrigger value="activity">
                <Clock className="mr-2 h-4 w-4" />
                Account Activity
              </TabsTrigger>
            </TabsList>
            
            {/* Password Tab */}
            <TabsContent value="password">
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>
                    Update your password to keep your account secure
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Password</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="Enter your current password" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="Enter your new password" 
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Password must be at least 8 characters and include uppercase, lowercase, 
                              number, and special character.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm New Password</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="Confirm your new password" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? <Spinner className="mr-2" size="sm" /> : null}
                        Update Password
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter>
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Password Security Tips</AlertTitle>
                    <AlertDescription className="text-sm">
                      <ul className="list-disc pl-4 space-y-1">
                        <li>Use a unique password for each of your accounts</li>
                        <li>Don't use personal information in your password</li>
                        <li>Consider using a password manager to generate and store strong passwords</li>
                        <li>Change your password regularly, especially if you suspect it might be compromised</li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* MFA Tab */}
            <TabsContent value="mfa">
              <Card>
                <CardHeader>
                  <CardTitle>Two-Factor Authentication</CardTitle>
                  <CardDescription>
                    Add an extra layer of security to your account by requiring a second verification step when signing in
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <MfaSetup />
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Account Activity Tab */}
            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle>Account Activity</CardTitle>
                  <CardDescription>
                    Review your recent account activity and security events
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Account Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Email</p>
                        <p>{user?.email}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Last Sign In</p>
                        <p>{user?.lastSignIn ? format(new Date(user.lastSignIn), "PPpp") : "Never"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Email Verified</p>
                        <p>{user?.isVerified ? "Yes" : "No"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Two-Factor Authentication</p>
                        <p>{user?.hasMfa ? "Enabled" : "Disabled"}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Security Recommendations</h3>
                    <div className="space-y-2">
                      {!user?.isVerified && (
                        <Alert variant="destructive">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertTitle>Email Not Verified</AlertTitle>
                          <AlertDescription>
                            Your email address is not verified. Please check your inbox for a verification email or request a new one.
                          </AlertDescription>
                        </Alert>
                      )}
                      
                      {!user?.hasMfa && (
                        <Alert variant="warning">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertTitle>Two-Factor Authentication Not Enabled</AlertTitle>
                          <AlertDescription>
                            Enable two-factor authentication to add an extra layer of security to your account.
                          </AlertDescription>
                        </Alert>
                      )}
                      
                      {user?.isVerified && user?.hasMfa && (
                        <Alert>
                          <Shield className="h-4 w-4" />
                          <AlertTitle>Account Security</AlertTitle>
                          <AlertDescription>
                            Your account security is up to date with best practices. Continue to monitor your account activity regularly.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  )
}
