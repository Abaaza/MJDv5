import { DashboardLayout } from "@/components/dashboard-layout"
import { AnalyticsDashboard } from "@/components/analytics-dashboard"
import { ProjectGrid } from "@/components/project-grid"
export default function HomePage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#00D4FF] to-[#00FF88] bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">Welcome to the MJD platform</p>
        </div>

        <AnalyticsDashboard />
        <ProjectGrid />
      </div>
    </DashboardLayout>
  )
}
