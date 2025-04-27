"use client"

import { useRef, useEffect } from "react"
import { useTheme } from "next-themes"

export default function AmbientBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d", { alpha: true })
    if (!ctx) return

    // Set canvas dimensions
    const setCanvasDimensions = () => {
      const dpr = window.devicePixelRatio || 1
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.scale(dpr, dpr)
    }

    setCanvasDimensions()

    // Throttle resize event for better performance
    let resizeTimeout: NodeJS.Timeout
    const handleResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        setCanvasDimensions()
      }, 200)
    }

    window.addEventListener("resize", handleResize)

    // Create gradient points - reduce count for better performance
    const points: Point[] = []
    const pointCount = Math.min(8, Math.floor(window.innerWidth / 200)) // Adaptive point count based on screen size

    for (let i = 0; i < pointCount; i++) {
      points.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 100 + 50,
        color: getRandomColor(isDark),
        vx: (Math.random() - 0.5) * 0.2, // Reduced speed
        vy: (Math.random() - 0.5) * 0.2, // Reduced speed
      })
    }

    // Animation with frame limiting
    let lastTime = 0
    const fps = 24 // Limit to 24 FPS for this background effect
    const fpsInterval = 1000 / fps
    let animationId: number

    const animate = (time: number) => {
      animationId = requestAnimationFrame(animate)

      // Calculate elapsed time
      const elapsed = time - lastTime

      // Only update if enough time has passed (frame limiting)
      if (elapsed > fpsInterval) {
        lastTime = time - (elapsed % fpsInterval)

        // Clear canvas with slight fade effect
        ctx.fillStyle = isDark ? "rgba(0, 0, 0, 0.03)" : "rgba(255, 255, 255, 0.03)"
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Update and draw points
        for (const point of points) {
          // Move point
          point.x += point.vx
          point.y += point.vy

          // Bounce off edges
          if (point.x < 0 || point.x > canvas.width) point.vx *= -1
          if (point.y < 0 || point.y > canvas.height) point.vy *= -1

          // Draw gradient
          const gradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, point.radius)

          gradient.addColorStop(0, `${point.color}30`) // 30 = 19% opacity
          gradient.addColorStop(1, `${point.color}00`) // 00 = 0% opacity

          ctx.fillStyle = gradient
          ctx.beginPath()
          ctx.arc(point.x, point.y, point.radius, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }

    animationId = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener("resize", handleResize)
      clearTimeout(resizeTimeout)
      cancelAnimationFrame(animationId)
    }
  }, [isDark])

  return <canvas ref={canvasRef} className="absolute inset-0 -z-5 opacity-30 mix-blend-screen" aria-hidden="true" />
}

interface Point {
  x: number
  y: number
  radius: number
  color: string
  vx: number
  vy: number
}

function getRandomColor(isDark: boolean) {
  const colors = isDark
    ? [
        "#a855f7", // purple
        "#8b5cf6", // violet
        "#6366f1", // indigo
        "#3b82f6", // blue
        "#0ea5e9", // sky
        "#06b6d4", // cyan
        "#14b8a6", // teal
        "#10b981", // emerald
        "#22c55e", // green
      ]
    : [
        "#d946ef", // fuchsia
        "#ec4899", // pink
        "#f43f5e", // rose
        "#ef4444", // red
        "#f97316", // orange
        "#f59e0b", // amber
        "#eab308", // yellow
        "#84cc16", // lime
      ]

  return colors[Math.floor(Math.random() * colors.length)]
}
