"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { PriceMatchModule } from "@/components/price-match-module"
import { useState } from "react"

export default function PriceMatchPage(){
  const [collapsed, setCollapsed] = useState(false)
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {!collapsed && (
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#00D4FF] to-[#00FF88] bg-clip-text text-transparent">Price Match</h1>
            <p className="text-muted-foreground mt-2">Upload a spreadsheet to find matching items</p>
          </div>
        )}
        <PriceMatchModule onMatched={() => setCollapsed(true)} />
      </div>
    </DashboardLayout>
  )
}
