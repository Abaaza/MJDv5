import { DashboardLayout } from "@/components/dashboard-layout"
import { ClientsGrid } from "@/components/clients-grid"

export default function ClientsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#00D4FF] to-[#00FF88] bg-clip-text text-transparent">
            Clients
          </h1>
          <p className="text-muted-foreground mt-2">Manage your client relationships and project history</p>
        </div>

        <ClientsGrid />
      </div>
    </DashboardLayout>
  )
}
