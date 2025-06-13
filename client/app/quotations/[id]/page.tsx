import { DashboardLayout } from "@/components/dashboard-layout"
import { QuotationDetail } from "@/components/quotation-detail"

export default function QuotationDetailPage({ params }: { params: { id: string } }) {
  return (
    <DashboardLayout>
      <QuotationDetail quotationId={params.id} />
    </DashboardLayout>
  )
}
