import { DashboardLayout } from "@/components/dashboard-layout"
import { QuotationGrid } from "@/components/quotation-grid"

export default function QuotationsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#00D4FF] to-[#00FF88] bg-clip-text text-transparent">
            All Quotations
          </h1>
          <p className="text-muted-foreground mt-2">View and manage all your construction quotations</p>
        </div>

        <QuotationGrid />
      </div>
    </DashboardLayout>
  )
}
