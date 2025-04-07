"use client"

import React from "react"
import { cn } from "@/lib/utils"

interface QRCodeProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  size?: number
  title?: string
}

/**
 * Simple QR Code Component
 * 
 * A basic component to display QR code data as a link
 * This is a simplified version that doesn't require external dependencies
 */
export function QRCode({
  value,
  size = 200,
  title = "Scan this QR code",
  className,
  ...props
}: QRCodeProps) {
  // Create a URL-friendly version of the value
  const encodedValue = encodeURIComponent(value)
  
  return (
    <div className={cn("flex flex-col items-center space-y-2", className)} {...props}>
      <div 
        className="bg-white p-4 rounded-md border border-border flex flex-col items-center justify-center"
        style={{ width: size, minHeight: size / 2 }}
      >
        <p className="text-sm text-center mb-4">{title}</p>
        <a 
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-center"
        >
          Open Authenticator Link
        </a>
      </div>
      <p className="text-xs text-muted-foreground text-center max-w-xs">
        Click the button above to open the link in your authenticator app, or manually enter the code below
      </p>
    </div>
  )
}
