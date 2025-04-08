"use client"

import { GrokSdkTest } from "@/components/grok/sdk-test"
import { SimpleChatTest } from "@/components/grok/simple-chat-test"

export default function SdkTestPage() {
  return (
    <div className="container py-8">
      <div className="max-w-md mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">SDK Installation Test</h1>
          <p className="text-muted-foreground">Verifying that the required AI SDK packages are properly installed</p>
        </div>

        <GrokSdkTest />

        <div className="pt-8">
          <h2 className="text-xl font-bold text-center mb-4">Chat Functionality Test</h2>
          <SimpleChatTest />
        </div>
      </div>
    </div>
  )
}
