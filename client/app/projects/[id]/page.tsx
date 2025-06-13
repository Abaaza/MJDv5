import { DashboardLayout } from "@/components/dashboard-layout"
import { ProjectDetail } from "@/components/project-detail"

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  return (
    <DashboardLayout>
      <ProjectDetail projectId={params.id} />
    </DashboardLayout>
  )
}
