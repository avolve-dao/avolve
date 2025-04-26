"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface TextPair {
  title: string
  subtitle: string
}

interface MorphingTextPairsProps {
  textPairs: TextPair[]
  interval?: number
  className?: string
}

export default function MorphingTextPairs({ textPairs, interval = 5000, className = "" }: MorphingTextPairsProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setInterval(() => {
      setIsVisible(false)

      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % textPairs.length)
        setIsVisible(true)
      }, 600) // Time for fade out before changing text
    }, interval)

    return () => clearInterval(timer)
  }, [interval, textPairs.length])

  return (
    <div className={`flex flex-col ${className}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={`title-${currentIndex}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -20 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="mb-2"
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-zinc-800 dark:text-white drop-shadow-md tracking-tight">
            {textPairs[currentIndex].title}
          </h1>
        </motion.div>
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key={`subtitle-${currentIndex}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.6, ease: "easeInOut", delay: 0.1 }}
        >
          <h2 className="text-2xl md:text-3xl lg:text-4xl text-zinc-700/90 dark:text-white/90 font-medium max-w-3xl mx-auto leading-relaxed">
            {textPairs[currentIndex].subtitle}
          </h2>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
