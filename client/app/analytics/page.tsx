import { DashboardLayout } from "@/components/dashboard-layout"
import { AnalyticsDashboard } from "@/components/analytics-dashboard"

export default function AnalyticsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#00D4FF] to-[#00FF88] bg-clip-text text-transparent">
            Analytics
          </h1>
          <p className="text-muted-foreground mt-2">Track performance and insights across your quotations</p>
        </div>

        <AnalyticsDashboard />
      </div>
    </DashboardLayout>
  )
}
