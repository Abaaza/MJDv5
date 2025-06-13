import { DashboardLayout } from "@/components/dashboard-layout"
import { SettingsPanel } from "@/components/settings-panel"

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#00D4FF] to-[#00FF88] bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-muted-foreground mt-2">Configure your platform preferences and account settings</p>
        </div>

        <SettingsPanel />
      </div>
    </DashboardLayout>
  )
}
