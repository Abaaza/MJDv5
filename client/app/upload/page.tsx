import { DashboardLayout } from "@/components/dashboard-layout"
import { UploadModule } from "@/components/upload-module"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function UploadPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#00D4FF] to-[#00FF88] bg-clip-text text-transparent">
            Upload Documents
          </h1>
          <p className="text-muted-foreground mt-2">Upload Excel files to automatically generate quotations</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <UploadModule />
          </div>

          <div className="space-y-6">
            <Card className="glass-effect border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Upload Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-400">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-[#00D4FF] rounded-full mt-2 flex-shrink-0"></div>
                  <p>Excel files should contain item descriptions, quantities, and units</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-[#00FF88] rounded-full mt-2 flex-shrink-0"></div>
                  <p>Pricing logic will be automatically applied based on material types</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-[#FF6B35] rounded-full mt-2 flex-shrink-0"></div>
                  <p>Files are processed in real-time with instant feedback</p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-effect border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Recent Uploads</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-2 rounded bg-white/5">
                  <span className="text-white text-sm">office_complex_items.xlsx</span>
                  <span className="text-[#00FF88] text-xs">45 items</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-white/5">
                  <span className="text-white text-sm">residential_tower.xlsx</span>
                  <span className="text-[#00FF88] text-xs">32 items</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-white/5">
                  <span className="text-white text-sm">bridge_renovation.xlsx</span>
                  <span className="text-[#00FF88] text-xs">67 items</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
