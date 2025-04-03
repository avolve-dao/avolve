"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { checkAiSdkSetup } from "@/lib/ai-sdk-setup"
import { Bot, Check, X } from "lucide-react"

export function GrokSdkTest() {
  const [sdkStatus, setSdkStatus] = useState<{
    aiSdkInstalled: boolean
    xaiSdkInstalled: boolean
  } | null>(null)

  useEffect(() => {
    // Check SDK installation status
    setSdkStatus(checkAiSdkSetup())
  }, [])

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          Grok SDK Installation Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!sdkStatus ? (
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">AI SDK Core</span>
              {sdkStatus.aiSdkInstalled ? (
                <div className="flex items-center text-green-500">
                  <Check className="h-5 w-5 mr-1" />
                  Installed
                </div>
              ) : (
                <div className="flex items-center text-red-500">
                  <X className="h-5 w-5 mr-1" />
                  Not Installed
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="font-medium">xAI SDK</span>
              {sdkStatus.xaiSdkInstalled ? (
                <div className="flex items-center text-green-500">
                  <Check className="h-5 w-5 mr-1" />
                  Installed
                </div>
              ) : (
                <div className="flex items-center text-red-500">
                  <X className="h-5 w-5 mr-1" />
                  Not Installed
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">
          The AI SDK and xAI integration are required for the Grok features to work properly.
        </p>
      </CardFooter>
    </Card>
  )
}

