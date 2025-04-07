"use client"

import { PageContainer } from "@/components/page-container"
import { PSPDashboard } from "@/components/dashboard/psp-dashboard"

export default function PersonalDashboardPage() {
  return (
    <PageContainer title="Personal Success Dashboard" subtitle="Track your progress and complete check-ins">
      <PSPDashboard />
    </PageContainer>
  )
}
