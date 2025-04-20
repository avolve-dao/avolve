"use client"

import React, { useState, useEffect } from "react"
import { useAuth } from "@/lib/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { Copy, AlertTriangle, ShieldCheck, Smartphone, LogOut } from "lucide-react"
import { TotpFactor, UserSession } from "@/lib/auth/auth-types"
import { toast } from "@/components/ui/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"

/**
 * Simple QR Code Display Component
 * 
 * A basic component to display QR code data as a URL for the user to scan
 */
function SimpleQRCode({ value }: { value: string }) {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="bg-white p-4 rounded-md border border-border">
        <div className="text-center text-sm text-muted-foreground mb-2">
          Open your authenticator app and scan this QR code:
        </div>
        <div className="text-center">
          <a 
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded-md"
          >
            Open QR Code
          </a>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        If you can't scan the QR code, you can manually enter the secret key below.
      </p>
    </div>
  )
}

/**
 * MFA Setup Component
 * 
 * This component provides a complete interface for setting up and managing
 * multi-factor authentication, including TOTP setup, recovery codes, and session management.
 */
export function MfaSetup() {
  const { 
    user, 
    setupTotp, 
    verifyTotpFactor, 
    generateRecoveryCodes,
    disableMfa,
    getUserSessions,
    revokeSession,
    revokeAllOtherSessions
  } = useAuth()
  
  const [activeTab, setActiveTab] = useState("setup")
  const [isLoading, setIsLoading] = useState(false)
  const [totpFactor, setTotpFactor] = useState<TotpFactor | null>(null)
  const [verificationCode, setVerificationCode] = useState("")
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([])
  const [sessions, setSessions] = useState<UserSession[]>([])
  
  const hasMfa = user?.hasMfa || false

  const loadSessions = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await getUserSessions()
      if (error) throw error
      if (data) {
        setSessions(data)
      }
    } catch (error) {
      console.error("Failed to load sessions:", error)
      toast({
        title: "Error",
        description: "Failed to load active sessions. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === "sessions") {
      loadSessions()
    }
  }, [activeTab])

  // Initialize TOTP setup
  const handleSetupTotp = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await setupTotp("Avolve Authenticator")
      if (error) throw error
      if (data) {
        setTotpFactor(data)
      }
    } catch (error) {
      console.error("Failed to setup TOTP:", error)
      toast({
        title: "Error",
        description: "Failed to setup authenticator. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Verify TOTP code
  const handleVerifyTotp = async () => {
    if (!totpFactor || !verificationCode || verificationCode.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter a valid 6-digit verification code.",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      const { data, error } = await verifyTotpFactor(totpFactor.id, verificationCode)
      if (error) throw error
      
      if (data) {
        toast({
          title: "Success",
          description: "Two-factor authentication has been enabled for your account.",
        })
        
        // Generate recovery codes after successful verification
        const { data: recoveryData, error: recoveryError } = await generateRecoveryCodes()
        if (recoveryError) throw recoveryError
        
        if (recoveryData) {
          setRecoveryCodes(recoveryData.codes)
          setActiveTab("recovery")
        }
      } else {
        toast({
          title: "Verification Failed",
          description: "The code you entered is incorrect. Please try again.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Failed to verify TOTP:", error)
      toast({
        title: "Error",
        description: "Failed to verify code. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
      setVerificationCode("")
    }
  }

  // Disable MFA
  const handleDisableMfa = async () => {
    if (!confirm("Are you sure you want to disable two-factor authentication? This will make your account less secure.")) {
      return
    }

    setIsLoading(true)
    try {
      const { data, error } = await disableMfa()
      if (error) throw error
      
      if (data) {
        toast({
          title: "MFA Disabled",
          description: "Two-factor authentication has been disabled for your account.",
        })
        
        // Reset state
        setTotpFactor(null)
        setRecoveryCodes([])
        setActiveTab("setup")
      }
    } catch (error) {
      console.error("Failed to disable MFA:", error)
      toast({
        title: "Error",
        description: "Failed to disable two-factor authentication. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Copy recovery codes to clipboard
  const handleCopyRecoveryCodes = () => {
    navigator.clipboard.writeText(recoveryCodes.join("\n"))
    toast({
      title: "Copied",
      description: "Recovery codes copied to clipboard.",
    })
  }

  // Revoke a specific session
  const handleRevokeSession = async (sessionId: string) => {
    if (!confirm("Are you sure you want to sign out this device? The user will need to sign in again.")) {
      return
    }

    setIsLoading(true)
    try {
      const { data, error } = await revokeSession(sessionId)
      if (error) throw error
      
      if (data) {
        toast({
          title: "Session Revoked",
          description: "The session has been successfully revoked.",
        })
        
        // Reload sessions
        await loadSessions()
      }
    } catch (error) {
      console.error("Failed to revoke session:", error)
      toast({
        title: "Error",
        description: "Failed to revoke session. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Revoke all other sessions
  const handleRevokeAllOtherSessions = async () => {
    if (!confirm("Are you sure you want to sign out all other devices? Users will need to sign in again.")) {
      return
    }

    setIsLoading(true)
    try {
      const { data, error } = await revokeAllOtherSessions()
      if (error) throw error
      
      if (data) {
        toast({
          title: "All Sessions Revoked",
          description: "All other sessions have been successfully revoked.",
        })
        
        // Reload sessions
        await loadSessions()
      }
    } catch (error) {
      console.error("Failed to revoke all sessions:", error)
      toast({
        title: "Error",
        description: "Failed to revoke all sessions. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Format device info for display
  const formatDeviceInfo = (session: UserSession) => {
    const deviceInfo = (session as any).deviceInfo || {}
    const browser = (deviceInfo as any).browser || "Unknown browser"
    const os = (deviceInfo as any).os || "Unknown OS"
    const device = (deviceInfo as any).device || "Unknown device"
    
    return `${browser} on ${os} (${device})`
  }

  // Format location info for display
  const formatLocationInfo = (session: UserSession) => {
    const location = (session as any).location || {}
    const city = (location as any).city || "Unknown"
    const country = (location as any).country || "Unknown"
    
    return `${city}, ${country}`
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="setup">
          {hasMfa ? "Manage 2FA" : "Setup 2FA"}
        </TabsTrigger>
        <TabsTrigger value="recovery" disabled={!hasMfa && !recoveryCodes.length}>
          Recovery Codes
        </TabsTrigger>
        <TabsTrigger value="sessions">
          Active Sessions
        </TabsTrigger>
      </TabsList>
      
      {/* TOTP Setup Tab */}
      <TabsContent value="setup">
        <Card>
          <CardHeader>
            <CardTitle>
              {hasMfa ? "Two-Factor Authentication" : "Setup Two-Factor Authentication"}
            </CardTitle>
            <CardDescription>
              {hasMfa 
                ? "Your account is protected with two-factor authentication."
                : "Add an extra layer of security to your account by requiring a verification code."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {hasMfa ? (
              <div className="space-y-4">
                <Alert>
                  <ShieldCheck className="h-4 w-4" />
                  <AlertTitle>Your account is secure</AlertTitle>
                  <AlertDescription>
                    Two-factor authentication is enabled for your account. You'll need to enter a verification code from your authenticator app when signing in.
                  </AlertDescription>
                </Alert>
                
                <div className="flex justify-center">
                  <Button variant="destructive" onClick={handleDisableMfa} disabled={isLoading}>
                    {isLoading ? <Spinner className="mr-2" size="sm" /> : <AlertTriangle className="mr-2 h-4 w-4" />}
                    Disable Two-Factor Authentication
                  </Button>
                </div>
              </div>
            ) : totpFactor ? (
              <div className="space-y-6">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <SimpleQRCode value={(totpFactor as any).qrCode} />
                  <div className="text-center">
                    <p className="mt-2 text-sm font-medium">
                      Or enter this code manually: <code className="bg-muted px-1 py-0.5 rounded">{(totpFactor as any).secret}</code>
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="verification-code">Enter verification code</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="verification-code"
                      placeholder="000000"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      maxLength={6}
                      className="text-center text-lg tracking-widest"
                    />
                    <Button onClick={handleVerifyTotp} disabled={isLoading || verificationCode.length !== 6}>
                      {isLoading ? <Spinner className="mr-2" size="sm" /> : null}
                      Verify
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Enter the 6-digit code from your authenticator app to verify setup
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Recommended Security Measure</AlertTitle>
                  <AlertDescription>
                    Two-factor authentication adds an extra layer of security to your account. Even if someone knows your password, they won't be able to sign in without access to your authenticator app.
                  </AlertDescription>
                </Alert>
                
                <div className="flex justify-center">
                  <Button onClick={handleSetupTotp} disabled={isLoading}>
                    {isLoading ? <Spinner className="mr-2" size="sm" /> : <Smartphone className="mr-2 h-4 w-4" />}
                    Setup Authenticator App
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      
      {/* Recovery Codes Tab */}
      <TabsContent value="recovery">
        <Card>
          <CardHeader>
            <CardTitle>Recovery Codes</CardTitle>
            <CardDescription>
              Save these recovery codes in a secure place. You can use them to access your account if you lose your authenticator device.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Important</AlertTitle>
              <AlertDescription>
                Each code can only be used once. Keep these codes in a safe place, like a password manager. If you lose access to your authenticator app and don't have these codes, you'll be locked out of your account.
              </AlertDescription>
            </Alert>
            
            <div className="bg-muted p-4 rounded-md font-mono text-sm">
              <div className="grid grid-cols-2 gap-2">
                {recoveryCodes.map((code, index) => (
                  <div key={index} className="p-2 border border-border rounded-sm">
                    {code}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleCopyRecoveryCodes}>
              <Copy className="mr-2 h-4 w-4" />
              Copy Codes
            </Button>
            <Button onClick={() => setActiveTab("setup")}>
              Continue
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
      
      {/* Sessions Tab */}
      <TabsContent value="sessions">
        <Card>
          <CardHeader>
            <CardTitle>Active Sessions</CardTitle>
            <CardDescription>
              Manage your active sessions across different devices. You can sign out from any device if you suspect unauthorized access.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Spinner size="lg" />
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No active sessions found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Device</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell className="font-medium">
                          {formatDeviceInfo(session)}
                        </TableCell>
                        <TableCell>{formatLocationInfo(session)}</TableCell>
                        <TableCell>
                          {format(new Date(session.lastActiveAt), "MMM d, yyyy h:mm a")}
                        </TableCell>
                        <TableCell>
                          {session.isCurrent ? (
                            <Badge variant="outline" className="bg-primary/10 text-primary">Current</Badge>
                          ) : (
                            <Badge variant="outline">Active</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {!session.isCurrent && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleRevokeSession((session as any).sessionId)}
                              disabled={isLoading}
                            >
                              <LogOut className="h-4 w-4" />
                              <span className="sr-only">Sign out</span>
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                <div className="flex justify-end">
                  <Button 
                    variant="outline" 
                    onClick={handleRevokeAllOtherSessions}
                    disabled={isLoading || sessions.filter(s => !s.isCurrent).length === 0}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out All Other Devices
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
