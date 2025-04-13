"use client"

import React, { useState, useEffect } from "react"
import { useAuth } from "@/lib/hooks/use-auth"
import { ProtectedRoute } from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"

/**
 * User Profile Page
 * 
 * This page allows users to view and update their profile information.
 * It is protected and only accessible to authenticated users.
 */
function ProfilePage() {
  const { user, isLoading, updateUserMetadata, updateEmail, updatePassword } = useAuth()
  
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    username: "",
    avatarUrl: "",
  })
  
  const [emailForm, setEmailForm] = useState({
    email: "",
    currentPassword: "",
  })
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  
  const [profileError, setProfileError] = useState<string | null>(null)
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)
  
  const [emailError, setEmailError] = useState<string | null>(null)
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null)
  const [emailLoading, setEmailLoading] = useState(false)
  
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)
  const [passwordLoading, setPasswordLoading] = useState(false)
  
  // Initialize form values when user data is loaded
  useEffect(() => {
    if (user) {
      setProfileForm({
        fullName: user.fullName || "",
        username: user.username || "",
        avatarUrl: user.avatarUrl || "",
      })
      
      setEmailForm({
        email: user.email || "",
        currentPassword: "",
      })
    }
  }, [user])
  
  // Handle profile form submission
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileLoading(true)
    setProfileError(null)
    setProfileSuccess(null)
    
    try {
      const { error } = await updateUserMetadata({
        full_name: profileForm.fullName,
        username: profileForm.username,
        avatar_url: profileForm.avatarUrl,
      })
      
      if (error) throw error
      
      setProfileSuccess("Profile updated successfully")
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : "Failed to update profile")
    } finally {
      setProfileLoading(false)
    }
  }
  
  // Handle email form submission
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailLoading(true)
    setEmailError(null)
    setEmailSuccess(null)
    
    try {
      if (!emailForm.email) {
        throw new Error("Email is required")
      }
      
      if (!emailForm.currentPassword) {
        throw new Error("Current password is required to change email")
      }
      
      // First verify the current password
      const { error: signInError } = await useAuth().signIn(user?.email || "", emailForm.currentPassword)
      
      if (signInError) {
        throw new Error("Current password is incorrect")
      }
      
      // Then update the email
      const { error } = await updateEmail(emailForm.email)
      
      if (error) throw error
      
      setEmailSuccess("Email update confirmation has been sent to your new email address")
      setEmailForm({
        ...emailForm,
        currentPassword: "",
      })
    } catch (error) {
      setEmailError(error instanceof Error ? error.message : "Failed to update email")
    } finally {
      setEmailLoading(false)
    }
  }
  
  // Handle password form submission
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordLoading(true)
    setPasswordError(null)
    setPasswordSuccess(null)
    
    try {
      if (!passwordForm.currentPassword) {
        throw new Error("Current password is required")
      }
      
      if (!passwordForm.newPassword) {
        throw new Error("New password is required")
      }
      
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        throw new Error("New passwords do not match")
      }
      
      if (passwordForm.newPassword.length < 8) {
        throw new Error("New password must be at least 8 characters long")
      }
      
      // First verify the current password
      const { error: signInError } = await useAuth().signIn(user?.email || "", passwordForm.currentPassword)
      
      if (signInError) {
        throw new Error("Current password is incorrect")
      }
      
      // Then update the password
      const { error } = await updatePassword(passwordForm.newPassword)
      
      if (error) throw error
      
      setPasswordSuccess("Password updated successfully")
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : "Failed to update password")
    } finally {
      setPasswordLoading(false)
    }
  }
  
  // Generate avatar fallback from user's name or email
  const getAvatarFallback = () => {
    if (user?.fullName) {
      return user.fullName.split(" ").map((n: string) => n[0]).join("").toUpperCase()
    }
    
    if (user?.username) {
      return user.username.substring(0, 2).toUpperCase()
    }
    
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase()
    }
    
    return "??"
  }
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    )
  }
  
  return (
    <div className="container max-w-4xl py-10">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and profile information
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* User Card */}
          <Card className="w-full md:w-1/3">
            <CardHeader>
              <div className="flex flex-col items-center gap-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user?.avatarUrl || ""} alt={user?.fullName || user?.username || "User"} />
                  <AvatarFallback className="text-lg">{getAvatarFallback()}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-center">
                  <h2 className="text-xl font-semibold">{user?.fullName || user?.username}</h2>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Member since</span>
                  <span className="text-sm font-medium">
                    {user?.metadata?.created_at
                      ? new Date(user.metadata.created_at).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Last login</span>
                  <span className="text-sm font-medium">
                    {user?.lastSignIn
                      ? new Date(user.lastSignIn).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Email verified</span>
                  <span className="text-sm font-medium">
                    {user?.isVerified ? "Yes" : "No"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Settings Tabs */}
          <div className="w-full md:w-2/3">
            <Tabs defaultValue="profile">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="email">Email</TabsTrigger>
                <TabsTrigger value="password">Password</TabsTrigger>
              </TabsList>
              
              {/* Profile Tab */}
              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                      Update your profile information and how others see you on the platform
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {profileError && (
                      <Alert variant="destructive" className="mb-4">
                        <AlertDescription>{profileError}</AlertDescription>
                      </Alert>
                    )}
                    {profileSuccess && (
                      <Alert className="mb-4">
                        <AlertDescription>{profileSuccess}</AlertDescription>
                      </Alert>
                    )}
                    <form onSubmit={handleProfileSubmit}>
                      <div className="grid gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="fullName">Full Name</Label>
                          <Input
                            id="fullName"
                            value={profileForm.fullName}
                            onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="username">Username</Label>
                          <Input
                            id="username"
                            value={profileForm.username}
                            onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="avatarUrl">Avatar URL</Label>
                          <Input
                            id="avatarUrl"
                            value={profileForm.avatarUrl}
                            onChange={(e) => setProfileForm({ ...profileForm, avatarUrl: e.target.value })}
                            placeholder="https://example.com/avatar.jpg"
                          />
                        </div>
                        <Button type="submit" disabled={profileLoading}>
                          {profileLoading ? (
                            <>
                              <Spinner size="sm" className="mr-2" />
                              Saving...
                            </>
                          ) : (
                            "Save Changes"
                          )}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Email Tab */}
              <TabsContent value="email">
                <Card>
                  <CardHeader>
                    <CardTitle>Email Address</CardTitle>
                    <CardDescription>
                      Update your email address. You will need to verify your new email.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {emailError && (
                      <Alert variant="destructive" className="mb-4">
                        <AlertDescription>{emailError}</AlertDescription>
                      </Alert>
                    )}
                    {emailSuccess && (
                      <Alert className="mb-4">
                        <AlertDescription>{emailSuccess}</AlertDescription>
                      </Alert>
                    )}
                    <form onSubmit={handleEmailSubmit}>
                      <div className="grid gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={emailForm.email}
                            onChange={(e) => setEmailForm({ ...emailForm, email: e.target.value })}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="currentPasswordEmail">Current Password</Label>
                          <Input
                            id="currentPasswordEmail"
                            type="password"
                            value={emailForm.currentPassword}
                            onChange={(e) => setEmailForm({ ...emailForm, currentPassword: e.target.value })}
                          />
                          <p className="text-sm text-muted-foreground">
                            For security, please enter your current password to change your email
                          </p>
                        </div>
                        <Button type="submit" disabled={emailLoading}>
                          {emailLoading ? (
                            <>
                              <Spinner size="sm" className="mr-2" />
                              Updating...
                            </>
                          ) : (
                            "Update Email"
                          )}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Password Tab */}
              <TabsContent value="password">
                <Card>
                  <CardHeader>
                    <CardTitle>Password</CardTitle>
                    <CardDescription>
                      Change your password to keep your account secure
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {passwordError && (
                      <Alert variant="destructive" className="mb-4">
                        <AlertDescription>{passwordError}</AlertDescription>
                      </Alert>
                    )}
                    {passwordSuccess && (
                      <Alert className="mb-4">
                        <AlertDescription>{passwordSuccess}</AlertDescription>
                      </Alert>
                    )}
                    <form onSubmit={handlePasswordSubmit}>
                      <div className="grid gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="currentPassword">Current Password</Label>
                          <Input
                            id="currentPassword"
                            type="password"
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="newPassword">New Password</Label>
                          <Input
                            id="newPassword"
                            type="password"
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="confirmPassword">Confirm New Password</Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                          />
                        </div>
                        <Button type="submit" disabled={passwordLoading}>
                          {passwordLoading ? (
                            <>
                              <Spinner size="sm" className="mr-2" />
                              Updating...
                            </>
                          ) : (
                            "Update Password"
                          )}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}

// Wrap the page with ProtectedRoute to ensure only authenticated users can access it
export default function ProtectedProfilePage() {
  return (
    <ProtectedRoute>
      <ProfilePage />
    </ProtectedRoute>
  )
}
