import { DashboardLayout } from "@/components/dashboard-layout"
import ProjectMatchModule from "@/components/project-match-module"

export default function ProjectMatchPage(){
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#00D4FF] to-[#00FF88] bg-clip-text text-transparent">Project Match</h1>
          <p className="text-muted-foreground mt-2">Upload a spreadsheet to match pricing items</p>
        </div>
        <ProjectMatchModule />
      </div>
    </DashboardLayout>
  )
}
