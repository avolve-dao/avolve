import { Suspense } from 'react'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Metadata } from 'next'

// Components
import { AdminShell } from '@/components/shells/admin-shell'
import { AdminHeader } from '@/components/admin/admin-header'
import { MetricsChart } from '@/components/admin/metrics-chart'
import { MetricsFilter } from '@/components/admin/metrics-filter'
import { LoadingCard } from '@/components/ui/loading-card'

export const metadata: Metadata = {
  title: 'Analytics | Avolve Admin',
  description: 'Platform analytics and insights.',
}

// Get time series metrics
async function getTimeSeriesMetrics() {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: metrics } = await supabase.rpc('get_time_series_metrics', {
    p_time_window: '30 days'
  })
  
  return metrics
}

// Get engagement metrics
async function getEngagementMetrics() {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: metrics } = await supabase.rpc('get_engagement_metrics')
  
  return metrics
}

// Get retention metrics
async function getRetentionMetrics() {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: metrics } = await supabase.rpc('get_retention_metrics')
  
  return metrics
}

export default async function AnalyticsPage() {
  const [timeSeriesMetrics, engagementMetrics, retentionMetrics] = await Promise.all([
    getTimeSeriesMetrics(),
    getEngagementMetrics(),
    getRetentionMetrics(),
  ])

  return (
    <AdminShell>
      <AdminHeader
        title="Analytics"
        description="Monitor platform performance and user engagement"
      />

      {/* Filters */}
      <div className="mb-6">
        <MetricsFilter />
      </div>

      <div className="grid gap-6">
        {/* Growth Metrics */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-white">Growth</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <Suspense fallback={<LoadingCard />}>
              <MetricsChart
                title="User Growth"
                data={timeSeriesMetrics?.users}
                type="line"
              />
            </Suspense>
            <Suspense fallback={<LoadingCard />}>
              <MetricsChart
                title="Team Growth"
                data={timeSeriesMetrics?.teams}
                type="line"
              />
            </Suspense>
          </div>
        </section>

        {/* Engagement Metrics */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-white">Engagement</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <Suspense fallback={<LoadingCard />}>
              <MetricsChart
                title="Daily Active Users"
                data={engagementMetrics?.dau}
                type="bar"
              />
            </Suspense>
            <Suspense fallback={<LoadingCard />}>
              <MetricsChart
                title="Actions per User"
                data={engagementMetrics?.actions_per_user}
                type="bar"
              />
            </Suspense>
          </div>
        </section>

        {/* Retention Metrics */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-white">Retention</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <Suspense fallback={<LoadingCard />}>
              <MetricsChart
                title="User Retention"
                data={retentionMetrics?.retention}
                type="heatmap"
              />
            </Suspense>
            <Suspense fallback={<LoadingCard />}>
              <MetricsChart
                title="Churn Rate"
                data={retentionMetrics?.churn}
                type="line"
              />
            </Suspense>
          </div>
        </section>
      </div>
    </AdminShell>
  )
}
