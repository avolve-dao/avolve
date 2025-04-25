import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-indigo-950 text-white flex flex-col items-center justify-center px-4">
      {/* Hero Section */}
      <section className="w-full max-w-3xl text-center py-20 flex flex-col items-center">
        <div className="mb-8 flex flex-col items-center">
          <span className="inline-flex items-center justify-center rounded-full bg-indigo-600/20 p-4 mb-4 animate-fade-in">
            {/* Replace with your logo if available */}
            <svg className="w-16 h-16 text-indigo-400" fill="none" viewBox="0 0 48 48" stroke="currentColor">
              <circle cx="24" cy="24" r="20" strokeWidth="4" />
              <ellipse cx="24" cy="24" rx="20" ry="8" strokeWidth="4" />
              <ellipse cx="24" cy="24" rx="8" ry="20" strokeWidth="4" />
            </svg>
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 animate-slide-up">
            Avolve
          </h1>
          <p className="text-lg md:text-xl text-zinc-300 mb-8 animate-fade-in">
            Evolve Your Potential. Join the movement redefining human achievement.
          </p>
          <Button className="px-8 py-4 text-lg rounded-full shadow-lg animate-pop-in" size="lg">
            Start Your Journey
          </Button>
        </div>
      </section>
      {/* Feature Highlights */}
      <section className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 animate-fade-in">
        <Card className="bg-zinc-900/70 border-zinc-700/40 p-6 flex flex-col items-center">
          <span className="mb-2 text-indigo-400">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 2v20m10-10H2" strokeWidth="2" /></svg>
          </span>
          <h3 className="font-bold text-xl mb-2">Superachiever</h3>
          <p className="text-zinc-400 mb-2">Personal growth journeys, AI-powered insights, and micro-rewards for progress.</p>
        </Card>
        <Card className="bg-zinc-900/70 border-zinc-700/40 p-6 flex flex-col items-center">
          <span className="mb-2 text-indigo-400">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth="2" /></svg>
          </span>
          <h3 className="font-bold text-xl mb-2">Superachievers</h3>
          <p className="text-zinc-400 mb-2">Form teams, unlock collective impact, and tackle humanity's greatest challenges.</p>
        </Card>
        <Card className="bg-zinc-900/70 border-zinc-700/40 p-6 flex flex-col items-center opacity-60 relative">
          <span className="mb-2 text-indigo-400">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="4" y="4" width="16" height="16" rx="4" strokeWidth="2" /></svg>
          </span>
          <h3 className="font-bold text-xl mb-2 flex items-center gap-2">Supercivilization <span className="ml-1 text-xs bg-zinc-700 px-2 py-0.5 rounded-full">Locked</span></h3>
          <p className="text-zinc-400 mb-2">Progress as a community to unlock the next era of human potential.</p>
          <div className="absolute top-2 right-2"><svg className="w-5 h-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 17v.01"/><rect x="9" y="7" width="6" height="6" rx="3"/><path d="M12 7v4"/></svg></div>
        </Card>
      </section>
      {/* Progress Bar */}
      <section className="w-full max-w-xl mt-16 mb-8 animate-fade-in">
        <div className="flex items-center justify-between mb-2">
          <span className="text-zinc-300 text-sm">Collective Progress</span>
          <span className="text-indigo-400 font-bold">42%</span>
        </div>
        <div className="w-full bg-zinc-800 rounded-full h-4 overflow-hidden relative">
          <div className="bg-gradient-to-r from-indigo-500 via-indigo-400 to-indigo-300 h-4 rounded-full transition-all duration-700" style={{ width: '42%' }} />
        </div>
        <p className="text-xs text-zinc-400 mt-2 text-center">Unlock new features as the community grows!</p>
      </section>
      <Separator className="my-12" />
      {/* Social Proof */}
      <section className="w-full max-w-4xl text-center mb-16 animate-fade-in">
        <h2 className="text-2xl font-bold mb-4">What Superachievers Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-zinc-900/70 border-zinc-700/40 p-4">
            <p className="text-zinc-200 italic mb-2">“Avolve is the most motivating community I’ve ever joined.”</p>
            <span className="text-zinc-400 text-xs">— Early Beta User</span>
          </Card>
          <Card className="bg-zinc-900/70 border-zinc-700/40 p-4">
            <p className="text-zinc-200 italic mb-2">“The progress tracking and rewards make growth addictive.”</p>
            <span className="text-zinc-400 text-xs">— Superachiever</span>
          </Card>
          <Card className="bg-zinc-900/70 border-zinc-700/40 p-4">
            <p className="text-zinc-200 italic mb-2">“I can’t wait for the Supercivilization unlock!”</p>
            <span className="text-zinc-400 text-xs">— Community Member</span>
          </Card>
        </div>
      </section>
      <Separator className="my-12" />
      {/* Call to Action */}
      <footer className="w-full max-w-2xl text-center pb-16 animate-fade-in">
        <h3 className="text-2xl font-bold mb-4">Ready to Evolve?</h3>
        <Button className="px-10 py-4 text-lg rounded-full shadow-xl animate-pop-in" size="lg">
          Request Early Access
        </Button>
        <p className="text-zinc-400 mt-4 text-sm">Invitation-only onboarding for the MVP launch. Be among the first superachievers!</p>
      </footer>
    </main>
  );
}
