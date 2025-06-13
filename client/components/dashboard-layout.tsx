"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { TopBar } from "@/components/top-bar"
import { BottomNav } from "@/components/bottom-nav"
import { cn } from "@/lib/utils"
import { useMobileOptimization } from "@/components/mobile-optimization-provider"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isMobile, isIOS, safeAreaTop } = useMobileOptimization()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    // Collapse sidebar by default on mobile
    if (isMobile) {
      setSidebarCollapsed(true)
    }
  }, [isMobile])

  return (
    <div className={cn("mobile-vh bg-black prevent-pull-refresh", isIOS && "is-ios")}>
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div
        className={cn(
          "transition-all duration-300 ease-in-out mobile-vh flex flex-col",
          !isMobile && (sidebarCollapsed ? "ml-16" : "ml-64"),
        )}
        style={{ paddingTop: isMobile ? safeAreaTop : 0 }}
      >
        <TopBar onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)} />

        <main className="flex-1 p-4 md:p-8 overflow-auto mobile-scroll allow-scroll">{children}</main>

        {isMobile && <BottomNav />}
      </div>
    </div>
  )
}
