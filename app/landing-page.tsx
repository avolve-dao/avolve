"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle, XCircle } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { ROUTES } from "@/constants"

export default function LandingPage() {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div className="min-h-screen">
      {/* Hero Section with Polarizing Message */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-4">
              <div className="inline-block rounded-lg bg-zinc-100 dark:bg-zinc-800 px-3 py-1 text-sm mb-4">
                Not for everyone. Only for value creators.
              </div>

              {/* Polarizing headline */}
              <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">Are You a Regen or Still a Degen?</h1>

              {/* Problem-focused subheadline */}
              <p className="text-xl text-muted-foreground md:text-2xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Join the Supercivilization of value creators or stay trapped in the Anticivilization of value
                extractors. The choice is yours.
              </p>

              {/* Clear call to action */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  size="lg"
                  className="px-8"
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                  asChild
                >
                  <Link href={ROUTES.SIGNUP}>
                    <span className="flex items-center gap-2">
                      Join the Supercivilization
                      <motion.div animate={{ x: isHovered ? 5 : 0 }} transition={{ duration: 0.2 }}>
                        <ArrowRight className="h-5 w-5" />
                      </motion.div>
                    </span>
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href={ROUTES.LOGIN}>I'm Already a Regen</Link>
                </Button>
              </div>

              {/* Value proposition points */}
              <div className="grid gap-2 pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Create your unique Genius ID</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Earn GEN tokens for value creation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Access Genie AI for personalized guidance</span>
                </div>
              </div>
            </div>

            {/* Hero image - using a gradient instead of an AI-generated image */}
            <div className="flex items-center justify-center">
              <div className="relative w-full max-w-[500px] aspect-square rounded-lg overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-400 to-zinc-600 animate-gradient-slow"></div>
                <div className="absolute inset-0 flex items-center justify-center text-white text-4xl font-bold">
                  #Supercivilization
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Polarizing Section - Who This Is For/Not For */}
      <section className="py-16 bg-zinc-50 dark:bg-zinc-900">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter">This Platform Is Not For Everyone</h2>
            <p className="text-muted-foreground mt-2 max-w-[700px] mx-auto">
              We deliberately polarize to attract Regens and repel Degens
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-100 dark:border-green-800/30">
              <h3 className="text-xl font-bold mb-4 text-green-700 dark:text-green-400 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" /> This Is For You If:
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
                  <span>You're a self-leader who takes responsibility for your life</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
                  <span>You believe in creating value that benefits yourself and others</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
                  <span>You embrace positive-sum thinking and abundance</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
                  <span>You want to contribute to building a better world</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
                  <span>You're committed to continuous growth and improvement</span>
                </li>
              </ul>
            </div>

            <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-lg border border-red-100 dark:border-red-900/30">
              <h3 className="text-xl font-bold mb-4 text-red-700 dark:text-red-400 flex items-center gap-2">
                <XCircle className="h-5 w-5" /> This Is NOT For You If:
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <XCircle className="h-4 w-4 text-red-500 mt-1" />
                  <span>You're stuck in a follower mentality waiting for others to lead</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="h-4 w-4 text-red-500 mt-1" />
                  <span>You believe success requires taking value from others</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="h-4 w-4 text-red-500 mt-1" />
                  <span>You're trapped in zero-sum thinking and scarcity</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="h-4 w-4 text-red-500 mt-1" />
                  <span>You want quick fixes without putting in the work</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="h-4 w-4 text-red-500 mt-1" />
                  <span>You're not willing to challenge your existing beliefs</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Problem-Solution Section */}
      <section className="py-16">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter">The Anticivilization Problem</h2>
              <p className="text-muted-foreground">Most people are trapped as Degens in the Anticivilization:</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">•</span>
                  <span>Stuck in follower mentality that enables parasitical elites</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">•</span>
                  <span>Trapped in zero-sum thinking that limits potential</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">•</span>
                  <span>Value is destroyed or usurped rather than created</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">•</span>
                  <span>Good and great people are harmed rather than helped</span>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter">The Supercivilization Solution</h2>
              <p className="text-muted-foreground">Avolve helps you transform into a Regen in the Supercivilization:</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold">•</span>
                  <span>Become a self-leader and integrated thinker</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold">•</span>
                  <span>Embrace positive-sum thinking that expands possibilities</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold">•</span>
                  <span>Create value that benefits yourself, others, society, and the environment</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold">•</span>
                  <span>Join the good and great people who produce and create value</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials from Regens */}
      <section className="py-16 bg-zinc-50 dark:bg-zinc-900">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold tracking-tighter">Hear From Fellow Regens</h2>
            <p className="text-muted-foreground mt-2 max-w-[700px] mx-auto">
              Value creators who have transformed their thinking and their lives
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-sm">
              <p className="italic mb-4">
                "I was stuck in zero-sum thinking for years. Avolve helped me see that creating value for others
                actually creates more value for myself. My business has grown 3x since adopting Regen thinking."
              </p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-zinc-200 dark:bg-zinc-700"></div>
                <div>
                  <p className="font-medium">Michael K.</p>
                  <p className="text-sm text-muted-foreground">Entrepreneur & Value Creator</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-sm">
              <p className="italic mb-4">
                "The Genius ID process was transformative. It helped me identify my unique value creation abilities and
                focus on what I do best. I'm now creating 10x more value and feeling fulfilled."
              </p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-zinc-200 dark:bg-zinc-700"></div>
                <div>
                  <p className="font-medium">Sarah J.</p>
                  <p className="text-sm text-muted-foreground">Creative Director & Regen Thinker</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-sm">
              <p className="italic mb-4">
                "Genie AI helped me overcome my limiting beliefs about value creation. Now I approach every challenge
                with a positive-sum mindset. My impact has grown exponentially."
              </p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-zinc-200 dark:bg-zinc-700"></div>
                <div>
                  <p className="font-medium">David T.</p>
                  <p className="text-sm text-muted-foreground">Community Builder & Value Amplifier</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Creation Path Section */}
      <section className="py-16">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold tracking-tighter">Your Path to the Supercivilization</h2>
            <p className="text-muted-foreground mt-2 max-w-[700px] mx-auto">
              Four key components to transform from Degen to Regen and join the Supercivilization
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-zinc-400 to-zinc-600 flex items-center justify-center mb-4 text-white">
                <span className="text-xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Commit to Principles</h3>
              <p className="text-muted-foreground">
                Align yourself with the value-creating principles of the Supercivilization
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-zinc-400 to-zinc-600 flex items-center justify-center mb-4 text-white">
                <span className="text-xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Create Your Genius ID</h3>
              <p className="text-muted-foreground">
                Establish your unique identity as a value creator in the Supercivilization
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-zinc-400 to-zinc-600 flex items-center justify-center mb-4 text-white">
                <span className="text-xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Earn GEN Tokens</h3>
              <p className="text-muted-foreground">
                Accumulate the currency of value creation to fuel your transformation
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-zinc-400 to-zinc-600 flex items-center justify-center mb-4 text-white">
                <span className="text-xl font-bold">4</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Access Genie AI</h3>
              <p className="text-muted-foreground">Get personalized guidance on your journey from Degen to Regen</p>
            </div>
          </div>

          <div className="flex justify-center mt-10">
            <Button size="lg" className="px-8" asChild>
              <Link href={ROUTES.SIGNUP}>
                Begin Your Transformation <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Final CTA Section with Polarizing Message */}
      <section className="py-20 bg-zinc-900 text-white">
        <div className="container px-4 md:px-6">
          <div className="text-center max-w-[800px] mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tighter mb-4">The Supercivilization Is Calling</h2>
            <p className="text-xl mb-8 text-zinc-300">
              Will you remain a Degen in the Anticivilization, or will you transform into a Regen and help build the
              Supercivilization?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="px-8 bg-white text-zinc-900 hover:bg-zinc-200" asChild>
                <Link href={ROUTES.SIGNUP}>
                  I Choose to Be a Regen <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10" asChild>
                <Link href="/pricing">View Value Creation Tiers</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
