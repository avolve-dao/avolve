"use client"

import * as React from "react"

import { useState, useEffect } from "react"
import Image, { type ImageProps } from "next/image"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

interface OptimizedImageProps extends Omit<ImageProps, "onLoad" | "onError"> {
  fallback?: React.ReactNode
  showSkeleton?: boolean
}

export function OptimizedImage({ src, alt, className, fallback, showSkeleton = true, ...props }: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const [imageSrc, setImageSrc] = useState(src)

  // Reset loading state when src changes
  useEffect(() => {
    setIsLoading(true)
    setError(false)
    setImageSrc(src)
  }, [src])

  // Handle image load
  const handleLoad = () => {
    setIsLoading(false)
  }

  // Handle image error
  const handleError = () => {
    setIsLoading(false)
    setError(true)
    // Set fallback image if available
    if (typeof fallback === "string") {
      setImageSrc(fallback as string)
    }
  }

  return (
    <div className="relative">
      {isLoading && showSkeleton && <Skeleton className={cn("absolute inset-0 z-10", className)} />}

      {error && typeof fallback !== "string" ? (
        fallback || (
          <div className={cn("flex items-center justify-center bg-muted text-muted-foreground", className)}>
            Failed to load image
          </div>
        )
      ) : (
        <Image
          src={imageSrc || "/placeholder.svg"}
          alt={alt}
          className={cn("transition-opacity duration-300", isLoading ? "opacity-0" : "opacity-100", className)}
          onLoadingComplete={handleLoad}
          onError={handleError}
          loading="lazy"
          {...props}
        />
      )}
    </div>
  )
}

