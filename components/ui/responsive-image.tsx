import Image from "next/image"
import { cn } from "@/lib/utils"

interface ResponsiveImageProps {
  src: string
  alt: string
  className?: string
  width?: number
  height?: number
  priority?: boolean
  sizes?: string
  fill?: boolean
  quality?: number
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down"
}

export function ResponsiveImage({
  src,
  alt,
  className,
  width,
  height,
  priority = false,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  fill = false,
  quality = 85,
  objectFit = "cover",
}: ResponsiveImageProps) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <Image
        src={src || "/placeholder.svg"}
        alt={alt}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        className={cn(
          "transition-all duration-300",
          objectFit === "contain" && "object-contain",
          objectFit === "cover" && "object-cover",
          objectFit === "fill" && "object-fill",
          objectFit === "none" && "object-none",
          objectFit === "scale-down" && "object-scale-down",
          fill && "object-cover",
        )}
        priority={priority}
        sizes={sizes}
        fill={fill}
        quality={quality}
      />
    </div>
  )
}
