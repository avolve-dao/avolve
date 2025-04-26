"use client"

import { useRef, useEffect } from "react"

export default function AmbientBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d", { alpha: true })
    if (!ctx) return

    // Set canvas dimensions
    const setCanvasDimensions = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    setCanvasDimensions()

    // Throttle resize event for better performance
    let resizeTimeout: NodeJS.Timeout
    const handleResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        setCanvasDimensions()
      }, 100)
    }

    window.addEventListener("resize", handleResize)

    // Create gradient points - reduce count for better performance
    const points: Point[] = []
    const pointCount = 10 // Reduced from 15

    for (let i = 0; i < pointCount; i++) {
      points.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 100 + 50,
        color: getRandomColor(),
        vx: (Math.random() - 0.5) * 0.2, // Reduced speed
        vy: (Math.random() - 0.5) * 0.2, // Reduced speed
      })
    }

    // Animation with frame limiting
    let lastTime = 0
    const fps = 24 // Limit to 24 FPS for this background effect
    const fpsInterval = 1000 / fps

    const animate = (time: number) => {
      requestAnimationFrame(animate)

      // Calculate elapsed time
      const elapsed = time - lastTime

      // Only update if enough time has passed (frame limiting)
      if (elapsed > fpsInterval) {
        lastTime = time - (elapsed % fpsInterval)

        // Clear canvas with slight fade effect
        ctx.fillStyle = "rgba(0, 0, 0, 0.03)"
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

    animate(0)

    return () => {
      window.removeEventListener("resize", handleResize)
      clearTimeout(resizeTimeout)
    }
  }, [])

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

function getRandomColor() {
  const colors = [
    "#a855f7", // purple
    "#8b5cf6", // violet
    "#6366f1", // indigo
    "#3b82f6", // blue
    "#0ea5e9", // sky
    "#06b6d4", // cyan
    "#14b8a6", // teal
    "#10b981", // emerald
    "#22c55e", // green
    "#84cc16", // lime
    "#eab308", // yellow
    "#f59e0b", // amber
    "#f97316", // orange
    "#ef4444", // red
    "#f43f5e", // rose
    "#ec4899", // pink
    "#d946ef", // fuchsia
  ]

  return colors[Math.floor(Math.random() * colors.length)]
}
