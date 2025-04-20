import { Suspense } from 'react'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

// Components
import { HeroSection } from '@/components/marketing/hero-section'
import { FeatureShowcase } from '@/components/marketing/feature-showcase'
import { SocialProof } from '@/components/marketing/social-proof'
import { ValueProposition } from '@/components/marketing/value-proposition'
import { CTASection } from '@/components/marketing/cta-section'
import LoadingSpinner from '@/components/ui/loading-spinner'
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

// Get personalized content based on user's location and referral
async function getPersonalizedContent() {
  let supabase;
  try {
    supabase = createServerClient({ cookies });
  } catch (error) {
    console.warn('Failed to initialize Supabase client:', error instanceof Error ? error.message : 'Unknown error');
    // Return fallback data if Supabase initialization fails
    return {
      location: null,
      testimonials: null,
      metrics: null,
    };
  }
  
  // Get user's general location (country/region)
  let location = null;
  try {
    const { data } = await supabase.functions.invoke('get-geo-location');
    location = data?.location;
  } catch (error) {
    console.warn('Failed to get location:', error instanceof Error ? error.message : 'Unknown error');
  }
  
  // Get relevant testimonials and case studies
  let testimonials = null;
  try {
    if (location?.country) {
      const { data } = await supabase
        .from('testimonials')
        .select('*')
        .eq('region', location.country)
        .limit(3);
      testimonials = data;
    }
  } catch (error) {
    console.warn('Failed to get testimonials:', error instanceof Error ? error.message : 'Unknown error');
  }

  // Get relevant success metrics
  let metrics = null;
  try {
    if (location?.country) {
      const { data } = await supabase
        .from('platform_metrics')
        .select('*')
        .eq('region', location.country)
        .single();
      metrics = data;
    }
  } catch (error) {
    console.warn('Failed to get metrics:', error instanceof Error ? error.message : 'Unknown error');
  }

  return {
    location,
    testimonials,
    metrics,
  }
}

export default async function HomePage() {
  const content = await getPersonalizedContent()

  return (
    <main className="flex-1">
      {/* Hero Section */}
      <HeroSection 
        region={content.location?.country}
        metrics={content.metrics}
        title="Transform Yourself, Transform Humanity"
        description="Embark on a journey of personal evolution and collective achievement to build a supercivilization with other extraordinary individuals."
      />

      <Separator className="my-12" />

      {/* Value Proposition */}
      <ValueProposition
        title="The Path to Supercivilization"
        content="Avolve is a revolutionary platform that empowers individuals to unlock their highest potential, form powerful collectives, and evolve humanity toward a supercivilization based on The Prime Law."
        sections={[
          {
            title: "Superachiever",
            content: "Embark on a transformative journey of self-discovery and personal growth to become the best version of yourself through personalized challenges and AI-powered insights."
          },
          {
            title: "Superachievers",
            content: "Connect with extraordinary individuals who share your drive for growth, forming powerful teams to tackle humanity's greatest challenges together."
          },
          {
            title: "Supercivilization",
            content: "Participate in shaping a new era of human civilization based on The Prime Law, where individual liberty and collective achievement create unprecedented prosperity."
          }
        ]}
      />
      <Separator className="my-12" />
      {/* Feature Showcase */}
      <Suspense fallback={<LoadingSpinner />}>
        <FeatureShowcase
          title="Your Journey of Transformation"
          features={[
            {
              title: "Personal Evolution",
              content: "Customized growth paths with AI-driven insights and challenges that adapt to your progress and goals."
            },
            {
              title: "Collective Impact",
              content: "Form teams with like-minded superachievers to solve complex problems and create meaningful change."
            },
            {
              title: "Token Recognition",
              content: "Earn tokens that represent your real achievements and contributions, unlocking access to exclusive opportunities."
            },
            {
              title: "Guided by Sacred Geometry",
              content: "Leverage the universal principles of sacred geometry to structure your personal and collective evolution."
            }
          ]}
        />
      </Suspense>

      <section className="py-24 px-6 bg-zinc-900/80 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/5 bg-[size:40px_40px] opacity-10" />
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-6">
            What Our Community Achieves
          </h2>
          <p className="text-lg text-zinc-300 max-w-3xl mx-auto mb-12">
            Our superachievers are already making extraordinary progress in their personal evolution and collective impact.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="p-6 rounded-xl bg-zinc-800/50 border border-zinc-700/30 backdrop-blur-sm">
              <div className="text-3xl font-bold text-indigo-400 mb-2">{new Intl.NumberFormat().format(content.metrics?.users || 0)}</div>
              <div className="text-zinc-300">Active Superachievers</div>
            </Card>
            <Card className="p-6 rounded-xl bg-zinc-800/50 border border-zinc-700/30 backdrop-blur-sm">
              <div className="text-3xl font-bold text-indigo-400 mb-2">{new Intl.NumberFormat().format(content.metrics?.teams || 0)}</div>
              <div className="text-zinc-300">Impact Teams</div>
            </Card>
            <Card className="p-6 rounded-xl bg-zinc-800/50 border border-zinc-700/30 backdrop-blur-sm">
              <div className="text-3xl font-bold text-indigo-400 mb-2">{new Intl.NumberFormat().format(content.metrics?.achievements || 0)}</div>
              <div className="text-zinc-300">Milestones Achieved</div>
            </Card>
          </div>
        </div>
      </section>
      <Separator className="my-12" />
      {/* Social Proof */}
      <Suspense fallback={<LoadingSpinner />}>
        <SocialProof testimonials={content.testimonials || []} />
      </Suspense>
      <Separator className="my-12" />
      {/* Call to Action */}
      <section className="flex flex-col items-center justify-center py-16">
        <CTASection 
          region={content.location?.country}
          metrics={content.metrics}
          title="Join the Evolution"
          description="Become part of a movement that is redefining human potential and building the foundation for a supercivilization."
        />
        <Button className="mt-8 px-8 py-4 text-lg rounded-full shadow-lg" size="lg">
          Get Started
        </Button>
      </section>
    </main>
  )
}
