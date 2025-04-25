import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface CTASectionProps {
  region?: string;
  metrics?: {
    users: number;
    teams: number;
    achievements: number;
  };
  title?: string;
  description?: string;
}

export function CTASection({ region, metrics, title, description }: CTASectionProps) {
  // Customize CTA based on region
  const ctaText = region === 'US' ? 'Join the Evolution' : 'Start Your Journey';

  return (
    <section className="relative isolate overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.indigo.100),theme(colors.zinc.900))] opacity-20" />

      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {title || 'Ready to Evolve?'}
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-zinc-300">
            {description ||
              `Join ${metrics?.users ? new Intl.NumberFormat().format(metrics.users) : 'thousands of'} extraordinary individuals who are already on their journey to unlock their highest potential.`}
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button asChild size="lg">
              <Link href="/signup">{ctaText}</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/about">
                Learn More
                <svg
                  className="ml-2 h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                  />
                </svg>
              </Link>
            </Button>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="mt-16 grid grid-cols-1 gap-8 sm:mt-20 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col items-center gap-y-4 rounded-2xl bg-zinc-800/10 p-8 text-center">
            <div className="text-5xl font-bold tracking-tight text-white">
              {metrics?.users ? new Intl.NumberFormat().format(metrics.users) : '10K+'}
            </div>
            <div className="text-sm font-semibold leading-6 text-zinc-300">Active Members</div>
          </div>
          <div className="flex flex-col items-center gap-y-4 rounded-2xl bg-zinc-800/10 p-8 text-center">
            <div className="text-5xl font-bold tracking-tight text-white">
              {metrics?.teams ? new Intl.NumberFormat().format(metrics.teams) : '500+'}
            </div>
            <div className="text-sm font-semibold leading-6 text-zinc-300">Active Teams</div>
          </div>
          <div className="flex flex-col items-center gap-y-4 rounded-2xl bg-zinc-800/10 p-8 text-center">
            <div className="text-5xl font-bold tracking-tight text-white">
              {metrics?.achievements
                ? new Intl.NumberFormat().format(metrics.achievements)
                : '50K+'}
            </div>
            <div className="text-sm font-semibold leading-6 text-zinc-300">
              Achievements Unlocked
            </div>
          </div>
          <div className="flex flex-col items-center gap-y-4 rounded-2xl bg-zinc-800/10 p-8 text-center">
            <div className="text-5xl font-bold tracking-tight text-white">98%</div>
            <div className="text-sm font-semibold leading-6 text-zinc-300">Member Satisfaction</div>
          </div>
        </div>

        {/* Trust badges */}
        <div className="mt-16 flex justify-center gap-x-6 sm:mt-20">
          <div className="flex items-center gap-x-2">
            <svg
              className="h-6 w-6 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
              />
            </svg>
            <span className="text-sm font-semibold text-zinc-300">Bank-level Security</span>
          </div>
          <div className="flex items-center gap-x-2">
            <svg
              className="h-6 w-6 text-blue-500"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
              />
            </svg>
            <span className="text-sm font-semibold text-zinc-300">Verified Platform</span>
          </div>
          <div className="flex items-center gap-x-2">
            <svg
              className="h-6 w-6 text-yellow-500"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
              />
            </svg>
            <span className="text-sm font-semibold text-zinc-300">5-Star Rating</span>
          </div>
        </div>
      </div>
    </section>
  );
}
