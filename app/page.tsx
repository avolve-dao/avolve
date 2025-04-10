import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { InviteForm } from "@/components/landing/invite-form"

// Next.js 15 page configuration
export const generateStaticParams = async () => {
  return []
}

export const generateMetadata = async () => {
  return {
    title: 'Avolve - Evolve into your highest potential',
    description: 'A private community for extraordinary individuals'
  }
}

// Set revalidation time (ISR)
export const revalidate = 3600 // 1 hour

export default async function Page() {
  // Track anonymous page view happens client-side in the InviteForm component
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-zinc-900 to-black p-4">
      <div className="w-full max-w-4xl mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-center text-white mb-2">Welcome to Avolve</h1>
        <p className="text-xl text-center text-zinc-400 mb-12">Evolve into your highest potential</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Superachiever Teaser */}
          <Card className="border-stone-800 bg-stone-950/50 backdrop-blur-sm hover:shadow-md hover:shadow-amber-900/20 transition-all">
            <div className="h-2 w-full bg-gradient-to-r from-amber-500 to-yellow-500"></div>
            <CardHeader>
              <CardTitle className="text-xl text-white">Superachiever</CardTitle>
              <CardDescription className="text-stone-400">
                Your individual journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-stone-300">
                Unlock your personal potential through daily challenges and growth opportunities. 
                Build your success puzzle one piece at a time.
              </p>
            </CardContent>
          </Card>
          
          {/* Superachievers Teaser */}
          <Card className="border-slate-800 bg-slate-950/50 backdrop-blur-sm hover:shadow-md hover:shadow-blue-900/20 transition-all">
            <div className="h-2 w-full bg-gradient-to-r from-blue-500 to-cyan-500"></div>
            <CardHeader>
              <CardTitle className="text-xl text-white">Superachievers</CardTitle>
              <CardDescription className="text-slate-400">
                Your collective journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-300">
                Connect with like-minded individuals to solve challenges together. 
                Contribute to a community of extraordinary achievers.
              </p>
            </CardContent>
          </Card>
          
          {/* Supercivilization Teaser */}
          <Card className="border-zinc-800 bg-zinc-950/50 backdrop-blur-sm hover:shadow-md hover:shadow-blue-900/20 transition-all">
            <div className="h-2 w-full bg-gradient-to-r from-zinc-400 to-zinc-600"></div>
            <CardHeader>
              <CardTitle className="text-xl text-white">Supercivilization</CardTitle>
              <CardDescription className="text-zinc-400">
                Your ecosystem journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-300">
                Participate in building a new kind of civilization based on The Prime Law. 
                Shape the future through governance and innovation.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="w-full max-w-md">
        <Card className="border-zinc-800 bg-zinc-950/50 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 p-[2px]">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-zinc-950">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-white">Avolve</CardTitle>
            <CardDescription className="text-zinc-400">
              A private community for extraordinary individuals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center text-sm text-zinc-400">
                <p>Membership is by invitation only</p>
              </div>
              <Suspense fallback={<div className="h-20 animate-pulse bg-zinc-800 rounded-md"></div>}>
                <InviteForm />
              </Suspense>
            </div>
          </CardContent>
          <div className="px-6 pb-6 text-center text-xs text-zinc-500">
            <p>Already a member? <a href="/auth/login" className="text-indigo-400 hover:text-indigo-300">Sign in</a></p>
          </div>
        </Card>
      </div>
    </div>
  )
}
