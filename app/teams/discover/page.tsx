import { Suspense } from 'react'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Metadata } from 'next'

// Components
import DashboardShell from '@/components/shells/dashboard-shell'
import { PageHeader } from '@/components/ui/page-header'
import { TeamCard } from '@/components/Teams/team-card'
import { TeamFilters } from '@/components/Teams/team-filters'
import { LoadingCard } from '@/components/ui/loading-card'
import { EmptyState } from '@/components/ui/empty-state'

// Define the type for team objects
interface Team {
  id: string;
  name?: string;
  description?: string;
  avatar_url?: string;
  members?: { count: number };
  owner?: { username?: string; full_name?: string; avatar_url?: string };
  featured?: boolean;
  featured_order?: number;
  [key: string]: any;
}

export const metadata: Metadata = {
  title: 'Discover Teams | Avolve',
  description: 'Find and join teams that align with your interests and goals.',
}

// Get recommended teams based on user preferences
async function getRecommendedTeams(userId: string) {
  const supabase = createServerComponentClient({ cookies })
  
  // Get user's interests and focus areas
  const { data: userPrefs } = await supabase
    .from('user_preferences')
    .select('focus_areas, interests')
    .eq('user_id', userId)
    .single()

  // Get teams that match user's interests
  const { data: teams } = await supabase
    .rpc('get_recommended_teams', {
      p_user_id: userId,
      p_focus_areas: userPrefs?.focus_areas || [],
      p_interests: userPrefs?.interests || []
    })

  return teams
}

// Get trending teams
async function getTrendingTeams() {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: teams } = await supabase
    .rpc('get_trending_teams', {
      p_time_window: '7 days'
    })

  return teams
}

// Get featured teams (curated by admins)
async function getFeaturedTeams() {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: teams } = await supabase
    .from('teams')
    .select(`
      *,
      members:team_members(count),
      owner:profiles(username, full_name, avatar_url)
    `)
    .eq('featured', true)
    .order('featured_order', { ascending: true })

  return teams
}

export default async function TeamsDiscoverPage() {
  const supabase = createServerComponentClient({ cookies })
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return null // Handle in middleware
  }

  // Get teams data
  const [recommendedTeams, trendingTeams, featuredTeams] = await Promise.all([
    getRecommendedTeams(user.id),
    getTrendingTeams(),
    getFeaturedTeams()
  ])

  return (
    <DashboardShell>
      <PageHeader
        title="Discover Teams"
        description="Find teams that match your interests and goals."
      />

      {/* Filters */}
      <div className="mb-8">
        <TeamFilters />
      </div>

      {/* Featured Teams */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Featured Teams</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Suspense fallback={<LoadingCard count={3} />}>
            {featuredTeams?.map((team: Team) => (
              <TeamCard
                key={team.id}
                team={team}
                variant="featured"
              />
            ))}
          </Suspense>
        </div>
      </section>

      {/* Recommended Teams */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Recommended for You</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Suspense fallback={<LoadingCard count={3} />}>
            {recommendedTeams?.length ? (
              recommendedTeams.map((team: Team) => (
                <TeamCard
                  key={team.id}
                  team={team}
                  variant="recommended"
                />
              ))
            ) : (
              <EmptyState
                title="No recommendations yet"
                description="Complete your profile and interests to get personalized team recommendations."
                action={{
                  label: 'Update Profile',
                  href: '/profile'
                }}
              />
            )}
          </Suspense>
        </div>
      </section>

      {/* Trending Teams */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Trending This Week</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Suspense fallback={<LoadingCard count={3} />}>
            {trendingTeams?.map((team: Team) => (
              <TeamCard
                key={team.id}
                team={team}
                variant="trending"
              />
            ))}
          </Suspense>
        </div>
      </section>
    </DashboardShell>
  )
}
