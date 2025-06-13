"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { Sidebar } from "@/components/navigation/sidebar"
import { TopBar } from "@/components/navigation/top-bar"
import { BottomNav } from "@/components/navigation/bottom-nav"
import { cn } from "@/lib/utils"
import { useMobileOptimization } from "@/hooks/use-mobile-optimization"
import { useScrollLock } from "@/hooks/use-scroll-lock"
import { LayoutContext } from "@/contexts/layout-context"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isMobile, isIOS, safeAreaTop } = useMobileOptimization()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Lock scroll when sidebar is open on mobile
  useScrollLock(isMobile && sidebarOpen)

  // Collapse sidebar by default on mobile
  useEffect(() => {
    setSidebarCollapsed(isMobile)
  }, [isMobile])

  // Toggle sidebar functions
  const toggleSidebar = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen)
    } else {
      setSidebarCollapsed(!sidebarCollapsed)
    }
  }

  // Close sidebar when clicking outside on mobile
  const closeSidebar = () => {
    if (isMobile) {
      setSidebarOpen(false)
    }
  }

  // Memoize layout context value to prevent unnecessary re-renders
  const layoutContextValue = useMemo(
    () => ({
      sidebarCollapsed,
      sidebarOpen,
      toggleSidebar,
      closeSidebar,
    }),
    [sidebarCollapsed, sidebarOpen],
  )

  return (
    <LayoutContext.Provider value={layoutContextValue}>
      <div className={cn("mobile-vh bg-black prevent-pull-refresh", isIOS && "is-ios")}>
        <Sidebar />

        <div
          className={cn(
            "transition-all duration-300 ease-in-out mobile-vh flex flex-col",
            !isMobile && (sidebarCollapsed ? "ml-16" : "ml-64"),
          )}
          style={{ paddingTop: isMobile ? safeAreaTop : 0 }}
        >
          <TopBar />

          <main className={cn("flex-1 p-4 md:p-8 overflow-auto mobile-scroll allow-scroll")}>{children}</main>

          {isMobile && <BottomNav />}
        </div>
      </div>
    </LayoutContext.Provider>
  )
}
